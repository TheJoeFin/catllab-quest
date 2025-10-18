# Object Badge Visibility Update

## Feature Enhancement

The level badge on interactive objects (showing difficulty 1, 2, or 3) now dynamically hides when a quest from that object has been accepted, and reappears when the quest is completed.

## Visual Behavior

### Before This Update:
```
🍽️ ③  ← Badge always visible
🗑️ ③  ← Badge always visible
🍳 ②  ← Badge always visible
```

### After This Update:

**State 1: No Active Quests**
```
🍽️ ③  ← Badge visible (available)
🗑️ ③  ← Badge visible (available)
🍳 ②  ← Badge visible (available)
```

**State 2: Quest Accepted from Dishes**
```
🍽️    ← Badge HIDDEN (quest active)
🗑️ ③  ← Badge visible (still available)
🍳 ②  ← Badge visible (still available)
```

**State 3: Dishes Quest Completed**
```
🍽️ ③  ← Badge REAPPEARS (available again)
🗑️ ③  ← Badge visible
🍳 ②  ← Badge visible
```

## How It Works

### Rendering Logic

When `renderRoom()` is called, for each interactive object:

1. **Check for Active Quest**:
   ```javascript
   const hasActiveQuest = quests.find(q => 
       q.npcId === obj.questType && 
       q.acceptedByPlayer && 
       !q.completed
   );
   ```

2. **Conditional Badge Rendering**:
   ```javascript
   if (!hasActiveQuest) {
       // Create and add badge
   }
   // If hasActiveQuest is true, badge is NOT added
   ```

### Automatic Updates

The badge visibility updates automatically because `renderRoom()` is called:
- After accepting a quest → Badge disappears
- After completing a quest → Badge reappears
- When switching rooms → Badges update based on current state

## Benefits

### For Users:
1. **Visual Clarity**: Instantly see which objects have active quests
2. **Prevents Confusion**: No need to wonder if you already have a quest from an object
3. **Cleaner Interface**: Reduces visual clutter when quests are active
4. **Status Indicator**: Badge presence = quest available, Badge absence = quest in progress

### For Gameplay:
1. **Quest Management**: Easy to see quest distribution across objects
2. **Multiple Quests**: Can accept quests from different objects and track them visually
3. **Completion Feedback**: Badge reappearing confirms quest completion
4. **Discovery**: Badges guide users to available content

## Examples

### Example 1: Kitchen Room

**Initial State** (no quests):
- Dirty Dishes: Shows badge ①
- Kitchen Counter: Shows badge ②
- Trash Can: Shows badge ③

**After accepting quest from Dirty Dishes**:
- Dirty Dishes: No badge (quest active)
- Kitchen Counter: Shows badge ②
- Trash Can: Shows badge ③

**After completing Dirty Dishes quest**:
- Dirty Dishes: Shows badge ① (ready for new quest)
- Kitchen Counter: Shows badge ②
- Trash Can: Shows badge ③

### Example 2: Multiple Active Quests

**Accept quests from 2 objects**:
- Dirty Dishes: No badge (quest active)
- Kitchen Counter: No badge (quest active)
- Trash Can: Shows badge ③ (available)

**Complete one quest**:
- Dirty Dishes: Shows badge ① (ready again)
- Kitchen Counter: No badge (still active)
- Trash Can: Shows badge ③ (available)

## Technical Implementation

### File Modified:
- `src/game.js`

### Function Modified:
- `renderRoom()` - Interactive objects rendering section

### Code Added:
```javascript
// Check if player has an active quest from this object
const hasActiveQuest = quests.find(q => 
    q.npcId === obj.questType && 
    q.acceptedByPlayer && 
    !q.completed
);

// Only add level badge if no active quest from this object
if (!hasActiveQuest) {
    const levelBadge = document.createElement('div');
    levelBadge.className = 'object-level-badge';
    levelBadge.textContent = obj.level;
    levelBadge.title = `${difficultyLabel} Difficulty`;
    objElement.appendChild(levelBadge);
}
```

## Testing Scenarios

### Test 1: Basic Badge Hiding
1. ✓ View Kitchen - all objects have badges
2. ✓ Click Dirty Dishes
3. ✓ Accept quest
4. ✓ Badge disappears from Dirty Dishes
5. ✓ Other badges remain visible

### Test 2: Badge Reappearing
1. ✓ Accept quest from object
2. ✓ Verify badge is hidden
3. ✓ Complete the quest
4. ✓ Badge reappears on object

### Test 3: Multiple Objects
1. ✓ Accept quest from Dishes (badge hides)
2. ✓ Accept quest from Trash (badge hides)
3. ✓ Counter still shows badge
4. ✓ Complete Dishes quest (badge reappears)
5. ✓ Trash badge still hidden

### Test 4: Room Switching
1. ✓ Accept quest in Kitchen
2. ✓ Go to Basement
3. ✓ Return to Kitchen
4. ✓ Badge still hidden (state persists)

### Test 5: Page Refresh
1. ✓ Accept quest from object
2. ✓ Refresh browser
3. ✓ Badge remains hidden (state saved)
4. ✓ Complete quest
5. ✓ Badge reappears

## Integration with Existing Features

### Works With:
- ✅ Quest acceptance system
- ✅ Quest completion system
- ✅ Room rendering
- ✅ Quest persistence (localStorage)
- ✅ Real-time updates (WebSocket)
- ✅ Sound effects
- ✅ Animations
- ✅ Duplicate quest prevention

### Does Not Break:
- ✅ Existing quest logic
- ✅ NPC interactions
- ✅ Door functionality
- ✅ Player movement
- ✅ Stats tracking
- ✅ Reward system

## Edge Cases Handled

1. **Multiple quests from same room**: Each object's badge updates independently
2. **Quest completion**: Badge correctly reappears
3. **Room switching**: Badge state persists correctly
4. **Page refresh**: Badge state loads from saved quests
5. **No quests available**: Badge shows normally (object available)

## User Experience Impact

### Before:
- Users had to remember which objects had active quests
- Visual clutter with badges on all objects
- No quick way to see quest status
- Potential confusion about available quests

### After:
- Instant visual feedback on quest status
- Cleaner interface when quests are active
- Clear indication of available vs. busy objects
- Better quest management at a glance

## Performance Impact

**Minimal**: 
- Single `find()` operation per object per render
- Only runs during room rendering (not continuous)
- No noticeable performance impact
- Efficient query on existing quests array

## Backwards Compatibility

✅ **Fully Compatible**:
- Works with existing save data
- No migration needed
- Gracefully handles all quest states
- Compatible with parent dashboard
- Works with WebSocket updates

---

## Quick Reference

**Badge Visible** = Quest Available  
**Badge Hidden** = Quest Active  
**Badge Returns** = Quest Completed

Simple, intuitive, and effective! 🎉
