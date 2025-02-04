// validators/pin.validator.js
const Joi = require('joi')

const pinSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(255)
    .required()
    .trim()
    .messages({
      'string.empty': 'Title cannot be empty',
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title cannot exceed 100 characters',
      'any.required': 'Title is required'
    }),

  description: Joi.string()
    .allow('')
    .trim(),


  // image_url: Joi.string()
  //     .uri()
  //     .required()
  //     .messages({
  //         'string.empty': 'Image URL cannot be empty',
  //         'string.uri': 'Invalid image URL format',
  //         'any.required': 'Image URL is required'
  //     }),

  external_url: Joi.string()
    .max(255)
    .uri()
    .allow('')
    .messages({
      'string.uri': 'Invalid source URL format'
    }),


})

const validatePinData = (data) => {
  return pinSchema.validate(data, {
    abortEarly: false, // returns all errors, not just the first one
    stripUnknown: true // removes unknown fields
  })
}

module.exports = {
  validatePinData
}