// Game configuration
const TILE_SIZE = 40;
const WORLD_WIDTH = 600;
const WORLD_HEIGHT = 600;
const MOVE_SPEED = TILE_SIZE;
const PARENT_PASSWORD = 'hero123'; // Default password - can be changed

// Player state
const player = {
    x: 0,
    y: 0,
    level: 1,
    xp: 0,
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
const playerLevelDisplay = document.getElementById('player-level');
const playerXpDisplay = document.getElementById('player-xp');
const xpNeededDisplay = document.getElementById('xp-needed');
const xpBar = document.getElementById('xp-bar');

// Obstacles (trees) positions
const obstacles = [
    { x: 200, y: 80 },
    { x: 360, y: 80 },
    { x: 200, y: 240 },
    { x: 520, y: 320 },
    { x: 240, y: 440 },
    { x: 520, y: 200 }
];

// Quest system
let quests = [];
let currentQuest = null;

// Category emojis
const categoryEmojis = {
    kitchen: '🍳',
    pet: '🐾',
    school: '📚'
};

// Initialize game
function init() {
    loadGameState();
    updatePlayerStats();
    updatePlayerPosition();
    renderQuestMarkers();
    setupEventListeners();

    console.log('🎮 HabitHero loaded!');
    console.log('Parents: Click "Parent Mode" to create quests');
    console.log('Kids: Walk to quest markers to complete them!');
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

    // Check for quest marker proximity
    checkQuestProximity();
}

// Check if a position collides with any obstacle
function checkCollision(x, y) {
    // Check world boundaries
    if (x < 0 || y < 0 || x + TILE_SIZE > WORLD_WIDTH || y + TILE_SIZE > WORLD_HEIGHT) {
        return true;
    }

    // Check obstacles
    for (let obstacle of obstacles) {
        if (Math.abs(x - obstacle.x) < TILE_SIZE &&
            Math.abs(y - obstacle.y) < TILE_SIZE) {
            return true;
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

// Check if player is near a quest marker
function checkQuestProximity() {
    for (let quest of quests) {
        const distance = Math.sqrt(
            Math.pow(player.x - quest.x, 2) +
            Math.pow(player.y - quest.y, 2)
        );

        // If player is very close to quest marker (touching it)
        if (distance < TILE_SIZE) {
            showQuestPanel(quest);
            return;
        }
    }
}

// Quest Management
function createQuest(name, description, category, xpReward, irlReward) {
    // Find a random position that doesn't collide
    let x, y;
    let attempts = 0;
    do {
        x = Math.floor(Math.random() * (WORLD_WIDTH / TILE_SIZE - 1)) * TILE_SIZE;
        y = Math.floor(Math.random() * (WORLD_HEIGHT / TILE_SIZE - 1)) * TILE_SIZE;
        attempts++;
    } while (checkCollision(x, y) && attempts < 50);

    const quest = {
        id: Date.now(),
        name,
        description,
        category,
        xpReward: parseInt(xpReward),
        irlReward,
        x,
        y
    };

    quests.push(quest);
    saveQuests();
    renderQuestMarkers();
    return quest;
}

function deleteQuest(questId) {
    quests = quests.filter(q => q.id !== questId);
    saveQuests();
    renderQuestMarkers();
}

function completeQuest(quest) {
    addXp(quest.xpReward);

    // Show completion message
    let message = `✨ Quest Complete! +${quest.xpReward} XP`;
    if (quest.irlReward) {
        message += `\n🎁 Reward: ${quest.irlReward}`;
    }
    alert(message);

    // Remove quest
    deleteQuest(quest.id);
    hideQuestPanel();
}

// Render quest markers in the game world
function renderQuestMarkers() {
    const markersContainer = document.getElementById('quest-markers');
    markersContainer.innerHTML = '';

    quests.forEach(quest => {
        const marker = document.createElement('div');
        marker.className = `quest-marker ${quest.category}`;
        marker.style.left = quest.x + 'px';
        marker.style.top = quest.y + 'px';
        marker.textContent = categoryEmojis[quest.category];
        marker.setAttribute('data-quest-id', quest.id);

        marker.addEventListener('click', () => {
            showQuestPanel(quest);
        });

        markersContainer.appendChild(marker);
    });
}

// Show quest panel
function showQuestPanel(quest) {
    currentQuest = quest;
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

    document.getElementById('quest-panel').classList.remove('hidden');
}

function hideQuestPanel() {
    document.getElementById('quest-panel').classList.add('hidden');
    currentQuest = null;
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
    } else {
        alert('❌ Incorrect password!');
        document.getElementById('parent-password-input').value = '';
    }
}

function hideParentMode() {
    document.getElementById('parent-panel').classList.add('hidden');
}

function createQuestFromForm() {
    const name = document.getElementById('new-quest-name').value.trim();
    const description = document.getElementById('new-quest-description').value.trim();
    const category = document.getElementById('new-quest-category').value;
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

    createQuest(name, description, category, xpReward, irlReward);

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

    listContainer.innerHTML = quests.map(quest => `
        <div class="quest-item">
            <div class="quest-item-header">
                <span class="quest-item-title">${quest.name}</span>
                <span class="quest-item-category ${quest.category}">
                    ${categoryEmojis[quest.category]} ${quest.category}
                </span>
            </div>
            <div class="quest-item-description">${quest.description}</div>
            <div class="quest-item-xp">Reward: ${quest.xpReward} XP${quest.irlReward ? ' + ' + quest.irlReward : ''}</div>
            <button class="btn btn-danger btn-small" onclick="deleteQuest(${quest.id}); updateActiveQuestsList();">Delete</button>
        </div>
    `).join('');
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
const gameWorld = document.getElementById('game-world');

gameWorld.addEventListener('click', (e) => {
    // Ignore clicks on quest markers
    if (e.target.classList.contains('quest-marker')) {
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
    // Parent mode
    document.getElementById('parent-mode-btn').addEventListener('click', showParentMode);
    document.getElementById('parent-password-submit').addEventListener('click', checkParentPassword);
    document.getElementById('parent-password-cancel').addEventListener('click', hideParentMode);
    document.getElementById('parent-password-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkParentPassword();
    });

    document.getElementById('create-quest-btn').addEventListener('click', createQuestFromForm);
    document.getElementById('close-parent-panel').addEventListener('click', hideParentMode);

    // Quest panel
    document.getElementById('complete-quest-btn').addEventListener('click', () => {
        if (currentQuest) {
            completeQuest(currentQuest);
        }
    });
    document.getElementById('close-quest-btn').addEventListener('click', hideQuestPanel);
}

// Storage functions
function saveGameState() {
    localStorage.setItem('habitHeroPlayer', JSON.stringify({
        level: player.level,
        xp: player.xp
    }));
}

function loadGameState() {
    const saved = localStorage.getItem('habitHeroPlayer');
    if (saved) {
        const data = JSON.parse(saved);
        player.level = data.level || 1;
        player.xp = data.xp || 0;
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

// Load quests before initializing
loadQuests();

// Initialize the game
init();
