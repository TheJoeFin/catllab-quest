# NPC Quest Display Fix

## Problem
Quests created in Parent Mode were not appearing when talking to NPCs. Parents would create quests assigned to NPCs (wizard, goblin, pet, owl), but when children clicked on the NPCs, no quests would appear.

## Root Cause
The issue was in how NPCs were being interacted with. There were two ways to interact with NPCs:

1. **Walking up to NPC** → triggered `checkNPCProximity()` → called `showNPCPanel(npcId)` ✓ (correctly showed quests)
2. **Clicking on NPC** → triggered click event → called `showMainObjectInfo(mainObj)` ✗ (showed generic message)

The `showMainObjectInfo()` function was always displaying a generic message like "Click on objects around the kitchen to find chores!" instead of checking for and displaying parent-created quests.

## Solution
Changed the click event handler in `renderRoom()` for main objects (NPCs) to call `showNPCPanel(mainObj.type)` instead of `showMainObjectInfo(mainObj)`.

### Code Change
**File:** `src/game.js`

**Before:**
```javascript
objElement.addEventListener('click', () => {
    if (typeof soundManager !== 'undefined') {
        soundManager.playClick();
    }
    showMainObjectInfo(mainObj);
});
```

**After:**
```javascript
objElement.addEventListener('click', () => {
    if (typeof soundManager !== 'undefined') {
        soundManager.playClick();
    }
    // Show NPC panel instead of generic main object info
    // This allows parent-created quests to appear when clicking NPCs
    showNPCPanel(mainObj.type);
});
```

## Impact
- Parent-created quests now properly appear when children click on NPCs
- NPCs will display quests with proper quest details (name, description, difficulty, rewards)
- Both clicking and walking up to NPCs now work consistently

## Testing
To verify the fix:
1. Open Parent Mode (password: hero123)
2. Create a quest and assign it to an NPC (e.g., Chef Wizard)
3. Close Parent Mode
4. Click on the NPC in the game
5. The quest should now appear in the quest panel

## Related Functions
- `showNPCPanel(npcId)` - Displays NPC dialog and quests
- `showMainObjectInfo(mainObj)` - Now only used for non-NPC objects (kept for backward compatibility)
- `checkNPCProximity()` - Handles walking up to NPCs
- `createQuest()` - Creates quests with npcId assignment
