// Game configuration
const TILE_SIZE = 40;
const WORLD_WIDTH = 600;
const WORLD_HEIGHT = 600;
const MOVE_SPEED = TILE_SIZE;
const PARENT_PASSWORD = 'hero123'; // Default password - can be changed

// Room definitions
const ROOMS = {
    kitchen: {
        name: 'Kitchen',
        emoji: '🏠',
        background: ['#ffeb3b', '#ffc107'],
        obstacles: [
            { x: 200, y: 120 },
            { x: 400, y: 120 }
        ],
        doors: [
            { x: 40, y: 520, to: 'basement', label: 'Basement', emoji: '🧺', color: '#607d8b' },
            { x: 280, y: 520, to: 'petroom', label: 'Pet Room', emoji: '🐾', color: '#8bc34a' },
            { x: 520, y: 520, to: 'study', label: 'Study', emoji: '📚', color: '#9c27b0' }
        ]
    },
    basement: {
        name: 'Basement',
        emoji: '🧺',
        background: ['#607d8b', '#455a64'],
        obstacles: [
            { x: 160, y: 80 },
            { x: 360, y: 200 },
            { x: 440, y: 360 }
        ],
        doors: [
            { x: 280, y: 40, to: 'kitchen', label: 'Kitchen', emoji: '🏠', color: '#ffeb3b' }
        ]
    },
    petroom: {
        name: 'Pet Room',
        emoji: '🐾',
        background: ['#8bc34a', '#7cb342'],
        obstacles: [
            { x: 240, y: 160 },
            { x: 400, y: 240 },
            { x: 520, y: 120 }
        ],
        doors: [
            { x: 280, y: 40, to: 'kitchen', label: 'Kitchen', emoji: '🏠', color: '#ffeb3b' }
        ]
    },
    study: {
        name: 'Study',
        emoji: '📚',
        background: ['#9c27b0', '#7b1fa2'],
        obstacles: [
            { x: 200, y: 200 },
            { x: 400, y: 160 },
            { x: 480, y: 360 }
        ],
        doors: [
            { x: 280, y: 40, to: 'kitchen', label: 'Kitchen', emoji: '🏠', color: '#ffeb3b' }
        ]
    }
};

// NPC definitions
const NPCS = {
    wizard: {
        name: 'Chef Wizard',
        emoji: '🧙',
        room: 'kitchen',
        x: 280,
        y: 280,
        color: '#9c27b0',
        dialogue: "Greetings, young hero! I need help in the kitchen.",
        noQuestDialogue: "The kitchen is spotless! Come back when there's more work to do."
    },
    goblin: {
        name: 'Laundry Goblin',
        emoji: '👹',
        room: 'basement',
        x: 280,
        y: 320,
        color: '#4caf50',
        dialogue: "Oi! Got some laundry that needs doing, if ye're up for it!",
        noQuestDialogue: "All clean! The goblin is pleased. Return when the laundry piles up again!"
    },
    pet: {
        name: 'Fluffy', // Default name, can be customized
        emoji: '🐱',
        room: 'petroom',
        x: 300,
        y: 240,
        color: '#ff9800',
        dialogue: "*Meow!* I need your help with something!",
        noQuestDialogue: "*Purr purr* Everything is purrfect right now. Thanks for checking on me!"
    },
    owl: {
        name: 'Scholar Owl',
        emoji: '🦉',
        room: 'study',
        x: 260,
        y: 200,
        color: '#2196f3',
        dialogue: "Hoot hoot! I have some scholarly tasks that need your attention.",
        noQuestDialogue: "Your studies are complete for now. Well done! *Hoot*"
    }
};

// Player state
const player = {
    x: 0,
    y: 0,
    level: 1,
    xp: 0,
    currentRoom: 'kitchen',
    element: document.getElementById('player')
};

