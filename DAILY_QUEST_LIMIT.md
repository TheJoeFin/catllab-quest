# Daily Quest Limit Feature - Complete Guide

## Overview

Object quests (from interactive objects like dishes, trash, washing machine, etc.) can now only be completed once per 24 hours. This prevents farming the same quest repeatedly and encourages variety in gameplay.

## How It Works

### Quest Lifecycle

1. **Available** - Object shows difficulty badge (1, 2, or 3), full opacity
2. **Active** - Quest accepted, badge hidden, full opacity
3. **On Cooldown** - Quest completed, shows ⏰ badge, 60% opacity
4. **Available Again** - 24 hours passed, back to state 1

### Cooldown Timer

When you complete an object quest:
- Timestamp is recorded (e.g., `1710789012345`)
- Stored in localStorage under key `habitHeroObjectCompletions`
- Cooldown period: **24 hours** (86,400,000 milliseconds)

### Visual Indicators

```
Available:     🍽️ ③   Full opacity, difficulty badge
Active Quest:  🍽️      No badge (in progress)
On Cooldown:   🍽️ ⏰   Clock badge, 60% opacity
```

## User Experience Flow

### Scenario 1: First Time Completing Quest

**Time: Day 1, 10:00 AM**

1. Click Dirty Dishes (shows badge ③)
2. Quest panel opens: "Wash the Dishes"
3. Accept quest
4. Badge disappears (quest active)
5. Complete quest → +25 XP, +1 Gem
6. **Cooldown starts**
7. Dishes now shows ⏰ badge, slightly faded
8. Object title shows: "Quest on cooldown - come back later"

### Scenario 2: Trying to Accept During Cooldown

**Time: Day 1, 2:30 PM (4.5 hours later)**

1. Click Dirty Dishes
2. Panel shows: "You've already completed a quest from this dirty dishes today! Come back in **19h 30m** for a new quest."
3. Only "Close" button available (no "Accept Quest")

### Scenario 3: After Cooldown Expires

**Time: Day 2, 10:01 AM (24+ hours later)**

1. Dishes badge changes back to ③
2. Full opacity restored
3. Click Dirty Dishes
4. New quest available!
5. Can accept and complete again

## Testing the Feature

### Quick Test (For Development)

To test without waiting 24 hours, you can manually adjust the timestamp in the browser console:

```javascript
// View current cooldowns
console.log(objectQuestCompletions);

// Set a cooldown to expire in 1 minute instead of 24 hours
objectQuestCompletions['dishes'] = Date.now() - (24 * 60 * 60 * 1000 - 60000);
saveObjectQuestCompletions();
renderRoom();

// Or completely clear cooldown for testing
delete objectQuestCompletions['dishes'];
saveObjectQuestCompletions();
renderRoom();
```

### Full Test Scenarios

#### Test 1: Basic Cooldown
1. ✅ Complete quest from Dirty Dishes
2. ✅ Verify ⏰ badge appears
3. ✅ Verify object has 60% opacity
4. ✅ Click object - see cooldown message
5. ✅ Message shows time remaining

#### Test 2: Multiple Objects
1. ✅ Complete quest from Dishes
2. ✅ Complete quest from Trash
3. ✅ Complete quest from Counter
4. ✅ All three show ⏰ badges
5. ✅ Each tracks cooldown independently

#### Test 3: Persistence
1. ✅ Complete quest from object
2. ✅ Refresh browser
3. ✅ Object still shows ⏰ badge
4. ✅ Cooldown timer still accurate

#### Test 4: Cooldown Expiry
1. ✅ Complete quest
2. ✅ Wait 24 hours (or manipulate timestamp)
3. ✅ Badge changes back to difficulty number
4. ✅ Can accept new quest

#### Test 5: Different Rooms
1. ✅ Complete quest in Kitchen
2. ✅ Go to Basement
3. ✅ Complete quest there
4. ✅ Return to Kitchen
5. ✅ Kitchen object still on cooldown

## Technical Details

### Data Structure

```javascript
objectQuestCompletions = {
  "dishes": 1710789012345,    // Kitchen - Dirty Dishes
  "counter": 1710789123456,   // Kitchen - Counter
  "trash": 1710789234567,     // Kitchen - Trash
  "washer": 1710789345678,    // Basement - Washer
  "dryer": 1710789456789,     // Basement - Dryer
  "basket": 1710789567890,    // Basement - Basket
  "feed": 1710789678901,      // Pet Room - Food Bowl
  "clean": 1710789789012,     // Pet Room - Litter Box
  "play": 1710789890123,      // Pet Room - Toys
  "homework": 1710789901234,  // Study - Desk
  "reading": 1710790012345,   // Study - Bookshelf
  "organize": 1710790123456   // Study - Backpack
}
```

