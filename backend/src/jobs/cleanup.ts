import cron from 'node-cron'
import { cleanUpTempFiles } from '../utils/cleanUp'

const createCleanupJob = () => {
    cron.schedule('*/10 * * * *', cleanUpTempFiles)
}

export default createCleanupJob
