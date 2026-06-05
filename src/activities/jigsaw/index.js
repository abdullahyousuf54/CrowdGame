const BaseActivity = require('../base');
const { generatePuzzlePieces } = require('./puzzleGenerator');
const fs = require('fs');
const path = require('path');

class JigsawActivity extends BaseActivity {
  constructor(roomCode, config, roomManager) {
    super(roomCode, config, roomManager);
    this.pieces = [];
    this.canvasWidth = 1200;
    this.canvasHeight = 800;
    this.pieceWidth = 0;
    this.pieceHeight = 0;
    this.totalPieces = 0;
    this.piecesPlaced = 0;
    this.imageUrl = config.imageUrl || '/uploads/default-puzzle.png';
    if (config.imagePath) {
      this.imagePath = config.imagePath;
    } else if (config.imageUrl) {
      if (config.imageUrl.startsWith('http://') || config.imageUrl.startsWith('https://')) {
        this.imagePath = null;
      } else {
        const relativePath = config.imageUrl.startsWith('/') ? config.imageUrl.slice(1) : config.imageUrl;
        this.imagePath = path.join(__dirname, '../../../public', relativePath);
      }
    } else {
      this.imagePath = path.join(__dirname, '../../../public/uploads/default-puzzle.png');
    }
    this.rows = config.rows || 4;
    this.cols = config.cols || 6;
    
    // Snap tolerance (in pixels) on the 1200x800 canvas
    this.tolerance = config.tolerance || 40;
    
    // NEW: Difficulty mode ('simple' or 'rotated')
    this.difficulty = config.difficulty || 'simple';
    
    // NEW: Rotation tolerance in degrees (±10°)
    this.rotationTolerance = config.rotationTolerance || 10;
  }

