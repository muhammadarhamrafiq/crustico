import path from 'path'
import fs from 'fs/promises'
import logger from '../lib/logger'

const TEMP_DIR = path.join(process.cwd(), 'uploads/tmp')
const TTL = 15 * 60 * 1000 // 15 minutes in milliseconds

export const cleanUpTempFiles = async () => {
    try {
        const files = await fs.readdir(TEMP_DIR)
        const now = Date.now()

        for (const file of files) {
            const filePath = path.join(TEMP_DIR, file)
            const stats = await fs.stat(filePath)

            const age = now - stats.mtimeMs
            if (age > TTL) {
                await fs.unlink(filePath)
                logger.info(`Deleted temp file: ${filePath}`)
            }
        }
    } catch (err) {
        logger.error({ error: err }, 'Error while cleaning the tmp data')
    }
}
