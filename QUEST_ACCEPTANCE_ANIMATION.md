# Quest Acceptance UI Enhancement

## Change Summary
Replaced large in-app notifications when accepting quests with a subtle animation on the player stats box (level progress box). This provides visual feedback without disrupting the gameplay experience.

## Problem
When players accepted quests from NPCs, a large notification banner would appear saying "Quest Accepted" with the quest name. This was:
- Visually intrusive
- Covered important parts of the UI
- Interrupted the flow of gameplay
- Redundant since the quest appears in the Active Quests list

## Solution
Instead of showing a notification, the player stats box (which displays Level, XP, and Gems) now animates with a pulse effect when a quest is accepted. This provides clear visual feedback while being non-intrusive.

## Implementation

### CSS Animation
Added a new animation class to `style.css`:

```css
/* Quest Acceptance Animation */
.player-stats.quest-accepted {
    animation: questAcceptPulse 0.6s ease-out;
}

@keyframes questAcceptPulse {
    0% {
        transform: scale(1);
        box-shadow: normal state
    }
    50% {
        transform: scale(1.08);
        box-shadow: enhanced glow with golden tint
    }
    100% {
        transform: scale(1);
        box-shadow: normal state
    }
}
```

The animation:
- Scales the stats box up to 1.08x size
- Enhances the glow/shadow effect
- Adds a golden tint to signify the quest acceptance
- Completes in 0.6 seconds

### JavaScript Function
Added `animateStatsBox()` function in `game.js`:

```javascript
function animateStatsBox() {
    const statsBox = document.querySelector('.player-stats');
    if (!statsBox) return;
    
    // Remove class if it exists (to restart animation)
    statsBox.classList.remove('quest-accepted');
    
    // Trigger reflow to restart animation
    void statsBox.offsetWidth;
    
    // Add animation class
    statsBox.classList.add('quest-accepted');
    
    // Remove class after animation completes
    setTimeout(() => {
        statsBox.classList.remove('quest-accepted');
    }, 600);
}
```

### Modified Functions
Updated two quest acceptance locations:

1. **acceptQuest()** - Regular NPC quests
   - Removed: `showNotification('Quest Accepted', ...)`
   - Added: `animateStatsBox()`

2. **Object quest acceptance** (interactive objects like dishes, trash, etc.)
   - Removed: `showNotification('Quest Accepted', ...)`
   - Added: `animateStatsBox()`

## Benefits
- **Less intrusive**: Animation is subtle and doesn't block UI elements
- **Better UX**: Players can immediately see their stats box highlight, drawing attention to where XP and gems will be added when they complete the quest
- **Cleaner interface**: Reduces notification spam
- **Visual continuity**: The same box that shows progress gets animated when accepting quests
- **Contextual feedback**: Links the action (accepting quest) with the area that will change (stats)

## Testing
To verify the enhancement:
1. Talk to an NPC (e.g., Chef Wizard)
2. Accept a quest
3. Observe the stats box in the top-left animate with a pulse and glow
4. No notification banner should appear
5. Quest should still appear in the Active Quests list on the right

## Related Changes
- Still keeping notifications for quest completion (more significant event)
- Still keeping notifications for errors and level ups
- This only affects quest acceptance feedback
