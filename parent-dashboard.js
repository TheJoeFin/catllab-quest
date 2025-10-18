// Parent Dashboard JavaScript
// This dashboard allows parents to monitor their child's progress and grant rewards

// Load data from localStorage
let playerData = {
    level: 1,
    xp: 0,
    gems: 0,
    currentRoom: 'kitchen'
};

let quests = [];
let vaultRewards = [];
let tasksCompletedAtLevel = {};

// Load all game data
function loadGameData() {
    // Load player data
    const savedPlayer = localStorage.getItem('habitHeroPlayer');
    if (savedPlayer) {
        playerData = JSON.parse(savedPlayer);
    }

    // Load quests
    const savedQuests = localStorage.getItem('habitHeroQuests');
    if (savedQuests) {
        quests = JSON.parse(savedQuests);
    }

    // Load reward vault
    const savedVault = localStorage.getItem('habitHeroRewardVault');
    if (savedVault) {
        vaultRewards = JSON.parse(savedVault);
    }

    // Load tasks completed
    const savedTasks = localStorage.getItem('habitHeroTasksCompleted');
    if (savedTasks) {
        tasksCompletedAtLevel = JSON.parse(savedTasks);
    }
}

// Calculate XP needed for current level
function getXPNeeded(level) {
    return level * 100;
}

// Update stats overview
function updateStatsOverview() {
    document.getElementById('current-level').textContent = playerData.level;
    document.getElementById('total-xp').textContent = playerData.xp;
    document.getElementById('total-gems').textContent = playerData.gems;
    
    const completedQuests = quests.filter(q => q.completed).length;
    document.getElementById('quests-completed').textContent = completedQuests;
}

// Calculate quest progress percentage (0-100)
// 0 = not started, 50 = accepted but not completed, 100 = completed
function getQuestProgress(quest) {
    if (quest.completed) {
        return 100;
    } else if (quest.acceptedByPlayer) {
        return 50;
    } else {
        return 0;
    }
}

// Convert progress percentage to X coordinate on hill (0-800)
function progressToX(progress) {
    // Map 0-100 to 0-800
    return (progress / 100) * 800;
}

// Calculate Y coordinate on the hill based on X
// Hill is defined as: Q 200 50, 400 250 T 800 250
// This is a quadratic curve going up then down
function calculateHillY(x) {
    // For simplicity, use a parabola formula
    // Peak at x=400, y=50
    // Ends at x=0, y=250 and x=800, y=250
    
    if (x <= 400) {
        // First half: going up the hill (upward curve)
        // y = 250 - 200 * (x/400)^0.8  (modified to be less steep)
        const t = x / 400;
        return 250 - 200 * Math.pow(t, 0.8);
    } else {
        // Second half: going down the hill
        const t = (x - 400) / 400;
        return 50 + 200 * Math.pow(t, 0.8);
    }
}

// Get color based on quest difficulty
function getQuestColor(difficulty) {
    const colors = {
        easy: '#10b981',
        medium: '#f59e0b',
        hard: '#ef4444'
    };
    return colors[difficulty] || '#667eea';
}

// Render hill chart with quest markers
function renderHillChart() {
    const svg = document.getElementById('hill-svg');
    const legend = document.getElementById('hill-legend');
    
    // Clear existing markers
    const existingMarkers = svg.querySelectorAll('.quest-marker');
    existingMarkers.forEach(marker => marker.remove());
    
    // Clear legend
    legend.innerHTML = '';
    
    // Get active quests (not completed)
    const activeQuests = quests.filter(q => !q.completed);
    
    if (activeQuests.length === 0) {
        legend.innerHTML = '<div class="empty-state"><p style="margin: 0; color: #64748b;">No active quests to display</p></div>';
        return;
    }
    
    // Create markers for each quest
    activeQuests.forEach((quest, index) => {
        const progress = getQuestProgress(quest);
        const x = progressToX(progress);
        const y = calculateHillY(x);
        const color = getQuestColor(quest.difficulty);
        
        // Create marker group
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        marker.classList.add('quest-marker');
        marker.setAttribute('data-quest-id', quest.id);
        
        // Create circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.classList.add('quest-marker-circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', '12');
        circle.style.fill = color;
        
        // Create text (quest number)
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.classList.add('quest-marker-text');
        text.setAttribute('x', x);
        text.setAttribute('y', y);
        text.textContent = index + 1;
        
        marker.appendChild(circle);
        marker.appendChild(text);
        svg.appendChild(marker);
        
        // Add tooltip behavior
        marker.addEventListener('mouseenter', () => showQuestTooltip(quest, marker));
        marker.addEventListener('mouseleave', hideQuestTooltip);
        
        // Add to legend
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `
            <div class="legend-color" style="background: ${color};"></div>
            <span><strong>${index + 1}.</strong> ${quest.name} (${progress === 0 ? 'Not Started' : progress === 50 ? 'In Progress' : 'Completed'})</span>
        `;
        legend.appendChild(legendItem);
    });
}

