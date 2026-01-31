import pino from 'pino'

const isProd = process.env.NODE_ENV === 'production'
const isTest = process.env.NODE_ENV === 'testing'

const devTransport: pino.TransportSingleOptions = {
    target: 'pino-pretty',
    options: {
        colorize: true,
        translateTime: 'yyyy-mm-dd HH:MM:ss',
        ignore: 'pid,hostname',
    },
}

const logger = pino({
    level: isTest ? 'silent' : isProd ? 'info' : 'debug',
    ...(isProd ? {} : { transport: devTransport }),
})

export default logger
