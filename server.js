const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Route for the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API Routes

// Get all quests
app.get('/api/quests', (req, res) => {
    try {
        const quests = db.quests.getAll();
        // Convert completed field from 0/1 to boolean
        const formattedQuests = quests.map(q => ({
            id: q.id,
            title: q.title,
            points: q.points,
            completed: q.completed === 1,
            createdAt: q.created_at,
            completedAt: q.completed_at
        }));
        res.json(formattedQuests);
    } catch (error) {
        console.error('Error fetching quests:', error);
        res.status(500).json({ error: 'Failed to fetch quests' });
    }
});

// Create a new quest
app.post('/api/quests', (req, res) => {
    try {
        const { title, points } = req.body;
        
        if (!title || !points) {
            return res.status(400).json({ error: 'Title and points are required' });
        }
        
        const quest = db.quests.create(title, parseInt(points));
        res.status(201).json(quest);
    } catch (error) {
        console.error('Error creating quest:', error);
        res.status(500).json({ error: 'Failed to create quest' });
    }
});

// Complete a quest
app.put('/api/quests/:id/complete', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const quest = db.quests.complete(id);
        
        if (!quest) {
            return res.status(404).json({ error: 'Quest not found or already completed' });
        }
        
        const formattedQuest = {
            id: quest.id,
            title: quest.title,
            points: quest.points,
            completed: quest.completed === 1,
            createdAt: quest.created_at,
            completedAt: quest.completed_at
        };
        
        res.json(formattedQuest);
    } catch (error) {
        console.error('Error completing quest:', error);
        res.status(500).json({ error: 'Failed to complete quest' });
    }
});

// Uncomplete a quest
app.put('/api/quests/:id/uncomplete', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const quest = db.quests.uncomplete(id);
        
        if (!quest) {
            return res.status(404).json({ error: 'Quest not found or not completed' });
        }
        
        const formattedQuest = {
            id: quest.id,
            title: quest.title,
            points: quest.points,
            completed: quest.completed === 1,
            createdAt: quest.created_at,
            completedAt: quest.completed_at
        };
        
        res.json(formattedQuest);
    } catch (error) {
        console.error('Error uncompleting quest:', error);
        res.status(500).json({ error: 'Failed to uncomplete quest' });
    }
});

// Delete a quest
app.delete('/api/quests/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const success = db.quests.delete(id);
        
        if (!success) {
            return res.status(404).json({ error: 'Quest not found' });
        }
        
        res.json({ message: 'Quest deleted successfully' });
    } catch (error) {
        console.error('Error deleting quest:', error);
        res.status(500).json({ error: 'Failed to delete quest' });
    }
});

// Get total points
app.get('/api/settings/total_points', (req, res) => {
    try {
        const totalPoints = db.settings.get('total_points');
        res.json({ totalPoints: parseInt(totalPoints || '0') });
    } catch (error) {
        console.error('Error fetching total points:', error);
        res.status(500).json({ error: 'Failed to fetch total points' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🎮 Server is running on http://localhost:${PORT}`);
    console.log(`   Open your browser and navigate to the URL above to play!`);
});

