// Game configuration
const TILE_SIZE = 40;
const WORLD_WIDTH = 600;
const WORLD_HEIGHT = 600;
const MOVE_SPEED = TILE_SIZE;
const PARENT_PASSWORD = 'hero123'; // Default password - can be changed

// Reward Vault configuration
const DIFFICULTY_GEMS = {
    easy: 1,
    medium: 2,
    hard: 3
};

// WebSocket connection for real-time updates
let socket;
if (typeof io !== 'undefined') {
    socket = io();
    
    socket.on('connect', () => {
        console.log('🔌 Connected to server via WebSocket');
    });
    
    socket.on('disconnect', () => {
        console.log('🔌 Disconnected from server');
    });
    
    socket.on('quest:created', (quest) => {
        console.log('📢 Quest created remotely:', quest);
        loadQuests(); // Reload quests from storage
        updatePlayerQuestList();
        showNotification('New Quest!', `New quest added: ${quest.name}`, 'info', 3000);
    });
    
    socket.on('quest:completed', (data) => {
        console.log('📢 Quest completed remotely:', data);
        loadQuests();
        loadGameState();
        updatePlayerQuestList();
        updatePlayerStats();
        showNotification('Quest Completed!', 'A quest was completed!', 'success', 3000);
    });
    
    socket.on('quest:uncompleted', (data) => {
        console.log('📢 Quest uncompleted remotely:', data);
        loadQuests();
        loadGameState();
        updatePlayerQuestList();
        updatePlayerStats();
        showNotification('Quest Updated', 'A quest was marked as incomplete', 'info', 3000);
    });
    
    socket.on('quest:deleted', (data) => {
        console.log('📢 Quest deleted remotely:', data);
        loadQuests();
        updatePlayerQuestList();
        showNotification('Quest Removed', 'A quest was deleted', 'info', 3000);
    });
    
    socket.on('reward:created', (reward) => {
        console.log('📢 Reward created remotely:', reward);
        loadRewardVault();
        showNotification('New Reward!', `New reward available: ${reward.name}`, 'info', 3000);
    });
    
    socket.on('reward:claimed', (data) => {
        console.log('📢 Reward claimed remotely:', data);
        loadRewardVault();
        loadGameState();
        updatePlayerStats();
        showNotification('Reward Claimed!', 'A reward was claimed!', 'success', 3000);
    });
    
    socket.on('player:updated', (playerData) => {
        console.log('📢 Player data updated remotely:', playerData);
        loadGameState();
        updatePlayerStats();
    });
} else {
    console.warn('Socket.IO not loaded, real-time updates disabled');
}

// Room definitions with level-based interactive objects
const ROOMS = {
    kitchen: {
        name: 'Kitchen',
        emoji: '🏠',
        background: ['#ffeb3b', '#ffc107'],
        mainObject: { x: 280, y: 280, emoji: '🧙', name: 'Chef Wizard', type: 'wizard' },
        interactiveObjects: [
            { x: 200, y: 120, type: 'dishes', emoji: '🍽️', name: 'Dirty Dishes', level: 1, questType: 'dishes' },
            { x: 400, y: 120, type: 'stove', emoji: '🍳', name: 'Kitchen Counter', level: 2, questType: 'counter' },
            { x: 480, y: 360, type: 'trash', emoji: '🗑️', name: 'Trash Can', level: 3, questType: 'trash' }
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
        mainObject: { x: 280, y: 320, emoji: '👹', name: 'Laundry Goblin', type: 'goblin' },
        interactiveObjects: [
            { x: 160, y: 80, type: 'washer', emoji: '🧼', name: 'Washing Machine', level: 1, questType: 'washer' },
            { x: 360, y: 200, type: 'dryer', emoji: '👕', name: 'Dryer', level: 2, questType: 'dryer' },
            { x: 440, y: 360, type: 'basket', emoji: '🧺', name: 'Laundry Basket', level: 3, questType: 'basket' }
        ],
        doors: [
            { x: 280, y: 40, to: 'kitchen', label: 'Kitchen', emoji: '🏠', color: '#ffeb3b' },
            { x: 40, y: 520, to: 'petroom', label: 'Pet Room', emoji: '🐾', color: '#8bc34a' },
            { x: 520, y: 520, to: 'study', label: 'Study', emoji: '📚', color: '#9c27b0' }
        ]
    },
    petroom: {
        name: 'Pet Room',
        emoji: '🐾',
        background: ['#8bc34a', '#7cb342'],
        mainObject: { x: 300, y: 240, emoji: '🐱', name: 'Fluffy', type: 'pet' },
        interactiveObjects: [
            { x: 240, y: 160, type: 'bowl', emoji: '🥣', name: 'Food Bowl', level: 1, questType: 'feed' },
            { x: 400, y: 320, type: 'litterbox', emoji: '📦', name: 'Litter Box', level: 2, questType: 'clean' },
            { x: 520, y: 120, type: 'toys', emoji: '🧸', name: 'Pet Toys', level: 3, questType: 'play' }
        ],
        doors: [
            { x: 280, y: 40, to: 'kitchen', label: 'Kitchen', emoji: '🏠', color: '#ffeb3b' },
            { x: 40, y: 520, to: 'basement', label: 'Basement', emoji: '🧺', color: '#607d8b' },
            { x: 520, y: 520, to: 'study', label: 'Study', emoji: '📚', color: '#9c27b0' }
        ]
    },
    study: {
        name: 'Study',
        emoji: '📚',
        background: ['#9c27b0', '#7b1fa2'],
        mainObject: { x: 260, y: 200, emoji: '🦉', name: 'Scholar Owl', type: 'owl' },
        interactiveObjects: [
            { x: 200, y: 280, type: 'desk', emoji: '📝', name: 'Homework Desk', level: 1, questType: 'homework' },
            { x: 400, y: 160, type: 'bookshelf', emoji: '📚', name: 'Bookshelf', level: 2, questType: 'reading' },
            { x: 480, y: 360, type: 'backpack', emoji: '🎒', name: 'School Bag', level: 3, questType: 'organize' }
        ],
        doors: [
            { x: 280, y: 40, to: 'kitchen', label: 'Kitchen', emoji: '🏠', color: '#ffeb3b' },
            { x: 40, y: 520, to: 'basement', label: 'Basement', emoji: '🧺', color: '#607d8b' },
            { x: 520, y: 520, to: 'petroom', label: 'Pet Room', emoji: '🐾', color: '#8bc34a' }
        ]
    }
};

// Quest definitions for interactive objects by type and level
const OBJECT_QUESTS = {
    // Kitchen quests
    dishes: {
        1: [
            { name: "Wash Breakfast Dishes", description: "Wash all the breakfast dishes and put them away", difficulty: "easy", xp: 25 },
            { name: "Wash Dinner Dishes", description: "Wash all the dinner dishes after the meal", difficulty: "easy", xp: 25 }
        ]
    },
    counter: {
        2: [
            { name: "Wipe Kitchen Counter", description: "Clean and wipe down the kitchen counter and stovetop", difficulty: "medium", xp: 35 },
            { name: "Organize Kitchen", description: "Organize the kitchen counter and put things away", difficulty: "medium", xp: 35 }
        ]
    },
    trash: {
        3: [
            { name: "Take Out Kitchen Trash", description: "Take out the kitchen trash and replace the bag", difficulty: "hard", xp: 45 },
            { name: "Clean Under Sink", description: "Organize and clean the area under the kitchen sink", difficulty: "hard", xp: 45 }
        ]
    },
    // Basement quests
    washer: {
        1: [
            { name: "Sort Laundry", description: "Sort dirty clothes into lights and darks", difficulty: "easy", xp: 25 },
            { name: "Load Washing Machine", description: "Put sorted clothes into the washing machine", difficulty: "easy", xp: 25 }
        ]
    },
    dryer: {
        2: [
            { name: "Move Clothes to Dryer", description: "Transfer wet clothes from washer to dryer", difficulty: "medium", xp: 35 },
            { name: "Fold Warm Clothes", description: "Fold the warm clothes fresh from the dryer", difficulty: "medium", xp: 35 }
        ]
    },
    basket: {
        3: [
            { name: "Put Away Laundry", description: "Put all folded clothes away in drawers and closet", difficulty: "hard", xp: 45 },
            { name: "Organize Laundry Room", description: "Tidy up the laundry area and organize supplies", difficulty: "hard", xp: 45 }
        ]
    },
    // Pet room quests
    feed: {
        1: [
            { name: "Feed the Pet", description: "Give your pet fresh food and water", difficulty: "easy", xp: 25 },
            { name: "Refill Water Bowl", description: "Clean and refill the pet's water bowl", difficulty: "easy", xp: 25 }
        ]
    },
    clean: {
        2: [
            { name: "Clean Litter Box", description: "Scoop and clean the cat's litter box", difficulty: "medium", xp: 35 },
            { name: "Wash Pet Area", description: "Clean around the pet's feeding and sleeping area", difficulty: "medium", xp: 35 }
        ]
    },
    play: {
        3: [
            { name: "Play with Pet", description: "Spend 15 minutes playing with your pet", difficulty: "hard", xp: 45 },
            { name: "Groom Pet", description: "Brush and groom your pet's fur", difficulty: "hard", xp: 45 }
        ]
    },
    // Study quests
    homework: {
        1: [
            { name: "Complete Math Homework", description: "Finish all math homework assignments", difficulty: "easy", xp: 25 },
            { name: "Complete Reading Homework", description: "Finish reading and comprehension homework", difficulty: "easy", xp: 25 }
        ]
    },
    reading: {
        2: [
            { name: "Read for 20 Minutes", description: "Read a book for at least 20 minutes", difficulty: "medium", xp: 35 },
            { name: "Practice Spelling Words", description: "Study and practice your spelling words", difficulty: "medium", xp: 35 }
        ]
    },
    organize: {
        3: [
            { name: "Organize School Bag", description: "Clean out and organize your school backpack", difficulty: "hard", xp: 45 },
            { name: "Prepare for Tomorrow", description: "Pack your bag and lay out clothes for tomorrow", difficulty: "hard", xp: 45 }
        ]
    }
};

// NPC definitions (kept for backward compatibility but now treated as main objects)
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
    gems: 0, // Total gems collected
    currentRoom: 'kitchen',
    element: document.getElementById('player')
};

