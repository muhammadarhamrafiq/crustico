import pinoHttp from 'pino-http'
import logger from '../lib/logger'

const httpLogger = pinoHttp({
    logger,
    customSuccessMessage: (req) => `${req.method} ${req.url}`,
    customErrorMessage: (req, res, error) => `${req.method} ${req.url} failed: ${error.message}`,
    genReqId: () => crypto.randomUUID(),
})

export default httpLogger
