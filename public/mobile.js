document.addEventListener('DOMContentLoaded', () => {
  let socket = null;
  let roomCode = '';
  let myPlayerId = '';
  let myColor = '';
  let myDisplayName = '';
  let myAvatarData = null;
  let piecesPlacedCount = 0;
  let currentAssignedPieces = [];
  let selectedPieceIndex = 0;
  
  // NEW: Rotation state
  let difficultyMode = 'simple'; // 'simple' or 'rotated'
  let currentPieceRotation = 0; // Current rotation angle in degrees

  // Workspace configuration
  const CANVAS_WIDTH = 1200;
  const CANVAS_HEIGHT = 800;
  let puzzleRows = 4;
  let puzzleCols = 6;

  // Avatar configuration
  const DICEBEAR_STYLE = 'avataaars';
  const DICEBEAR_VERSION = '10.x';
  let currentAvatarConfig = {
    seed: generateRandomSeed(),
    topVariant: 'shortFlat',
    hairColor: 'b58143',
    accessoriesVariant: '',
    accessoriesProbability: 0,
    clothesVariant: 'hoodie',
    clothesColor: '5199e4',
    skinColor: 'ae5d29',
    backgroundColor: 'b6e3f4'
  };

  // DOM Elements
  const joinSection = document.getElementById('joinSection');
  const waitingSection = document.getElementById('waitingSection');
  const gameplaySection = document.getElementById('gameplaySection');
  const completeSection = document.getElementById('completeSection');

  const joinForm = document.getElementById('joinForm');
  const displayNameInput = document.getElementById('displayNameInput');
  const joinRoomCode = document.getElementById('joinRoomCode');
  
  const welcomeText = document.getElementById('welcomeText');
  const playerColorVal = document.getElementById('playerColorVal');

  const headerPilotName = document.getElementById('headerPilotName');
  const headerColorDot = document.getElementById('headerColorDot');
  const gameProgressPct = document.getElementById('gameProgressPct');
  const assignedPiecesPool = document.getElementById('assignedPiecesPool');
  const dragBoard = document.getElementById('dragBoard');
  const pieceSelectorContainer = document.getElementById('pieceSelectorContainer');

  const myContributionsVal = document.getElementById('myContributionsVal');

  // Avatar elements
  const avatarPreview = document.getElementById('avatarPreview');
  const randomizeAvatarBtn = document.getElementById('randomizeAvatarBtn');
  const customizeAvatarBtn = document.getElementById('customizeAvatarBtn');
  const avatarModal = document.getElementById('avatarModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  const saveAvatarBtn = document.getElementById('saveAvatarBtn');
  const modalRandomizeBtn = document.getElementById('modalRandomizeBtn');
  const modalAvatarPreview = document.getElementById('modalAvatarPreview');
  const waitingAvatarImg = document.getElementById('waitingAvatarImg');
  const headerAvatarImg = document.getElementById('headerAvatarImg');

  // Avatar customization controls
  const hairStyleSelect = document.getElementById('hairStyleSelect');
  const hairColorSelect = document.getElementById('hairColorSelect');
  const clothingSelect = document.getElementById('clothingSelect');
  const clothingColorSelect = document.getElementById('clothingColorSelect');
  const accessoriesSelect = document.getElementById('accessoriesSelect');
  const skinColorSelect = document.getElementById('skinColorSelect');
  const bgColorInput = document.getElementById('bgColorInput');

  // Extract roomCode from URL (/join/ABCD)
  const pathParts = window.location.pathname.split('/');
  roomCode = pathParts[pathParts.length - 1].toUpperCase();
  joinRoomCode.textContent = roomCode;

  // Initialize avatar on page load
  updateAvatarPreview();

  // ============ AVATAR FUNCTIONS ============
  
  function generateRandomSeed() {
    return Math.random().toString(36).substring(2, 15);
  }

  function getAvatarUrl(config) {
    const params = new URLSearchParams({
      seed: config.seed,
      backgroundColor: config.backgroundColor
    });
    
    // Add variant parameters
    if (config.topVariant) params.append('topVariant', config.topVariant);
    if (config.hairColor) params.append('hairColor', config.hairColor);
    if (config.accessoriesVariant) {
      params.append('accessoriesVariant', config.accessoriesVariant);
      params.append('accessoriesProbability', '100');
    } else {
      params.append('accessoriesProbability', '0');
    }
    if (config.clothesVariant) params.append('clothesVariant', config.clothesVariant);
    if (config.clothesColor) params.append('clothesColor', config.clothesColor);
    if (config.skinColor) params.append('skinColor', config.skinColor);
    
    return `https://api.dicebear.com/${DICEBEAR_VERSION}/${DICEBEAR_STYLE}/svg?${params.toString()}`;
  }

  function updateAvatarPreview() {
    const url = getAvatarUrl(currentAvatarConfig);
    console.log(url);
    avatarPreview.innerHTML = `<img src="${url}" alt="Avatar" class="avatar-img">`;
    myAvatarData = {
      url,
      config: { ...currentAvatarConfig }
    };
  }

  function updateModalPreview() {
    const url = getAvatarUrl(currentAvatarConfig);
    modalAvatarPreview.innerHTML = `<img src="${url}" alt="Avatar" class="avatar-img-xl">`;
  }

  function randomizeAvatar() {
    // Variant options based on DiceBear API v10
    const topVariants = ['bigHair', 'bob', 'bun', 'curly', 'curvy', 'dreads', 'dreads01', 'dreads02', 'frida', 'frizzle', 'fro', 'froBand', 'hat', 'hijab', 'longButNotTooLong', 'miaWallace', 'shaggy', 'shaggyMullet', 'shavedSides', 'shortCurly', 'shortFlat', 'shortRound', 'shortWaved', 'sides', 'straight01', 'straight02', 'straightAndStrand', 'theCaesar', 'theCaesarAndSidePart', 'turban', 'winterHat1', 'winterHat02', 'winterHat03', 'winterHat04'];
    const hairColors = ['a55728', '2c1b18', 'b58143', 'd6b370', '724133', '4a312c', 'f59797', 'ecdcbf', 'c93305', 'e8e1e1'];
    const clothesVariants = ['blazerAndShirt', 'blazerAndSweater', 'collarAndSweater', 'graphicShirt', 'hoodie', 'overall', 'shirtCrewNeck', 'shirtScoopNeck', 'shirtVNeck'];
    const clothesColors = ['262e33', '65c9ff', '5199e4', '25557c', 'e6e6e6', '929598', '3c4f5c', 'b1e2ff', 'a7ffc4', 'ffafb9', 'ffffb1', 'ff488e', 'ff5c5c', 'ffffff'];
    const accessoriesVariants = ['', 'eyepatch', 'kurt', 'prescription01', 'prescription02', 'round', 'sunglasses', 'wayfarers'];
    const skinColors = ['614335', 'd08b5b', 'ae5d29', 'edb98a', 'ffdbb4', 'fd9841', 'f8d25c'];
    const bgColors = ['b6e3f4', 'ffd5dc', 'c7ecee', 'f4e4ba', 'd4f4dd', 'e8d5f2', 'ffeaa7', 'fab1a0', 'a29bfe', '81ecec'];

    currentAvatarConfig = {
      seed: generateRandomSeed(),
      topVariant: topVariants[Math.floor(Math.random() * topVariants.length)],
      hairColor: hairColors[Math.floor(Math.random() * hairColors.length)],
      accessoriesVariant: accessoriesVariants[Math.floor(Math.random() * accessoriesVariants.length)],
      accessoriesProbability: accessoriesVariants[Math.floor(Math.random() * accessoriesVariants.length)] ? 100 : 0,
      clothesVariant: clothesVariants[Math.floor(Math.random() * clothesVariants.length)],
      clothesColor: clothesColors[Math.floor(Math.random() * clothesColors.length)],
      skinColor: skinColors[Math.floor(Math.random() * skinColors.length)],
      backgroundColor: bgColors[Math.floor(Math.random() * bgColors.length)]
    };
  }

  function syncModalControls() {
    hairStyleSelect.value = currentAvatarConfig.topVariant;
    hairColorSelect.value = currentAvatarConfig.hairColor;
    clothingSelect.value = currentAvatarConfig.clothesVariant;
    clothingColorSelect.value = currentAvatarConfig.clothesColor;
    accessoriesSelect.value = currentAvatarConfig.accessoriesVariant;
    skinColorSelect.value = currentAvatarConfig.skinColor;
    bgColorInput.value = '#' + currentAvatarConfig.backgroundColor;
  }

  // Avatar event listeners
  randomizeAvatarBtn.addEventListener('click', () => {
    randomizeAvatar();
    updateAvatarPreview();
  });

  customizeAvatarBtn.addEventListener('click', () => {
    syncModalControls();
    updateModalPreview();
    avatarModal.classList.remove('hidden');
  });

  closeModalBtn.addEventListener('click', () => {
    avatarModal.classList.add('hidden');
  });

  cancelModalBtn.addEventListener('click', () => {
    avatarModal.classList.add('hidden');
  });

  saveAvatarBtn.addEventListener('click', () => {
    updateAvatarPreview();
    avatarModal.classList.add('hidden');
  });

  modalRandomizeBtn.addEventListener('click', () => {
    randomizeAvatar();
    syncModalControls();
    updateModalPreview();
  });

  // Update config when controls change
  hairStyleSelect.addEventListener('change', (e) => {
    currentAvatarConfig.topVariant = e.target.value;
    updateModalPreview();
  });

  hairColorSelect.addEventListener('change', (e) => {
    currentAvatarConfig.hairColor = e.target.value;
    updateModalPreview();
  });

  clothingSelect.addEventListener('change', (e) => {
    currentAvatarConfig.clothesVariant = e.target.value;
    updateModalPreview();
  });

  clothingColorSelect.addEventListener('change', (e) => {
    currentAvatarConfig.clothesColor = e.target.value;
    updateModalPreview();
  });

  accessoriesSelect.addEventListener('change', (e) => {
    currentAvatarConfig.accessoriesVariant = e.target.value;
    currentAvatarConfig.accessoriesProbability = e.target.value ? 100 : 0;
    updateModalPreview();
  });

  skinColorSelect.addEventListener('change', (e) => {
    currentAvatarConfig.skinColor = e.target.value;
    updateModalPreview();
  });

  bgColorInput.addEventListener('input', (e) => {
    currentAvatarConfig.backgroundColor = e.target.value.replace('#', '');
    updateModalPreview();
  });

  // ============ END AVATAR FUNCTIONS ============

  // 1. JOIN FORM FORM SUBMISSION
  joinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    myDisplayName = displayNameInput.value.trim();
    if (!myDisplayName) return;

    initializeSocketConnection();
  });

  // 2. SOCKET AND PAIRING MANAGEMENT
  function initializeSocketConnection() {
    socket = io();

    socket.on('connect', () => {
      // Send join message with avatar data
      socket.emit('join-room', { 
        roomCode, 
        displayName: myDisplayName,
        avatarData: myAvatarData
      });
    });

    socket.on('joined-successfully', (data) => {
      myPlayerId = data.playerId;
      myColor = data.color;
      
      // Update UI
      welcomeText.textContent = `WELCOME, ${myDisplayName.toUpperCase()}`;
      playerColorVal.textContent = getNeonColorName(myColor);
      playerColorVal.style.color = myColor;
      
      // Display avatar in waiting section
      if (myAvatarData && myAvatarData.url) {
        waitingAvatarImg.src = myAvatarData.url;
        waitingAvatarImg.style.display = 'block';
      }
      
      joinSection.classList.add('hidden');
      waitingSection.classList.remove('hidden');
    });

    socket.on('room-update', (data) => {
      if (data.status === 'active') {
        waitingSection.classList.add('hidden');
        gameplaySection.classList.remove('hidden');
      }
    });

    socket.on('activity-start', (data) => {
      waitingSection.classList.add('hidden');
      completeSection.classList.add('hidden');
      gameplaySection.classList.remove('hidden');
      
      // NEW: Set difficulty mode
      difficultyMode = data.state.difficulty || 'simple';
      
      // Initialise header details
      headerPilotName.textContent = myDisplayName.toUpperCase();
      headerColorDot.style.backgroundColor = myColor;
      headerColorDot.style.boxShadow = `0 0 8px ${myColor}`;
      
      // Display avatar in gameplay header
      if (myAvatarData && myAvatarData.url) {
        headerAvatarImg.src = myAvatarData.url;
        headerAvatarImg.style.display = 'block';
      }
      
      gameProgressPct.textContent = `${data.state.progress}%`;
      currentAssignedPieces = data.state.assignedPieces || [];
      selectedPieceIndex = 0;
      
      // Set background image on dragBoard as a ghost reference
      if (data.state.imageUrl) {
        dragBoard.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url(${data.state.imageUrl})`;
        dragBoard.style.backgroundSize = '100% 100%';
        dragBoard.style.backgroundPosition = 'center';
      }

      // Configure grid overlay to match server rows/cols
      const gridOverlay = document.getElementById('gridOverlay');
      if (gridOverlay && data.state.rows && data.state.cols) {
        puzzleRows = data.state.rows;
        puzzleCols = data.state.cols;
        gridOverlay.style.gridTemplateColumns = `repeat(${puzzleCols}, 1fr)`;
        gridOverlay.style.gridTemplateRows = `repeat(${puzzleRows}, 1fr)`;
        gridOverlay.innerHTML = '';
        const totalCells = puzzleRows * puzzleCols;
        for (let i = 0; i < totalCells; i++) {
          gridOverlay.appendChild(document.createElement('div'));
        }
      }

      renderAssignedPieces();
    });

    socket.on('assign-pieces', (data) => {
      currentAssignedPieces = data.assignedPieces || [];
      selectedPieceIndex = Math.max(0, Math.min(selectedPieceIndex, currentAssignedPieces.length - 1));
      renderAssignedPieces();
    });

    socket.on('piece-placed', (data) => {
      gameProgressPct.textContent = `${data.progress}%`;
      // Check if this was solved by me
      if (data.placedBy.toLowerCase() === myDisplayName.toLowerCase()) {
        piecesPlacedCount++;
        triggerHapticFeedback(true);
      }
    });

    socket.on('placement-incorrect', (data) => {
      triggerHapticFeedback(false);
      // Find matching piece and run shake animation
      const el = document.getElementById(data.pieceId);
      if (el) {
        el.classList.add('shake');
        setTimeout(() => el.classList.remove('shake'), 500);
      }
    });

    socket.on('activity-complete', () => {
      gameplaySection.classList.add('hidden');
      completeSection.classList.remove('hidden');
      myContributionsVal.textContent = piecesPlacedCount;
    });

    socket.on('host-disconnected', () => {
      alert('Event Big Screen disconnected. Returning to entry screen.');
      window.location.reload();
    });

    socket.on('error-message', (msg) => {
      alert(msg);
      window.location.reload();
    });
  }

  // 3. PIECE RENDERER & TOUCH DRAGGING ENGINE
  function renderAssignedPieces() {
    assignedPiecesPool.innerHTML = '';
    pieceSelectorContainer.innerHTML = '';

    // Guard against undefined/null (shouldn't happen but defensive)
    if (!currentAssignedPieces || currentAssignedPieces.length === 0) {
      assignedPiecesPool.innerHTML = '<div class="minimap-hint" style="color: var(--color-cyan)">Waiting for piece assignment...</div>';
      return;
    }

    // Ensure selectedPieceIndex is in valid range
    selectedPieceIndex = Math.max(0, Math.min(selectedPieceIndex, currentAssignedPieces.length - 1));

    // Show the active piece — centered in the drag board.
    // Player drags it to its correct grid position.
    const p = currentAssignedPieces[selectedPieceIndex];
    
    // NEW: Initialize rotation from server state
    currentPieceRotation = p.currentRotation || 0;

    const el = document.createElement('div');
    el.className = 'draggable-piece';
    el.id = p.id;
    // Set dynamic dimensions to exactly match the grid cell size
    const percentWidth = 100 / puzzleCols;
    const percentHeight = 100 / puzzleRows;
    el.style.width = `${percentWidth}%`;
    el.style.height = `${percentHeight}%`;
    
    // Position at the bottom initially, centered horizontally
    el.style.left = '50%';
    el.style.top = '75%';
    
    // Create piece structure with image and rotation handle
    el.innerHTML = `
      <img src="${p.imageUrl}" alt="Puzzle Piece" draggable="false" class="piece-image" />
      ${difficultyMode === 'rotated' ? '<div class="rotation-handle" title="Drag to rotate"></div>' : ''}
    `;
    
    // NEW: Apply initial rotation
    applyRotationToPiece(el);

    assignedPiecesPool.appendChild(el);
    setupDragging(el, p);

    // Show a hint label indicating the grid target (row, col) for this piece
    const hint = document.createElement('div');
    hint.style.cssText = 'position:absolute;bottom:6px;left:0;right:0;text-align:center;font-size:11px;color:rgba(0,243,255,0.5);font-family:monospace;pointer-events:none;';
    hint.textContent = `Target: row ${p.row + 1}, col ${p.col + 1}`;
    if (difficultyMode === 'rotated') {
      hint.textContent += ` • ${Math.round(currentPieceRotation)}°`;
    }
    assignedPiecesPool.appendChild(hint);

    // Render selector tabs if there are multiple pieces
    if (currentAssignedPieces.length > 1) {
      currentAssignedPieces.forEach((piece, idx) => {
        const tab = document.createElement('div');
        tab.className = `piece-tab ${idx === selectedPieceIndex ? 'active' : ''}`;
        
        tab.innerHTML = `
          <div class="piece-tab-thumb">
            <img src="${piece.imageUrl}" alt="Piece Thumbnail" draggable="false" />
          </div>
          <div class="piece-tab-info">
            <span class="tab-title">Piece ${idx + 1}</span>
            <span class="tab-target">Row ${piece.row + 1}, Col ${piece.col + 1}</span>
          </div>
        `;
        
        tab.addEventListener('click', () => {
          if (selectedPieceIndex !== idx) {
            selectedPieceIndex = idx;
            renderAssignedPieces();
          }
        });
        
        pieceSelectorContainer.appendChild(tab);
      });
    }
  }
  
  // NEW: Rotation functions
  function applyRotationToPiece(element) {
    // Apply rotation to the entire piece container
    const currentTransform = element.style.transform;
    
    // Extract translate values if they exist (for dragging)
    const translateMatch = currentTransform.match(/translate\(([^)]+)\)/);
    const scaleMatch = currentTransform.match(/scale\(([^)]+)\)/);
    
    let translatePart = translateMatch ? `translate(${translateMatch[1]})` : 'translate(-50%, -50%)';
    let scalePart = scaleMatch ? ` scale(${scaleMatch[1]})` : '';
    
    // Apply rotation to the entire container
    element.style.transform = `${translatePart}${scalePart} rotate(${currentPieceRotation}deg)`;
  }
  
  function updateRotationHint() {
    // Update the hint text with current rotation
    const hint = assignedPiecesPool.querySelector('div[style*="bottom:6px"]');
    if (hint && difficultyMode === 'rotated') {
      const currentPiece = currentAssignedPieces[selectedPieceIndex];
      if (currentPiece) {
        hint.textContent = `Target: row ${currentPiece.row + 1}, col ${currentPiece.col + 1} • ${Math.round(currentPieceRotation)}°`;
      }
    }
  }

  function setupDragging(element, pieceInfo) {
    let active = false;
    let currentX = 0;
    let currentY = 0;
    let initialX = 0;
    let initialY = 0;
    let xOffset = 0;
    let yOffset = 0;
    
    // NEW: Rotation state
    let isRotating = false;
    let rotationStartAngle = 0;
    let rotationStartValue = 0;

    // Attach only pointerdown to the element.
    // pointermove/pointerup are added to document only while dragging
    // and removed immediately on release — prevents listener accumulation.
    element.addEventListener('pointerdown', dragStart);
    
    // NEW: Handle rotation via rotation handle
    const rotationHandle = element.querySelector('.rotation-handle');
    if (rotationHandle) {
      rotationHandle.addEventListener('pointerdown', rotateStart);
    }

    function dragStart(e) {
      // Ignore if clicking on rotation handle
      if (e.target.classList.contains('rotation-handle')) {
        return;
      }
      
      e.preventDefault();
      active = true;
      element.classList.add('dragging');

      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;

      // Add move/up listeners only for the duration of this drag
      document.addEventListener('pointermove', drag, { passive: false });
      document.addEventListener('pointerup', dragEnd);
    }
    
    function rotateStart(e) {
      e.preventDefault();
      e.stopPropagation();
      
      isRotating = true;
      element.classList.add('rotating');
      
      // Calculate initial angle from piece center to pointer
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      rotationStartAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
      rotationStartValue = currentPieceRotation;
      
      // Add move/up listeners for rotation
      document.addEventListener('pointermove', rotate, { passive: false });
      document.addEventListener('pointerup', rotateEnd);
    }

    function drag(e) {
      if (!active) return;
      e.preventDefault();

      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;

      xOffset = currentX;
      yOffset = currentY;

      element.style.transform = `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px)) scale(1.1)`;
      // Re-apply rotation to maintain visual consistency during drag
      applyRotationToPiece(element);

      // Map touch position to the 1200×800 server canvas coordinate space
      const rect = dragBoard.getBoundingClientRect();
      const touchX = e.clientX - rect.left;
      const touchY = e.clientY - rect.top;

      // Snap to the nearest grid cell to remove guesswork
      const cellWidth = rect.width / puzzleCols;
      const cellHeight = rect.height / puzzleRows;
      
      const targetCol = Math.max(0, Math.min(puzzleCols - 1, Math.floor(touchX / cellWidth)));
      const targetRow = Math.max(0, Math.min(puzzleRows - 1, Math.floor(touchY / cellHeight)));

      const canvasX = Math.round(targetCol * (CANVAS_WIDTH / puzzleCols));
      const canvasY = Math.round(targetRow * (CANVAS_HEIGHT / puzzleRows));

      // NEW: Emit live position with rotation
      socket.emit('move-piece', {
        pieceId: pieceInfo.id,
        currentX: canvasX,
        currentY: canvasY,
        currentRotation: currentPieceRotation
      });
    }
    
    function rotate(e) {
      if (!isRotating) return;
      e.preventDefault();
      
      // Calculate current angle from piece center to pointer
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
      const angleDelta = currentAngle - rotationStartAngle;
      
      // Update rotation (continuous, any angle)
      currentPieceRotation = (rotationStartValue + angleDelta) % 360;
      if (currentPieceRotation < 0) currentPieceRotation += 360;
      
      // Apply rotation visually
      applyRotationToPiece(element);
      updateRotationHint();
      
      // Emit rotation update to server
      socket.emit('rotate-piece', {
        pieceId: pieceInfo.id,
        rotation: currentPieceRotation
      });
    }

    function dragEnd(e) {
      if (!active) return;
      active = false;
      element.classList.remove('dragging');

      // Always remove the document-level listeners immediately
      document.removeEventListener('pointermove', drag);
      document.removeEventListener('pointerup', dragEnd);

      const rect = dragBoard.getBoundingClientRect();
      const touchX = e.clientX - rect.left;
      const touchY = e.clientY - rect.top;

      const cellWidth = rect.width / puzzleCols;
      const cellHeight = rect.height / puzzleRows;

      const targetCol = Math.max(0, Math.min(puzzleCols - 1, Math.floor(touchX / cellWidth)));
      const targetRow = Math.max(0, Math.min(puzzleRows - 1, Math.floor(touchY / cellHeight)));

      const canvasX = Math.round(targetCol * (CANVAS_WIDTH / puzzleCols));
      const canvasY = Math.round(targetRow * (CANVAS_HEIGHT / puzzleRows));

      // NEW: Final placement submission with rotation
      socket.emit('place-piece', {
        pieceId: pieceInfo.id,
        currentX: canvasX,
        currentY: canvasY,
        currentRotation: currentPieceRotation
      });

      // Reset visual position — server will confirm or deny placement
      xOffset = 0;
      yOffset = 0;
      element.style.transform = `translate(-50%, -50%)`;
      applyRotationToPiece(element);
    }
    
    function rotateEnd(e) {
      if (!isRotating) return;
      e.preventDefault();
      
      isRotating = false;
      element.classList.remove('rotating');
      
      // Remove rotation listeners
      document.removeEventListener('pointermove', rotate);
      document.removeEventListener('pointerup', rotateEnd);
      
      // Provide haptic feedback
      triggerHapticFeedback(true);
    }
  }

  // Helper colors
  function getNeonColorName(hex) {
    const colors = {
      '#ff007f': 'NEON PINK',
      '#00f3ff': 'NEON CYAN',
      '#ffb800': 'NEON GOLD',
      '#39ff14': 'NEON GRASS',
      '#9d00ff': 'NEON AMETHYST',
      '#ff4500': 'NEON RED',
      '#e0b0ff': 'NEON MAUVE',
      '#ff00ff': 'NEON MAGENTA'
    };
    return colors[hex] || 'NEON PILOT';
  }

  // 4. HAPTICS (Device Vibration)
  function triggerHapticFeedback(success) {
    if ('vibrate' in navigator) {
      if (success) {
        // Success haptic: short double tap
        navigator.vibrate([40, 40, 60]);
      } else {
        // Failure haptic: long single rumble
        navigator.vibrate(200);
      }
    }
  }
});