// Add limbs to player character
function initPlayerCharacter() {
    const playerEl = player.element;

    // Create arms
    const leftArm = document.createElement('div');
    leftArm.className = 'player-arm left-arm';
    const rightArm = document.createElement('div');
    rightArm.className = 'player-arm right-arm';

    // Create legs
    const leftLeg = document.createElement('div');
    leftLeg.className = 'player-leg left-leg';
    const rightLeg = document.createElement('div');
    rightLeg.className = 'player-leg right-leg';

    // Create smile
    const smile = document.createElement('div');
    smile.className = 'player-smile';

    playerEl.appendChild(leftArm);
    playerEl.appendChild(rightArm);
    playerEl.appendChild(leftLeg);
    playerEl.appendChild(rightLeg);
    playerEl.appendChild(smile);
}

initPlayerCharacter();

// UI Elements
const positionDisplay = document.getElementById('position');
const currentRoomDisplay = document.getElementById('current-room');
const playerLevelDisplay = document.getElementById('player-level');
const playerXpDisplay = document.getElementById('player-xp');
const xpNeededDisplay = document.getElementById('xp-needed');
const xpBar = document.getElementById('xp-bar');
const gameWorld = document.getElementById('game-world');

// Quest system - now tied to NPCs
let quests = []; // Each quest will have { npcId, name, description, xpReward, irlReward }
let currentNPC = null;

// Pet customization
let petName = 'Fluffy'; // Default name

// Initialize game
function init() {
    loadGameState();
    loadPetName();
    updatePlayerStats();
    switchRoom(player.currentRoom);
    setupEventListeners();

    console.log('🎮 HabitHero loaded!');
    console.log('🚪 Walk through doors to explore different rooms!');
    console.log('👨‍👩‍👧 Parents: Click "Parent Mode" to create quests');
    console.log('🧒 Kids: Talk to NPCs to get quests!');
}

// Get the current pet name
function getPetName() {
    return petName;
}

// Get NPC display name (use custom name for pet)
function getNPCName(npcId) {
    if (npcId === 'pet') {
        return getPetName();
    }
    return NPCS[npcId].name;
}

// Switch to a different room
function switchRoom(roomId) {
    player.currentRoom = roomId;
    const room = ROOMS[roomId];

    // Update room display
    currentRoomDisplay.textContent = room.name;

    // Update room background
    gameWorld.style.background = `
        repeating-linear-gradient(
            0deg,
            ${room.background[0]} 0px,
            ${room.background[0]} 40px,
            ${room.background[1]} 40px,
            ${room.background[1]} 80px
        ),
        repeating-linear-gradient(
            90deg,
            ${room.background[0]} 0px,
            ${room.background[0]} 40px,
            ${room.background[1]} 40px,
            ${room.background[1]} 80px
        )
    `;

    // Reset player position when switching rooms
    player.x = 0;
    player.y = 0;
    updatePlayerPosition();

    // Render NPCs and obstacles for this room
    renderRoom();

    // Highlight active room button
    document.querySelectorAll('.room-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.room === roomId) {
            btn.classList.add('active');
        }
    });
}

// Render NPCs, obstacles, and doors for current room
function renderRoom() {
    const room = ROOMS[player.currentRoom];
    const npcsContainer = document.getElementById('npcs-container');
    npcsContainer.innerHTML = '';

    // Render doors
    room.doors.forEach((door, index) => {
        const doorElement = document.createElement('div');
        doorElement.className = 'door';
        doorElement.style.left = door.x + 'px';
        doorElement.style.top = door.y + 'px';
        doorElement.style.borderColor = door.color;
        doorElement.dataset.doorTo = door.to;

        const doorLabel = document.createElement('div');
        doorLabel.className = 'door-label';
        doorLabel.textContent = door.emoji;
        doorElement.appendChild(doorLabel);

        const doorText = document.createElement('div');
        doorText.className = 'door-text';
        doorText.textContent = door.label;
        doorElement.appendChild(doorText);

        doorElement.addEventListener('click', () => {
            switchRoom(door.to);
        });

        npcsContainer.appendChild(doorElement);
    });

    // Render obstacles
    room.obstacles.forEach((obs, index) => {
        const obstacle = document.createElement('div');
        obstacle.className = 'obstacle';
        obstacle.style.left = obs.x + 'px';
        obstacle.style.top = obs.y + 'px';
        npcsContainer.appendChild(obstacle);
    });

    // Render NPCs in this room
    Object.entries(NPCS).forEach(([npcId, npc]) => {
        if (npc.room === player.currentRoom) {
            const npcElement = document.createElement('div');
            npcElement.className = 'npc';
            npcElement.style.left = npc.x + 'px';
            npcElement.style.top = npc.y + 'px';
            npcElement.style.background = npc.color;
            npcElement.textContent = npc.emoji;
            npcElement.dataset.npcId = npcId;

            // Check if NPC has a quest
            const hasQuest = quests.some(q => q.npcId === npcId);
            if (hasQuest) {
                npcElement.classList.add('has-quest');
            }

            npcElement.addEventListener('click', () => {
                showNPCPanel(npcId);
            });

            npcsContainer.appendChild(npcElement);
        }
    });
}

