const router = require('express').Router()
const { User, Pin, Like, Comment, CommentReply, Follower, Chat, Message,  } = require('../models/index')
const { sequelize } = require('../util/db')
const redisClient = require('../util/redis')
const logger = require('../util/logger')
const bcrypt = require('bcrypt')
const path = require('path')
const csv = require('csv-parser')
const fs = require('fs')
const { uploadPin, clearFolder } = require('../util/cloudinary')



router.post('/reset', async (request, response) => {
  logger.info('Start Cleanup')
  try {
    await sequelize.query('SET session_replication_role = replica')

    await Promise.all([
      User.destroy({ truncate: true, cascade: true }),
      Pin.destroy({ truncate: true, cascade: true }),
      Like.destroy({ truncate: true, cascade: true }),
      Comment.destroy({ truncate: true, cascade: true }),
      CommentReply.destroy({ truncate: true, cascade: true }),
      Follower.destroy({ truncate: true, cascade: true }),
      Chat.destroy({ truncate: true, cascade: true }),
      Message.destroy({ truncate: true, cascade: true }),
    ])

    await sequelize.query('SET session_replication_role = default')

    // Clear Redis cache
    await redisClient.FLUSHALL()

    // Cloudinary cleanup
    const folders = ['pins', 'avatars', 'avatars/defaults']
    await clearFolder(folders)

    logger.info('Cleanup Successfull')
    response.status(200).end()

  }catch(error) {
    logger.error('System cleanup error:', error)
    response.status(500).json({ error: 'Cleanup failed' })
  }

}
)


router.post('/upload-from-csv', async (request, response) => {
  const password_hash = await bcrypt.hash('awesomeJulia90', 10)
  const userInfo = {
    email: 'julia@gmail.com',
    username: 'julia',
    first_name: 'julia',
    last_name: 'awesome',
    password_hash,
    dob: '10/10/2001'
  }

  try {
    let user = await User.findOne({ where: { email: userInfo.email } })
    if (!user) {
      user = await User.create(userInfo)
    }

    // logger.info('Created test user:', user.dataValues)


    const assetsPath = path.join(__dirname, 'assets')
    const csvPath = path.join(assetsPath, 'pins.csv')

    // Validate assets folder and CSV existence
    if (!fs.existsSync(assetsPath)) {
      throw new Error('Assets folder not found')
    }
    if (!fs.existsSync(csvPath)) {
      throw new Error('pins.csv not found in assets folder')
    }

    const pins = []
    // Read and process CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (data) => pins.push(data))
        .on('end', resolve)
        .on('error', reject)
    })

    // Upload images and create pins
    const pinPromises =  pins.map(async pin => {

      // Read the image file
      const imagePath = path.join(assetsPath, pin.image_path)
      const imageFile = {
        buffer: fs.readFileSync(imagePath),
        mimetype: `image/${path.extname(pin.image_path).slice(1)}`
      }

      // Upload to Cloudinary
      const pinUrl = await uploadPin(imageFile)

      // Create pin in database
      return Pin.create({
        title: pin.title,
        description: pin.description,
        image_url: pinUrl,
        user_id: user.dataValues.id
      })
    })

    // console.log('PINS PINS :', pins)

    const createdPins = await Promise.all(pinPromises)
    logger.info(`Successfully created ${createdPins.length} pins from CSV`)

    response.status(201).json({
      message: `Created ${createdPins.length} pins successfully`,
      pins: createdPins
    })

  } catch (error) {
    logger.error('Error in CSV pin upload:', error)
    response.status(500).json({ error: 'Failed to create pins from CSV' })
  }
})



module.exports = router