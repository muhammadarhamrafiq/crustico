import multer from 'multer'
import path from 'path'
import { asyncHandler } from '../utils/asynHandler'
import { Request, Response, NextFunction } from 'express'
import fs from 'fs'
import { ApiError } from '../utils/apiError'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/tmp/')
    },
    filename: function (req, file, cb) {
        const fileName = crypto.randomUUID() + path.extname(file.originalname)
        cb(null, fileName)
    },
})

export const upload = multer({ storage: storage })

export const moveToPermanentStorage = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        if (!req.body.image) return next()

        const temp = path.join(process.cwd(), req.body.image)
        const permanent = path.join(process.cwd(), 'uploads/storage', path.basename(req.body.image))

        if (!fs.existsSync(temp)) return next(new ApiError(400, 'Image file does not exists.'))

        fs.renameSync(temp, permanent)
        req.body.image = `image/${path.basename(req.body.image)}`
        next()
    }
)
