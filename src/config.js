const path = require('path');

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  
  // Database configurations
  DATABASE_URL: process.env.DATABASE_URL,
  USE_SQLITE_FALLBACK: process.env.USE_SQLITE_FALLBACK !== 'false',
  SQLITE_PATH: process.env.SQLITE_PATH || path.join(__dirname, '../crowdplay.sqlite'),

  // Redis configurations
  REDIS_URL: process.env.REDIS_URL, // e.g. redis://localhost:6379 or AWS ElastiCache URL
  
  // Storage configurations (AWS S3)
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  S3_BUCKET: process.env.S3_BUCKET,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  
  // Admin credentials
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',
  JWT_SECRET: process.env.JWT_SECRET || 'crowdplay-super-secret-key-change-in-prod'
};
