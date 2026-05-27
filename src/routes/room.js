const express = require('express');
const QRCode = require('qrcode');
const os = require('os');
const router = express.Router();
const config = require('../config');

// Helper to get local network IP address (for dev/local hosting)
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  const ipCandidates = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ipCandidates.push(iface.address);
      }
    }
  }
  
  const privateIPPattern = /^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/;
  const preferredIP = ipCandidates.find(ip => privateIPPattern.test(ip));
  
  return preferredIP || ipCandidates[0] || 'localhost';
}

const LOCAL_IP = getLocalIP();

// API endpoint to retrieve connection configuration and generate QR code
router.get('/config', async (req, res) => {
  const roomCode = req.query.roomCode || Math.random().toString(36).substring(2, 6).toUpperCase();

  // Use host header to dynamically build the join URL.
  // IMPORTANT: If the request comes from localhost (same machine), swap in the
  // server's LAN IP so QR codes are reachable by mobile phones on the same WiFi.
  let host = req.get('host'); // e.g. "localhost:3000" or "192.168.1.5:3000"
  if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) {
    host = `${LOCAL_IP}:${config.PORT}`;
  }

  // Always use https — the dev server runs HTTPS for DeviceOrientation API access.
  // Mobile users will see a cert warning and must tap "Advanced → Proceed".
  const protocol = 'https';
  const joinUrl = `${protocol}://${host}/join/${roomCode}`;
  
  try {
    // Generate QR code data URL
    const qrDataUrl = await QRCode.toDataURL(joinUrl, {
      color: {
        dark: '#ffffff', // White QR code
        light: '#0b001a', // Dark theme background
      },
      margin: 1,
      width: 256,
    });
    
    res.json({
      localIp: LOCAL_IP,
      port: config.PORT,
      roomCode,
      joinUrl,
      qrDataUrl
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

module.exports = router;