// Add limbs and face to player character
function initPlayerCharacter() {
    const playerEl = player.element;

    // Create eyes (Roblox style)
    const leftEye = document.createElement('div');
    leftEye.className = 'player-eye left-eye';
    const rightEye = document.createElement('div');
    rightEye.className = 'player-eye right-eye';

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

    playerEl.appendChild(leftEye);
    playerEl.appendChild(rightEye);
    playerEl.appendChild(leftArm);
    playerEl.appendChild(rightArm);
    playerEl.appendChild(leftLeg);
    playerEl.appendChild(rightLeg);
    playerEl.appendChild(smile);
}

initPlayerCharacter();

// UI Elements
const currentRoomDisplay = document.getElementById('current-room');
const playerLevelDisplay = document.getElementById('player-level');
const playerXpDisplay = document.getElementById('player-xp');
const xpNeededDisplay = document.getElementById('xp-needed');
const xpBar = document.getElementById('xp-bar');
const gameWorld = document.getElementById('game-world');

// Quest system - enhanced with room, level, difficulty, and completion tracking
let quests = []; // Each quest will have { id, npcId, name, description, room, level, difficulty, xpReward, gemReward, irlReward, acceptedByPlayer, completed, isDaily }
let currentNPC = null;
let currentQuestInPanel = null; // Track which quest is being viewed in the panel
let tasksCompletedAtLevel = {}; // Track completed tasks per level { level: count }

// Default daily quests that reset every day
const DEFAULT_DAILY_QUESTS = [
    // Kitchen quests - Chef Wizard
    {
        npcId: 'wizard',
        name: 'Wash the Dishes',
        description: 'Help the Chef Wizard by washing all the dishes after meals.',
        difficulty: 'easy',
        xpReward: 25,
        gemReward: 1
    },
    {
        npcId: 'wizard',
        name: 'Clean Kitchen Counter',
        description: 'Wipe down the kitchen counter and keep it sparkling clean.',
        difficulty: 'easy',
        xpReward: 20,
        gemReward: 1
    },
    // Basement quests - Laundry Goblin
    {
        npcId: 'goblin',
        name: 'Sort the Laundry',
        description: 'Help the goblin sort clothes into lights and darks.',
        difficulty: 'easy',
        xpReward: 25,
        gemReward: 1
    },
    {
        npcId: 'goblin',
        name: 'Fold Clean Clothes',
        description: 'Fold the clean laundry and put it away neatly.',
        difficulty: 'medium',
        xpReward: 35,
        gemReward: 2
    },
    // Pet Room quests - Fluffy
    {
        npcId: 'pet',
        name: 'Feed the Pet',
        description: 'Make sure your pet has fresh food and water.',
        difficulty: 'easy',
        xpReward: 20,
        gemReward: 1
    },
    {
        npcId: 'pet',
        name: 'Clean Pet Area',
        description: 'Clean up the pet area and make it comfortable.',
        difficulty: 'easy',
        xpReward: 25,
        gemReward: 1
    },
    // Study quests - Scholar Owl
    {
        npcId: 'owl',
        name: 'Complete Homework',
        description: 'Finish all your homework assignments for today.',
        difficulty: 'medium',
        xpReward: 40,
        gemReward: 2
    },
    {
        npcId: 'owl',
        name: 'Read for 20 Minutes',
        description: 'Spend 20 minutes reading a book of your choice.',
        difficulty: 'easy',
        xpReward: 30,
        gemReward: 1
    }
];

// Reward Vault system
let vaultRewards = []; // Parent-defined rewards { id, name, gemCost, unlocked, claimed }

// Pet customization
let petName = 'Fluffy'; // Default name

// Notification System
function showNotification(title, message, type = 'info', duration = 3000) {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: '💡',
        gem: '💎',
        level: '🎉',
        quest: '📜'
    };

    const icon = icons[type] || icons.info;

    notification.innerHTML = `
        <div class="notification-icon">${icon}</div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            ${message ? `<div class="notification-message">${message}</div>` : ''}
        </div>
    `;

    container.appendChild(notification);

    // Auto-remove after duration
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, duration);
}

// Daily quest management
function createDailyQuest(template) {
    const npc = NPCS[template.npcId];
    return {
        id: Date.now() + Math.random(),
        npcId: template.npcId,
        name: template.name,
        description: template.description,
        room: npc.room,
        level: 1, // All daily quests are level 1
        difficulty: template.difficulty,
        xpReward: template.xpReward,
        gemReward: template.gemReward,
        irlReward: '',
        acceptedByPlayer: false,
        completed: false,
        isDaily: true // Mark as daily quest
    };
}

function initializeDailyQuests() {
    // Check if we need to reset daily quests
    const lastResetDate = localStorage.getItem('habitHeroLastDailyReset');
    const today = new Date().toDateString();
    
    if (lastResetDate !== today) {
        // It's a new day! Reset daily quests
        console.log('🌅 New day detected! Resetting daily quests...');
        
        // Remove old daily quests
        quests = quests.filter(q => !q.isDaily);
        
        // Add fresh daily quests
        DEFAULT_DAILY_QUESTS.forEach(template => {
            const dailyQuest = createDailyQuest(template);
            quests.push(dailyQuest);
        });
        
        // Save the reset date
        localStorage.setItem('habitHeroLastDailyReset', today);
        saveQuests();
        
        console.log(`✅ Added ${DEFAULT_DAILY_QUESTS.length} daily quests!`);
    } else {
        // Check if daily quests exist, if not add them
        const dailyQuestsExist = quests.some(q => q.isDaily);
        if (!dailyQuestsExist) {
            console.log('📜 Adding daily quests for the first time...');
            DEFAULT_DAILY_QUESTS.forEach(template => {
                const dailyQuest = createDailyQuest(template);
                quests.push(dailyQuest);
            });
            localStorage.setItem('habitHeroLastDailyReset', today);
            saveQuests();
        }
    }
}

// Initialize game
function init() {
    loadGameState();
    loadPetName();
    loadTasksCompleted();
    loadRewardVault();
    initializeDailyQuests(); // Initialize or reset daily quests
    updatePlayerStats();
    updatePlayerQuestList();
    switchRoom(player.currentRoom);
    setupEventListeners();

    console.log('🎮 HabitHero loaded!');
    console.log('🚪 Walk through doors to explore different rooms!');
    console.log('👨‍👩‍👧 Parents: Click "Parent Mode" to create quests');
    console.log('🧒 Kids: Talk to NPCs to get quests!');
    console.log('💎 Collect gems from quests to unlock rewards!');

    // Show welcome modal
    showWelcomeModal();
}

