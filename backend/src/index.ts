import 'dotenv/config'
import app from './app'
import logger from './lib/logger'

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
    logger.info(`Server is running at http://localhost:${PORT}`)
})
