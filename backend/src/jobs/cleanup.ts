import cron from 'node-cron'
import { cleanUpTempFiles } from '../utils/cleanUp'

const createCleanupJob = () => {
    cron.schedule('*/2 * * * *', cleanUpTempFiles)
}

export default createCleanupJob