// Tooltip for quest markers
let tooltipTimeout;
function showQuestTooltip(quest, markerElement) {
    clearTimeout(tooltipTimeout);
    // Could add a tooltip element here if desired
    markerElement.style.transform = 'scale(1.2)';
}

function hideQuestTooltip(event) {
    if (event.target.classList.contains('quest-marker') || event.target.closest('.quest-marker')) {
        const marker = event.target.closest('.quest-marker') || event.target;
        marker.style.transform = 'scale(1)';
    }
}

// Render pending rewards section
function renderPendingRewards() {
    const container = document.getElementById('pending-rewards-container');
    
    // Find rewards that can be claimed (player has enough gems and not yet claimed)
    const earnedRewards = vaultRewards.filter(r => 
        !r.claimed && playerData.gems >= r.gemCost
    );
    
    if (earnedRewards.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🎁</div>
                <p>No rewards ready to grant yet.</p>
                <p style="font-size: 0.875rem; color: #94a3b8;">Rewards will appear here when your child earns enough gems.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = earnedRewards.map(reward => `
        <div class="reward-card earned" data-reward-id="${reward.id}">
            <div class="reward-badge">EARNED! ✓</div>
            <h3>🎁 ${reward.name}</h3>
            <div class="reward-info">
                <div class="reward-meta">
                    <span><strong>💎 ${reward.gemCost}</strong> gems required</span>
                    <span><strong>💎 ${playerData.gems}</strong> gems earned</span>
                </div>
                <p style="font-size: 0.875rem; color: #78350f; margin: 8px 0;">
                    Your child has earned this reward! Grant it when you're ready.
                </p>
            </div>
            <div class="reward-actions">
                <button class="btn btn-success" onclick="grantReward(${reward.id})">
                    ✓ Grant Reward
                </button>
            </div>
        </div>
    `).join('');
}

// Grant a reward to the child
function grantReward(rewardId) {
    const reward = vaultRewards.find(r => r.id === rewardId);
    if (!reward) return;
    
    // Show confirmation modal
    const modal = document.getElementById('grant-reward-modal');
    const message = document.getElementById('reward-grant-message');
    
    message.textContent = `Grant "${reward.name}" to your child? This will deduct ${reward.gemCost} gems from their total.`;
    modal.classList.add('active');
    
    // Set up confirmation handler
    const confirmBtn = document.getElementById('confirm-grant-btn');
    const cancelBtn = document.getElementById('cancel-grant-btn');
    
    // Remove old event listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    const newCancelBtn = cancelBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    
    newConfirmBtn.addEventListener('click', () => {
        // Mark reward as claimed
        reward.claimed = true;
        
        // Deduct gems from player
        playerData.gems -= reward.gemCost;
        
        // Save updated data
        localStorage.setItem('habitHeroRewardVault', JSON.stringify(vaultRewards));
        localStorage.setItem('habitHeroPlayer', JSON.stringify(playerData));
        
        // Close modal
        modal.classList.remove('active');
        
        // Refresh dashboard
        refreshDashboard();
        
        // Show success message
        alert(`✓ Reward "${reward.name}" has been granted! Your child's gem count has been updated.`);
    });
    
    newCancelBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
}

// Render active quests
function renderActiveQuests() {
    const container = document.getElementById('active-quests-container');
    const activeQuests = quests.filter(q => !q.completed);
    
    if (activeQuests.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <p>No active quests.</p>
                <p style="font-size: 0.875rem; color: #94a3b8;">Create quests in the game's Parent Mode.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = activeQuests.map(quest => {
        const status = quest.acceptedByPlayer ? 'In Progress' : 'Not Started';
        const statusColor = quest.acceptedByPlayer ? '#f59e0b' : '#94a3b8';
        
        return `
            <div class="quest-card">
                <div class="quest-header">
                    <div>
                        <div class="quest-title">${quest.name}</div>
                        <span class="quest-difficulty ${quest.difficulty}">${quest.difficulty}</span>
                    </div>
                </div>
                <div class="quest-description">${quest.description}</div>
                <div style="font-size: 0.875rem; color: ${statusColor}; font-weight: 600; margin-top: 8px;">
                    Status: ${status}
                </div>
                <div class="quest-rewards">
                    <div class="quest-reward-item">
                        ⭐ ${quest.xpReward} XP
                    </div>
                    <div class="quest-reward-item">
                        💎 ${quest.gemReward || 0} gems
                    </div>
                    ${quest.irlReward ? `
                        <div class="quest-reward-item">
                            🎁 ${quest.irlReward}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Render completed quests
function renderCompletedQuests() {
    const container = document.getElementById('completed-quests-container');
    const completedQuests = quests.filter(q => q.completed);
    
    if (completedQuests.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">✅</div>
                <p>No completed quests yet.</p>
            </div>
        `;
        return;
    }
    
    // Show only the 10 most recent
    const recentCompleted = completedQuests.slice(-10).reverse();
    
    container.innerHTML = recentCompleted.map(quest => `
        <div class="completed-quest-item">
            <div class="completed-quest-info">
                <div class="completed-quest-name">${quest.name}</div>
                <div class="completed-quest-meta">
                    Level ${quest.level} • ${quest.difficulty}
                </div>
            </div>
            <div class="completed-quest-rewards">
                <span>⭐ ${quest.xpReward}</span>
                <span>💎 ${quest.gemReward || 0}</span>
            </div>
        </div>
    `).join('');
}

// Refresh all dashboard data
function refreshDashboard() {
    loadGameData();
    updateStatsOverview();
    renderHillChart();
    renderPendingRewards();
    renderActiveQuests();
    renderCompletedQuests();
}

// Initialize dashboard
function init() {
    loadGameData();
    updateStatsOverview();
    renderHillChart();
    renderPendingRewards();
    renderActiveQuests();
    renderCompletedQuests();
    
    // Set up refresh button
    document.getElementById('refresh-btn').addEventListener('click', () => {
        refreshDashboard();
        
        // Show brief feedback
        const btn = document.getElementById('refresh-btn');
        const originalText = btn.textContent;
        btn.textContent = '✓ Refreshed';
        btn.style.background = '#10b981';
        btn.style.color = 'white';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.style.color = '';
        }, 1500);
    });
    
    // Auto-refresh every 30 seconds
    setInterval(() => {
        refreshDashboard();
    }, 30000);
    
    // Set up modal close button
    const closeModalBtn = document.getElementById('grant-reward-modal-close-x');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            const modal = document.getElementById('grant-reward-modal');
            modal.classList.remove('active');
        });
    }
    
    // Set up soft dismiss for modal (clicking outside)
    const modal = document.getElementById('grant-reward-modal');
    const modalContent = modal.querySelector('.modal-content');
    if (modal && modalContent) {
        modal.addEventListener('click', (e) => {
            // Only close if clicking the backdrop, not the content
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }
    
    console.log('🏆 Parent Dashboard loaded!');
    console.log(`📊 Tracking ${quests.length} total quests`);
    console.log(`💎 Child has ${playerData.gems} gems`);
}

// Start the dashboard when page loads
document.addEventListener('DOMContentLoaded', init);