// Calculate XP needed for next level
function getXpNeeded(level) {
    return 100 * level;
}

// Update player stats display
function updatePlayerStats() {
    playerLevelDisplay.textContent = player.level;
    playerXpDisplay.textContent = player.xp;
    const xpNeeded = getXpNeeded(player.level);
    xpNeededDisplay.textContent = xpNeeded;

    // Update XP bar
    const xpPercent = (player.xp / xpNeeded) * 100;
    xpBar.style.width = xpPercent + '%';
}

// Add XP and check for level up
function addXp(amount) {
    player.xp += amount;
    const xpNeeded = getXpNeeded(player.level);

    // Check for level up
    while (player.xp >= xpNeeded) {
        player.xp -= xpNeeded;
        player.level++;
        showLevelUpNotification();
    }

    updatePlayerStats();
    saveGameState();
}

// Show level up notification
function showLevelUpNotification() {
    alert(`🎉 LEVEL UP! You are now Level ${player.level}!`);
}

// Update player position
function updatePlayerPosition() {
    player.element.style.left = player.x + 'px';
    player.element.style.top = player.y + 'px';
    positionDisplay.textContent = `X: ${Math.floor(player.x / TILE_SIZE)}, Y: ${Math.floor(player.y / TILE_SIZE)}`;

    // Check for door proximity first (higher priority)
    if (checkDoorProximity()) {
        return; // Door entered, stop checking other proximities
    }

    // Check for NPC proximity
    checkNPCProximity();
}

// Check if player is near a door
function checkDoorProximity() {
    const room = ROOMS[player.currentRoom];
    for (let door of room.doors) {
        const distance = Math.sqrt(
            Math.pow(player.x - door.x, 2) +
            Math.pow(player.y - door.y, 2)
        );

        // If player is very close to door (touching it)
        if (distance < TILE_SIZE) {
            switchRoom(door.to);
            return true;
        }
    }
    return false;
}

// Check if a position collides with any obstacle or NPC
function checkCollision(x, y) {
    // Check world boundaries
    if (x < 0 || y < 0 || x + TILE_SIZE > WORLD_WIDTH || y + TILE_SIZE > WORLD_HEIGHT) {
        return true;
    }

    // Check obstacles in current room
    const room = ROOMS[player.currentRoom];
    for (let obstacle of room.obstacles) {
        if (Math.abs(x - obstacle.x) < TILE_SIZE &&
            Math.abs(y - obstacle.y) < TILE_SIZE) {
            return true;
        }
    }

    // Check NPCs in current room
    for (let [npcId, npc] of Object.entries(NPCS)) {
        if (npc.room === player.currentRoom) {
            if (Math.abs(x - npc.x) < TILE_SIZE &&
                Math.abs(y - npc.y) < TILE_SIZE) {
                return true;
            }
        }
    }

    return false;
}

