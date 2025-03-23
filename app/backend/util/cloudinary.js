// utils/cloudinary.js
require('dotenv').config()
const logger = require('./logger')
const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadProfileImg = async (file, userId, username) => {

  try {
    // Delete previous images with complete folder paths
    await cloudinary.uploader.destroy(`avatars/defaults/default_${username}_`)
    await cloudinary.uploader.destroy(`avatars/avatar_${userId}_`)

    // Convert buffer to base64
    const b64 = Buffer.from(file.buffer).toString('base64')
    const dataURI = `data:${file.mimetype};base64,${b64}`

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'avatars',
      public_id: `avatar_${userId}_`,
      resource_type: 'auto'
    })

    return result.secure_url
  } catch (error) {
    logger.error('Cloudinary upload error:', error)
    throw new Error('Image upload failed')
  }
}

const generateInitialAvatar = async (username) => {
  try {
    // Create a text overlay with the first letter
    const initial = username.charAt(0).toUpperCase()
    const backgroundColor = '#E60023' // Pinterest red

    // Create transformation string
    const transformation = [
      { width: 200, height: 200, crop: 'fill', background: backgroundColor },
      {
        overlay: {
          font_family: 'Arial',
          font_size: 90,
          text: initial
        },
        color: 'white',
        gravity: 'center'
      }
    ]

    const result = await cloudinary.uploader.upload('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', {
      folder: 'avatars/defaults',
      public_id: `default_${username}_`,
      transformation: transformation
    })

    return result.secure_url
  } catch (error) {
    logger.error('Error generating initial avatar:', error)
    throw new Error('Failed to generate default avatar')
  }
}


const uploadPin = async (file) => {
  try {

    // Convert buffer to base64
    const b64 = Buffer.from(file.buffer).toString('base64')
    const dataURI = `data:${file.mimetype};base64,${b64}`

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'pins',
      resource_type: 'auto'
    })
    return result.secure_url
  } catch (error) {
    logger.error('Cloudinary upload error:', error)
    throw new Error('Image upload failed')
  }
}

const clearFolder = async (folders) => {
  try {
    const result = await Promise.all(
      folders.map(folder =>
        cloudinary.api.delete_resources_by_prefix(folder, {
          type: 'upload',
          resource_type: 'image'
        })
      )
    )
    // const result = await cloudinary.api.delete_resources_by_prefix(folder, {
    //   type: 'upload',
    //   resource_type: 'image'
    // })
    logger.info('CLEARED CLOUDINARY', result)
    logger.info('Cloudinary storage cleared successfully')

    return result
  } catch (error) {
    logger.error(`Failed to clear folder ${folders}:`, error)
    throw new Error('Folder cleanup failed')
  }
}

module.exports = { uploadProfileImg, generateInitialAvatar, uploadPin, clearFolder }

