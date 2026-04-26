import { v2 as cloudinary } from 'cloudinary'

const normalizeEnvValue = (value = '') =>
    value
        .trim()
        .replace(/^['"]|['"]$/g, '')
        .trim()

const connectCloudinary = async () => {

    const cloudName = normalizeEnvValue(process.env.CLOUDINARY_NAME || process.env.CLOUDINARY_CLOUD_NAME)
    const apiKey = normalizeEnvValue(process.env.CLOUDINARY_API_KEY)
    const apiSecret = normalizeEnvValue(process.env.CLOUDINARY_SECRET_KEY || process.env.CLOUDINARY_API_SECRET)

    if (!cloudName || !apiKey || !apiSecret) {
        throw new Error('Cloudinary environment variables are missing. Set CLOUDINARY_NAME/CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_SECRET_KEY/CLOUDINARY_API_SECRET.')
    }

    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
    })

}

export default connectCloudinary