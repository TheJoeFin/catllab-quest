# CATLLAB Quest - 2D RPG Adventure

A fun and engaging 2D RPG game with an integrated quest/task management system, perfect for encouraging children to complete real-world tasks through gamification!

## Features

### Game Features
- **Tile-based movement** - Navigate through a grid-based world
- **Collision detection** - Avoid obstacles (trees) as you explore
- **Keyboard controls** - Use arrow keys to move your character
- **Smooth animations** - Beautiful animations and responsive design

### Quest System Features
- **Add Tasks/Quests** - Parents can add real-world tasks as in-game quests
- **Point System** - Each quest has customizable point values
- **Track Progress** - Visual tracking of completed and pending quests
- **SQLite Database** - Server-side database stores all quests and points persistently
- **RESTful API** - Modern API architecture for quest management
- **Celebrations** - Fun animations when completing quests
- **Quest Management** - Complete, uncomplete, or delete quests as needed

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository or download the project files

2. Install dependencies:
```bash
npm install
```

## Running the Game

### Production Mode
```bash
npm start
```

### Development Mode (with auto-reload)
```bash
npm run dev
```

The game will be available at `http://localhost:3000`

## How to Use

### For Parents/Adults
1. **Add Quests** - Use the quest panel on the left to add tasks:
   - Enter a task description (e.g., "Clean your room", "Do homework", "Practice piano")
   - Set point values based on task difficulty
   - Click "Add Quest" to create the task

2. **Manage Quests** - Track and manage tasks:
   - View all active and completed quests
   - Mark quests as incomplete if needed (undo button)
   - Delete quests that are no longer relevant

### For Children
1. **Play the Game** - Use **Arrow Keys** to move your character around the world
2. **Complete Real Tasks** - Do your assigned tasks in real life
3. **Check Off Quests** - When a task is done, click the ✓ button to complete it
4. **Earn Points** - Watch your points grow as you complete quests!
5. **Celebrate** - Enjoy the celebration animation when you complete a quest

### Gameplay
- Navigate around the green obstacles (trees)
- Explore the game world
- Complete quests to earn points and see your character celebrate!

## Project Structure

```
catllab-quest/
├── src/
│   ├── game.js     # Game logic and mechanics
│   └── quests.js   # Quest management system (client-side)
├── database.js     # SQLite database operations
├── server.js       # Express server with REST API
├── index.html      # Main HTML file
├── style.css       # Styling and animations
├── package.json    # Node.js dependencies
├── quests.db       # SQLite database (created automatically)
└── README.md       # This file
```

## Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: SQLite (via better-sqlite3)
- **Real-time Communication**: Socket.IO for WebSocket support
- **Architecture**: RESTful API with real-time updates
- **Development**: Nodemon for auto-reloading

## Real-Time Features

The application uses **WebSocket** technology (Socket.IO) to provide real-time synchronization across multiple devices:

- **Multi-device support** - Changes made on one device instantly appear on all connected devices
- **Quest updates** - When a parent adds or deletes a quest, all clients update immediately
- **Completion notifications** - When a child completes a quest, parents see it in real-time
- **Reward updates** - Reward creation and claims are synchronized across devices
- **No page refresh needed** - All updates happen automatically

### WebSocket Events

The application emits and listens for the following events:

- `quest:created` - New quest added
- `quest:completed` - Quest marked as complete
- `quest:uncompleted` - Quest marked as incomplete
- `quest:deleted` - Quest removed
- `reward:created` - New reward added to vault
- `reward:claimed` - Reward claimed by child
- `player:updated` - Player stats updated

## API Endpoints

The server provides the following REST API endpoints:

- `GET /api/quests` - Get all quests
- `POST /api/quests` - Create a new quest
- `PUT /api/quests/:id/complete` - Mark a quest as completed
- `PUT /api/quests/:id/uncomplete` - Mark a quest as incomplete
- `DELETE /api/quests/:id` - Delete a quest
- `GET /api/settings/total_points` - Get total points earned

## License

MIT

