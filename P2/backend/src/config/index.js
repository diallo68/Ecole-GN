require('dotenv').config();

const IS_PROD = process.env.NODE_ENV === 'production';

module.exports = {
  PORT: process.env.PORT || 4000,
  IS_PROD,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/gandal',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_secret_change_me',
  CORS_WHITELIST: (process.env.CORS_WHITELIST || 'http://localhost:3000').split(','),
  SMTP: {
    HOST: process.env.SMTP_HOST || '',
    PORT: Number(process.env.SMTP_PORT) || 587,
    USER: process.env.SMTP_USER || '',
    PASS: process.env.SMTP_PASS || '',
    FROM: process.env.SMTP_FROM || 'Gandal <no-reply@gandal.example>',
  },
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    API_KEY: process.env.CLOUDINARY_API_KEY,
    API_SECRET: process.env.CLOUDINARY_API_SECRET,
  },
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
};
