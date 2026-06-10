const pino = require('pino')

const isDev  = process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test'
const silent = process.env.NODE_ENV === 'test'

const logger = pino({
  level: silent ? 'silent' : (process.env.LOG_LEVEL || 'info'),
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
      }
    : undefined,
})

module.exports = logger
