// Game configuration
const TILE_SIZE = 40;
const WORLD_WIDTH = 600;
const WORLD_HEIGHT = 600;
const MOVE_SPEED = TILE_SIZE;

// Player state
const player = {
    x: 0,
    y: 0,
    element: document.getElementById('player')
};

// Position display
const positionDisplay = document.getElementById('position');

// Obstacles (trees) positions
const obstacles = [
    { x: 200, y: 80 },
    { x: 360, y: 80 },
    { x: 200, y: 240 },
    { x: 520, y: 320 },
    { x: 240, y: 440 },
    { x: 520, y: 200 }
];

// Initialize player position
function updatePlayerPosition() {
    player.element.style.left = player.x + 'px';
    player.element.style.top = player.y + 'px';
    positionDisplay.textContent = `X: ${player.x / TILE_SIZE}, Y: ${player.y / TILE_SIZE}`;
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

// Initialize the game
updatePlayerPosition();

console.log('Game loaded! Use arrow keys to move your character.');
console.log('Avoid the trees (green circles) and explore the world!');
