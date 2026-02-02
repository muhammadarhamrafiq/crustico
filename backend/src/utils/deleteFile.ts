import fs from 'fs/promises'
import logger from '../lib/logger'
import path from 'path'

export const deleteFile = (filePath: string) => {
    const fullPath = path.join(
        process.cwd(),
        process.env.UPLOAD_STORAGE_DIR as string,
        path.basename(filePath)
    )
    fs.unlink(fullPath).catch((err) => {
        logger.error(`Failed to delete file at path: ${filePath}`, err)
    })
}
