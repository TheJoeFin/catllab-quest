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

// Quest system - enhanced with room, level, and completion tracking
let quests = []; // Each quest will have { id, npcId, name, description, room, level, xpReward, irlReward, acceptedByPlayer, completed }
let currentNPC = null;
let currentQuestInPanel = null; // Track which quest is being viewed in the panel
let tasksCompletedAtLevel = {}; // Track completed tasks per level { level: count }

// Pet customization
let petName = 'Fluffy'; // Default name

// Initialize game
function init() {
    loadGameState();
    loadPetName();
    loadTasksCompleted();
    updatePlayerStats();
    updatePlayerQuestList();
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

            // Check if NPC has any unaccepted quests (show indicator for available quests)
            const hasAvailableQuest = quests.some(q => q.npcId === npcId && !q.acceptedByPlayer && !q.completed);
            if (hasAvailableQuest) {
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

    // Check for level up - requires 5 completed tasks at current level
    while (player.xp >= xpNeeded) {
        const completedAtCurrentLevel = tasksCompletedAtLevel[player.level] || 0;

        if (completedAtCurrentLevel >= 5) {
            // Player has completed enough tasks to level up
            player.xp -= xpNeeded;
            player.level++;
            showLevelUpNotification();
        } else {
            // Not enough tasks completed at this level
            const remaining = 5 - completedAtCurrentLevel;
            alert(`⚠️ Level Up Blocked!\n\nYou have enough XP, but you need to complete ${remaining} more task${remaining > 1 ? 's' : ''} at Level ${player.level} before you can advance to Level ${player.level + 1}.\n\nTasks completed at Level ${player.level}: ${completedAtCurrentLevel}/5`);
            break; // Stop trying to level up
        }
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

// Quest Management - enhanced with room and level
function createQuest(name, description, npcId, room, level, xpReward, irlReward) {
    const quest = {
        id: Date.now() + Math.random(), // Ensure unique ID for multiple simultaneous quests
        name,
        description,
        npcId,
        room,
        level: parseInt(level),
        xpReward: parseInt(xpReward),
        irlReward,
        acceptedByPlayer: false, // Quest needs to be accepted before it can be completed
        completed: false
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

function acceptQuest(quest) {
    // Mark quest as accepted by player
    quest.acceptedByPlayer = true;

    // Show acceptance message
    const npc = NPCS[quest.npcId];
    const npcName = getNPCName(quest.npcId);
    alert(`✅ Quest Accepted!\n\n"${quest.name}" has been added to your quest log.\n\nCheck your sidebar to track your active quests!`);

    // Save state
    saveQuests();

    // Update displays
    updatePlayerQuestList();
    renderRoom();
    hideNPCPanel();
}

function completeQuest(quest) {
    // Can only complete accepted quests
    if (!quest.acceptedByPlayer) {
        alert('❌ You need to accept this quest first!');
        return;
    }

    // Mark quest as completed
    quest.completed = true;

    // Track completed tasks for this level
    if (!tasksCompletedAtLevel[quest.level]) {
        tasksCompletedAtLevel[quest.level] = 0;
    }
    tasksCompletedAtLevel[quest.level]++;

    addXp(quest.xpReward);

    // Show completion message
    const npc = NPCS[quest.npcId];
    const npcName = getNPCName(quest.npcId);
    const completedCount = tasksCompletedAtLevel[quest.level];
    let message = `✨ Quest Complete!\n${npc.emoji} ${npcName} is pleased!\n+${quest.xpReward} XP\n\n📊 Level ${quest.level} Progress: ${completedCount}/5 tasks completed`;
    if (quest.irlReward) {
        message += `\n🎁 Reward: ${quest.irlReward}`;
    }
    alert(message);

    // Save state
    saveQuests();
    saveTasksCompleted();

    // Update displays
    updatePlayerQuestList();
    renderRoom();
}

// Count incomplete tasks for a specific level
function getIncompleteTasksForLevel(level) {
    return quests.filter(q => q.level === level && !q.completed).length;
}

// Count total incomplete tasks across all levels
function getTotalIncompleteTasks() {
    return quests.filter(q => !q.completed).length;
}

// Validate if we can add tasks to a level (max 5 per level)
function canAddTasksToLevel(level, count = 1) {
    const currentCount = getIncompleteTasksForLevel(level);
    return (currentCount + count) <= 5;
}

// Check if total incomplete tasks will exceed warning threshold
function shouldWarnAboutTaskLimit(additionalTasks = 0) {
    const totalIncomplete = getTotalIncompleteTasks();
    return (totalIncomplete + additionalTasks) >= 10;
}

// Show NPC interaction panel
function showNPCPanel(npcId) {
    const npc = NPCS[npcId];
    // Find first unaccepted and incomplete quest for this NPC
    const quest = quests.find(q => q.npcId === npcId && !q.acceptedByPlayer && !q.completed);

    currentNPC = npcId;
    currentQuestInPanel = quest;

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
    currentQuestInPanel = null;
}

// Update player's quest list in sidebar
function updatePlayerQuestList() {
    const listContainer = document.getElementById('player-quest-list');

    // Get accepted but not completed quests
    const activeQuests = quests.filter(q => q.acceptedByPlayer && !q.completed);

    if (activeQuests.length === 0) {
        listContainer.innerHTML = '<p style="color: #999; font-size: 14px;">No active quests. Talk to NPCs!</p>';
        return;
    }

    listContainer.innerHTML = activeQuests.map(quest => {
        const npc = NPCS[quest.npcId];
        const room = ROOMS[quest.room];
        return `
            <div class="player-quest-item" style="border: 1px solid #ddd; padding: 8px; margin-bottom: 8px; border-radius: 5px; background: white;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 5px;">
                    <strong style="font-size: 14px;">${quest.name}</strong>
                    <span style="font-size: 18px;">${npc.emoji}</span>
                </div>
                <div style="font-size: 12px; color: #666; margin-bottom: 5px;">${quest.description}</div>
                <div style="font-size: 11px; color: #999; margin-bottom: 5px;">
                    📍 ${room.emoji} ${room.name} • ⭐ Level ${quest.level}
                </div>
                <div style="font-size: 11px; color: #4caf50; margin-bottom: 5px;">
                    🎯 ${quest.xpReward} XP${quest.irlReward ? ' • 🎁 ' + quest.irlReward : ''}
                </div>
                <button class="btn btn-primary btn-small" onclick="completeQuestFromList(${quest.id})" style="width: 100%; font-size: 12px; padding: 5px;">
                    ✓ Complete
                </button>
            </div>
        `;
    }).join('');
}

// Complete a quest from the player's quest list
function completeQuestFromList(questId) {
    const quest = quests.find(q => q.id === questId);
    if (quest) {
        completeQuest(quest);
    }
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

        // Initialize multi-quest form if empty
        const container = document.getElementById('quest-forms-container');
        if (container.children.length === 0) {
            addQuestForm();
        }

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

// Multi-quest creation functions
let questFormCounter = 0;

function createQuestFormHTML(formId) {
    return `
        <div class="quest-form-item" id="quest-form-${formId}" style="border: 2px solid #e0e0e0; padding: 15px; margin-bottom: 15px; border-radius: 8px; background: #fafafa;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h4 style="margin: 0;">Quest ${formId + 1}</h4>
                <button class="btn btn-danger btn-small" onclick="removeQuestForm(${formId})">Remove</button>
            </div>
            <div class="form-group">
                <label>Quest Name:</label>
                <input type="text" id="quest-name-${formId}" placeholder="e.g., Wash the Dishes">
            </div>
            <div class="form-group">
                <label>Description:</label>
                <textarea id="quest-description-${formId}" placeholder="What needs to be done?"></textarea>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div class="form-group">
                    <label>Assign to NPC:</label>
                    <select id="quest-npc-${formId}">
                        <option value="wizard">🧙 Chef Wizard</option>
                        <option value="goblin">👹 Laundry Goblin</option>
                        <option value="pet">🐱 ${getPetName()}</option>
                        <option value="owl">🦉 Scholar Owl</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Room:</label>
                    <select id="quest-room-${formId}">
                        <option value="kitchen">🏠 Kitchen</option>
                        <option value="basement">🧺 Basement</option>
                        <option value="petroom">🐾 Pet Room</option>
                        <option value="study">📚 Study</option>
                    </select>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div class="form-group">
                    <label>Level Required:</label>
                    <input type="number" id="quest-level-${formId}" value="1" min="1" max="100">
                </div>
                <div class="form-group">
                    <label>XP Reward:</label>
                    <input type="number" id="quest-xp-${formId}" value="50" min="10" max="500">
                </div>
            </div>
            <div class="form-group">
                <label>IRL Reward (optional):</label>
                <input type="text" id="quest-reward-${formId}" placeholder="e.g., 30 min screen time">
            </div>
        </div>
    `;
}

function addQuestForm() {
    const container = document.getElementById('quest-forms-container');
    const formId = questFormCounter++;
    container.insertAdjacentHTML('beforeend', createQuestFormHTML(formId));
}

function removeQuestForm(formId) {
    const formElement = document.getElementById(`quest-form-${formId}`);
    if (formElement) {
        formElement.remove();
    }
}

function createAllQuestsFromForms() {
    const container = document.getElementById('quest-forms-container');
    const forms = container.querySelectorAll('.quest-form-item');

    if (forms.length === 0) {
        alert('❌ Please add at least one quest form!');
        return;
    }

    // Collect all quest data
    const questsToCreate = [];
    const errors = [];

    forms.forEach((form, index) => {
        const formId = form.id.split('-')[2];
        const name = document.getElementById(`quest-name-${formId}`)?.value.trim();
        const description = document.getElementById(`quest-description-${formId}`)?.value.trim();
        const npcId = document.getElementById(`quest-npc-${formId}`)?.value;
        const room = document.getElementById(`quest-room-${formId}`)?.value;
        const level = parseInt(document.getElementById(`quest-level-${formId}`)?.value);
        const xpReward = document.getElementById(`quest-xp-${formId}`)?.value;
        const irlReward = document.getElementById(`quest-reward-${formId}`)?.value.trim();

        if (!name) {
            errors.push(`Quest ${index + 1}: Missing name`);
        }
        if (!description) {
            errors.push(`Quest ${index + 1}: Missing description`);
        }

        if (name && description) {
            questsToCreate.push({ name, description, npcId, room, level, xpReward, irlReward });
        }
    });

    if (errors.length > 0) {
        alert('❌ Please fix these errors:\n\n' + errors.join('\n'));
        return;
    }

    // Validate level limits
    const questsByLevel = {};
    questsToCreate.forEach(quest => {
        if (!questsByLevel[quest.level]) {
            questsByLevel[quest.level] = [];
        }
        questsByLevel[quest.level].push(quest);
    });

    for (const [level, quests] of Object.entries(questsByLevel)) {
        const newQuestsCount = quests.length;
        if (!canAddTasksToLevel(parseInt(level), newQuestsCount)) {
            const currentCount = getIncompleteTasksForLevel(parseInt(level));
            alert(`❌ Cannot add all quests!\n\nLevel ${level} will exceed the limit of 5 active tasks.\nCurrent: ${currentCount}\nTrying to add: ${newQuestsCount}\nTotal: ${currentCount + newQuestsCount}\n\nPlease adjust levels or complete some existing tasks.`);
            return;
        }
    }

    // Check total incomplete tasks warning
    if (shouldWarnAboutTaskLimit(questsToCreate.length)) {
        const totalIncomplete = getTotalIncompleteTasks();
        const shouldContinue = confirm(`⚠️ Warning: High Task Load!\n\nYou currently have ${totalIncomplete} incomplete task${totalIncomplete !== 1 ? 's' : ''}.\nYou're about to add ${questsToCreate.length} more quest${questsToCreate.length !== 1 ? 's' : ''}, bringing the total to ${totalIncomplete + questsToCreate.length}.\n\nThis may overwhelm your child. Consider completing some existing tasks first.\n\nDo you want to add these quests anyway?`);

        if (!shouldContinue) {
            return;
        }
    }

    // Create all quests
    let createdCount = 0;
    questsToCreate.forEach(quest => {
        createQuest(quest.name, quest.description, quest.npcId, quest.room, quest.level, quest.xpReward, quest.irlReward);
        createdCount++;
    });

    // Clear all forms
    container.innerHTML = '';
    questFormCounter = 0;

    // Add one fresh form
    addQuestForm();

    // Update list
    updateActiveQuestsList();

    alert(`✅ ${createdCount} quest${createdCount !== 1 ? 's' : ''} created successfully!`);
}

function createQuestFromForm() {
    const name = document.getElementById('new-quest-name').value.trim();
    const description = document.getElementById('new-quest-description').value.trim();
    const npcId = document.getElementById('new-quest-npc').value;
    const room = document.getElementById('new-quest-room').value;
    const level = parseInt(document.getElementById('new-quest-level').value);
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

    // Validate: Check if level already has 5 incomplete tasks
    if (!canAddTasksToLevel(level, 1)) {
        alert(`❌ Cannot add quest!\n\nLevel ${level} already has 5 incomplete tasks. Each level can only have 5 active tasks at a time.\n\nPlease complete some tasks at Level ${level} or assign this quest to a different level.`);
        return;
    }

    // Warning: Check if total incomplete tasks will reach 10
    if (shouldWarnAboutTaskLimit(1)) {
        const totalIncomplete = getTotalIncompleteTasks();
        const shouldContinue = confirm(`⚠️ Warning: High Task Load!\n\nYou currently have ${totalIncomplete} incomplete task${totalIncomplete !== 1 ? 's' : ''} across all levels.\n\nAdding more quests may overwhelm your child. Consider completing some existing tasks first.\n\nDo you want to add this quest anyway?`);

        if (!shouldContinue) {
            return;
        }
    }

    createQuest(name, description, npcId, room, level, xpReward, irlReward);

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

    // Separate incomplete and completed quests
    const incompleteQuests = quests.filter(q => !q.completed);
    const completedQuests = quests.filter(q => q.completed);

    if (quests.length === 0) {
        listContainer.innerHTML = '<p style="color: #999;">No quests yet. Create one above!</p>';
        return;
    }

    let html = '';

    // Show incomplete tasks count warning
    const totalIncomplete = incompleteQuests.length;
    if (totalIncomplete >= 10) {
        html += `<div style="background: #ff9800; padding: 10px; border-radius: 5px; margin-bottom: 10px; color: white;">
            <strong>⚠️ High Task Load!</strong><br>
            ${totalIncomplete} incomplete tasks. Consider completing some before adding more.
        </div>`;
    }

    // Incomplete quests
    if (incompleteQuests.length > 0) {
        html += `<h4 style="margin-top: 0;">Incomplete Quests (${incompleteQuests.length})</h4>`;
        html += incompleteQuests.map(quest => {
            const npc = NPCS[quest.npcId];
            const npcName = getNPCName(quest.npcId);
            const room = ROOMS[quest.room];
            const incompleteAtLevel = getIncompleteTasksForLevel(quest.level);
            return `
                <div class="quest-item">
                    <div class="quest-item-header">
                        <span class="quest-item-title">${quest.name}</span>
                        <span class="quest-item-npc" style="background: ${npc.color};">
                            ${npc.emoji} ${npcName}
                        </span>
                    </div>
                    <div class="quest-item-description">${quest.description}</div>
                    <div class="quest-item-meta">
                        <span>📍 ${room.emoji} ${room.name}</span>
                        <span>⭐ Level ${quest.level} (${incompleteAtLevel}/5 tasks)</span>
                    </div>
                    <div class="quest-item-xp">Reward: ${quest.xpReward} XP${quest.irlReward ? ' + ' + quest.irlReward : ''}</div>
                    <button class="btn btn-danger btn-small" onclick="deleteQuest(${quest.id}); updateActiveQuestsList();">Delete</button>
                </div>
            `;
        }).join('');
    }

    // Completed quests (collapsible)
    if (completedQuests.length > 0) {
        html += `<h4 style="margin-top: 15px; color: #4caf50;">✅ Completed Quests (${completedQuests.length})</h4>`;
        html += completedQuests.map(quest => {
            const npc = NPCS[quest.npcId];
            const npcName = getNPCName(quest.npcId);
            const room = ROOMS[quest.room];
            return `
                <div class="quest-item" style="opacity: 0.6; background: #e8f5e9;">
                    <div class="quest-item-header">
                        <span class="quest-item-title">${quest.name}</span>
                        <span class="quest-item-npc" style="background: ${npc.color};">
                            ${npc.emoji} ${npcName}
                        </span>
                    </div>
                    <div class="quest-item-meta">
                        <span>📍 ${room.emoji} ${room.name}</span>
                        <span>⭐ Level ${quest.level}</span>
                        <span style="color: #4caf50;">✅ Completed</span>
                    </div>
                    <button class="btn btn-danger btn-small" onclick="deleteQuest(${quest.id}); updateActiveQuestsList();">Delete</button>
                </div>
            `;
        }).join('');
    }

    listContainer.innerHTML = html;
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

    // Multi-quest creation buttons
    document.getElementById('add-quest-form-btn').addEventListener('click', addQuestForm);
    document.getElementById('create-all-quests-btn').addEventListener('click', createAllQuestsFromForms);
    document.getElementById('close-parent-panel').addEventListener('click', hideParentMode);

    // NPC/Quest panel
    document.getElementById('accept-quest-btn').addEventListener('click', () => {
        if (currentQuestInPanel) {
            acceptQuest(currentQuestInPanel);
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

function saveTasksCompleted() {
    localStorage.setItem('habitHeroTasksCompleted', JSON.stringify(tasksCompletedAtLevel));
}

function loadTasksCompleted() {
    const saved = localStorage.getItem('habitHeroTasksCompleted');
    if (saved) {
        tasksCompletedAtLevel = JSON.parse(saved);
    }
}

// Load quests before initializing
loadQuests();

// Initialize the game
init();
