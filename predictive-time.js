/**
 * Predictive Time Management for Futuristic Clock
 * Analyzes user patterns and provides smart scheduling suggestions
 */

class PredictiveTimeManagement {
    constructor() {
        this.activities = [];
        this.routines = [];
        this.predictions = [];
        this.activityHistory = [];
        this.isTrackingEnabled = false;
        this.currentActivity = null;
        this.lastActivityChange = null;
        this.activityUpdateInterval = null;
        this.predictionUpdateInterval = null;
        this.maxHistoryItems = 100;
        this.minDataPointsForPrediction = 5;
        this.predictionConfidenceThreshold = 0.6;
        
        // Create time management button
        this.createTimeManagementButton();
        
        // Create time management modal
        this.createTimeManagementModal();
        
        // Load saved data
        this.loadSavedData();
    }
    
    createTimeManagementButton() {
        const controlsContainer = document.querySelector('.controls');
        const timeManagementBtn = document.createElement('button');
        timeManagementBtn.className = 'control-btn';
        timeManagementBtn.id = 'timeManagementBtn';
        timeManagementBtn.innerHTML = '<span class="icon-time-management"></span> Time AI';
        
        // Add button to controls after AR button
        const arBtn = document.getElementById('arBtn');
        if (arBtn) {
            controlsContainer.insertBefore(timeManagementBtn, arBtn.nextSibling);
        } else {
            controlsContainer.appendChild(timeManagementBtn);
        }
        
        // Open time management modal on button click
        timeManagementBtn.addEventListener('click', () => {
            this.openTimeManagementModal();
        });
    }
    
    createTimeManagementModal() {
        // Create modal element
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'timeManagementModal';
        
        // Create modal content
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Predictive Time Management</h2>
                    <button class="close-modal" data-modal="timeManagementModal">×</button>
                </div>
                <div class="time-management-tabs">
                    <button class="tab-btn active" data-tab="activities">Activities</button>
                    <button class="tab-btn" data-tab="routines">Routines</button>
                    <button class="tab-btn" data-tab="predictions">Predictions</button>
                    <button class="tab-btn" data-tab="settings">Settings</button>
                </div>
                <div class="time-management-content">
                    <!-- Activities Tab -->
                    <div class="tab-content active" id="activitiesTab">
                        <div class="current-activity">
                            <h3>Current Activity</h3>
                            <div class="activity-display" id="currentActivityDisplay">
                                <span class="no-activity">No activity in progress</span>
                            </div>
                            <div class="activity-timer" id="activityTimer">00:00:00</div>
                            <div class="activity-actions">
                                <button class="btn-set" id="startActivityBtn">Start Activity</button>
                                <button class="btn-set" id="stopActivityBtn" disabled>End Activity</button>
                            </div>
                        </div>
                        <div class="activity-list-container">
                            <h3>Recent Activities</h3>
                            <div class="activity-list" id="activityList">
                                <div class="empty-list">No recent activities</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Routines Tab -->
                    <div class="tab-content" id="routinesTab">
                        <div class="routines-header">
                            <h3>Your Routines</h3>
                            <button class="btn-set" id="createRoutineBtn">Create Routine</button>
                        </div>
                        <div class="routines-list" id="routinesList">
                            <div class="empty-list">No routines created yet</div>
                        </div>
                        <div class="routine-form" id="routineForm">
                            <h3>Create Routine</h3>
                            <div class="form-group">
                                <label>Routine Name</label>
                                <input type="text" id="routineName" placeholder="e.g., Morning Workout">
                            </div>
                            <div class="form-group">
                                <label>Days</label>
                                <div class="day-selector">
                                    <label class="day-checkbox">
                                        <input type="checkbox" value="mon"> M
                                    </label>
                                    <label class="day-checkbox">
                                        <input type="checkbox" value="tue"> T
                                    </label>
                                    <label class="day-checkbox">
                                        <input type="checkbox" value="wed"> W
                                    </label>
                                    <label class="day-checkbox">
                                        <input type="checkbox" value="thu"> T
                                    </label>
                                    <label class="day-checkbox">
                                        <input type="checkbox" value="fri"> F
                                    </label>
                                    <label class="day-checkbox">
                                        <input type="checkbox" value="sat"> S
                                    </label>
                                    <label class="day-checkbox">
                                        <input type="checkbox" value="sun"> S
                                    </label>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Start Time</label>
                                <input type="time" id="routineStartTime">
                            </div>
                            <div class="form-group">
                                <label>End Time</label>
                                <input type="time" id="routineEndTime">
                            </div>
                            <div class="form-group">
                                <label>Activity</label>
                                <input type="text" id="routineActivity" placeholder="e.g., Exercise">
                            </div>
                            <div class="form-actions">
                                <button class="btn-cancel" id="cancelRoutineBtn">Cancel</button>
                                <button class="btn-set" id="saveRoutineBtn">Save Routine</button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Predictions Tab -->
                    <div class="tab-content" id="predictionsTab">
                        <div class="predictions-header">
                            <h3>Time Predictions</h3>
                            <div class="prediction-info">
                                Based on your activity patterns, here are personalized time management suggestions.
                            </div>
                        </div>
                        <div class="predictions-list" id="predictionsList">
                            <div class="empty-list">No predictions available yet. Start tracking activities to generate predictions.</div>
                        </div>
                        <div class="daily-schedule">
                            <h3>Today's Optimal Schedule</h3>
                            <div class="schedule-timeline" id="scheduleTimeline">
                                <div class="empty-list">Track more activities to generate an optimal schedule.</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Settings Tab -->
                    <div class="tab-content" id="settingsTab">
                        <div class="form-group">
                            <label>Activity Tracking</label>
                            <label class="switch">
                                <input type="checkbox" id="activityTrackingToggle">
                                <span class="slider round"></span>
                            </label>
                            <div class="setting-description">
                                Enable automatic activity tracking and predictions
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Notification Reminders</label>
                            <label class="switch">
                                <input type="checkbox" id="reminderNotificationsToggle" checked>
                                <span class="slider round"></span>
                            </label>
                            <div class="setting-description">
                                Receive notifications for predicted activities and routines
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Prediction Sensitivity</label>
                            <div class="slider-container">
                                <input type="range" id="predictionSensitivity" min="1" max="10" value="6" class="range-slider">
                                <span id="sensitivityValue">6</span>
                            </div>
                            <div class="setting-description">
                                Higher values generate more predictions with less certainty
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Data Management</label>
                            <button class="btn-set" id="exportDataBtn">Export Data</button>
                            <button class="btn-set" id="clearDataBtn">Clear All Data</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to document
        document.body.appendChild(modal);
        
        // Add event listeners
        this.addTimeManagementEventListeners();
    }
    