// Move player
function movePlayer(dx, dy) {
    const newX = player.x + dx;
    const newY = player.y + dy;

    // Check for collisions
    if (!checkCollision(newX, newY)) {
        player.x = newX;
        player.y = newY;
        updatePlayerPosition();

        // Add movement animation
        player.element.classList.add('moving');
        setTimeout(() => {
            player.element.classList.remove('moving');
        }, 200);
    }
}

// Check if player is near an NPC
function checkNPCProximity() {
    for (let [npcId, npc] of Object.entries(NPCS)) {
        if (npc.room === player.currentRoom) {
            const distance = Math.sqrt(
                Math.pow(player.x - npc.x, 2) +
                Math.pow(player.y - npc.y, 2)
            );

            // If player is very close to NPC (touching it)
            if (distance < TILE_SIZE * 1.2) {
                showNPCPanel(npcId);
                return;
            }
        }
    }
}

// Quest Management - now NPC-based
function createQuest(name, description, npcId, xpReward, irlReward) {
    const quest = {
        id: Date.now(),
        name,
        description,
        npcId,
        xpReward: parseInt(xpReward),
        irlReward
    };

    quests.push(quest);
    saveQuests();
    renderRoom(); // Re-render to update NPC quest indicators
    return quest;
}

function deleteQuest(questId) {
    quests = quests.filter(q => q.id !== questId);
    saveQuests();
    renderRoom(); // Re-render to update NPC quest indicators
}

function completeQuest(quest) {
    addXp(quest.xpReward);

    // Show completion message
    const npc = NPCS[quest.npcId];
    const npcName = getNPCName(quest.npcId);
    let message = `✨ Quest Complete!\n${npc.emoji} ${npcName} is pleased!\n+${quest.xpReward} XP`;
    if (quest.irlReward) {
        message += `\n🎁 Reward: ${quest.irlReward}`;
    }
    alert(message);

    // Remove quest
    deleteQuest(quest.id);
    hideNPCPanel();
}

// Show NPC interaction panel
function showNPCPanel(npcId) {
    const npc = NPCS[npcId];
    const quest = quests.find(q => q.npcId === npcId);

    currentNPC = npcId;

    // Check if this is first time meeting the pet
    if (npcId === 'pet' && !localStorage.getItem('habitHeroPetNamed')) {
        promptPetName();
        return;
    }

    // Set NPC info
    document.getElementById('npc-avatar').textContent = npc.emoji;
    document.getElementById('npc-avatar').style.background = npc.color;
    document.getElementById('npc-name').textContent = getNPCName(npcId);

    // Add rename button for pet
    const npcHeader = document.querySelector('.npc-header');
    const existingRenameBtn = document.getElementById('rename-pet-btn');
    if (existingRenameBtn) {
        existingRenameBtn.remove();
    }

    if (npcId === 'pet') {
        const renameBtn = document.createElement('button');
        renameBtn.id = 'rename-pet-btn';
        renameBtn.className = 'btn-rename';
        renameBtn.textContent = '✏️';
        renameBtn.title = 'Rename your cat';
        renameBtn.onclick = (e) => {
            e.stopPropagation();
            promptPetName();
        };
        npcHeader.appendChild(renameBtn);
    }

    const questInfo = document.getElementById('quest-info');
    const noQuestInfo = document.getElementById('no-quest-info');

    if (quest) {
        // NPC has a quest
        document.getElementById('npc-dialogue').textContent = npc.dialogue;
        document.getElementById('quest-title').textContent = quest.name;
        document.getElementById('quest-description').textContent = quest.description;
        document.getElementById('quest-xp').textContent = quest.xpReward + ' XP';

        const irlRewardContainer = document.getElementById('quest-irl-reward-container');
        if (quest.irlReward) {
            document.getElementById('quest-irl-reward').textContent = quest.irlReward;
            irlRewardContainer.style.display = 'block';
        } else {
            irlRewardContainer.style.display = 'none';
        }

        questInfo.classList.remove('hidden');
        noQuestInfo.classList.add('hidden');
    } else {
        // NPC has no quest
        document.getElementById('npc-dialogue').textContent = npc.noQuestDialogue;
        questInfo.classList.add('hidden');
        noQuestInfo.classList.remove('hidden');
    }

    document.getElementById('quest-panel').classList.remove('hidden');
}

