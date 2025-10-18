# Quest Origin System Update

## Overview
Updated the quest system to properly distinguish between two types of quests:
1. **Object Quests** - Simple daily tasks from interactive objects (dishes, trash, litter box, etc.)
2. **NPC Quests** - Parent-added quests that come from NPCs (Chef Wizard, Laundry Goblin, Fluffy, Scholar Owl)

## Changes Made

### 1. Quest Data Structure
- Added `origin` field to quest objects
- Values: `'object'` or `'npc'`
- Backward compatible: old quests without origin field are handled correctly

### 2. Core Functions Updated

#### `createQuest()` Function
```javascript
function createQuest(name, description, npcId, room, level, difficulty, xpReward, irlReward, origin = 'npc')
```
- Added `origin` parameter (defaults to `'npc'`)
- Parent-created quests automatically get `origin: 'npc'`
- Object quests explicitly set `origin: 'object'`

#### `getQuestOriginName()` Function (New)
```javascript
function getQuestOriginName(quest)
```
- Returns the appropriate display name based on quest origin
- For object quests: Shows object name (e.g., "Dirty Dishes", "Washing Machine")
- For NPC quests: Shows NPC name (e.g., "Chef Wizard", "Scholar Owl")
- Handles backward compatibility for quests without origin field

### 3. Display Updates

All quest displays now properly show the origin:

#### Player Quest List (Sidebar)
- Shows "From [Object Name]" for object quests
- Shows "From [NPC Name]" for parent quests
- Uses appropriate emoji for each type

#### Welcome Modal Quest Summary
- Current quest and pressing quest displays updated
- Origin shown for each quest

#### Parent Mode Quest Management
- Incomplete and completed quest lists updated
- Color coding: Object quests use room color, NPC quests use NPC color
- Clear visual distinction between quest types

### 4. Quest Creation Flow

#### Object Quest Creation
When player accepts a quest from an interactive object:
```javascript
createQuest(
    name, description, 
    objectType, // e.g., 'dishes', 'trash'
    room, level, difficulty, xpReward,
    '', // No IRL reward
    'object' // Origin marker
)
```

#### Parent Quest Creation
When parent creates a quest in Parent Mode:
```javascript
createQuest(
    name, description,
    npcId, // e.g., 'wizard', 'goblin', 'pet', 'owl'
    room, level, difficulty, xpReward, irlReward
    // origin defaults to 'npc'
)
```

## Benefits

1. **Clear Origin Tracking**: Players can now see exactly where each quest came from
2. **Better Organization**: Easy to distinguish between daily chores and special parent tasks
3. **Improved UX**: More intuitive quest management for both child and parent
4. **Backward Compatible**: Existing quests continue to work without issues

## Visual Differences

### Object Quests (Daily Tasks)
- Origin: Shows object name (e.g., "Dirty Dishes")
- Color: Uses room emoji/color
- Emoji: Room-based
- Nature: Repeatable daily tasks

### NPC Quests (Parent-Added)
- Origin: Shows NPC name (e.g., "Chef Wizard")
- Color: Uses NPC color
- Emoji: NPC emoji
- Nature: Custom tasks set by parent

## Testing Recommendations

1. Create a new object quest by interacting with any interactive object
   - Verify it shows "From [Object Name]"
   
2. Create a parent quest in Parent Mode
   - Verify it shows "From [NPC Name]"

3. Check quest displays in:
   - Player quest list (sidebar)
   - Welcome modal
   - Parent Mode quest management panel

4. Verify backward compatibility:
   - Old quests should display correctly
   - No errors in console

## Files Modified

- `src/game.js` - Core quest system updates
  - Lines ~338-340: Quest data structure comment
  - Lines ~750-780: Added getQuestOriginName() function
  - Lines ~1244-1273: Updated createQuest() function
  - Lines ~1646-1700: Updated updatePlayerQuestList() function
  - Lines ~2504-2620: Updated updateActiveQuestsList() function
  - Lines ~2730-2781: Updated accept quest button handler
  - Lines ~620-660: Updated welcome modal quest displays
