// utils/cloudinary.js
require('dotenv').config()
const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadImage = async (file) => {
  try {

     // Convert buffer to base64
     const b64 = Buffer.from(file.buffer).toString('base64');
     const dataURI = `data:${file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'avatars',
      resource_type: 'auto'
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Image upload failed');
  }
};

const generateInitialAvatar = async (username) => {
  try {
    // Create a text overlay with the first letter
    const initial = username.charAt(0).toUpperCase();
    const backgroundColor = '#E60023'; // Pinterest red

     // Create transformation string
     const transformation = [
      { width: 200, height: 200, crop: 'fill', background: backgroundColor },
      {
        overlay: {
          font_family: "Arial",
          font_size: 90,
          text: initial
        },
        color: "white",
        gravity: "center"
      }
    ];

    const result = await cloudinary.uploader.upload('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', {
      folder: 'avatars/defaults',
      public_id: `default_${username}_${Date.now()}`,
      transformation: transformation
    });
    
    return result.secure_url;
  } catch (error) {
    console.error('Error generating initial avatar:', error);
    // Return a fallback default avatar URL
    throw new Error('Failed to generate default avatar');
  }
};
module.exports = { uploadImage, generateInitialAvatar };