  async onStart() {
    console.log(`Starting Jigsaw Activity for room ${this.roomCode}...`);
    
    // Generate default puzzle image if it doesn't exist
    await this.ensureDefaultImage();

    let imageBuffer;
    if (this.config.imageBuffer) {
      imageBuffer = this.config.imageBuffer;
    } else if (this.imageUrl && (this.imageUrl.startsWith('http://') || this.imageUrl.startsWith('https://'))) {
      try {
        console.log(`Downloading puzzle image from URL: ${this.imageUrl}`);
        const response = await fetch(this.imageUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
      } catch (err) {
        console.error('Failed to fetch image from URL, using fallback default', err);
        const fallbackPath = path.join(__dirname, '../../../public/uploads/default-puzzle.png');
        imageBuffer = await fs.promises.readFile(fallbackPath);
      }
    } else {
      try {
        imageBuffer = await fs.promises.readFile(this.imagePath);
      } catch (err) {
        console.error('Failed to read config imagePath, using fallback default', err);
        const fallbackPath = path.join(__dirname, '../../../public/uploads/default-puzzle.png');
        imageBuffer = await fs.promises.readFile(fallbackPath);
      }
    }

    // Slice image into pieces
    const result = await generatePuzzlePieces(imageBuffer, this.rows, this.cols, false);
    this.pieces = result.pieces;
    this.canvasWidth = result.canvasWidth;
    this.canvasHeight = result.canvasHeight;
    this.pieceWidth = result.pieceWidth;
    this.pieceHeight = result.pieceHeight;
    this.totalPieces = this.pieces.length;
    this.piecesPlaced = 0;

    // Distribute/randomize initial coordinates (off-screen or on edges for the screen)
    this.pieces.forEach(p => {
      // Scatter initial positions along the canvas edges
      const side = Math.floor(Math.random() * 4);
      const padding = 50;
      switch (side) {
        case 0: // Top
          p.currentX = Math.random() * (this.canvasWidth - p.pieceWidth);
          p.currentY = -p.pieceHeight + padding;
          break;
        case 1: // Right
          p.currentX = this.canvasWidth - padding;
          p.currentY = Math.random() * (this.canvasHeight - p.pieceHeight);
          break;
        case 2: // Bottom
          p.currentX = Math.random() * (this.canvasWidth - p.pieceWidth);
          p.currentY = this.canvasHeight - padding;
          break;
        case 3: // Left
          p.currentX = -p.pieceWidth + padding;
          p.currentY = Math.random() * (this.canvasHeight - p.pieceHeight);
          break;
      }
      
      // NEW: Initialize rotation for rotated mode
      if (this.difficulty === 'rotated') {
        // Random rotation between 0 and 359 degrees
        p.currentRotation = Math.floor(Math.random() * 360);
        p.targetRotation = 0; // All pieces should be upright when placed
      } else {
        // Simple mode: no rotation
        p.currentRotation = 0;
        p.targetRotation = 0;
      }
    });

    console.log(`Puzzle initialized. ${this.totalPieces} pieces (${this.rows}x${this.cols}) generated.`);
  }

  // Ensures a default synthwave image exists in uploads for clean zero-config setup
  async ensureDefaultImage() {
    const uploadsDir = path.join(__dirname, '../../../public/uploads');
    const defaultImagePath = path.join(uploadsDir, 'default-puzzle.png');
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    if (!fs.existsSync(defaultImagePath)) {
      console.log('Generating default synthwave puzzle image...');
      // Draw a neat placeholder SVG background and convert it to PNG
      const svgString = `
        <svg width="1200" height="800" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#0b001a" />
              <stop offset="60%" stop-color="#2d004d" />
              <stop offset="100%" stop-color="#800080" />
            </linearGradient>
            <linearGradient id="gridGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="rgba(0, 243, 255, 0)" />
              <stop offset="100%" stop-color="#00f3ff" />
            </linearGradient>
          </defs>
          
          <!-- Background sky -->
          <rect width="100%" height="100%" fill="url(#sky)" />
          
          <!-- Glowing Grid lines perspective -->
          <path d="M 0 500 L 1200 500 M 0 550 L 1200 550 M 0 620 L 1200 620 M 0 700 L 1200 700" stroke="#ff007f" stroke-width="2" opacity="0.6" />
          <path d="M 600 450 L 100 800 M 600 450 L 300 800 M 600 450 L 500 800 M 600 450 L 700 800 M 600 450 L 900 800 M 600 450 L 1100 800" stroke="#00f3ff" stroke-width="2" />
          
          <!-- Sun -->
          <circle cx="600" cy="400" r="150" fill="#ffb800" />
          <!-- Sun Horizon strips -->
          <rect x="400" y="420" width="400" height="8" fill="#0b001a" />
          <rect x="400" y="440" width="400" height="12" fill="#0b001a" />
          <rect x="400" y="465" width="400" height="18" fill="#0b001a" />
          <rect x="400" y="500" width="400" height="40" fill="#0b001a" />

          <!-- Title -->
          <text x="50%" y="150" font-family="'Outfit', sans-serif" font-size="68" font-weight="900" fill="#00f3ff" text-anchor="middle" letter-spacing="10" filter="drop-shadow(0px 0px 10px #00f3ff)">CROWDPLAY</text>
          <text x="50%" y="220" font-family="'Share Tech Mono', monospace" font-size="24" fill="#ff007f" text-anchor="middle" letter-spacing="5">SOLVE THE PUZZLE TOGETHER</text>
        </svg>
      `;

      try {
        const sharp = require('sharp');
        await sharp(Buffer.from(svgString))
          .png()
          .toFile(defaultImagePath);
        console.log('Default puzzle image successfully generated.');
      } catch (err) {
        console.error('Error rendering default puzzle SVG:', err);
      }
    }
  }

  onPlayerJoin(player) {
    console.log(`Player ${player.displayName} (${player.id}) joined activity jigsaw.`);
    this.assignPiecesToPlayer(player.id);
  }

  onPlayerLeave(player) {
    console.log(`Player ${player.displayName} (${player.id}) left. Returning assigned pieces to pool.`);
    // Reclaim pieces assigned to this player
    this.pieces.forEach(p => {
      if (p.assignedTo === player.id && !p.isPlaced) {
        p.assignedTo = null;
      }
    });
  }

  // Assign up to 3 unplaced/unassigned pieces to a player
  assignPiecesToPlayer(playerId) {
    const playerPieces = this.pieces.filter(p => p.assignedTo === playerId && !p.isPlaced);
    const quota = 2; // assign 2 pieces at a time
    const needed = quota - playerPieces.length;
    
    if (needed <= 0) return;

    // Get unplaced and unassigned pieces
    const pool = this.pieces.filter(p => !p.isPlaced && !p.assignedTo);
    
    // Sort pool randomly
    const shuffled = pool.sort(() => 0.5 - Math.random());
    
    // Take what is needed
    const toAssign = shuffled.slice(0, needed);
    toAssign.forEach(p => {
      p.assignedTo = playerId;
    });

    console.log(`Assigned ${toAssign.length} piece(s) to player ${playerId}.`);
  }

  onPlayerAction(player, actionType, actionData) {
    if (actionType === 'place-piece') {
      return this.handlePiecePlacement(player, actionData);
    } else if (actionType === 'rotate-piece') {
      // NEW: Handle rotation action
      return this.handlePieceRotation(player, actionData);
    }
    return null;
  }

  // NEW: Handle piece rotation
  handlePieceRotation(player, { pieceId, rotation }) {
    const piece = this.pieces.find(p => p.id === pieceId);
    if (!piece) return { success: false, error: 'Piece not found' };
    if (piece.isPlaced) return { success: false, error: 'Piece already placed' };
    if (piece.assignedTo !== player.id) return { success: false, error: 'Piece not assigned to you' };

    // Update current rotation
    piece.currentRotation = rotation % 360;
    if (piece.currentRotation < 0) piece.currentRotation += 360;

    return {
      success: true,
      pieceId: piece.id,
      rotation: piece.currentRotation
    };
  }

  handlePiecePlacement(player, { pieceId, currentX, currentY, currentRotation }) {
    const piece = this.pieces.find(p => p.id === pieceId);
    if (!piece) return { success: false, error: 'Piece not found' };
    if (piece.isPlaced) return { success: false, error: 'Piece already placed' };
    if (piece.assignedTo !== player.id) return { success: false, error: 'Piece not assigned to you' };

    // Calculate distance to correct position
    const dx = Math.abs(currentX - piece.correctX);
    const dy = Math.abs(currentY - piece.correctY);
    
    const positionCorrect = dx <= this.tolerance && dy <= this.tolerance;
    
    // NEW: Check rotation if in rotated mode
    let rotationCorrect = true;
    if (this.difficulty === 'rotated' && currentRotation !== undefined) {
      // Update piece rotation
      piece.currentRotation = currentRotation % 360;
      if (piece.currentRotation < 0) piece.currentRotation += 360;
      
      // Calculate rotation difference considering wrap-around
      let rotDiff = Math.abs(piece.currentRotation - piece.targetRotation);
      if (rotDiff > 180) rotDiff = 360 - rotDiff;
      
      rotationCorrect = rotDiff <= this.rotationTolerance;
    }
    
    const isCorrect = positionCorrect && rotationCorrect;

    if (isCorrect) {
      // Snap piece into correct position and rotation
      piece.isPlaced = true;
      piece.currentX = piece.correctX;
      piece.currentY = piece.correctY;
      piece.currentRotation = piece.targetRotation; // Snap to correct rotation
      piece.placedBy = player.id;
      piece.placedByName = player.displayName;
      piece.assignedTo = null;
      
      this.piecesPlaced++;
      
      // Update participant score
      player.score += 100; // 100 points for correct placement
      
      // Assign a new piece to the player
      this.assignPiecesToPlayer(player.id);
      
      // Check if puzzle is fully solved
      const isSolved = this.piecesPlaced === this.totalPieces;
      if (isSolved) {
        this.onEnd();
      }

      return {
        success: true,
        correct: true,
        pieceId: piece.id,
        correctX: piece.correctX,
        correctY: piece.correctY,
        correctRotation: piece.targetRotation,
        placedBy: player.displayName,
        score: player.score,
        isSolved,
        progress: this.getProgress()
      };
    } else {
      // Wrong placement - update position and rotation
      piece.currentX = currentX;
      piece.currentY = currentY;
      if (currentRotation !== undefined) {
        piece.currentRotation = currentRotation % 360;
        if (piece.currentRotation < 0) piece.currentRotation += 360;
      }
      
      return {
        success: true,
        correct: false,
        pieceId: piece.id,
        currentX,
        currentY,
        currentRotation: piece.currentRotation,
        progress: this.getProgress()
      };
    }
  }

  getStateForScreen() {
    return {
      status: this.status,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      imageUrl: this.imageUrl,
      canvasWidth: this.canvasWidth,
      canvasHeight: this.canvasHeight,
      pieceWidth: this.pieceWidth,
      pieceHeight: this.pieceHeight,
      rows: this.rows,
      cols: this.cols,
      totalPieces: this.totalPieces,
      piecesPlaced: this.piecesPlaced,
      progress: this.getProgress(),
      difficulty: this.difficulty, // NEW
      pieces: this.pieces.map(p => ({
        id: p.id,
        row: p.row,
        col: p.col,
        currentX: p.currentX,
        currentY: p.currentY,
        correctX: p.correctX,
        correctY: p.correctY,
        currentRotation: p.currentRotation, // NEW
        isPlaced: p.isPlaced,
        placedByName: p.placedByName,
        imageUrl: p.imageUrl
      }))
    };
  }

  getStateForPlayer(playerId) {
    const assignedPieces = this.pieces
      .filter(p => p.assignedTo === playerId && !p.isPlaced)
      .map(p => ({
        id: p.id,
        row: p.row,
        col: p.col,
        imageUrl: p.imageUrl,
        correctX: p.correctX,
        correctY: p.correctY,
        pieceWidth: p.pieceWidth,
        pieceHeight: p.pieceHeight,
        currentRotation: p.currentRotation, // NEW
        targetRotation: p.targetRotation // NEW
      }));

    return {
      status: this.status,
      imageUrl: this.imageUrl,
      canvasWidth: this.canvasWidth,
      canvasHeight: this.canvasHeight,
      rows: this.rows,
      cols: this.cols,
      piecesPlaced: this.piecesPlaced,
      totalPieces: this.totalPieces,
      progress: this.getProgress(),
      difficulty: this.difficulty, // NEW
      assignedPieces
    };
  }

  getProgress() {
    if (this.totalPieces === 0) return 0;
    return Math.round((this.piecesPlaced / this.totalPieces) * 100);
  }
}

module.exports = JigsawActivity;