    addTimeManagementEventListeners() {
        // Close modal button
        const closeBtn = document.querySelector('#timeManagementModal .close-modal');
        closeBtn.addEventListener('click', () => {
            this.closeTimeManagementModal();
        });
        
        // Tab buttons
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons and content
                tabButtons.forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked button and corresponding content
                button.classList.add('active');
                const tabId = button.dataset.tab + 'Tab';
                document.getElementById(tabId).classList.add('active');
            });
        });
        
        // Activity tracking toggle
        const activityTrackingToggle = document.getElementById('activityTrackingToggle');
        activityTrackingToggle.addEventListener('change', (e) => {
            this.isTrackingEnabled = e.target.checked;
            
            if (this.isTrackingEnabled) {
                this.startActivityTracking();
            } else {
                this.stopActivityTracking();
            }
            
            // Save preference
            localStorage.setItem('clockActivityTracking', this.isTrackingEnabled);
        });
        
        // Reminder notifications toggle
        const reminderNotificationsToggle = document.getElementById('reminderNotificationsToggle');
        reminderNotificationsToggle.addEventListener('change', (e) => {
            localStorage.setItem('clockReminderNotifications', e.target.checked);
        });
        
        // Prediction sensitivity slider
        const sensitivitySlider = document.getElementById('predictionSensitivity');
        const sensitivityValue = document.getElementById('sensitivityValue');
        
        sensitivitySlider.addEventListener('input', (e) => {
            const value = e.target.value;
            sensitivityValue.textContent = value;
            
            // Update prediction confidence threshold
            this.predictionConfidenceThreshold = 1.1 - (value / 10);
            
            // Save preference
            localStorage.setItem('clockPredictionSensitivity', value);
            
            // Update predictions
            this.generatePredictions();
        });
        
        // Start activity button
        document.getElementById('startActivityBtn').addEventListener('click', () => {
            this.showActivitySelectionDialog();
        });
        
        // Stop activity button
        document.getElementById('stopActivityBtn').addEventListener('click', () => {
            this.stopCurrentActivity();
        });
        
        // Create routine button
        document.getElementById('createRoutineBtn').addEventListener('click', () => {
            this.showRoutineForm();
        });
        
        // Cancel routine button
        document.getElementById('cancelRoutineBtn').addEventListener('click', () => {
            this.hideRoutineForm();
        });
        
        // Save routine button
        document.getElementById('saveRoutineBtn').addEventListener('click', () => {
            this.saveRoutine();
        });
        
        // Export data button
        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.exportData();
        });
        
        // Clear data button
        document.getElementById('clearDataBtn').addEventListener('click', () => {
            this.showClearDataConfirmation();
        });
    }
    
    openTimeManagementModal() {
        const modal = document.getElementById('timeManagementModal');
        modal.classList.add('active');
        
        // Update activity list
        this.updateActivityList();
        
        // Update routines list
        this.updateRoutinesList();
        
        // Update predictions
        this.updatePredictionsList();
        
        // Update current activity display
        this.updateCurrentActivityDisplay();
    }
    
    closeTimeManagementModal() {
        const modal = document.getElementById('timeManagementModal');
        modal.classList.remove('active');
    }
    
    startActivityTracking() {
        if (this.activityUpdateInterval) return;
        
        // Start activity update interval
        this.activityUpdateInterval = setInterval(() => {
            this.updateCurrentActivityTimer();
        }, 1000);
        
        // Start prediction update interval
        this.predictionUpdateInterval = setInterval(() => {
            this.checkRoutinesAndPredictions();
        }, 60000); // Check every minute
        
        // Update button state
        const timeManagementBtn = document.getElementById('timeManagementBtn');
        if (timeManagementBtn) {
            timeManagementBtn.classList.add('active');
        }
    }
    
    stopActivityTracking() {
        if (this.activityUpdateInterval) {
            clearInterval(this.activityUpdateInterval);
            this.activityUpdateInterval = null;
        }
        
        if (this.predictionUpdateInterval) {
            clearInterval(this.predictionUpdateInterval);
            this.predictionUpdateInterval = null;
        }
        
        // Update button state
        const timeManagementBtn = document.getElementById('timeManagementBtn');
        if (timeManagementBtn) {
            timeManagementBtn.classList.remove('active');
        }
    }
    
    showActivitySelectionDialog() {
        // Create dialog for activity selection
        const dialog = document.createElement('div');
        dialog.className = 'activity-dialog';
        
        // Get unique activities from history
        const uniqueActivities = [...new Set(this.activityHistory.map(item => item.activity))];
        
        // Create dialog content
        dialog.innerHTML = `
            <div class="dialog-header">
                <h3>Start Activity</h3>
                <button class="dialog-close">×</button>
            </div>
            <div class="dialog-content">
                <div class="form-group">
                    <label>Select or enter activity</label>
                    <input type="text" id="activityInput" list="activityList" placeholder="e.g., Work, Study, Exercise">
                    <datalist id="activityList">
                        ${uniqueActivities.map(activity => `<option value="${activity}">`).join('')}
                    </datalist>
                </div>
            </div>
            <div class="dialog-actions">
                <button class="btn-cancel" id="cancelActivityBtn">Cancel</button>
                <button class="btn-set" id="confirmActivityBtn">Start</button>
            </div>
        `;
        
        // Add dialog to document
        document.body.appendChild(dialog);
        
        // Show dialog with animation
        setTimeout(() => {
            dialog.classList.add('show');
        }, 10);
        
        // Focus input
        setTimeout(() => {
            document.getElementById('activityInput').focus();
        }, 300);
        
        // Add event listeners
        document.querySelector('.dialog-close').addEventListener('click', () => {
            this.closeDialog(dialog);
        });
        
        document.getElementById('cancelActivityBtn').addEventListener('click', () => {
            this.closeDialog(dialog);
        });
        
        document.getElementById('confirmActivityBtn').addEventListener('click', () => {
            const activity = document.getElementById('activityInput').value.trim();
            if (activity) {
                this.startActivity(activity);
                this.closeDialog(dialog);
            }
        });
        
        // Handle enter key
        document.getElementById('activityInput').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                const activity = e.target.value.trim();
                if (activity) {
                    this.startActivity(activity);
                    this.closeDialog(dialog);
                }
            }
        });
    }
    
    closeDialog(dialog) {
        dialog.classList.remove('show');
        
        // Remove dialog after animation
        setTimeout(() => {
            if (dialog.parentNode) {
                dialog.parentNode.removeChild(dialog);
            }
        }, 300);
    }
    
    startActivity(activity) {
        // End current activity if exists
        if (this.currentActivity) {
            this.stopCurrentActivity();
        }
        
        // Start new activity
        this.currentActivity = {
            activity,
            startTime: new Date(),
            duration: 0
        };
        
        // Update display
        this.updateCurrentActivityDisplay();
        
        // Enable stop button
        document.getElementById('stopActivityBtn').disabled = false;
        
        // Show notification
        this.showNotification(`Started: ${activity}`, 'Activity tracking has begun.');
        
        // Start tracking if not already
        if (!this.activityUpdateInterval && this.isTrackingEnabled) {
            this.startActivityTracking();
        }
    }
    
    stopCurrentActivity() {
        if (!this.currentActivity) return;
        
        // Calculate duration
        const endTime = new Date();
        const duration = (endTime - this.currentActivity.startTime) / 1000; // in seconds
        
        // Only save if duration is at least 30 seconds
        if (duration >= 30) {
            // Save activity to history
            const activityRecord = {
                activity: this.currentActivity.activity,
                startTime: this.currentActivity.startTime,
                endTime,
                duration,
                dayOfWeek: this.currentActivity.startTime.getDay(),
                hourOfDay: this.currentActivity.startTime.getHours()
            };
            
            this.activityHistory.unshift(activityRecord);
            
            // Limit history size
            if (this.activityHistory.length > this.maxHistoryItems) {
                this.activityHistory.pop();
            }
            
            // Save to localStorage
            this.saveActivityHistory();
            
            // Update activity list
            this.updateActivityList();
            
            // Generate new predictions
            this.generatePredictions();
            
            // Show notification
            const durationText = this.formatDuration(duration);
            this.showNotification(
                `Completed: ${this.currentActivity.activity}`,
                `Duration: ${durationText}`
            );
        }
        
        // Clear current activity
        this.currentActivity = null;
        this.lastActivityChange = new Date();
        
        // Update display
        this.updateCurrentActivityDisplay();
        
        // Disable stop button
        document.getElementById('stopActivityBtn').disabled = true;
    }
    
    updateCurrentActivityDisplay() {
        const currentActivityDisplay = document.getElementById('currentActivityDisplay');
        const activityTimer = document.getElementById('activityTimer');
        
        if (!currentActivityDisplay || !activityTimer) return;
        
        if (this.currentActivity) {
            currentActivityDisplay.innerHTML = `
                <div class="activity-name">${this.currentActivity.activity}</div>
                <div class="activity-start-time">Started at ${this.currentActivity.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            `;
            
            // Update timer
            this.updateCurrentActivityTimer();
        } else {
            currentActivityDisplay.innerHTML = `<span class="no-activity">No activity in progress</span>`;
            activityTimer.textContent = '00:00:00';
        }
    }
    
    updateCurrentActivityTimer() {
        const activityTimer = document.getElementById('activityTimer');
        if (!activityTimer || !this.currentActivity) return;
        
        const now = new Date();
        const duration = (now - this.currentActivity.startTime) / 1000; // in seconds
        
        activityTimer.textContent = this.formatDuration(duration);
    }
    
    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    updateActivityList() {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;
        
        if (this.activityHistory.length === 0) {
            activityList.innerHTML = '<div class="empty-list">No recent activities</div>';
            return;
        }
        
        // Create activity list items
        activityList.innerHTML = this.activityHistory.slice(0, 10).map(activity => {
            const date = new Date(activity.startTime);
            const dateString = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
            const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const durationText = this.formatDuration(activity.duration);
            
            return `
                <div class="activity-item">
                    <div class="activity-item-header">
                        <div class="activity-item-name">${activity.activity}</div>
                        <div class="activity-item-duration">${durationText}</div>
                    </div>
                    <div class="activity-item-time">${dateString} at ${timeString}</div>
                </div>
            `;
        }).join('');
    }
    
    showRoutineForm() {
        const routineForm = document.getElementById('routineForm');
        const routinesList = document.getElementById('routinesList');
        
        routineForm.style.display = 'block';
        routinesList.style.display = 'none';
        
        // Clear form
        document.getElementById('routineName').value = '';
        document.getElementById('routineStartTime').value = '';
        document.getElementById('routineEndTime').value = '';
        document.getElementById('routineActivity').value = '';
        document.querySelectorAll('.day-checkbox input').forEach(checkbox => {
            checkbox.checked = false;
        });
    }
    
    hideRoutineForm() {
        const routineForm = document.getElementById('routineForm');
        const routinesList = document.getElementById('routinesList');
        
        routineForm.style.display = 'none';
        routinesList.style.display = 'block';
    }
    
    saveRoutine() {
        const name = document.getElementById('routineName').value.trim();
        const startTime = document.getElementById('routineStartTime').value;
        const endTime = document.getElementById('routineEndTime').value;
        const activity = document.getElementById('routineActivity').value.trim();
        
        // Get selected days
        const days = [];
        document.querySelectorAll('.day-checkbox input:checked').forEach(checkbox => {
            days.push(checkbox.value);
        });
        
        // Validate form
        if (!name || !startTime || !endTime || !activity || days.length === 0) {
            this.showNotification('Error', 'Please fill in all fields and select at least one day.');
            return;
        }
        
        // Create routine object
        const routine = {
            id: Date.now(),
            name,
            days,
            startTime,
            endTime,
            activity
        };
        
        // Add to routines
        this.routines.push(routine);
        
        // Save to localStorage
        this.saveRoutines();
        
        // Update routines list
        this.updateRoutinesList();
        
        // Hide form
        this.hideRoutineForm();
        
        // Show notification
        this.showNotification('Routine Created', `"${name}" has been added to your routines.`);
    }
    
    updateRoutinesList() {
        const routinesList = document.getElementById('routinesList');
        if (!routinesList) return;
        
        if (this.routines.length === 0) {
            routinesList.innerHTML = '<div class="empty-list">No routines created yet</div>';
            return;
        }
        
        // Create routines list items
        routinesList.innerHTML = this.routines.map(routine => {
            const daysText = routine.days.map(day => day.charAt(0).toUpperCase()).join(', ');
            
            return `
                <div class="routine-item" data-id="${routine.id}">
                    <div class="routine-item-header">
                        <div class="routine-item-name">${routine.name}</div>
                        <div class="routine-item-actions">
                            <button class="routine-edit-btn" data-id="${routine.id}">Edit</button>
                            <button class="routine-delete-btn" data-id="${routine.id}">Delete</button>
                        </div>
                    </div>
                    <div class="routine-item-details">
                        <div class="routine-item-time">${routine.startTime} - ${routine.endTime}</div>
                        <div class="routine-item-days">${daysText}</div>
                        <div class="routine-item-activity">${routine.activity}</div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.routine-edit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.editRoutine(id);
            });
        });
        
        document.querySelectorAll('.routine-delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.deleteRoutine(id);
            });
        });
    }
    
    editRoutine(id) {
        // Find routine
        const routine = this.routines.find(r => r.id === id);
        if (!routine) return;
        
        // Show form
        this.showRoutineForm();
        
        // Fill form with routine data
        document.getElementById('routineName').value = routine.name;
        document.getElementById('routineStartTime').value = routine.startTime;
        document.getElementById('routineEndTime').value = routine.endTime;
        document.getElementById('routineActivity').value = routine.activity;
        
        // Check days
        document.querySelectorAll('.day-checkbox input').forEach(checkbox => {
            checkbox.checked = routine.days.includes(checkbox.value);
        });
        
        // Change save button to update
        const saveButton = document.getElementById('saveRoutineBtn');
        saveButton.textContent = 'Update Routine';
        saveButton.dataset.editId = id;
        
        // Change save button event listener
        saveButton.onclick = () => {
            this.updateRoutine(id);
        };
    }
    
    updateRoutine(id) {
        const name = document.getElementById('routineName').value.trim();
        const startTime = document.getElementById('routineStartTime').value;
        const endTime = document.getElementById('routineEndTime').value;
        const activity = document.getElementById('routineActivity').value.trim();
        
        // Get selected days
        const days = [];
        document.querySelectorAll('.day-checkbox input:checked').forEach(checkbox => {
            days.push(checkbox.value);
        });
        
        // Validate form
        if (!name || !startTime || !endTime || !activity || days.length === 0) {
            this.showNotification('Error', 'Please fill in all fields and select at least one day.');
            return;
        }
        
        // Find routine index
        const index = this.routines.findIndex(r => r.id === id);
        if (index === -1) return;
        
        // Update routine
        this.routines[index] = {
            id,
            name,
            days,
            startTime,
            endTime,
            activity
        };
        
        // Save to localStorage
        this.saveRoutines();
        
        // Update routines list
        this.updateRoutinesList();
        
        // Hide form
        this.hideRoutineForm();
        
        // Reset save button
        const saveButton = document.getElementById('saveRoutineBtn');
        saveButton.textContent = 'Save Routine';
        delete saveButton.dataset.editId;
        
        // Reset save button event listener
        saveButton.onclick = () => {
            this.saveRoutine();
        };
        
        // Show notification
        this.showNotification('Routine Updated', `"${name}" has been updated.`);
    }
    
    deleteRoutine(id) {
        // Find routine
        const routine = this.routines.find(r => r.id === id);
        if (!routine) return;
        
        // Confirm deletion
        if (!confirm(`Are you sure you want to delete the routine "${routine.name}"?`)) {
            return;
        }
        
        // Remove routine
        this.routines = this.routines.filter(r => r.id !== id);
        
        // Save to localStorage
        this.saveRoutines();
        
        // Update routines list
        this.updateRoutinesList();
        
        // Show notification
        this.showNotification('Routine Deleted', `"${routine.name}" has been deleted.`);
    }
    
    generatePredictions() {
        // Clear existing predictions
        this.predictions = [];
        
        // Need minimum data points for prediction
        if (this.activityHistory.length < this.minDataPointsForPrediction) {
            return;
        }
        
        // Group activities by type
        const activityGroups = {};
        
        this.activityHistory.forEach(activity => {
            if (!activityGroups[activity.activity]) {
                activityGroups[activity.activity] = [];
            }
            
            activityGroups[activity.activity].push(activity);
        });
        
        // Analyze each activity type
        for (const activity in activityGroups) {
            const activities = activityGroups[activity];
            
            // Skip if not enough data points
            if (activities.length < this.minDataPointsForPrediction) {
                continue;
            }
            
            // Analyze by day of week
            const dayPatterns = this.analyzeDayPatterns(activities);
            
            // Analyze by time of day
            const timePatterns = this.analyzeTimePatterns(activities);
            
            // Analyze duration patterns
            const durationPattern = this.analyzeDurationPattern(activities);
            
            // Create predictions based on patterns
            this.createPredictionsFromPatterns(activity, dayPatterns, timePatterns, durationPattern);
        }
        
        // Sort predictions by confidence
        this.predictions.sort((a, b) => b.confidence - a.confidence);
        
        // Update predictions list
        this.updatePredictionsList();
        
        // Update schedule timeline
        this.updateScheduleTimeline();
    }
    
    analyzeDayPatterns(activities) {
        const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun, Mon, Tue, Wed, Thu, Fri, Sat
        
        activities.forEach(activity => {
            dayCounts[activity.dayOfWeek]++;
        });
        
        // Calculate day probabilities
        const totalActivities = activities.length;
        const dayProbabilities = dayCounts.map(count => count / totalActivities);
        
        return dayProbabilities;
    }
    
    analyzeTimePatterns(activities) {
        const hourCounts = Array(24).fill(0);
        
        activities.forEach(activity => {
            hourCounts[activity.hourOfDay]++;
        });
        
        // Calculate hour probabilities
        const totalActivities = activities.length;
        const hourProbabilities = hourCounts.map(count => count / totalActivities);
        
        return hourProbabilities;
    }
    
    analyzeDurationPattern(activities) {
        // Calculate average duration
        const totalDuration = activities.reduce((sum, activity) => sum + activity.duration, 0);
        const averageDuration = totalDuration / activities.length;
        
        // Calculate standard deviation
        const squaredDifferences = activities.map(activity => {
            const diff = activity.duration - averageDuration;
            return diff * diff;
        });
        
        const variance = squaredDifferences.reduce((sum, sqDiff) => sum + sqDiff, 0) / activities.length;
        const standardDeviation = Math.sqrt(variance);
        
        return {
            average: averageDuration,
            standardDeviation
        };
    }
    
    createPredictionsFromPatterns(activity, dayPatterns, timePatterns, durationPattern) {
        const now = new Date();
        const currentDay = now.getDay();
        
        // Look ahead for the next 7 days
        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
            const predictionDay = (currentDay + dayOffset) % 7;
            const dayConfidence = dayPatterns[predictionDay];
            
            // Skip days with low probability
            if (dayConfidence < this.predictionConfidenceThreshold / 2) {
                continue;
            }
            
            // Find the most likely hour for this activity on this day
            let maxHourConfidence = 0;
            let likelyHour = 0;
            
            for (let hour = 0; hour < 24; hour++) {
                const hourConfidence = timePatterns[hour];
                if (hourConfidence > maxHourConfidence) {
                    maxHourConfidence = hourConfidence;
                    likelyHour = hour;
                }
            }
            
            // Skip if hour confidence is too low
            if (maxHourConfidence < this.predictionConfidenceThreshold / 2) {
                continue;
            }
            
            // Calculate overall confidence
            const confidence = (dayConfidence + maxHourConfidence) / 2;
            
            // Skip if overall confidence is below threshold
            if (confidence < this.predictionConfidenceThreshold) {
                continue;
            }
            
            // Create prediction date
            const predictionDate = new Date(now);
            predictionDate.setDate(now.getDate() + dayOffset);
            predictionDate.setHours(likelyHour, 0, 0, 0);
            
            // Skip if prediction is in the past
            if (predictionDate < now) {
                continue;
            }
            
            // Create prediction
            const prediction = {
                activity,
                date: predictionDate,
                confidence,
                duration: durationPattern.average,
                durationVariance: durationPattern.standardDeviation
            };
            
            this.predictions.push(prediction);
        }
    }
    
    updatePredictionsList() {
        const predictionsList = document.getElementById('predictionsList');
        if (!predictionsList) return;
        
        if (this.predictions.length === 0) {
            predictionsList.innerHTML = '<div class="empty-list">No predictions available yet. Start tracking activities to generate predictions.</div>';
            return;
        }
        
        // Create predictions list items
        predictionsList.innerHTML = this.predictions.slice(0, 5).map(prediction => {
            const date = new Date(prediction.date);
            const dateString = date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
            const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const confidencePercent = Math.round(prediction.confidence * 100);
            const durationText = this.formatDuration(prediction.duration);
            
            return `
                <div class="prediction-item">
                    <div class="prediction-item-header">
                        <div class="prediction-item-activity">${prediction.activity}</div>
                        <div class="prediction-item-confidence">
                            <div class="confidence-bar">
                                <div class="confidence-level" style="width: ${confidencePercent}%"></div>
                            </div>
                            <div class="confidence-text">${confidencePercent}%</div>
                        </div>
                    </div>
                    <div class="prediction-item-details">
                        <div class="prediction-item-time">${dateString} at ${timeString}</div>
                        <div class="prediction-item-duration">Est. duration: ${durationText}</div>
                    </div>
                    <div class="prediction-item-actions">
                        <button class="btn-set schedule-btn" data-activity="${prediction.activity}" data-time="${date.toISOString()}">Schedule</button>
                        <button class="btn-set remind-btn" data-activity="${prediction.activity}" data-time="${date.toISOString()}">Remind</button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Add event listeners to buttons
        document.querySelectorAll('.schedule-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const activity = e.target.dataset.activity;
                const time = new Date(e.target.dataset.time);
                this.scheduleActivity(activity, time);
            });
        });
        
        document.querySelectorAll('.remind-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const activity = e.target.dataset.activity;
                const time = new Date(e.target.dataset.time);
                this.setReminder(activity, time);
            });
        });
    }
    
    updateScheduleTimeline() {
        const scheduleTimeline = document.getElementById('scheduleTimeline');
        if (!scheduleTimeline) return;
        
        if (this.predictions.length === 0) {
            scheduleTimeline.innerHTML = '<div class="empty-list">Track more activities to generate an optimal schedule.</div>';
            return;
        }
        
        // Get today's predictions
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);
        
        const todayPredictions = this.predictions.filter(prediction => {
            const predictionDate = new Date(prediction.date);
            return predictionDate >= todayStart && predictionDate < todayEnd;
        });
        
        if (todayPredictions.length === 0) {
            scheduleTimeline.innerHTML = '<div class="empty-list">No activities predicted for today.</div>';
            return;
        }
        
        // Sort by time
        todayPredictions.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Create timeline
        const timelineHtml = `
            <div class="timeline">
                ${todayPredictions.map(prediction => {
                    const date = new Date(prediction.date);
                    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const durationText = this.formatDuration(prediction.duration);
                    const timePercent = (date.getHours() * 60 + date.getMinutes()) / (24 * 60) * 100;
                    
                    return `
                        <div class="timeline-item" style="left: ${timePercent}%">
                            <div class="timeline-point"></div>
                            <div class="timeline-content">
                                <div class="timeline-time">${timeString}</div>
                                <div class="timeline-activity">${prediction.activity}</div>
                                <div class="timeline-duration">${durationText}</div>
                            </div>
                        </div>
                    `;
                }).join('')}
                <div class="timeline-line"></div>
                <div class="timeline-now" style="left: ${(now.getHours() * 60 + now.getMinutes()) / (24 * 60) * 100}%"></div>
            </div>
        `;
        
        scheduleTimeline.innerHTML = timelineHtml;
    }
    
    scheduleActivity(activity, time) {
        // Create calendar event
        const startTime = new Date(time);
        const endTime = new Date(startTime);
        
        // Find average duration for this activity
        const activityRecords = this.activityHistory.filter(record => record.activity === activity);
        let duration = 3600; // Default 1 hour
        
        if (activityRecords.length > 0) {
            const totalDuration = activityRecords.reduce((sum, record) => sum + record.duration, 0);
            duration = totalDuration / activityRecords.length;
        }
        
        // Add duration to end time
        endTime.setSeconds(endTime.getSeconds() + duration);
        
        // Format times for calendar URL
        const formatDate = (date) => {
            return date.toISOString().replace(/-|:|\.\d+/g, '');
        };
        
        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(activity)}&dates=${formatDate(startTime)}/${formatDate(endTime)}&details=Scheduled%20by%20Futuristic%20Clock`;
        
        // Open calendar in new tab
        window.open(calendarUrl, '_blank');
        
        // Show notification
        this.showNotification('Activity Scheduled', `"${activity}" has been added to your calendar.`);
    }
    
    setReminder(activity, time) {
        // Calculate time until reminder
        const now = new Date();
        const reminderTime = new Date(time);
        
        // If reminder is in the past, show error
        if (reminderTime < now) {
            this.showNotification('Error', 'Cannot set reminder for past time.');
            return;
        }
        
        // Calculate minutes before activity
        const minutesBefore = 15;
        reminderTime.setMinutes(reminderTime.getMinutes() - minutesBefore);
        
        // If adjusted reminder time is still in the future
        if (reminderTime > now) {
            // Schedule notification
            const timeUntilReminder = reminderTime - now;
            
            setTimeout(() => {
                // Show notification when time comes
                if (window.notificationSystem) {
                    window.notificationSystem.addSystemNotification(
                        `Reminder: ${activity}`,
                        `Scheduled to start in ${minutesBefore} minutes.`,
                        'reminder',
                        'icon-alarm'
                    );
                } else {
                    // Fallback if notification system not available
                    this.showNotification(`Reminder: ${activity}`, `Scheduled to start in ${minutesBefore} minutes.`);
                }
            }, timeUntilReminder);
            
            // Show confirmation
            const activityTime = new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            this.showNotification('Reminder Set', `You will be reminded about "${activity}" at ${reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, ${minutesBefore} minutes before the activity at ${activityTime}.`);
        } else {
            // If reminder time is in the past but activity time is in the future
            this.showNotification('Reminder Set', `"${activity}" is starting soon.`);
        }
    }
    
    checkRoutinesAndPredictions() {
        const now = new Date();
        const currentDay = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][now.getDay()];
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        // Check routines
        this.routines.forEach(routine => {
            // Check if routine is scheduled for today
            if (routine.days.includes(currentDay)) {
                // Check if it's time for the routine
                if (this.isTimeInRange(currentTime, routine.startTime, routine.endTime)) {
                    // Check if we're within 5 minutes of start time
                    const routineStartMinutes = this.timeToMinutes(routine.startTime);
                    const currentMinutes = now.getHours() * 60 + now.getMinutes();
                    
                    if (Math.abs(currentMinutes - routineStartMinutes) <= 5) {
                        // Suggest starting the routine
                        this.suggestRoutine(routine);
                    }
                }
            }
        });
        
        // Check predictions
        this.predictions.forEach(prediction => {
            const predictionTime = new Date(prediction.date);
            
            // Check if prediction is for today
            if (predictionTime.toDateString() === now.toDateString()) {
                // Check if we're within 15 minutes of predicted time
                const timeDiff = Math.abs(predictionTime - now) / (1000 * 60);
                
                if (timeDiff <= 15 && prediction.confidence >= this.predictionConfidenceThreshold) {
                    // Suggest starting the predicted activity
                    this.suggestPrediction(prediction);
                }
            }
        });
    }
    
    isTimeInRange(time, start, end) {
        // Convert times to minutes for comparison
        const timeMinutes = this.timeToMinutes(time);
        const startMinutes = this.timeToMinutes(start);
        const endMinutes = this.timeToMinutes(end);
        
        // Handle overnight routines
        if (startMinutes > endMinutes) {
            return timeMinutes >= startMinutes || timeMinutes <= endMinutes;
        } else {
            return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
        }
    }
    
    timeToMinutes(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }
    
    suggestRoutine(routine) {
        // Check if notifications are enabled
        const notificationsEnabled = localStorage.getItem('clockReminderNotifications') !== 'false';
        if (!notificationsEnabled) return;
        
        // Check if we've already suggested this routine recently
        const now = new Date();
        const routineKey = `suggested_routine_${routine.id}_${now.toDateString()}`;
        
        if (localStorage.getItem(routineKey)) {
            return;
        }
        
        // Mark as suggested
        localStorage.setItem(routineKey, 'true');
        
        // Show notification
        if (window.notificationSystem) {
            window.notificationSystem.addSystemNotification(
                `Routine: ${routine.name}`,
                `It's time for your scheduled ${routine.activity}.`,
                'reminder',
                'icon-alarm'
            );
        } else {
            // Fallback if notification system not available
            this.showNotification(`Routine: ${routine.name}`, `It's time for your scheduled ${routine.activity}.`);
        }
    }
    
    suggestPrediction(prediction) {
        // Check if notifications are enabled
        const notificationsEnabled = localStorage.getItem('clockReminderNotifications') !== 'false';
        if (!notificationsEnabled) return;
        
        // Check if we've already suggested this prediction recently
        const now = new Date();
        const predictionTime = new Date(prediction.date);
        const predictionKey = `suggested_prediction_${prediction.activity}_${predictionTime.toDateString()}_${predictionTime.getHours()}`;
        
        if (localStorage.getItem(predictionKey)) {
            return;
        }
        
        // Mark as suggested
        localStorage.setItem(predictionKey, 'true');
        
        // Show notification
        if (window.notificationSystem) {
            window.notificationSystem.addSystemNotification(
                `Suggestion: ${prediction.activity}`,
                `Based on your patterns, it's time for ${prediction.activity}.`,
                'reminder',
                'icon-time-management'
            );
        } else {
            // Fallback if notification system not available
            this.showNotification(`Suggestion: ${prediction.activity}`, `Based on your patterns, it's time for ${prediction.activity}.`);
        }
    }
    
    exportData() {
        // Create export data object
        const exportData = {
            activities: this.activityHistory,
            routines: this.routines,
            predictions: this.predictions,
            version: '1.0'
        };
        
        // Convert to JSON
        const jsonData = JSON.stringify(exportData, null, 2);
        
        // Create download link
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `futuristic_clock_data_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        // Show notification
        this.showNotification('Data Exported', 'Your time management data has been exported successfully.');
    }
    
    showClearDataConfirmation() {
        // Create confirmation dialog
        const dialog = document.createElement('div');
        dialog.className = 'activity-dialog';
        
        // Create dialog content
        dialog.innerHTML = `
            <div class="dialog-header">
                <h3>Clear All Data</h3>
                <button class="dialog-close">×</button>
            </div>
            <div class="dialog-content">
                <p>Are you sure you want to clear all your time management data? This action cannot be undone.</p>
                <p>This will delete all activity history, routines, and predictions.</p>
            </div>
            <div class="dialog-actions">
                <button class="btn-cancel" id="cancelClearBtn">Cancel</button>
                <button class="btn-danger" id="confirmClearBtn">Clear All Data</button>
            </div>
        `;
        
        // Add dialog to document
        document.body.appendChild(dialog);
        
        // Show dialog with animation
        setTimeout(() => {
            dialog.classList.add('show');
        }, 10);
        
        // Add event listeners
        document.querySelector('.dialog-close').addEventListener('click', () => {
            this.closeDialog(dialog);
        });
        
        document.getElementById('cancelClearBtn').addEventListener('click', () => {
            this.closeDialog(dialog);
        });
        
        document.getElementById('confirmClearBtn').addEventListener('click', () => {
            this.clearAllData();
            this.closeDialog(dialog);
        });
    }
    
    clearAllData() {
        // Clear all data
        this.activities = [];
        this.routines = [];
        this.predictions = [];
        this.activityHistory = [];
        this.currentActivity = null;
        
        // Clear localStorage
        localStorage.removeItem('clockActivityHistory');
        localStorage.removeItem('clockRoutines');
        
        // Update UI
        this.updateActivityList();
        this.updateRoutinesList();
        this.updatePredictionsList();
        this.updateCurrentActivityDisplay();
        this.updateScheduleTimeline();
        
        // Show notification
        this.showNotification('Data Cleared', 'All time management data has been cleared.');
    }
    
    showNotification(title, message) {
        // Use notification system if available
        if (window.notificationSystem) {
            window.notificationSystem.addSystemNotification(title, message, 'system', 'icon-time-management');
        } else {
            // Fallback to alert
            alert(`${title}: ${message}`);
        }
    }
    
    saveActivityHistory() {
        localStorage.setItem('clockActivityHistory', JSON.stringify(this.activityHistory));
    }
    
    saveRoutines() {
        localStorage.setItem('clockRoutines', JSON.stringify(this.routines));
    }
    
    loadSavedData() {
        // Load activity history
        const savedActivityHistory = localStorage.getItem('clockActivityHistory');
        if (savedActivityHistory) {
            try {
                this.activityHistory = JSON.parse(savedActivityHistory);
                
                // Convert date strings to Date objects
                this.activityHistory.forEach(activity => {
                    activity.startTime = new Date(activity.startTime);
                    activity.endTime = new Date(activity.endTime);
                });
            } catch (error) {
                console.error('Error loading activity history:', error);
            }
        }
        
        // Load routines
        const savedRoutines = localStorage.getItem('clockRoutines');
        if (savedRoutines) {
            try {
                this.routines = JSON.parse(savedRoutines);
            } catch (error) {
                console.error('Error loading routines:', error);
            }
        }
        
        // Load tracking preference
        const savedTracking = localStorage.getItem('clockActivityTracking');
        if (savedTracking !== null) {
            this.isTrackingEnabled = savedTracking === 'true';
            
            // Update toggle
            const trackingToggle = document.getElementById('activityTrackingToggle');
            if (trackingToggle) {
                trackingToggle.checked = this.isTrackingEnabled;
            }
            
            // Start tracking if enabled
            if (this.isTrackingEnabled) {
                this.startActivityTracking();
            }
        }
        
        // Load prediction sensitivity
        const savedSensitivity = localStorage.getItem('clockPredictionSensitivity');
        if (savedSensitivity !== null) {
            const sensitivity = parseInt(savedSensitivity);
            
            // Update slider
            const sensitivitySlider = document.getElementById('predictionSensitivity');
            const sensitivityValue = document.getElementById('sensitivityValue');
            
            if (sensitivitySlider && sensitivityValue) {
                sensitivitySlider.value = sensitivity;
                sensitivityValue.textContent = sensitivity;
            }
            
            // Update prediction confidence threshold
            this.predictionConfidenceThreshold = 1.1 - (sensitivity / 10);
        }
        
        // Generate predictions
        this.generatePredictions();
    }
}

// Initialize predictive time management when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Add predictive time management CSS
    const predictiveTimeCSS = `
        /* Time management styles */
        .time-management-tabs {
            display: flex;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            margin-bottom: 15px;
        }
        
        .tab-btn {
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.7);
            padding: 10px 15px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.2s ease;
            border-bottom: 2px solid transparent;
        }
        
        .tab-btn:hover {
            color: white;
        }
        
        .tab-btn.active {
            color: white;
            border-bottom-color: var(--hologram-color, rgba(0, 120, 255, 0.8));
        }
        
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block;
        }
        
        /* Activities tab */
        .current-activity {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 20px;
        }
        
        .activity-display {
            margin: 10px 0;
            min-height: 50px;
        }
        
        .no-activity {
            color: rgba(255, 255, 255, 0.5);
            font-style: italic;
        }
        
        .activity-name {
            font-size: 1.2rem;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .activity-start-time {
            font-size: 0.9rem;
            color: rgba(255, 255, 255, 0.7);
        }
        
        .activity-timer {
            font-size: 1.5rem;
            font-weight: bold;
            margin: 10px 0;
            font-family: monospace;
        }
        
        .activity-actions {
            display: flex;
            gap: 10px;
        }
        
        .activity-list-container {
            margin-top: 20px;
        }
        
        .activity-list {
            max-height: 300px;
            overflow-y: auto;
        }
        
        .activity-item {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            padding: 12px;
            margin-bottom: 10px;
        }
        
        .activity-item-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
        }
        
        .activity-item-name {
            font-weight: bold;
        }
        
        .activity-item-duration {
            font-family: monospace;
        }
        
        .activity-item-time {
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.6);
        }
        
        /* Routines tab */
        .routines-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .routines-list {
            max-height: 350px;
            overflow-y: auto;
        }
        
        .routine-item {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            padding: 12px;
            margin-bottom: 10px;
        }
        
        .routine-item-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
        }
        
        .routine-item-name {
            font-weight: bold;
        }
        
        .routine-item-actions {
            display: flex;
            gap: 5px;
        }
        
        .routine-edit-btn, .routine-delete-btn {
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.6);
            cursor: pointer;
            font-size: 0.8rem;
            transition: color 0.2s ease;
        }
        
        .routine-edit-btn:hover {
            color: var(--hologram-color, rgba(0, 120, 255, 0.8));
        }
        
        .routine-delete-btn:hover {
            color: rgba(255, 50, 50, 0.8);
        }
        
        .routine-item-details {
            font-size: 0.9rem;
        }
        
        .routine-item-time {
            margin-bottom: 3px;
        }
        
        .routine-item-days {
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 3px;
        }
        
        .routine-item-activity {
            font-style: italic;
        }
        
        .routine-form {
            display: none;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            padding: 15px;
        }
        
        .day-selector {
            display: flex;
            gap: 5px;
        }
        
        .day-checkbox {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .day-checkbox:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        .day-checkbox input {
            display: none;
        }
        
        .day-checkbox input:checked + .day-checkbox {
            background: var(--hologram-color, rgba(0, 120, 255, 0.8));
        }
        
        .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 15px;
        }
        
        /* Predictions tab */
        .predictions-header {
            margin-bottom: 15px;
        }
        
        .prediction-info {
            font-size: 0.9rem;
            color: rgba(255, 255, 255, 0.7);
            margin-top: 5px;
        }
        
        .predictions-list {
            margin-bottom: 20px;
        }
        
        .prediction-item {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            padding: 12px;
            margin-bottom: 10px;
        }
        
        .prediction-item-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        
        .prediction-item-activity {
            font-weight: bold;
        }
        
        .prediction-item-confidence {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .confidence-bar {
            width: 100px;
            height: 8px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            overflow: hidden;
        }
        
        .confidence-level {
            height: 100%;
            background: var(--hologram-color, rgba(0, 120, 255, 0.8));
            border-radius: 4px;
        }
        
        .confidence-text {
            font-size: 0.8rem;
            min-width: 30px;
            text-align: right;
        }
        
        .prediction-item-details {
            font-size: 0.9rem;
            margin-bottom: 10px;
        }
        
        .prediction-item-actions {
            display: flex;
            gap: 10px;
        }
        
        .daily-schedule {
            margin-top: 20px;
        }
        
        .schedule-timeline {
            margin-top: 10px;
            position: relative;
            height: 100px;
        }
        
        .timeline {
            position: relative;
            height: 100%;
        }
        
        .timeline-line {
            position: absolute;
            top: 50%;
            left: 0;
            width: 100%;
            height: 2px;
            background: rgba(255, 255, 255, 0.2);
        }
        
        .timeline-now {
            position: absolute;
            top: 0;
            width: 2px;
            height: 100%;
            background: rgba(255, 50, 50, 0.8);
        }
        
        .timeline-item {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
        }
        
        .timeline-point {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: var(--hologram-color, rgba(0, 120, 255, 0.8));
            position: absolute;
            top: 50%;
            left: 0;
            transform: translate(-50%, -50%);
        }
        
        .timeline-content {
            position: absolute;
            top: -40px;
            left: 0;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.7);
            border-radius: 5px;
            padding: 5px 8px;
            min-width: 100px;
            text-align: center;
            font-size: 0.8rem;
        }
        
        .timeline-time {
            font-weight: bold;
            margin-bottom: 2px;
        }
        
        .timeline-activity {
            margin-bottom: 2px;
        }
        
        .timeline-duration {
            font-size: 0.7rem;
            color: rgba(255, 255, 255, 0.7);
        }
        
        /* Settings tab */
        .setting-description {
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.6);
            margin-top: 5px;
        }
        
        /* Dialog */
        .activity-dialog {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.9);
            background: rgba(10, 20, 50, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 10px;
            padding: 20px;
            width: 90%;
            max-width: 400px;
            z-index: 2000;
            opacity: 0;
            transition: all 0.3s ease;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }
        
        .activity-dialog.show {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
        
        .dialog-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .dialog-header h3 {
            margin: 0;
        }
        
        .dialog-close {
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.7);
            font-size: 1.5rem;
            cursor: pointer;
            transition: color 0.2s ease;
        }
        
        .dialog-close:hover {
            color: white;
        }
        
        .dialog-content {
            margin-bottom: 20px;
        }
        
        .dialog-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }
        
        /* Buttons */
        .btn-set {
            background: var(--hologram-color, rgba(0, 120, 255, 0.8));
            color: white;
            border: none;
            border-radius: 5px;
            padding: 8px 15px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .btn-set:hover {
            background: rgba(0, 150, 255, 0.9);
            transform: translateY(-2px);
        }
        
        .btn-set:disabled {
            background: rgba(100, 100, 100, 0.5);
            cursor: not-allowed;
            transform: none;
        }
        
        .btn-cancel {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: none;
            border-radius: 5px;
            padding: 8px 15px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .btn-cancel:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        .btn-danger {
            background: rgba(255, 50, 50, 0.8);
            color: white;
            border: none;
            border-radius: 5px;
            padding: 8px 15px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .btn-danger:hover {
            background: rgba(255, 70, 70, 0.9);
        }
        
        /* Form elements */
        .form-group {
            margin-bottom: 15px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
        }
        
        .form-group input[type="text"],
        .form-group input[type="time"] {
            width: 100%;
            padding: 8px 10px;
            border-radius: 5px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            background: rgba(255, 255, 255, 0.1);
            color: white;
        }
        
        .form-group input[type="text"]:focus,
        .form-group input[type="time"]:focus {
            outline: none;
            border-color: var(--hologram-color, rgba(0, 120, 255, 0.8));
        }
        
        /* Empty list */
        .empty-list {
            text-align: center;
            padding: 20px;
            color: rgba(255, 255, 255, 0.5);
            font-style: italic;
        }
    `;
    
    // Add CSS to document
    const styleElement = document.createElement('style');
    styleElement.textContent = predictiveTimeCSS;
    document.head.appendChild(styleElement);
    
    // Initialize predictive time management
    window.predictiveTimeManagement = new PredictiveTimeManagement();
});