// Show Welcome Modal with motivational stats
function showWelcomeModal() {
    const modal = document.getElementById('welcome-modal');
    
    // Get time of day for greeting
    const hour = new Date().getHours();
    let greeting = 'Good Morning';
    if (hour >= 12 && hour < 17) {
        greeting = 'Good Afternoon';
    } else if (hour >= 17) {
        greeting = 'Good Evening';
    }
    
    // Set greeting
    document.getElementById('welcome-greeting-text').textContent = `${greeting}, Hero!`;
    
    // Set date
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = new Date().toLocaleDateString('en-US', dateOptions);
    document.getElementById('welcome-date').textContent = dateStr;
    
    // Set stats
    document.getElementById('welcome-level').textContent = player.level;
    document.getElementById('welcome-gems').textContent = player.gems;
    document.getElementById('welcome-xp').textContent = `${player.xp} / ${getXpNeeded(player.level)}`;
    
    // Get active quests
    const activeQuests = quests.filter(q => q.acceptedByPlayer && !q.completed);
    const completedToday = getCompletedTodayCount();
    
    // Current quest (first active quest)
    const currentQuestDiv = document.getElementById('welcome-current-quest');
    if (activeQuests.length > 0) {
        const quest = activeQuests[0];
        currentQuestDiv.innerHTML = `
            <div class="quest-item">
                <span class="quest-name">${quest.name}</span>
                <span class="quest-npc">from ${getNPCName(quest.npcId)}</span>
                <span class="quest-difficulty ${quest.difficulty}">${quest.difficulty.toUpperCase()}</span>
                <div style="margin-top: 8px; color: #666;">
                    Rewards: ${quest.xpReward} XP, ${quest.gemReward} 💎
                </div>
            </div>
        `;
    } else {
        currentQuestDiv.innerHTML = '<p class="no-quest-msg">No active quests - Talk to NPCs to get started!</p>';
    }
    
    // Most pressing quest (hard difficulty or oldest)
    const pressingQuestDiv = document.getElementById('welcome-pressing-quest');
    const hardQuests = activeQuests.filter(q => q.difficulty === 'hard');
    const pressingQuest = hardQuests.length > 0 ? hardQuests[0] : activeQuests[0];
    
    if (pressingQuest && pressingQuest !== activeQuests[0]) {
        pressingQuestDiv.innerHTML = `
            <div class="quest-item">
                <span class="quest-name">${pressingQuest.name}</span>
                <span class="quest-npc">from ${getNPCName(pressingQuest.npcId)}</span>
                <span class="quest-difficulty ${pressingQuest.difficulty}">${pressingQuest.difficulty.toUpperCase()}</span>
            </div>
        `;
    } else if (activeQuests.length > 1) {
        const secondQuest = activeQuests[1];
        pressingQuestDiv.innerHTML = `
            <div class="quest-item">
                <span class="quest-name">${secondQuest.name}</span>
                <span class="quest-npc">from ${getNPCName(secondQuest.npcId)}</span>
                <span class="quest-difficulty ${secondQuest.difficulty}">${secondQuest.difficulty.toUpperCase()}</span>
            </div>
        `;
    } else {
        pressingQuestDiv.innerHTML = '<p class="no-quest-msg">All caught up! Great job! 🎉</p>';
    }
    
    // Next reward
    const nextRewardDiv = document.getElementById('welcome-next-reward');
    const unlockedRewards = vaultRewards.filter(r => !r.unlocked).sort((a, b) => a.gemCost - b.gemCost);
    
    if (unlockedRewards.length > 0) {
        const nextReward = unlockedRewards[0];
        const gemsNeeded = nextReward.gemCost - player.gems;
        const progress = Math.min(100, (player.gems / nextReward.gemCost) * 100).toFixed(0);
        
        nextRewardDiv.innerHTML = `
            <div class="reward-item">
                <div>
                    <span class="reward-name">${nextReward.name}</span>
                    <div class="reward-progress">${gemsNeeded > 0 ? `${gemsNeeded} more gems needed` : 'Ready to unlock!'}</div>
                </div>
                <span class="reward-cost">💎 ${nextReward.gemCost}</span>
            </div>
            <div style="margin-top: 10px;">
                <div style="background: #e0e0e0; height: 8px; border-radius: 4px; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, #ffd700, #ffed4e); height: 100%; width: ${progress}%; transition: width 0.3s;"></div>
                </div>
            </div>
        `;
    } else if (vaultRewards.filter(r => r.unlocked && !r.claimed).length > 0) {
        nextRewardDiv.innerHTML = `
            <p style="color: #4caf50; font-weight: bold; margin: 0;">
                🎉 You have unlocked rewards waiting in your vault!
            </p>
        `;
    } else {
        nextRewardDiv.innerHTML = '<p class="no-reward-msg">No rewards available yet - Ask your parents to add some!</p>';
    }
    
    // Progress stats
    document.getElementById('welcome-active-count').textContent = activeQuests.length;
    document.getElementById('welcome-completed-count').textContent = completedToday;
    
    const tasksAtCurrentLevel = tasksCompletedAtLevel[player.level] || 0;
    document.getElementById('welcome-level-tasks').textContent = `${tasksAtCurrentLevel} / 15`;
    
    // Motivational quotes
    const quotes = [
        "You've got this! Let's make today amazing! 🌟",
        "Every quest completed brings you closer to greatness! 💪",
        "Today is a new day to be a hero! 🦸",
        "Small steps lead to big victories! 🚀",
        "Your adventure awaits - let's go! ⚔️",
        "Believe in yourself and watch magic happen! ✨",
        "You're doing great - keep up the momentum! 🎯",
        "One quest at a time, one day at a time! 🌈"
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    document.getElementById('welcome-quote').textContent = randomQuote;
    
    // Show modal
    modal.classList.remove('hidden');
}

// Get count of quests completed today
function getCompletedTodayCount() {
    const today = new Date().toDateString();
    const completedToday = quests.filter(q => {
        if (!q.completed || !q.completedAt) return false;
        const completedDate = new Date(q.completedAt).toDateString();
        return completedDate === today;
    });
    return completedToday.length;
}

// Close welcome modal
function closeWelcomeModal() {
    const modal = document.getElementById('welcome-modal');
    modal.classList.add('hidden');
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
let isSwitchingRoom = false; // Flag to prevent recursive room switches

function switchRoom(roomId, fromRoom = null) {
    if (isSwitchingRoom) {
        console.log('Already switching room, skipping...');
        return;
    }
    
    isSwitchingRoom = true;
    
    console.log('=== SWITCH ROOM DEBUG ===');
    console.log('Switching to:', roomId);
    console.log('From room param:', fromRoom);
    console.log('Current player.currentRoom:', player.currentRoom);
    
    const previousRoom = player.currentRoom;
    player.currentRoom = roomId;
    const room = ROOMS[roomId];
    
    console.log('Previous room:', previousRoom);
    console.log('New room ID:', roomId);
    console.log('Room object exists?', !!room);
    
    if (!room) {
        console.error('ERROR: Invalid room ID:', roomId);
        isSwitchingRoom = false;
        return;
    }

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

    // Position player at the corresponding door in the new room
    // Find the door that leads back to where we came from
    if (fromRoom || previousRoom) {
        const sourceRoom = fromRoom || previousRoom;
        const correspondingDoor = room.doors.find(door => door.to === sourceRoom);
        
        console.log('Looking for door back to:', sourceRoom);
        console.log('Found corresponding door?', !!correspondingDoor);
        
        if (correspondingDoor) {
            // Place player at the door position in the new room
            player.x = correspondingDoor.x;
            player.y = correspondingDoor.y;
            console.log('Placed player at door:', correspondingDoor.x, correspondingDoor.y);
        } else {
            // No corresponding door found, use default position
            player.x = 0;
            player.y = 0;
            console.log('No corresponding door, using default (0,0)');
        }
    } else {
        // First time entering or no previous room, use default position
        player.x = 0;
        player.y = 0;
        console.log('First time or no previous room, using default (0,0)');
    }
    
    console.log('Final player position:', player.x, player.y);
    console.log('About to call updatePlayerPosition()');
    updatePlayerPosition();
    
    console.log('About to call renderRoom()');
    // Render NPCs and obstacles for this room
    renderRoom();
    
    console.log('About to save game state');
    // Save the room change
    saveGameState();
    
    console.log('=== SWITCH ROOM COMPLETE ===');

    // Highlight active room button in quick nav
    document.querySelectorAll('.room-nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.room === roomId) {
            btn.classList.add('active');
        }
    });
    
    // Reset the flag after a short delay to allow rendering to complete
    setTimeout(() => {
        isSwitchingRoom = false;
        console.log('Room switch flag reset');
    }, 100);
}

// Render NPCs, obstacles, and doors for current room
function renderRoom() {
    const room = ROOMS[player.currentRoom];
    const npcsContainer = document.getElementById('npcs-container');
    
    console.log('=== RENDER ROOM DEBUG ===');
    console.log('Current room ID:', player.currentRoom);
    console.log('Room object:', room);
    console.log('Room exists?', !!room);
    console.log('npcsContainer element:', npcsContainer);
    console.log('npcsContainer exists?', !!npcsContainer);
    
    if (!room) {
        console.error('ERROR: Room not found for ID:', player.currentRoom);
        return;
    }
    
    if (!npcsContainer) {
        console.error('ERROR: npcs-container element not found!');
        return;
    }
    
    console.log('Before clearing - npcsContainer.children.length:', npcsContainer.children.length);
    npcsContainer.innerHTML = '';
    console.log('After clearing - npcsContainer.children.length:', npcsContainer.children.length);
    
    console.log('Rendering room:', player.currentRoom);
    console.log('Room name:', room.name);
    console.log('Doors:', room.doors?.length || 0);
    console.log('Interactive objects:', room.interactiveObjects?.length || 0);
    console.log('Main object:', room.mainObject?.name || 'none');

    // Render doors
    console.log('Starting to render doors...');
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
    console.log('Doors rendered:', room.doors.length);

    // Render interactive objects (furniture with quests)
    if (room.interactiveObjects) {
        console.log('Interactive objects found:', room.interactiveObjects.length);
        room.interactiveObjects.forEach((obj, index) => {
            const objElement = document.createElement('div');
            objElement.className = 'interactive-object';
            objElement.style.left = obj.x + 'px';
            objElement.style.top = obj.y + 'px';
            objElement.textContent = obj.emoji;
            objElement.dataset.objectType = obj.questType;
            objElement.dataset.objectLevel = obj.level;
            
            // Update title to clarify difficulty
            const difficultyLabel = obj.level === 1 ? 'Easy' : obj.level === 2 ? 'Medium' : 'Hard';
            objElement.title = `${obj.name} - ${difficultyLabel} Tasks`;
            
            // Add level indicator
            const levelBadge = document.createElement('div');
            levelBadge.className = 'object-level-badge';
            levelBadge.textContent = obj.level;
            levelBadge.title = `${difficultyLabel} Difficulty`;
            objElement.appendChild(levelBadge);
            
            objElement.addEventListener('click', () => {
                showObjectQuestPanel(obj);
            });
            
            npcsContainer.appendChild(objElement);
            console.log('Added interactive object:', obj.name);
        });
    } else {
        console.log('No interactive objects in room');
    }

    // Render main object (NPC without background)
    if (room.mainObject) {
        console.log('Main object found:', room.mainObject.name);
        const mainObj = room.mainObject;
        const objElement = document.createElement('div');
        objElement.className = 'main-object';
        objElement.style.left = mainObj.x + 'px';
        objElement.style.top = mainObj.y + 'px';
        objElement.textContent = mainObj.emoji;
        objElement.dataset.objectType = mainObj.type;
        objElement.title = mainObj.name;
        
        objElement.addEventListener('click', () => {
            showMainObjectInfo(mainObj);
        });
        
        npcsContainer.appendChild(objElement);
        console.log('Added main object:', mainObj.name);
    } else {
        console.log('No main object in room');
    }
    
    console.log('=== RENDER COMPLETE ===');
    console.log('Total children in npcsContainer:', npcsContainer.children.length);
    console.log('Children elements:', Array.from(npcsContainer.children).map(el => el.className));
    console.log('========================');
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

    // Update gems display
    const playerGemsDisplay = document.getElementById('player-gems');
    if (playerGemsDisplay) {
        playerGemsDisplay.textContent = player.gems;
    }
}