// Prompt user to name the pet
function promptPetName() {
    const name = prompt(`🐱 What would you like to name your cat?\n\n(Current name: ${petName})`);

    if (name && name.trim()) {
        petName = name.trim();
        savePetName();
        localStorage.setItem('habitHeroPetNamed', 'true');

        // If panel is open, refresh it
        if (currentNPC === 'pet') {
            hideNPCPanel();
            setTimeout(() => showNPCPanel('pet'), 100);
        } else {
            // First time naming - show the pet
            showNPCPanel('pet');
        }

        // Re-render room to update NPC if visible
        renderRoom();
    } else if (!localStorage.getItem('habitHeroPetNamed')) {
        // First time and they cancelled - try again
        alert('Your cat needs a name!');
        promptPetName();
    }
}

function hideNPCPanel() {
    document.getElementById('quest-panel').classList.add('hidden');
    currentNPC = null;
}

// Parent Mode
function showParentMode() {
    document.getElementById('parent-panel').classList.remove('hidden');
    document.getElementById('parent-password-entry').classList.remove('hidden');
    document.getElementById('parent-quest-management').classList.add('hidden');
    document.getElementById('parent-password-input').value = '';
    document.getElementById('parent-password-input').focus();
}

function checkParentPassword() {
    const input = document.getElementById('parent-password-input').value;
    if (input === PARENT_PASSWORD) {
        document.getElementById('parent-password-entry').classList.add('hidden');
        document.getElementById('parent-quest-management').classList.remove('hidden');
        updateActiveQuestsList();
        updatePetDropdownName();
    } else {
        alert('❌ Incorrect password!');
        document.getElementById('parent-password-input').value = '';
    }
}

// Update the pet option in the dropdown to show custom name
function updatePetDropdownName() {
    const petOption = document.querySelector('#new-quest-npc option[value="pet"]');
    if (petOption) {
        petOption.textContent = `🐱 ${getPetName()} (Pet Room)`;
    }
}

function hideParentMode() {
    document.getElementById('parent-panel').classList.add('hidden');
}

function createQuestFromForm() {
    const name = document.getElementById('new-quest-name').value.trim();
    const description = document.getElementById('new-quest-description').value.trim();
    const npcId = document.getElementById('new-quest-npc').value;
    const xpReward = document.getElementById('new-quest-xp').value;
    const irlReward = document.getElementById('new-quest-reward').value.trim();

    if (!name) {
        alert('❌ Please enter a quest name!');
        return;
    }

    if (!description) {
        alert('❌ Please enter a quest description!');
        return;
    }

    // Check if NPC already has a quest
    const existingQuest = quests.find(q => q.npcId === npcId);
    if (existingQuest) {
        alert(`❌ ${NPCS[npcId].name} already has a quest! Complete or delete it first.`);
        return;
    }

    createQuest(name, description, npcId, xpReward, irlReward);

    // Clear form
    document.getElementById('new-quest-name').value = '';
    document.getElementById('new-quest-description').value = '';
    document.getElementById('new-quest-xp').value = '50';
    document.getElementById('new-quest-reward').value = '';

    // Update list
    updateActiveQuestsList();

    alert('✅ Quest created successfully!');
}

function updateActiveQuestsList() {
    const listContainer = document.getElementById('active-quests-list');

    if (quests.length === 0) {
        listContainer.innerHTML = '<p style="color: #999;">No active quests. Create one above!</p>';
        return;
    }

    listContainer.innerHTML = quests.map(quest => {
        const npc = NPCS[quest.npcId];
        const npcName = getNPCName(quest.npcId);
        return `
            <div class="quest-item">
                <div class="quest-item-header">
                    <span class="quest-item-title">${quest.name}</span>
                    <span class="quest-item-npc" style="background: ${npc.color};">
                        ${npc.emoji} ${npcName}
                    </span>
                </div>
                <div class="quest-item-description">${quest.description}</div>
                <div class="quest-item-xp">Reward: ${quest.xpReward} XP${quest.irlReward ? ' + ' + quest.irlReward : ''}</div>
                <button class="btn btn-danger btn-small" onclick="deleteQuest(${quest.id}); updateActiveQuestsList();">Delete</button>
            </div>
        `;
    }).join('');
}

