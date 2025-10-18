# Modal Movement Lock Fix

## Problem
Players could move their character using arrow keys or clicking on the game world even when chat modals/panels were open (like NPC quest panels, parent mode, reward vault, etc.). This created a confusing user experience where the player could accidentally move while interacting with UI elements.

## Solution
Added a `isModalOpen()` helper function that checks if any modal or panel is currently open, and modified the movement handlers to prevent movement when any modal is active.

## Implementation

### New Helper Function
```javascript
function isModalOpen() {
    const modalIds = [
        'quest-panel',          // NPC interaction panel
        'parent-panel',         // Parent mode panel
        'reward-vault-panel',   // Reward vault
        'welcome-modal',        // Daily welcome screen
        'help-modal',           // Help/tutorial screen
        'template-modal'        // Quest template selector
    ];
    
    return modalIds.some(id => {
        const element = document.getElementById(id);
        return element && !element.classList.contains('hidden');
    });
}
```

### Modified Movement Handlers

**Keyboard Movement (handleMovement):**
```javascript
function handleMovement() {
    // Don't allow movement if any modal is open
    if (isModalOpen()) {
        return;
    }
    
    if (keys['ArrowUp']) {
        movePlayer(0, -MOVE_SPEED);
    }
    // ... rest of movement code
}
```

**Click-to-Move:**
```javascript
gameWorld.addEventListener('click', (e) => {
    // Don't allow movement if any modal is open
    if (isModalOpen()) {
        return;
    }
    
    // ... rest of click-to-move code
});
```

## Benefits
- Players can no longer accidentally move while reading quest descriptions
- Prevents confusion when interacting with NPCs
- Makes parent mode safer to use (can't accidentally move while creating quests)
- Improves overall user experience by keeping focus on the modal content

## Affected Modals/Panels
1. **Quest Panel** - NPC interaction and quest viewing
2. **Parent Panel** - Quest creation and management
3. **Reward Vault Panel** - Viewing and claiming rewards
4. **Welcome Modal** - Daily greeting and stats overview
5. **Help Modal** - Game instructions and help
6. **Template Modal** - Quest template selection

## Testing
To verify the fix:
1. Open any modal (e.g., click on an NPC to open the quest panel)
2. Try pressing arrow keys → Player should NOT move
3. Try clicking on the game world → Player should NOT move
4. Close the modal
5. Try moving again → Player SHOULD move normally