// Add XP and check for level up
function addXp(amount) {
    player.xp += amount;
    const xpNeeded = getXpNeeded(player.level);

    // Check for level up - requires 5 completed tasks at current player level
    while (player.xp >= xpNeeded) {
        const completedAtCurrentLevel = tasksCompletedAtLevel[player.level] || 0;

        if (completedAtCurrentLevel >= 5) {
            // Player has completed enough tasks to level up
            player.xp -= xpNeeded;
            player.level++;
            // Reset task counter for new level
            tasksCompletedAtLevel[player.level] = 0;
            showLevelUpNotification();
        } else {
            // Not enough tasks completed at this level
            const remaining = 5 - completedAtCurrentLevel;
            showNotification('Level Up Blocked', `Complete ${remaining} more task${remaining > 1 ? 's' : ''} at Level ${player.level} to advance`, 'warning', 4000);
            break; // Stop trying to level up
        }
    }

    updatePlayerStats();
    saveGameState();
}

// Add gems to player's vault
function addGems(amount) {
    player.gems += amount;
    saveGameState();
}

// Check if any rewards should be unlocked based on current gem count
function checkRewardUnlocks() {
    let newlyUnlocked = [];

    vaultRewards.forEach(reward => {
        if (!reward.unlocked && player.gems >= reward.gemCost) {
            reward.unlocked = true;
            newlyUnlocked.push(reward);
        }
    });

    if (newlyUnlocked.length > 0) {
        saveRewardVault();
        const rewardNames = newlyUnlocked.map(r => r.name).join(', ');
        showNotification('Reward Unlocked!', `${rewardNames} - Check your Reward Vault!`, 'gem', 4000);
    }
}

// Show level up notification
function showLevelUpNotification() {
    showNotification('LEVEL UP!', `You are now Level ${player.level}!`, 'level', 4000);
}