// Keyboard controls
const keys = {};

document.addEventListener('keydown', (e) => {
    // Prevent default arrow key scrolling
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }

    keys[e.key] = true;
    handleMovement();
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

function handleMovement() {
    if (keys['ArrowUp']) {
        movePlayer(0, -MOVE_SPEED);
    }
    if (keys['ArrowDown']) {
        movePlayer(0, MOVE_SPEED);
    }
    if (keys['ArrowLeft']) {
        movePlayer(-MOVE_SPEED, 0);
    }
    if (keys['ArrowRight']) {
        movePlayer(MOVE_SPEED, 0);
    }
}

// Click/Tap to move
gameWorld.addEventListener('click', (e) => {
    // Ignore clicks on NPCs and doors
    if (e.target.classList.contains('npc') || e.target.closest('.npc') ||
        e.target.classList.contains('door') || e.target.closest('.door')) {
        return;
    }

    // Get the click position relative to the game world
    const rect = gameWorld.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Calculate the target position (center the player on the click)
    const targetX = clickX - (TILE_SIZE / 2);
    const targetY = clickY - (TILE_SIZE / 2);

    // Check if the position is valid
    if (!checkCollision(targetX, targetY)) {
        player.x = targetX;
        player.y = targetY;
        updatePlayerPosition();

        // Add movement animation
        player.element.classList.add('moving');
        setTimeout(() => {
            player.element.classList.remove('moving');
        }, 200);
    }
});

// Event Listeners
function setupEventListeners() {
    // Room navigation
    document.querySelectorAll('.room-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchRoom(btn.dataset.room);
        });
    });

    // Parent mode
    document.getElementById('parent-mode-btn').addEventListener('click', showParentMode);
    document.getElementById('parent-password-submit').addEventListener('click', checkParentPassword);
    document.getElementById('parent-password-cancel').addEventListener('click', hideParentMode);
    document.getElementById('parent-password-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkParentPassword();
    });

    document.getElementById('create-quest-btn').addEventListener('click', createQuestFromForm);
    document.getElementById('close-parent-panel').addEventListener('click', hideParentMode);

    // NPC/Quest panel
    document.getElementById('complete-quest-btn').addEventListener('click', () => {
        if (currentNPC) {
            const quest = quests.find(q => q.npcId === currentNPC);
            if (quest) {
                completeQuest(quest);
            }
        }
    });
    document.getElementById('close-quest-btn').addEventListener('click', hideNPCPanel);
    document.getElementById('close-npc-btn').addEventListener('click', hideNPCPanel);
}

// Storage functions
function saveGameState() {
    localStorage.setItem('habitHeroPlayer', JSON.stringify({
        level: player.level,
        xp: player.xp,
        currentRoom: player.currentRoom
    }));
}

function loadGameState() {
    const saved = localStorage.getItem('habitHeroPlayer');
    if (saved) {
        const data = JSON.parse(saved);
        player.level = data.level || 1;
        player.xp = data.xp || 0;
        player.currentRoom = data.currentRoom || 'kitchen';
    }
}

function saveQuests() {
    localStorage.setItem('habitHeroQuests', JSON.stringify(quests));
}

function loadQuests() {
    const saved = localStorage.getItem('habitHeroQuests');
    if (saved) {
        quests = JSON.parse(saved);
    }
}

function savePetName() {
    localStorage.setItem('habitHeroPetName', petName);
}

function loadPetName() {
    const saved = localStorage.getItem('habitHeroPetName');
    if (saved) {
        petName = saved;
    }
}

// Load quests before initializing
loadQuests();

// Initialize the game
init();
