import multer from 'multer'
import path from 'path'
import { asyncHandler } from '../utils/asynHandler'
import { Request, Response, NextFunction } from 'express'
import fs from 'fs'
import { ApiError } from '../utils/apiError'

const tempDir = path.join(process.cwd(), process.env.UPLOAD_TMP_DIR || 'uploads/tmp')
const storageDir = path.join(process.cwd(), process.env.UPLOAD_STORAGE_DIR || 'uploads/storage')

if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true })
}

if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/tmp/')
    },
    filename: function (req, file, cb) {
        const fileName = crypto.randomUUID() + path.extname(file.originalname)
        cb(null, fileName)
    },
})

export const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const mimeType = file.mimetype.toLocaleLowerCase()

    const allowedTypes = (
        process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/gif,image/webp'
    ).split(',')
    const allowedExtensions = (
        process.env.ALLOWED_IMAGE_EXTENSIONS || '.jpg,.jpeg,.png,.gif,.webp'
    ).split(',')

    if (allowedTypes.includes(mimeType) && allowedExtensions.includes(ext)) cb(null, true)
    else cb(new ApiError(415, 'Unsupported file type.'))
}

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
})

export const moveToPermanentStorage = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { image } = req.body
        if (!image) return next()

        const temp = path.join(process.cwd(), image)
        const permanent = path.join(process.cwd(), 'uploads/storage', path.basename(image))

        if (!fs.existsSync(temp)) return next(new ApiError(404, 'Image file does not exists.'))

        fs.renameSync(temp, permanent)
        req.body.image = `image/${path.basename(image)}`
        next()
    }
)
