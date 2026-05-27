const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const storage = require('../services/storage');
const config = require('../config');

const router = express.Router();

// ─── Auth Middleware ────────────────────────────────────────────────────────
// Verifies the JWT sent in the Authorization header (Bearer <token>).
function requireAdminAuth(req, res, next) {
  const authHeader = req.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }
  const token = authHeader.slice(7); // strip "Bearer "
  try {
    const payload = jwt.verify(token, config.JWT_SECRET);
    req.adminPayload = payload;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired admin token' });
  }
}

// ─── Login ──────────────────────────────────────────────────────────────────
// POST /api/admin/login  { password }
// Returns a signed JWT on success.
router.post('/login', (req, res) => {
  const { password } = req.body;

  if (!password || password !== config.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Invalid admin password' });
  }

  // Sign a short-lived JWT (8 hours is plenty for an event day)
  const token = jwt.sign(
    { role: 'admin' },
    config.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({ success: true, token });
});

// ─── Multer: in-memory storage for uploaded puzzle images ──────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// ─── Upload Puzzle Image ────────────────────────────────────────────────────
// POST /api/admin/upload-puzzle-image  (requires valid admin JWT)
router.post('/upload-puzzle-image', requireAdminAuth, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }

  try {
    const uploadResult = await storage.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    res.json({
      success: true,
      imageUrl: uploadResult.url,
      fileName: uploadResult.fileName
    });
  } catch (err) {
    console.error('Error during admin file upload:', err);
    res.status(500).json({ error: 'Failed to process and store image file' });
  }
});

module.exports = router;
