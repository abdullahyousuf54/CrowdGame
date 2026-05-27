const sharp = require('sharp');
const storage = require('../../services/storage');

/**
 * Slices an image buffer into a grid of jigsaw pieces
 * @param {Buffer} imageBuffer - Source image buffer
 * @param {number} rows - Number of grid rows
 * @param {number} cols - Number of grid columns
 * @param {boolean} useS3 - Whether to upload individual pieces to S3
 * @returns {Promise<Array>} List of pieces with metadata and image data/URLs
 */
async function generatePuzzlePieces(imageBuffer, rows, cols, useS3 = false) {
  const pieces = [];
  
  // Resize source image to a standardized canvas size for uniform coordinates
  const canvasWidth = 1200;
  const canvasHeight = 800;
  
  const baseImage = await sharp(imageBuffer)
    .resize(canvasWidth, canvasHeight, { fit: 'fill' })
    .toBuffer();
    
  const pieceWidth = Math.floor(canvasWidth / cols);
  const pieceHeight = Math.floor(canvasHeight / rows);
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const left = c * pieceWidth;
      const top = r * pieceHeight;
      
      // Extract piece image
      const pieceBuffer = await sharp(baseImage)
        .extract({ left, top, width: pieceWidth, height: pieceHeight })
        .png()
        .toBuffer();
        
      let pieceUrl;
      const pieceName = `piece-${r}-${c}.png`;
      
      if (useS3) {
        // Upload piece to S3/local storage via storage service
        const uploadResult = await storage.uploadFile(pieceBuffer, pieceName, 'image/png');
        pieceUrl = uploadResult.url;
      } else {
        // Fallback to Base64 URL for zero-latency, local-friendly transport
        pieceUrl = `data:image/png;base64,${pieceBuffer.toString('base64')}`;
      }
      
      pieces.push({
        id: `piece_${r}_${c}`,
        row: r,
        col: c,
        pieceWidth,
        pieceHeight,
        correctX: left,
        correctY: top,
        currentX: 0, // initially zero, randomized on client side / during game setup
        currentY: 0,
        isPlaced: false,
        placedBy: null,
        placedByName: null,
        assignedTo: null, // playerId
        imageUrl: pieceUrl
      });
    }
  }
  
  return {
    pieces,
    canvasWidth,
    canvasHeight,
    pieceWidth,
    pieceHeight
  };
}

module.exports = {
  generatePuzzlePieces
};
