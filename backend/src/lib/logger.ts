import pino from 'pino'

const isProd = process.env.NODE_ENV === 'production'

const devTransport: pino.TransportSingleOptions = {
    target: 'pino-pretty',
    options: {
        colorize: true,
        translateTime: 'yyyy-mm-dd HH:MM:ss',
        ignore: 'pid,hostname',
    },
}

const logger = pino({
    level: isProd ? 'info' : 'debug',
    ...(isProd ? {} : { transport: devTransport }),
})

export default logger