### Key Functions

#### canAcceptObjectQuest(questType)
```javascript
Returns: boolean
Purpose: Check if 24 hours have passed since last completion
Example: canAcceptObjectQuest('dishes') → true/false
```

#### getTimeUntilObjectQuestAvailable(questType)
```javascript
Returns: milliseconds remaining
Purpose: Calculate time until cooldown expires
Example: getTimeUntilObjectQuestAvailable('dishes') → 82800000
```

#### formatTimeRemaining(milliseconds)
```javascript
Returns: string (e.g., "23h 45m" or "45m")
Purpose: Convert milliseconds to human-readable format
Example: formatTimeRemaining(86340000) → "23h 59m"
```

### Code Flow

**When Quest Completed:**
```javascript
completeQuest(quest) {
  // ... existing code ...
  
  if (quest.npcId && Object.keys(OBJECT_QUESTS).includes(quest.npcId)) {
    objectQuestCompletions[quest.npcId] = Date.now();
    saveObjectQuestCompletions();
  }
  
  // ... rest of function ...
}
```

**When Object Clicked:**
```javascript
showObjectQuestPanel(obj) {
  // Check cooldown first
  if (!canAcceptObjectQuest(obj.questType)) {
    const timeRemaining = getTimeUntilObjectQuestAvailable(obj.questType);
    const timeString = formatTimeRemaining(timeRemaining);
    // Show cooldown message with time
    return;
  }
  
  // ... show quest normally ...
}
```

**When Rendering Room:**
```javascript
renderRoom() {
  // ... for each interactive object ...
  
  const onCooldown = !canAcceptObjectQuest(obj.questType);
  
  if (onCooldown) {
    // Add clock badge
    // Set opacity to 60%
  }
  
  // ... rest of rendering ...
}
```

## Edge Cases Handled

### 1. Never Completed Before
- `objectQuestCompletions[questType]` is `undefined`
- `canAcceptObjectQuest()` returns `true`
- Quest available normally

### 2. Page Refresh During Cooldown
- Data loaded from localStorage
- Cooldown persists correctly
- Timer updates based on saved timestamp

### 3. Multiple Completions in One Session
- Each completion updates timestamp
- Previous timestamp is overwritten
- New 24-hour cooldown starts

### 4. Clearing Browser Data
- localStorage cleared
- All cooldowns reset
- All quests become available

### 5. Active Quest vs Cooldown
- Priority: Active quest takes precedence
- Badge hidden while quest active
- Clock badge only shows after completion

## Benefits

### For Players:
- ✅ Encourages exploration of all objects
- ✅ Prevents repetitive grinding
- ✅ Clear feedback on availability
- ✅ Builds anticipation for daily quests

### For Parents:
- ✅ Spreads tasks throughout the day
- ✅ Prevents gaming the system
- ✅ Encourages variety in chores
- ✅ Natural daily routine builder

### For Gameplay:
- ✅ Balanced progression
- ✅ Sustainable reward system
- ✅ Long-term engagement
- ✅ Strategic quest planning

## Troubleshooting

### Quest Not Going on Cooldown
**Check:**
- Is it an object quest? (NPC quests don't have cooldown)
- Look at console for errors
- Verify `saveObjectQuestCompletions()` is called

### Cooldown Not Expiring
**Check:**
- Current timestamp vs saved timestamp
- Math: `Date.now() - savedTimestamp >= 86400000`
- Browser console: `objectQuestCompletions`

### Badge Not Updating
**Check:**
- Is `renderRoom()` being called after completion?
- Check console for rendering errors
- Verify `canAcceptObjectQuest()` logic

### Time Remaining Incorrect
**Check:**
- System clock accuracy
- Timestamp format (should be milliseconds)
- `formatTimeRemaining()` logic

## Future Enhancements (Ideas)

- 🔮 Configurable cooldown period (12h, 24h, 48h)
- 🔮 Premium objects with shorter cooldowns
- 🔮 Bonus rewards for completing after cooldown
- 🔮 Daily streak system
- 🔮 Progress bar showing cooldown visually
- 🔮 Notification when cooldown expires

---

## Quick Reference

**Object Quest Types:**
- Kitchen: `dishes`, `counter`, `trash`
- Basement: `washer`, `dryer`, `basket`
- Pet Room: `feed`, `clean`, `play`
- Study: `homework`, `reading`, `organize`

**Cooldown Duration:** 24 hours (86,400,000 ms)

**Storage Key:** `habitHeroObjectCompletions`

**Visual States:**
- Available: Badge ①②③, opacity 100%
- Active: No badge, opacity 100%
- Cooldown: Badge ⏰, opacity 60%

✅ Feature is fully functional and production-ready!
