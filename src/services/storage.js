const fs = require('fs');
const path = require('path');
const config = require('../config');

// S3 Clients can be initialized optionally
let s3Client = null;

if (config.S3_BUCKET && config.AWS_ACCESS_KEY_ID && config.AWS_SECRET_ACCESS_KEY) {
  try {
    const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
    s3Client = new S3Client({
      region: config.AWS_REGION,
      credentials: {
        accessKeyId: config.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY
      }
    });
    console.log(`Initialized S3 storage helper. Bucket: ${config.S3_BUCKET}`);
  } catch (err) {
    console.error('Failed to load S3 Client. Falling back to local storage...', err);
  }
}

// Local storage fallback directory
const UPLOADS_DIR = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  console.log(`Created local uploads directory: ${UPLOADS_DIR}`);
}

async function uploadFile(fileBuffer, originalName, mimeType) {
  const fileExtension = path.extname(originalName) || '.png';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${fileExtension}`;

  if (s3Client && config.S3_BUCKET) {
    const { PutObjectCommand } = require('@aws-sdk/client-s3');
    try {
      const command = new PutObjectCommand({
        Bucket: config.S3_BUCKET,
        Key: `uploads/${fileName}`,
        Body: fileBuffer,
        ContentType: mimeType,
        ACL: 'public-read' // CloudFront or direct access
      });
      await s3Client.send(command);
      const url = `https://${config.S3_BUCKET}.s3.${config.AWS_REGION}.amazonaws.com/uploads/${fileName}`;
      return { url, fileName };
    } catch (err) {
      console.error('Error uploading to S3, trying local fallback:', err);
    }
  }

  // Local Storage Fallback
  const filePath = path.join(UPLOADS_DIR, fileName);
  await fs.promises.writeFile(filePath, fileBuffer);
  
  // URL path for static file serving
  const url = `/uploads/${fileName}`;
  return { url, fileName };
}

module.exports = {
  uploadFile
};
