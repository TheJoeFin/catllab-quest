// Quest Management System

// Quest data structure
let quests = [];
let totalPoints = 0;

// DOM elements
const questList = document.getElementById('quest-list');
const addQuestForm = document.getElementById('add-quest-form');
const questTitleInput = document.getElementById('quest-title');
const questPointsInput = document.getElementById('quest-points');
const totalPointsDisplay = document.getElementById('total-points');

// API Helper Functions
async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        showNotification('Error: Could not connect to server');
        throw error;
    }
}

// Initialize quests from server
async function initQuests() {
    try {
        // Fetch quests from server
        const questsData = await apiRequest('/api/quests');
        quests = questsData;
        
        // Fetch total points from server
        const pointsData = await apiRequest('/api/settings/total_points');
        totalPoints = pointsData.totalPoints;
        
        updatePointsDisplay();
        renderQuests();
    } catch (error) {
        console.error('Failed to initialize quests:', error);
        renderQuests(); // Render empty state
    }
}

// Update points display
function updatePointsDisplay() {
    totalPointsDisplay.textContent = totalPoints;
    
    // Add animation when points change
    totalPointsDisplay.classList.add('points-update');
    setTimeout(() => {
        totalPointsDisplay.classList.remove('points-update');
    }, 500);
}

// Add a new quest
async function addQuest(title, points) {
    try {
        const quest = await apiRequest('/api/quests', {
            method: 'POST',
            body: JSON.stringify({ title, points })
        });
        
        quests.unshift(quest);
        renderQuests();
        
        // Show success feedback
        showNotification('Quest added! 🎯');
    } catch (error) {
        console.error('Failed to add quest:', error);
    }
}

// Complete a quest
async function completeQuest(questId) {
    try {
        const quest = await apiRequest(`/api/quests/${questId}/complete`, {
            method: 'PUT'
        });
        
        // Update local data
        const index = quests.findIndex(q => q.id === questId);
        if (index !== -1) {
            quests[index] = quest;
        }
        
        // Fetch updated total points
        const pointsData = await apiRequest('/api/settings/total_points');
        totalPoints = pointsData.totalPoints;
        
        updatePointsDisplay();
        renderQuests();
        
        // Show celebration
        showNotification(`Quest completed! +${quest.points} points! 🎉`);
        celebrateCompletion();
    } catch (error) {
        console.error('Failed to complete quest:', error);
    }
}

// Delete a quest
async function deleteQuest(questId) {
    try {
        await apiRequest(`/api/quests/${questId}`, {
            method: 'DELETE'
        });
        
        const questIndex = quests.findIndex(q => q.id === questId);
        if (questIndex !== -1) {
            quests.splice(questIndex, 1);
        }
        
        renderQuests();
        showNotification('Quest deleted 🗑️');
    } catch (error) {
        console.error('Failed to delete quest:', error);
    }
}

// Uncomplete a quest (in case of mistakes)
async function uncompleteQuest(questId) {
    try {
        const quest = await apiRequest(`/api/quests/${questId}/uncomplete`, {
            method: 'PUT'
        });
        
        // Update local data
        const index = quests.findIndex(q => q.id === questId);
        if (index !== -1) {
            quests[index] = quest;
        }
        
        // Fetch updated total points
        const pointsData = await apiRequest('/api/settings/total_points');
        totalPoints = pointsData.totalPoints;
        
        updatePointsDisplay();
        renderQuests();
        
        showNotification('Quest marked as incomplete');
    } catch (error) {
        console.error('Failed to uncomplete quest:', error);
    }
}

// Render all quests
function renderQuests() {
    if (quests.length === 0) {
        questList.innerHTML = '<div class="no-quests">No quests yet! Add one to get started.</div>';
        return;
    }
    
    questList.innerHTML = quests.map(quest => `
        <div class="quest-item ${quest.completed ? 'completed' : ''}">
            <div class="quest-content">
                <div class="quest-title">${escapeHtml(quest.title)}</div>
                <div class="quest-points">
                    <span class="points-badge">${quest.points} pts</span>
                </div>
            </div>
            <div class="quest-actions">
                ${quest.completed ? 
                    `<button class="btn-uncomplete" onclick="uncompleteQuest(${quest.id})" title="Mark as incomplete">↩️</button>` :
                    `<button class="btn-complete" onclick="completeQuest(${quest.id})" title="Complete quest">✓</button>`
                }
                <button class="btn-delete" onclick="deleteQuest(${quest.id})" title="Delete quest">×</button>
            </div>
        </div>
    `).join('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show notification
function showNotification(message) {
    // Remove any existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Celebrate completion with animation
function celebrateCompletion() {
    // Add celebration class to player
    const playerElement = document.getElementById('player');
    if (playerElement) {
        playerElement.classList.add('celebrating');
        setTimeout(() => {
            playerElement.classList.remove('celebrating');
        }, 1000);
    }
}

// Handle form submission
addQuestForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = questTitleInput.value.trim();
    const points = parseInt(questPointsInput.value);
    
    if (title && points > 0) {
        addQuest(title, points);
        
        // Reset form
        questTitleInput.value = '';
        questPointsInput.value = '10';
        questTitleInput.focus();
    }
});

// Initialize on page load
initQuests();

console.log('Quest system loaded! 🎯');