// Update player position
function updatePlayerPosition() {
    player.element.style.left = player.x + 'px';
    player.element.style.top = player.y + 'px';

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

// Check if a position collides with any obstacle, interactive object, or main object
function checkCollision(x, y) {
    // Check world boundaries
    if (x < 0 || y < 0 || x + TILE_SIZE > WORLD_WIDTH || y + TILE_SIZE > WORLD_HEIGHT) {
        return true;
    }

    const room = ROOMS[player.currentRoom];
    
    // Check interactive objects in current room
    if (room.interactiveObjects) {
        for (let obj of room.interactiveObjects) {
            if (Math.abs(x - obj.x) < TILE_SIZE &&
                Math.abs(y - obj.y) < TILE_SIZE) {
                return true;
            }
        }
    }
    
    // Check main object in current room
    if (room.mainObject) {
        const mainObj = room.mainObject;
        if (Math.abs(x - mainObj.x) < TILE_SIZE &&
            Math.abs(y - mainObj.y) < TILE_SIZE) {
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
    } else {
        // Collision detected - check if we bumped into an interactive object or main object
        checkObjectBump(newX, newY);
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

// Check if player bumped into an interactive object or main object
function checkObjectBump(attemptedX, attemptedY) {
    const room = ROOMS[player.currentRoom];
    
    // Check interactive objects
    if (room.interactiveObjects) {
        for (let obj of room.interactiveObjects) {
            if (Math.abs(attemptedX - obj.x) < TILE_SIZE &&
                Math.abs(attemptedY - obj.y) < TILE_SIZE) {
                // Player bumped into this interactive object - auto-interact
                showObjectQuestPanel(obj);
                return;
            }
        }
    }
    
    // Check main object (wizard, goblin, etc.)
    if (room.mainObject) {
        const mainObj = room.mainObject;
        if (Math.abs(attemptedX - mainObj.x) < TILE_SIZE &&
            Math.abs(attemptedY - mainObj.y) < TILE_SIZE) {
            // Player bumped into main object - auto-interact
            showMainObjectInfo(mainObj);
            return;
        }
    }
}

// Quest Management - enhanced with room, level, and difficulty
function createQuest(name, description, npcId, room, level, difficulty, xpReward, irlReward) {
    const gemReward = DIFFICULTY_GEMS[difficulty] || 1; // Default to easy (1 gem) if difficulty not specified

    const quest = {
        id: Date.now() + Math.random(), // Ensure unique ID for multiple simultaneous quests
        name,
        description,
        npcId,
        room,
        level: parseInt(level),
        difficulty: difficulty || 'easy',
        xpReward: parseInt(xpReward),
        gemReward: gemReward,
        irlReward,
        acceptedByPlayer: false, // Quest needs to be accepted before it can be completed
        completed: false
    };

    quests.push(quest);
    saveQuests();
    renderRoom(); // Re-render to update NPC quest indicators
    
    // Emit WebSocket event
    if (socket && socket.connected) {
        socket.emit('quest:created', quest);
    }
    
    return quest;
}

function deleteQuest(questId) {
    quests = quests.filter(q => q.id !== questId);
    saveQuests();
    renderRoom(); // Re-render to update NPC quest indicators
    
    // Emit WebSocket event
    if (socket && socket.connected) {
        socket.emit('quest:deleted', { questId });
    }
}

function acceptQuest(quest) {
    // Mark quest as accepted by player
    quest.acceptedByPlayer = true;

    // Show acceptance message
    const npc = NPCS[quest.npcId];
    const npcName = getNPCName(quest.npcId);
    showNotification('Quest Accepted', `"${quest.name}" added to your quest log`, 'quest', 3000);

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
        showNotification('Cannot Complete', 'You need to accept this quest first!', 'error', 3000);
        return;
    }

    // Mark quest as completed
    quest.completed = true;
    quest.completedAt = new Date().toISOString(); // Track when it was completed

    // Track completed tasks for the PLAYER'S current level (not quest level)
    if (!tasksCompletedAtLevel[player.level]) {
        tasksCompletedAtLevel[player.level] = 0;
    }
    tasksCompletedAtLevel[player.level]++;

    // Award XP and gems
    addXp(quest.xpReward);
    addGems(quest.gemReward);

    // Show completion message
    const completedCount = tasksCompletedAtLevel[player.level];
    const difficultyLabel = quest.level === 1 ? 'Easy' : quest.level === 2 ? 'Medium' : 'Hard';
    let message = `+${quest.xpReward} XP, +${quest.gemReward} Gem${quest.gemReward > 1 ? 's' : ''} • ${completedCount}/15 tasks at Player Level ${player.level}`;
    showNotification('Quest Complete!', message, 'success', 4000);

    // Save state
    saveQuests();
    saveTasksCompleted();

    // Update displays
    updatePlayerQuestList();
    updatePlayerStats();
    renderRoom();
    checkRewardUnlocks(); // Check if any rewards were unlocked
    
    // Emit WebSocket event
    if (socket && socket.connected) {
        socket.emit('quest:completed', { 
            quest,
            playerLevel: player.level,
            playerXp: player.xp,
            playerGems: player.gems
        });
    }
}

// Count incomplete tasks for a specific level
function getIncompleteTasksForLevel(level) {
    return quests.filter(q => q.level === level && !q.completed).length;
}

// Count total incomplete tasks across all levels
function getTotalIncompleteTasks() {
    return quests.filter(q => !q.completed).length;
}

// Validate if we can add tasks to a level (max 15 per level)
function canAddTasksToLevel(level, count = 1) {
    const currentCount = getIncompleteTasksForLevel(level);
    return (currentCount + count) <= 15;
}

// Check if total incomplete tasks will exceed warning threshold
function shouldWarnAboutTaskLimit(additionalTasks = 0) {
    const totalIncomplete = getTotalIncompleteTasks();
    return (totalIncomplete + additionalTasks) >= 10;
}

// Show quest panel for interactive object
function showObjectQuestPanel(obj) {
    // Get available quests for this object type and level
    const availableQuests = OBJECT_QUESTS[obj.questType]?.[obj.level] || [];
    
    if (availableQuests.length === 0) {
        showNotification('No Quests', `No quests available for ${obj.name}`, 'info', 3000);
        return;
    }
    
    // Randomly select one quest from available quests
    const selectedQuest = availableQuests[Math.floor(Math.random() * availableQuests.length)];
    
    const difficultyLabel = obj.level === 1 ? 'Easy' : obj.level === 2 ? 'Medium' : 'Hard';
    
    // Set object info
    document.getElementById('npc-avatar').textContent = obj.emoji;
    document.getElementById('npc-avatar').style.background = 'transparent';
    document.getElementById('npc-name').textContent = obj.name;
    
    // Set dialogue
    document.getElementById('npc-dialogue').textContent = `This ${obj.name.toLowerCase()} needs attention! (${difficultyLabel} Task)`;
    
    // Set quest info
    document.getElementById('quest-title').textContent = selectedQuest.name;
    document.getElementById('quest-description').textContent = selectedQuest.description;
    
    // Display difficulty
    const difficultyBadge = document.getElementById('quest-difficulty');
    difficultyBadge.textContent = selectedQuest.difficulty.charAt(0).toUpperCase() + selectedQuest.difficulty.slice(1);
    difficultyBadge.className = 'difficulty-badge difficulty-' + selectedQuest.difficulty;
    
    // Display rewards
    const gemReward = DIFFICULTY_GEMS[selectedQuest.difficulty] || 1;
    document.getElementById('quest-xp').textContent = selectedQuest.xp + ' XP';
    document.getElementById('quest-gems').textContent = gemReward;
    
    // Hide IRL reward for object quests
    document.getElementById('quest-irl-reward-container').style.display = 'none';
    
    // Store quest info for acceptance
    currentQuestInPanel = {
        name: selectedQuest.name,
        description: selectedQuest.description,
        difficulty: selectedQuest.difficulty,
        xpReward: selectedQuest.xp,
        gemReward: gemReward,
        level: obj.level, // This is difficulty level, not player level requirement
        objectType: obj.type,
        room: player.currentRoom
    };
    
    // Show quest info, hide no quest info
    document.getElementById('quest-info').classList.remove('hidden');
    document.getElementById('no-quest-info').classList.add('hidden');
    document.getElementById('quest-panel').classList.remove('hidden');
}

// Show info panel for main object (character)
function showMainObjectInfo(mainObj) {
    // Set main object info
    document.getElementById('npc-avatar').textContent = mainObj.emoji;
    document.getElementById('npc-avatar').style.background = 'transparent';
    document.getElementById('npc-name').textContent = mainObj.name;
    
    // Set dialogue
    const dialogues = {
        wizard: "Hello! Click on the objects around the kitchen to find chores!",
        goblin: "Oi! Check the laundry machines and basket for tasks!",
        pet: "*Meow!* Touch my bowl, litter box, or toys for tasks!",
        owl: "*Hoot!* Interact with the desk, bookshelf, or backpack for study tasks!"
    };
    
    document.getElementById('npc-dialogue').textContent = dialogues[mainObj.type] || "Click on objects in this room to find quests!";
    
    // Hide quest info, show no quest info
    document.getElementById('quest-info').classList.add('hidden');
    document.getElementById('no-quest-info').classList.remove('hidden');
    document.getElementById('quest-panel').classList.remove('hidden');
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

        // Display difficulty
        const difficultyBadge = document.getElementById('quest-difficulty');
        const difficulty = quest.difficulty || 'easy';
        difficultyBadge.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
        difficultyBadge.className = 'difficulty-badge difficulty-' + difficulty;

        // Display rewards
        document.getElementById('quest-xp').textContent = quest.xpReward + ' XP';
        document.getElementById('quest-gems').textContent = quest.gemReward || DIFFICULTY_GEMS[difficulty] || 1;

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
        showNotification('Pet Named!', `Say hello to ${petName}!`, 'success', 3000);
    } else if (!localStorage.getItem('habitHeroPetNamed')) {
        // First time and they cancelled - use default name
        localStorage.setItem('habitHeroPetNamed', 'true');
        savePetName();
        showNPCPanel('pet');
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
        const difficulty = quest.difficulty || 'easy';
        const difficultyColor = difficulty === 'easy' ? '#4caf50' : difficulty === 'medium' ? '#ff9800' : '#f44336';
        
        // Get emoji - either from NPC or use a default based on room
        let questEmoji = '📋';
        if (npc && npc.emoji) {
            questEmoji = npc.emoji;
        } else if (room) {
            questEmoji = room.emoji;
        }
        
        return `
            <div class="player-quest-item" style="border: 1px solid #ddd; padding: 8px; margin-bottom: 8px; border-radius: 5px; background: white;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 5px;">
                    <strong style="font-size: 14px;">${quest.name}</strong>
                    <span style="font-size: 18px;">${questEmoji}</span>
                </div>
                <div style="font-size: 12px; color: #666; margin-bottom: 5px;">${quest.description}</div>
                <div style="font-size: 11px; color: #999; margin-bottom: 5px;">
                    📍 ${room.emoji} ${room.name} • ⭐ Level ${quest.level} • <span style="color: ${difficultyColor}; font-weight: bold;">${difficulty.toUpperCase()}</span>
                </div>
                <div style="font-size: 11px; color: #4caf50; margin-bottom: 5px;">
                    🎯 ${quest.xpReward} XP • 💎 ${quest.gemReward || DIFFICULTY_GEMS[difficulty] || 1} Gems${quest.irlReward ? ' • 🎁 ' + quest.irlReward : ''}
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

// Reward Vault Management
function createReward(name, gemCost) {
    const reward = {
        id: Date.now() + Math.random(),
        name: name.trim(),
        gemCost: parseInt(gemCost),
        unlocked: false,
        claimed: false
    };

    vaultRewards.push(reward);
    saveRewardVault();

    // Check if it should be unlocked immediately
    if (player.gems >= reward.gemCost) {
        reward.unlocked = true;
        saveRewardVault();
    }

    // Emit WebSocket event
    if (socket && socket.connected) {
        socket.emit('reward:created', reward);
    }

    return reward;
}

function deleteReward(rewardId) {
    vaultRewards = vaultRewards.filter(r => r.id !== rewardId);
    saveRewardVault();
    
    // Emit WebSocket event
    if (socket && socket.connected) {
        socket.emit('reward:deleted', { rewardId });
    }
}

function claimReward(rewardId) {
    const reward = vaultRewards.find(r => r.id === rewardId);
    if (!reward) {
        showNotification('Error', 'Reward not found!', 'error', 3000);
        return;
    }

    if (!reward.unlocked) {
        showNotification('Locked', `Need ${reward.gemCost - player.gems} more gems to unlock`, 'warning', 3000);
        return;
    }

    if (reward.claimed) {
        showNotification('Already Claimed', 'You already claimed this reward!', 'info', 3000);
        return;
    }

    // Mark as claimed
    reward.claimed = true;
    saveRewardVault();

    showNotification('Reward Claimed!', `"${reward.name}" - Show your parents!`, 'success', 5000);
    updateVaultRewardsList();
    
    // Emit WebSocket event
    if (socket && socket.connected) {
        socket.emit('reward:claimed', { rewardId, reward });
    }
}

function showRewardVault() {
    document.getElementById('reward-vault-panel').classList.remove('hidden');
    updateVaultRewardsList();
}

function hideRewardVault() {
    document.getElementById('reward-vault-panel').classList.add('hidden');
}

// Help Modal Functions
function showHelpModal() {
    document.getElementById('help-modal').classList.remove('hidden');
}

function hideHelpModal() {
    document.getElementById('help-modal').classList.add('hidden');
}

function updateVaultRewardsList() {
    const listContainer = document.getElementById('vault-rewards-list');
    const gemCountDisplay = document.getElementById('vault-gem-count');

    // Update gem count
    gemCountDisplay.textContent = player.gems;

    if (vaultRewards.length === 0) {
        listContainer.innerHTML = '<p style="color: #999;">No rewards available yet. Ask your parents to add some!</p>';
        return;
    }

    // Sort rewards: unlocked unclaimed first, then locked, then claimed
    const sortedRewards = [...vaultRewards].sort((a, b) => {
        if (a.claimed !== b.claimed) return a.claimed ? 1 : -1;
        if (a.unlocked !== b.unlocked) return b.unlocked ? 1 : -1;
        return a.gemCost - b.gemCost;
    });

    listContainer.innerHTML = sortedRewards.map(reward => {
        const isLocked = !reward.unlocked;
        const isClaimed = reward.claimed;
        const canClaim = reward.unlocked && !reward.claimed;

        let statusBadge = '';
        let buttonHtml = '';

        if (isClaimed) {
            statusBadge = '<span style="color: #4caf50; font-weight: bold;">✅ CLAIMED</span>';
            buttonHtml = '<button class="btn btn-secondary btn-small" disabled style="width: 100%;">Already Claimed</button>';
        } else if (isLocked) {
            const gemsNeeded = reward.gemCost - player.gems;
            statusBadge = `<span style="color: #999; font-weight: bold;">🔒 LOCKED (Need ${gemsNeeded} more gems)</span>`;
            buttonHtml = '<button class="btn btn-secondary btn-small" disabled style="width: 100%;">Locked</button>';
        } else {
            statusBadge = '<span style="color: #ffd700; font-weight: bold;">✨ UNLOCKED!</span>';
            buttonHtml = `<button class="btn btn-primary btn-small" onclick="claimReward(${reward.id})" style="width: 100%;">Claim Reward</button>`;
        }

        return `
            <div class="reward-vault-item" style="border: 2px solid ${isClaimed ? '#4caf50' : isLocked ? '#ccc' : '#ffd700'}; padding: 12px; margin-bottom: 12px; border-radius: 8px; background: ${isClaimed ? '#f1f8f4' : isLocked ? '#f5f5f5' : '#fffbf0'}; opacity: ${isClaimed ? 0.7 : 1};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <strong style="font-size: 16px;">${reward.name}</strong>
                    ${statusBadge}
                </div>
                <div style="font-size: 14px; color: #666; margin-bottom: 8px;">
                    💎 Cost: ${reward.gemCost} gems
                </div>
                ${buttonHtml}
            </div>
        `;
    }).join('');
}

function updateParentRewardsList() {
    const listContainer = document.getElementById('parent-rewards-list');

    if (vaultRewards.length === 0) {
        listContainer.innerHTML = '<p style="color: #999;">No rewards yet. Create one above!</p>';
        return;
    }

    listContainer.innerHTML = vaultRewards.map(reward => {
        const statusText = reward.claimed ? '✅ Claimed' : reward.unlocked ? '✨ Unlocked' : '🔒 Locked';
        return `
            <div class="quest-item" style="background: ${reward.claimed ? '#f1f8f4' : reward.unlocked ? '#fffbf0' : 'white'};">
                <div class="quest-item-header">
                    <span class="quest-item-title">${reward.name}</span>
                    <span style="font-size: 12px; color: #666;">${statusText}</span>
                </div>
                <div class="quest-item-meta">
                    <span>💎 ${reward.gemCost} gems</span>
                </div>
                <button class="btn btn-danger btn-small" onclick="deleteReward(${reward.id}); updateParentRewardsList();">Delete</button>
            </div>
        `;
    }).join('');
}

function createRewardFromForm() {
    const name = document.getElementById('new-reward-name').value.trim();
    const gemCost = document.getElementById('new-reward-gems').value;

    if (!name) {
        showNotification('Missing Name', 'Please enter a reward name', 'error', 3000);
        return;
    }

    createReward(name, gemCost);

    // Clear form
    document.getElementById('new-reward-name').value = '';
    document.getElementById('new-reward-gems').value = '10';

    // Update list
    updateParentRewardsList();

    showNotification('Reward Created', `"${name}" added to vault`, 'success', 3000);
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
        updateParentRewardsList();
        updatePetDropdownName();
    } else {
        showNotification('Incorrect Password', 'Please try again', 'error', 3000);
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

// Quest Templates for kids ages 8-10
const QUEST_TEMPLATES = {
    kitchen: [
        { name: "Set the Table", description: "Set the table for dinner with plates, utensils, and cups", difficulty: "easy", xp: 30 },
        { name: "Clear the Table", description: "Clear dishes and wipe down the table after meals", difficulty: "easy", xp: 30 },
        { name: "Wash the Dishes", description: "Wash and dry all the dishes in the sink", difficulty: "medium", xp: 50 },
        { name: "Load the Dishwasher", description: "Load dirty dishes into the dishwasher properly", difficulty: "easy", xp: 30 },
        { name: "Unload the Dishwasher", description: "Put away all clean dishes from the dishwasher", difficulty: "easy", xp: 30 },
        { name: "Wipe Down Counters", description: "Clean and wipe down all kitchen counters", difficulty: "easy", xp: 30 },
        { name: "Sweep the Kitchen Floor", description: "Sweep the kitchen floor to remove crumbs and dirt", difficulty: "easy", xp: 30 },
        { name: "Take Out Kitchen Trash", description: "Take out the kitchen trash and replace the bag", difficulty: "easy", xp: 30 },
        { name: "Help Pack Lunch", description: "Help prepare and pack lunch for school", difficulty: "medium", xp: 40 },
        { name: "Put Away Groceries", description: "Help put away groceries in the pantry and fridge", difficulty: "easy", xp: 30 }
    ],
    basement: [
        { name: "Sort Laundry", description: "Sort dirty clothes into whites, colors, and darks", difficulty: "easy", xp: 30 },
        { name: "Put Clothes in Washer", description: "Load sorted clothes into the washing machine", difficulty: "easy", xp: 30 },
        { name: "Move Clothes to Dryer", description: "Transfer wet clothes from washer to dryer", difficulty: "easy", xp: 30 },
        { name: "Fold Clean Laundry", description: "Fold your own clean clothes neatly", difficulty: "medium", xp: 50 },
        { name: "Put Away Clothes", description: "Put your folded clothes away in drawers", difficulty: "easy", xp: 30 },
        { name: "Match Socks", description: "Match all the clean socks into pairs", difficulty: "easy", xp: 30 },
        { name: "Hang Up Clothes", description: "Hang up shirts and pants on hangers", difficulty: "easy", xp: 30 },
        { name: "Organize Basement", description: "Help organize and tidy up the basement area", difficulty: "hard", xp: 70 }
    ],
    petroom: [
        { name: "Feed the Pet", description: "Give your pet their food and fresh water", difficulty: "easy", xp: 30 },
        { name: "Clean Pet Bowl", description: "Wash and clean your pet's food and water bowls", difficulty: "easy", xp: 30 },
        { name: "Play with Pet", description: "Spend 15 minutes playing with your pet", difficulty: "easy", xp: 30 },
        { name: "Brush the Pet", description: "Brush your pet's fur gently", difficulty: "easy", xp: 30 },
        { name: "Clean Litter Box", description: "Scoop and clean the cat's litter box", difficulty: "medium", xp: 50 },
        { name: "Walk the Dog", description: "Take the dog for a 15-minute walk", difficulty: "medium", xp: 50 },
        { name: "Refill Pet Supplies", description: "Check and refill pet food, water, and treats", difficulty: "easy", xp: 30 },
        { name: "Clean Pet Toys", description: "Wash and organize pet toys", difficulty: "easy", xp: 30 }
    ],
    study: [
        { name: "Complete Homework", description: "Finish all homework assignments for today", difficulty: "medium", xp: 50 },
        { name: "Read for 20 Minutes", description: "Read a book for at least 20 minutes", difficulty: "easy", xp: 30 },
        { name: "Practice Math Facts", description: "Practice multiplication or addition facts for 10 minutes", difficulty: "medium", xp: 40 },
        { name: "Write in Journal", description: "Write a journal entry about your day", difficulty: "easy", xp: 30 },
        { name: "Organize School Bag", description: "Clean out and organize your school backpack", difficulty: "easy", xp: 30 },
        { name: "Practice Spelling Words", description: "Study and practice your spelling words", difficulty: "easy", xp: 30 },
        { name: "Tidy Study Desk", description: "Clean and organize your study desk", difficulty: "easy", xp: 30 },
        { name: "Complete Art Project", description: "Work on your art or craft project", difficulty: "medium", xp: 50 },
        { name: "Practice Musical Instrument", description: "Practice your instrument for 15 minutes", difficulty: "medium", xp: 50 },
        { name: "Study for Test", description: "Study and review for upcoming test", difficulty: "medium", xp: 50 }
    ],
    personal: [
        { name: "Make Your Bed", description: "Make your bed neatly every morning", difficulty: "easy", xp: 30 },
        { name: "Clean Your Room", description: "Pick up and organize your bedroom", difficulty: "medium", xp: 50 },
        { name: "Put Toys Away", description: "Put all toys back in their proper places", difficulty: "easy", xp: 30 },
        { name: "Brush Teeth Twice", description: "Brush your teeth morning and night", difficulty: "easy", xp: 30 },
        { name: "Take a Shower", description: "Take a shower and wash your hair", difficulty: "easy", xp: 30 },
        { name: "Lay Out Tomorrow's Clothes", description: "Choose and lay out clothes for tomorrow", difficulty: "easy", xp: 30 },
        { name: "Empty Bedroom Trash", description: "Empty the trash can in your room", difficulty: "easy", xp: 30 },
        { name: "Water Plants", description: "Water the houseplants or garden", difficulty: "easy", xp: 30 },
        { name: "Help Sibling", description: "Help your brother or sister with a task", difficulty: "medium", xp: 40 },
        { name: "Be Kind", description: "Do something kind for a family member", difficulty: "easy", xp: 30 }
    ],
    custom: [
        { name: "Custom Quest 1", description: "Create your own quest here", difficulty: "easy", xp: 30 },
        { name: "Custom Quest 2", description: "Create your own quest here", difficulty: "medium", xp: 50 },
        { name: "Custom Quest 3", description: "Create your own quest here", difficulty: "hard", xp: 70 }
    ]
};

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
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                <div class="form-group">
                    <label>Level Required:</label>
                    <input type="number" id="quest-level-${formId}" value="1" min="1" max="100">
                </div>
                <div class="form-group">
                    <label>Difficulty:</label>
                    <select id="quest-difficulty-${formId}">
                        <option value="easy">Easy (1 💎)</option>
                        <option value="medium" selected>Medium (2 💎)</option>
                        <option value="hard">Hard (3 💎)</option>
                    </select>
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

// Show quest template selector
function showQuestTemplates() {
    const modal = document.getElementById('template-modal');
    if (!modal) return;
    
    modal.classList.remove('hidden');
    renderQuestTemplates();
}

function hideQuestTemplates() {
    const modal = document.getElementById('template-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Render quest templates in the modal
function renderQuestTemplates() {
    const container = document.getElementById('template-quests-container');
    if (!container) return;
    
    let html = '';
    
    // Kitchen quests
    html += '<div class="template-category"><h4>🏠 Kitchen Chores</h4>';
    QUEST_TEMPLATES.kitchen.forEach((template, idx) => {
        html += createTemplateCheckbox('kitchen', idx, template);
    });
    html += '</div>';
    
    // Basement/Laundry quests
    html += '<div class="template-category"><h4>🧺 Laundry & Basement</h4>';
    QUEST_TEMPLATES.basement.forEach((template, idx) => {
        html += createTemplateCheckbox('basement', idx, template);
    });
    html += '</div>';
    
    // Pet Room quests
    html += '<div class="template-category"><h4>🐾 Pet Care</h4>';
    QUEST_TEMPLATES.petroom.forEach((template, idx) => {
        html += createTemplateCheckbox('petroom', idx, template);
    });
    html += '</div>';
    
    // Study quests
    html += '<div class="template-category"><h4>📚 Homework & Study</h4>';
    QUEST_TEMPLATES.study.forEach((template, idx) => {
        html += createTemplateCheckbox('study', idx, template);
    });
    html += '</div>';
    
    // Personal quests
    html += '<div class="template-category"><h4>🛏️ Personal Habits</h4>';
    QUEST_TEMPLATES.personal.forEach((template, idx) => {
        html += createTemplateCheckbox('personal', idx, template);
    });
    html += '</div>';
    
    // Custom quests
    html += '<div class="template-category"><h4>✏️ Custom Quests</h4>';
    html += '<p style="color: #666; font-size: 13px; margin-bottom: 10px;">Write in your own custom quests:</p>';
    for (let i = 0; i < 5; i++) {
        html += createCustomQuestInput(i);
    }
    html += '</div>';
    
    container.innerHTML = html;
}

function createTemplateCheckbox(category, idx, template) {
    const difficultyColor = template.difficulty === 'easy' ? '#4caf50' : template.difficulty === 'medium' ? '#ff9800' : '#f44336';
    return `
        <div class="template-item">
            <input type="checkbox" id="template-${category}-${idx}" data-category="${category}" data-idx="${idx}">
            <label for="template-${category}-${idx}">
                <strong>${template.name}</strong>
                <span class="template-meta" style="color: ${difficultyColor};">${template.difficulty.toUpperCase()}</span>
                <span class="template-meta">${template.xp} XP</span>
                <div class="template-desc">${template.description}</div>
            </label>
        </div>
    `;
}

function createCustomQuestInput(idx) {
    return `
        <div class="custom-quest-input" style="margin-bottom: 15px; padding: 10px; border: 1px dashed #ccc; border-radius: 5px;">
            <input type="text" id="custom-name-${idx}" placeholder="Quest Name" style="width: 100%; margin-bottom: 5px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <textarea id="custom-desc-${idx}" placeholder="Description" style="width: 100%; margin-bottom: 5px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; resize: vertical; min-height: 50px;"></textarea>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
                <select id="custom-difficulty-${idx}" style="padding: 6px; border: 1px solid #ddd; border-radius: 4px;">
                    <option value="easy">Easy</option>
                    <option value="medium" selected>Medium</option>
                    <option value="hard">Hard</option>
                </select>
                <input type="number" id="custom-xp-${idx}" placeholder="XP" value="30" min="10" max="500" style="padding: 6px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
        </div>
    `;
}

// Create quests from selected templates
function createQuestsFromTemplates() {
    const selectedQuests = [];
    
    // Get all checked template checkboxes
    document.querySelectorAll('#template-quests-container input[type="checkbox"]:checked').forEach(checkbox => {
        const category = checkbox.dataset.category;
        const idx = parseInt(checkbox.dataset.idx);
        const template = QUEST_TEMPLATES[category][idx];
        
        if (template) {
            // Map category to appropriate NPC and room
            let npcId, room;
            switch(category) {
                case 'kitchen':
                    npcId = 'wizard';
                    room = 'kitchen';
                    break;
                case 'basement':
                    npcId = 'goblin';
                    room = 'basement';
                    break;
                case 'petroom':
                    npcId = 'pet';
                    room = 'petroom';
                    break;
                case 'study':
                    npcId = 'owl';
                    room = 'study';
                    break;
                case 'personal':
                    // Personal tasks can go to any NPC - default to kitchen
                    npcId = 'wizard';
                    room = 'kitchen';
                    break;
            }
            
            selectedQuests.push({
                name: template.name,
                description: template.description,
                npcId: npcId,
                room: room,
                level: 1,
                difficulty: template.difficulty,
                xpReward: template.xp,
                irlReward: ''
            });
        }
    });
    
    // Get custom quests
    for (let i = 0; i < 5; i++) {
        const name = document.getElementById(`custom-name-${i}`)?.value.trim();
        const desc = document.getElementById(`custom-desc-${i}`)?.value.trim();
        const difficulty = document.getElementById(`custom-difficulty-${i}`)?.value;
        const xp = document.getElementById(`custom-xp-${i}`)?.value;
        
        if (name && desc) {
            selectedQuests.push({
                name: name,
                description: desc,
                npcId: 'wizard', // Default to wizard
                room: 'kitchen', // Default to kitchen
                level: 1,
                difficulty: difficulty,
                xpReward: parseInt(xp),
                irlReward: ''
            });
        }
    }
    
    if (selectedQuests.length === 0) {
        showNotification('No Quests Selected', 'Please select at least one quest template or fill in a custom quest', 'warning', 3000);
        return;
    }
    
    // Validate level limits
    const questsByLevel = {};
    selectedQuests.forEach(quest => {
        if (!questsByLevel[quest.level]) {
            questsByLevel[quest.level] = [];
        }
        questsByLevel[quest.level].push(quest);
    });
    
    for (const [level, quests] of Object.entries(questsByLevel)) {
        const newQuestsCount = quests.length;
        if (!canAddTasksToLevel(parseInt(level), newQuestsCount)) {
            const currentCount = getIncompleteTasksForLevel(parseInt(level));
            const shouldContinue = confirm(`⚠️ You might overload your kid. STOP!!!!\n\nLevel ${level} currently has ${currentCount} task${currentCount !== 1 ? 's' : ''}.\nYou're trying to add ${newQuestsCount} more, which would exceed the recommended limit of 15 tasks per level.\n\nDo you want to add these quests anyway?`);
            
            if (!shouldContinue) {
                return;
            }
        }
    }
    
    // Check total incomplete tasks warning
    if (shouldWarnAboutTaskLimit(selectedQuests.length)) {
        const totalIncomplete = getTotalIncompleteTasks();
        const shouldContinue = confirm(`⚠️ Warning: High Task Load!\n\nYou currently have ${totalIncomplete} incomplete task${totalIncomplete !== 1 ? 's' : ''}.\nYou're about to add ${selectedQuests.length} more quest${selectedQuests.length !== 1 ? 's' : ''}, bringing the total to ${totalIncomplete + selectedQuests.length}.\n\nThis may overwhelm your child. Consider completing some existing tasks first.\n\nDo you want to add these quests anyway?`);
        
        if (!shouldContinue) {
            return;
        }
    }
    
    // Create all quests
    let createdCount = 0;
    selectedQuests.forEach(quest => {
        createQuest(quest.name, quest.description, quest.npcId, quest.room, quest.level, quest.difficulty, quest.xpReward, quest.irlReward);
        createdCount++;
    });
    
    // Update list
    updateActiveQuestsList();
    
    // Close modal
    hideQuestTemplates();
    
    showNotification('Quests Created', `${createdCount} quest${createdCount !== 1 ? 's' : ''} added successfully`, 'success', 3000);
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
        showNotification('No Quests', 'Please add at least one quest form', 'warning', 3000);
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
        const difficulty = document.getElementById(`quest-difficulty-${formId}`)?.value;
        const xpReward = document.getElementById(`quest-xp-${formId}`)?.value;
        const irlReward = document.getElementById(`quest-reward-${formId}`)?.value.trim();

        if (!name) {
            errors.push(`Quest ${index + 1}: Missing name`);
        }
        if (!description) {
            errors.push(`Quest ${index + 1}: Missing description`);
        }

        if (name && description) {
            questsToCreate.push({ name, description, npcId, room, level, difficulty, xpReward, irlReward });
        }
    });

    if (errors.length > 0) {
        showNotification('Form Errors', errors.join(', '), 'error', 4000);
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
            const shouldContinue = confirm(`⚠️ You might overload your kid. STOP!!!!\n\nLevel ${level} currently has ${currentCount} task${currentCount !== 1 ? 's' : ''}.\nYou're trying to add ${newQuestsCount} more, which would exceed the recommended limit of 15 tasks per level.\n\nDo you want to add these quests anyway?`);
            
            if (!shouldContinue) {
                return;
            }
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
        createQuest(quest.name, quest.description, quest.npcId, quest.room, quest.level, quest.difficulty, quest.xpReward, quest.irlReward);
        createdCount++;
    });

    // Clear all forms
    container.innerHTML = '';
    questFormCounter = 0;

    // Add one fresh form
    addQuestForm();

    // Update list
    updateActiveQuestsList();

    showNotification('Quests Created', `${createdCount} quest${createdCount !== 1 ? 's' : ''} added successfully`, 'success', 3000);
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
        showNotification('Missing Name', 'Please enter a quest name', 'error', 3000);
        return;
    }

    if (!description) {
        showNotification('Missing Description', 'Please enter a quest description', 'error', 3000);
        return;
    }

    // Validate: Check if level already has 15 incomplete tasks
    if (!canAddTasksToLevel(level, 1)) {
        const currentCount = getIncompleteTasksForLevel(level);
        const shouldContinue = confirm(`⚠️ You might overload your kid. STOP!!!!\n\nLevel ${level} already has ${currentCount} task${currentCount !== 1 ? 's' : ''}, which exceeds the recommended limit of 15 tasks.\n\nDo you want to add this quest anyway?`);
        
        if (!shouldContinue) {
            return;
        }
    }

    // Warning: Check if total incomplete tasks will reach 10
    if (shouldWarnAboutTaskLimit(1)) {
        const totalIncomplete = getTotalIncompleteTasks();
        const shouldContinue = confirm(`⚠️ Warning: You have ${totalIncomplete} incomplete tasks. Adding more may overwhelm your child. Continue?`);

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

    showNotification('Quest Created', 'Quest added successfully', 'success', 3000);
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
            const npcName = npc ? getNPCName(quest.npcId) : quest.npcId;
            const room = ROOMS[quest.room];
            const incompleteAtLevel = getIncompleteTasksForLevel(quest.level);
            const isDailyBadge = quest.isDaily ? '<span style="background: #4caf50; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.8em; margin-left: 5px;">📅 Daily</span>' : '';
            const deleteButton = quest.isDaily 
                ? '<span style="color: #999; font-size: 0.85em;">Resets daily</span>'
                : `<button class="btn btn-danger btn-small" onclick="deleteQuest(${quest.id}); updateActiveQuestsList();">Delete</button>`;
            
            // Handle NPC display for object-based quests
            let npcDisplay = '';
            if (npc && npc.emoji && npc.color) {
                npcDisplay = `<span class="quest-item-npc" style="background: ${npc.color};">
                    ${npc.emoji} ${npcName}
                </span>`;
            } else {
                npcDisplay = `<span class="quest-item-npc" style="background: #999;">
                    ${room.emoji} ${npcName}
                </span>`;
            }
            
            return `
                <div class="quest-item">
                    <div class="quest-item-header">
                        <span class="quest-item-title">${quest.name}${isDailyBadge}</span>
                        ${npcDisplay}
                    </div>
                    <div class="quest-item-description">${quest.description}</div>
                    <div class="quest-item-meta">
                        <span>📍 ${room.emoji} ${room.name}</span>
                        <span>⭐ Level ${quest.level} (${incompleteAtLevel}/15 tasks)</span>
                    </div>
                    <div class="quest-item-xp">Reward: ${quest.xpReward} XP, ${quest.gemReward} 💎${quest.irlReward ? ' + ' + quest.irlReward : ''}</div>
                    ${deleteButton}
                </div>
            `;
        }).join('');
    }

    // Completed quests (collapsible)
    if (completedQuests.length > 0) {
        html += `<h4 style="margin-top: 15px; color: #4caf50;">✅ Completed Quests (${completedQuests.length})</h4>`;
        html += completedQuests.map(quest => {
            const npc = NPCS[quest.npcId];
            const npcName = npc ? getNPCName(quest.npcId) : quest.npcId;
            const room = ROOMS[quest.room];
            const isDailyBadge = quest.isDaily ? '<span style="background: #4caf50; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.8em; margin-left: 5px;">📅 Daily</span>' : '';
            const deleteButton = quest.isDaily 
                ? '<span style="color: #999; font-size: 0.85em;">Resets daily</span>'
                : `<button class="btn btn-danger btn-small" onclick="deleteQuest(${quest.id}); updateActiveQuestsList();">Delete</button>`;
            
            // Handle NPC display for object-based quests
            let npcDisplay = '';
            if (npc && npc.emoji && npc.color) {
                npcDisplay = `<span class="quest-item-npc" style="background: ${npc.color};">
                    ${npc.emoji} ${npcName}
                </span>`;
            } else {
                npcDisplay = `<span class="quest-item-npc" style="background: #999;">
                    ${room.emoji} ${npcName}
                </span>`;
            }
            
            return `
                <div class="quest-item" style="opacity: 0.6; background: #e8f5e9;">
                    <div class="quest-item-header">
                        <span class="quest-item-title">${quest.name}${isDailyBadge}</span>
                        ${npcDisplay}
                    </div>
                    <div class="quest-item-meta">
                        <span>📍 ${room.emoji} ${room.name}</span>
                        <span>⭐ Level ${quest.level}</span>
                        <span style="color: #4caf50;">✅ Completed</span>
                    </div>
                    ${deleteButton}
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
    // Handle clicks on interactive objects - auto-interact
    if (e.target.classList.contains('interactive-object') || e.target.closest('.interactive-object')) {
        // The click event on the object itself will handle the interaction
        // (already set up in renderRoom)
        return;
    }
    
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
    // Welcome modal
    document.getElementById('welcome-start-btn').addEventListener('click', closeWelcomeModal);

    // Room quick navigation buttons
    document.querySelectorAll('.room-nav-btn').forEach(btn => {
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
    
    // Quest template buttons
    const templateBtn = document.getElementById('use-templates-btn');
    if (templateBtn) {
        templateBtn.addEventListener('click', showQuestTemplates);
    }
    const closeTemplateBtn = document.getElementById('close-template-modal');
    if (closeTemplateBtn) {
        closeTemplateBtn.addEventListener('click', hideQuestTemplates);
    }
    const createFromTemplatesBtn = document.getElementById('create-from-templates-btn');
    if (createFromTemplatesBtn) {
        createFromTemplatesBtn.addEventListener('click', createQuestsFromTemplates);
    }

    // Reward Vault buttons
    document.getElementById('reward-vault-btn').addEventListener('click', showRewardVault);
    document.getElementById('close-vault-btn').addEventListener('click', hideRewardVault);
    document.getElementById('create-reward-btn').addEventListener('click', createRewardFromForm);

    // Help modal buttons
    document.getElementById('help-btn').addEventListener('click', showHelpModal);
    document.getElementById('close-help-btn').addEventListener('click', hideHelpModal);

    // NPC/Quest panel
    // NPC/Quest panel - Accept quest button
    document.getElementById('accept-quest-btn').addEventListener('click', () => {
        if (currentQuestInPanel) {
            // If it's an object quest (has objectType), create it dynamically
            if (currentQuestInPanel.objectType) {
                const quest = createQuest(
                    currentQuestInPanel.name,
                    currentQuestInPanel.description,
                    currentQuestInPanel.objectType, // Use object type as npcId
                    currentQuestInPanel.room,
                    currentQuestInPanel.level,
                    currentQuestInPanel.difficulty,
                    currentQuestInPanel.xpReward,
                    '' // No IRL reward for object quests
                );
                acceptQuest(quest);
            } else {
                acceptQuest(currentQuestInPanel);
            }
        }
    });
    document.getElementById('close-quest-btn').addEventListener('click', hideNPCPanel);
    document.getElementById('close-npc-btn').addEventListener('click', hideNPCPanel);
    
    // X button close handlers for all panels/modals
    document.getElementById('quest-panel-close-x').addEventListener('click', hideNPCPanel);
    document.getElementById('parent-panel-close-x').addEventListener('click', hideParentMode);
    document.getElementById('reward-vault-close-x').addEventListener('click', hideRewardVault);
    document.getElementById('welcome-modal-close-x').addEventListener('click', closeWelcomeModal);
    
    // Soft dismiss - clicking outside modal/panel to close (only for safe modals)
    setupSoftDismiss('quest-panel', 'quest-panel-content', hideNPCPanel);
    setupSoftDismiss('reward-vault-panel', 'reward-vault-content', hideRewardVault);
    setupSoftDismiss('welcome-modal', 'welcome-modal-content', closeWelcomeModal);
    setupSoftDismiss('help-modal', 'help-modal-content', hideHelpModal);
    setupSoftDismiss('template-modal', 'template-modal-content', hideQuestTemplates);
    // Note: parent-panel does NOT have soft dismiss as it may have unsaved form data
}

// Setup soft dismiss for a modal/panel
function setupSoftDismiss(panelId, contentId, closeFunction) {
    const panel = document.getElementById(panelId);
    const content = document.getElementById(contentId);
    
    if (panel && content) {
        panel.addEventListener('click', (e) => {
            // Only close if clicking the backdrop, not the content
            if (e.target === panel) {
                closeFunction();
            }
        });
    }
}

// Storage functions
function saveGameState() {
    localStorage.setItem('habitHeroPlayer', JSON.stringify({
        level: player.level,
        xp: player.xp,
        gems: player.gems,
        currentRoom: player.currentRoom
    }));
}

function loadGameState() {
    const saved = localStorage.getItem('habitHeroPlayer');
    if (saved) {
        const data = JSON.parse(saved);
        player.level = data.level || 1;
        player.xp = data.xp || 0;
        player.gems = data.gems || 0;
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

function saveRewardVault() {
    localStorage.setItem('habitHeroRewardVault', JSON.stringify(vaultRewards));
}

function loadRewardVault() {
    const saved = localStorage.getItem('habitHeroRewardVault');
    if (saved) {
        vaultRewards = JSON.parse(saved);
    }
}

// Load quests before initializing
loadQuests();

// Initialize the game
init();
