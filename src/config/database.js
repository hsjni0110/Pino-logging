// src/config/database.js
import { MongoClient } from 'mongodb';
import { AsyncLocalStorage } from 'async_hooks';
import { logger } from './logger.js';

const SLOW_LOGGING = process.env.SLOW_LOGGING === 'true';
const SLOW_MS = parseInt(process.env.SLOW_QUERY_THRESHOLD, 10) || 200;
const SIMULATED_DELAY = parseInt(process.env.SIMULATED_DELAY, 10) || 0;

export const als = new AsyncLocalStorage();

export function createClient(uri) {
  const client = new MongoClient(uri, { monitorCommands: true });

  const internalCommands = new Set(['endSessions', 'hello', 'ismaster', 'ping', 'buildInfo', 'saslStart', 'saslContinue', 'getMore', 'killCursors']);

  const commandInfo = new Map();
  
  // 5분마다 오래된 명령어 정보 정리
  const cleanupInterval = setInterval(() => {
    const cutoff = Date.now() - 5 * 60 * 1000; // 5분 전
    for (const [requestId, info] of commandInfo.entries()) {
      if (info.timestamp < cutoff) {
        commandInfo.delete(requestId);
      }
    }
  }, 60000); // 1분마다 실행

  // 클라이언트 종료 시 cleanup
  client.on('close', () => {
    clearInterval(cleanupInterval);
    commandInfo.clear();
  });

  // commandStarted에서 정보 수집
  client.on('commandStarted', ev => {
    if (internalCommands.has(ev.commandName)) return;

    const store = als.getStore();
    const collection = ev.command?.[ev.commandName] || 'unknown';
    
    commandInfo.set(ev.requestId, {
      collection,
      commandName: ev.commandName,
      reqId: store?.reqId,
      timestamp: Date.now(),
      filter: ev.commandName === 'find' ? ev.command?.filter : undefined,
      pipeline: ev.commandName === 'aggregate' ? ev.command?.pipeline : undefined
    });
  });

  // commandSucceeded에서 실행 시간과 함께 로깅
  client.on('commandSucceeded', ev => {
    if (internalCommands.has(ev.commandName)) return;
    
    const info = commandInfo.get(ev.requestId);
    if (!info) return;
    
    const duration = (ev.duration || 0);
    const isSlowQuery = SLOW_LOGGING && duration > SLOW_MS;
    
    // 느린 쿼리이거나 일반 로깅이 활성화된 경우만 상세 정보 생성
    let queryInfo = '';
    if (isSlowQuery || !SLOW_LOGGING) {
      if (info.filter) {
        queryInfo = ` filter=${JSON.stringify(info.filter)}`;
      } else if (info.pipeline) {
        // pipeline steps 미리 계산된 것 사용하거나 간단히 처리
        const pipelineSteps = info.pipeline.map(step => Object.keys(step)[0]).join('→');
        queryInfo = ` pipeline=${pipelineSteps}`;
      }
    }

    const logData = {
      reqId: info.reqId,
      cmd: ev.commandName,
      collection: info.collection,
      duration
    };

    const logMessage = `${ev.commandName} on ${info.collection} (${duration}ms)${queryInfo}`;
    
    // 로그 레벨별 분기 최소화
    if (isSlowQuery) {
      logger.warn(logData, `SLOW: ${logMessage}`);
    } else {
      logger.info(logData, `${logMessage}`);
    }

    // 메모리 정리
    commandInfo.delete(ev.requestId);
  });

  // commandFailed에서 실패 로깅
  client.on('commandFailed', ev => {
    if (internalCommands.has(ev.commandName)) return;
    
    const info = commandInfo.get(ev.requestId);
    if (!info) return;
    
    logger.error({
      reqId: info.reqId,
      cmd: ev.commandName,
      collection: info.collection,
      duration: (ev.duration || 0) + SIMULATED_DELAY,
      error: ev.failure?.message || ev.failure || 'Unknown error'
    }, `${ev.commandName} on ${info.collection} FAILED`);

    // 메모리 정리
    commandInfo.delete(ev.requestId);
  });

  return client;
}