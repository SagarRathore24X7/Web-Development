/**
 * Smart Notification System for Futuristic Clock
 * Integrates with browser notifications and provides prioritized alerts
 */

class SmartNotificationSystem {
    constructor() {
        this.notificationPermission = 'default';
        this.notifications = [];
        this.maxNotifications = 10;
        this.notificationSounds = {
            'default': 'https://assets.mixkit.co/active_storage/sfx/1531/1531-preview.mp3',
            'alarm': 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
            'reminder': 'https://assets.mixkit.co/active_storage/sfx/1529/1529-preview.mp3',
            'alert': 'https://assets.mixkit.co/active_storage/sfx/2867/2867-preview.mp3',
            'message': 'https://assets.mixkit.co/active_storage/sfx/1518/1518-preview.mp3'
        };
        this.notificationCategories = [
            'alarm', 'reminder', 'weather', 'system', 'message'
        ];
        this.notificationPriorities = {
            'alarm': 5,
            'reminder': 4,
            'weather': 3,
            'system': 2,
            'message': 1
        };
        this.isNotificationCenterOpen = false;
        
        // Create notification button
        this.createNotificationButton();
        
        // Create notification center
        this.createNotificationCenter();
        
        // Request notification permission
        this.requestNotificationPermission();
        
        // Initialize notification listeners
        this.initNotificationListeners();
    }
    
    createNotificationButton() {
        const controlsContainer = document.querySelector('.controls');
        const notificationBtn = document.createElement('button');
        notificationBtn.className = 'control-btn';
        notificationBtn.id = 'notificationBtn';
        notificationBtn.innerHTML = '<span class="icon-notification"></span> Notifications';
        
        // Add button to controls after gesture button
        const gestureBtn = document.getElementById('gestureBtn');
        if (gestureBtn) {
            controlsContainer.insertBefore(notificationBtn, gestureBtn.nextSibling);
        } else {
            controlsContainer.appendChild(notificationBtn);
        }
        
        // Toggle notification center on button click
        notificationBtn.addEventListener('click', () => {
            this.toggleNotificationCenter();
        });
    }
    
    createNotificationCenter() {
        // Create notification center element
        const notificationCenter = document.createElement('div');
        notificationCenter.className = 'notification-center';
        notificationCenter.id = 'notificationCenter';
        
        // Create notification center content
        notificationCenter.innerHTML = `
            <div class="notification-header">
                <h2>Notifications</h2>
                <div class="notification-actions">
                    <button id="clearNotifications" class="notification-action-btn">Clear All</button>
                    <button id="closeNotificationCenter" class="notification-action-btn">Close</button>
                </div>
            </div>
            <div class="notification-filters">
                <button class="filter-btn active" data-filter="all">All</button>
                <button class="filter-btn" data-filter="alarm">Alarms</button>
                <button class="filter-btn" data-filter="reminder">Reminders</button>
                <button class="filter-btn" data-filter="weather">Weather</button>
                <button class="filter-btn" data-filter="system">System</button>
                <button class="filter-btn" data-filter="message">Messages</button>
            </div>
            <div class="notification-list" id="notificationList">
                <div class="empty-notifications">No notifications</div>
            </div>
            <div class="notification-settings">
                <div class="form-group">
                    <label>Browser Notifications</label>
                    <div class="permission-status" id="permissionStatus">Permission: Unknown</div>
                    <button id="requestPermission" class="btn-set">Request Permission</button>
                </div>
                <div class="form-group">
                    <label>Notification Sound</label>
                    <label class="switch">
                        <input type="checkbox" id="notificationSound" checked>
                        <span class="slider round"></span>
                    </label>
                </div>
                <div class="form-group">
                    <label>Smart Prioritization</label>
                    <label class="switch">
                        <input type="checkbox" id="smartPrioritization" checked>
                        <span class="slider round"></span>
                    </label>
                </div>
            </div>
        `;
        
        // Add notification center to document
        document.body.appendChild(notificationCenter);
        
        // Add event listeners
        this.addNotificationEventListeners();
    }
    
    addNotificationEventListeners() {
        // Close notification center
        document.getElementById('closeNotificationCenter').addEventListener('click', () => {
            this.closeNotificationCenter();
        });
        
        // Clear all notifications
        document.getElementById('clearNotifications').addEventListener('click', () => {
            this.clearAllNotifications();
        });
        
        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Apply filter
                const filter = button.dataset.filter;
                this.filterNotifications(filter);
            });
        });
        
        // Request permission button
        document.getElementById('requestPermission').addEventListener('click', () => {
            this.requestNotificationPermission();
        });
        
        // Notification sound toggle
        document.getElementById('notificationSound').addEventListener('change', (e) => {
            localStorage.setItem('clockNotificationSound', e.target.checked);
        });
        
        // Smart prioritization toggle
        document.getElementById('smartPrioritization').addEventListener('change', (e) => {
            localStorage.setItem('clockSmartPrioritization', e.target.checked);
        });
    }
    
    toggleNotificationCenter() {
        const notificationCenter = document.getElementById('notificationCenter');
        
        if (this.isNotificationCenterOpen) {
            this.closeNotificationCenter();
        } else {
            this.openNotificationCenter();
        }
    }
    
    openNotificationCenter() {
        const notificationCenter = document.getElementById('notificationCenter');
        notificationCenter.classList.add('open');
        this.isNotificationCenterOpen = true;
        
        // Update notification button
        const notificationBtn = document.getElementById('notificationBtn');
        if (notificationBtn) {
            notificationBtn.classList.add('active');
        }
        
        // Update permission status
        this.updatePermissionStatus();
    }
    
    closeNotificationCenter() {
        const notificationCenter = document.getElementById('notificationCenter');
        notificationCenter.classList.remove('open');
        this.isNotificationCenterOpen = false;
        
        // Update notification button
        const notificationBtn = document.getElementById('notificationBtn');
        if (notificationBtn) {
            notificationBtn.classList.remove('active');
        }
    }
    
    updatePermissionStatus() {
        const permissionStatus = document.getElementById('permissionStatus');
        const requestPermissionBtn = document.getElementById('requestPermission');
        
        if (permissionStatus && requestPermissionBtn) {
            permissionStatus.textContent = `Permission: ${this.notificationPermission}`;
            
            if (this.notificationPermission === 'granted') {
                permissionStatus.className = 'permission-status granted';
                requestPermissionBtn.style.display = 'none';
            } else if (this.notificationPermission === 'denied') {
                permissionStatus.className = 'permission-status denied';
                requestPermissionBtn.style.display = 'block';
            } else {
                permissionStatus.className = 'permission-status default';
                requestPermissionBtn.style.display = 'block';
            }
        }
    }
    
    requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            this.notificationPermission = 'not-supported';
            this.updatePermissionStatus();
            return;
        }
        
        // Check if permission is already granted
        if (Notification.permission === 'granted') {
            this.notificationPermission = 'granted';
            this.updatePermissionStatus();
            return;
        }
        
        // Request permission
        Notification.requestPermission()
            .then(permission => {
                this.notificationPermission = permission;
                this.updatePermissionStatus();
                
                if (permission === 'granted') {
                    this.showSystemNotification('Notifications enabled', 'You will now receive notifications from the Futuristic Clock.');
                }
            });
    }
    
    initNotificationListeners() {
        // Listen for alarm events
        document.addEventListener('alarmTriggered', (e) => {
            const { alarm } = e.detail;
            this.addNotification({
                title: `Alarm: ${alarm.title}`,
                message: `It's ${alarm.time}`,
                category: 'alarm',
                timestamp: new Date(),
                icon: 'icon-alarm'
            });
        });
        
        // Listen for weather updates
        document.addEventListener('weatherUpdated', (e) => {
            const { weather } = e.detail;
            this.addNotification({
                title: 'Weather Update',
                message: `${weather.condition}, ${weather.temperature}`,
                category: 'weather',
                timestamp: new Date(),
                icon: 'icon-weather-' + this.getWeatherIcon(weather.condition)
            });
        });
        
        // Listen for system events
        document.addEventListener('systemEvent', (e) => {
            const { event } = e.detail;
            this.addNotification({
                title: 'System Notification',
                message: event.message,
                category: 'system',
                timestamp: new Date(),
                icon: event.icon || 'icon-notification'
            });
        });
    }
    
    getWeatherIcon(condition) {
        condition = condition.toLowerCase();
        
        if (condition.includes('sun') || condition.includes('clear')) {
            return 'sunny';
        } else if (condition.includes('cloud')) {
            return 'cloudy';
        } else if (condition.includes('rain')) {
            return 'rainy';
        } else if (condition.includes('snow')) {
            return 'snowy';
        } else if (condition.includes('thunder') || condition.includes('storm')) {
            return 'thunder';
        } else if (condition.includes('fog') || condition.includes('mist')) {
            return 'foggy';
        } else {
            return 'cloudy'; // Default
        }
    }
    
    addNotification(notification) {
        // Add id and read status
        notification.id = Date.now();
        notification.read = false;
        
        // Add to notifications array
        this.notifications.unshift(notification);
        
        // Limit number of notifications
        if (this.notifications.length > this.maxNotifications) {
            this.notifications.pop();
        }
        
        // Update notification list if notification center is open
        if (this.isNotificationCenterOpen) {
            this.renderNotifications();
        }
        
        // Show browser notification if permission granted
        if (this.notificationPermission === 'granted') {
            this.showBrowserNotification(notification);
        }
        
        // Show in-app notification
        this.showInAppNotification(notification);
        
        // Play notification sound if enabled
        this.playNotificationSound(notification.category);
        
        // Save notifications to localStorage
        this.saveNotifications();
        
        // Update notification count badge
        this.updateNotificationBadge();
    }
    
    showBrowserNotification(notification) {
        const options = {
            body: notification.message,
            icon: '/favicon.ico', // Use clock favicon
            tag: notification.id,
            silent: true // We'll handle sound ourselves
        };
        
        const browserNotification = new Notification(notification.title, options);
        
        browserNotification.onclick = () => {
            // Focus window and open notification center
            window.focus();
            this.openNotificationCenter();
            
            // Mark notification as read
            this.markNotificationAsRead(notification.id);
        };
    }
    
    showInAppNotification(notification) {
        // Create notification element
        const notificationElement = document.createElement('div');
        notificationElement.className = 'in-app-notification';
        notificationElement.dataset.id = notification.id;
        
        // Create notification content
        notificationElement.innerHTML = `
            <div class="notification-icon ${notification.icon}"></div>
            <div class="notification-content">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
            </div>
            <button class="notification-close">×</button>
        `;
        
        // Add notification to document
        document.body.appendChild(notificationElement);
        
        // Add event listeners
        notificationElement.querySelector('.notification-close').addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeInAppNotification(notificationElement);
        });
        
        notificationElement.addEventListener('click', () => {
            this.openNotificationCenter();
            this.markNotificationAsRead(notification.id);
            this.removeInAppNotification(notificationElement);
        });
        
        // Show notification with animation
        setTimeout(() => {
            notificationElement.classList.add('show');
        }, 10);
        
        // Auto-hide after delay
        setTimeout(() => {
            this.removeInAppNotification(notificationElement);
        }, 5000);
    }
    
    removeInAppNotification(element) {
        element.classList.remove('show');
        
        // Remove element after animation
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 300);
    }
    
    playNotificationSound(category) {
        // Check if notification sound is enabled
        const soundEnabled = localStorage.getItem('clockNotificationSound') !== 'false';
        if (!soundEnabled) return;
        
        // Get sound URL based on category
        const soundUrl = this.notificationSounds[category] || this.notificationSounds.default;
        
        // Play sound
        const audio = new Audio(soundUrl);
        audio.volume = 0.5;
        audio.play();
    }
    
    renderNotifications() {
        const notificationList = document.getElementById('notificationList');
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        
        // Filter notifications based on active filter
        let filteredNotifications = this.notifications;
        if (activeFilter !== 'all') {
            filteredNotifications = this.notifications.filter(notification => notification.category === activeFilter);
        }
        
        // Check if there are any notifications
        if (filteredNotifications.length === 0) {
            notificationList.innerHTML = '<div class="empty-notifications">No notifications</div>';
            return;
        }
        
        // Sort notifications by priority if smart prioritization is enabled
        const smartPrioritization = localStorage.getItem('clockSmartPrioritization') !== 'false';
        if (smartPrioritization) {
            filteredNotifications.sort((a, b) => {
                const priorityA = this.notificationPriorities[a.category] || 0;
                const priorityB = this.notificationPriorities[b.category] || 0;
                
                // Sort by priority first, then by timestamp (newest first)
                if (priorityA !== priorityB) {
                    return priorityB - priorityA;
                } else {
                    return b.timestamp - a.timestamp;
                }
            });
        }
        
        // Render notifications
        notificationList.innerHTML = filteredNotifications.map(notification => {
            const time = new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const readClass = notification.read ? 'read' : 'unread';
            
            return `
                <div class="notification-item ${readClass}" data-id="${notification.id}" data-category="${notification.category}">
                    <div class="notification-icon ${notification.icon}"></div>
                    <div class="notification-content">
                        <div class="notification-title">${notification.title}</div>
                        <div class="notification-message">${notification.message}</div>
                        <div class="notification-time">${time}</div>
                    </div>
                    <button class="notification-delete" data-id="${notification.id}">×</button>
                </div>
            `;
        }).join('');
        
        // Add event listeners to notification items
        document.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.dataset.id);
                this.markNotificationAsRead(id);
            });
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.notification-delete').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(button.dataset.id);
                this.deleteNotification(id);
            });
        });
    }
    
    filterNotifications(filter) {
        // Re-render notifications with active filter
        this.renderNotifications();
    }
    
    markNotificationAsRead(id) {
        // Find notification by id
        const notification = this.notifications.find(n => n.id === id);
        if (!notification) return;
        
        // Mark as read
        notification.read = true;
        
        // Update notification list
        this.renderNotifications();
        
        // Save notifications to localStorage
        this.saveNotifications();
        
        // Update notification count badge
        this.updateNotificationBadge();
    }
    
    deleteNotification(id) {
        // Remove notification from array
        this.notifications = this.notifications.filter(n => n.id !== id);
        
        // Update notification list
        this.renderNotifications();
        
        // Save notifications to localStorage
        this.saveNotifications();
        
        // Update notification count badge
        this.updateNotificationBadge();
    }
    
    clearAllNotifications() {
        // Clear all notifications
        this.notifications = [];
        
        // Update notification list
        this.renderNotifications();
        
        // Save notifications to localStorage
        this.saveNotifications();
        
        // Update notification count badge
        this.updateNotificationBadge();
    }
    
    saveNotifications() {
        // Save notifications to localStorage
        localStorage.setItem('clockNotifications', JSON.stringify(this.notifications));
    }
    
    loadNotifications() {
        // Load notifications from localStorage
        const savedNotifications = localStorage.getItem('clockNotifications');
        if (savedNotifications) {
            try {
                this.notifications = JSON.parse(savedNotifications);
                
                // Convert timestamp strings to Date objects
                this.notifications.forEach(notification => {
                    notification.timestamp = new Date(notification.timestamp);
                });
                
                // Update notification count badge
                this.updateNotificationBadge();
            } catch (error) {
                console.error('Error loading notifications:', error);
            }
        }
    }
    
    updateNotificationBadge() {
        // Count unread notifications
        const unreadCount = this.notifications.filter(n => !n.read).length;
        
        // Update notification button badge
        const notificationBtn = document.getElementById('notificationBtn');
        if (notificationBtn) {
            const badge = notificationBtn.querySelector('.notification-badge') || document.createElement('span');
            badge.className = 'notification-badge';
            
            if (unreadCount > 0) {
                badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
                badge.style.display = 'block';
                
                if (!badge.parentNode) {
                    notificationBtn.appendChild(badge);
                }
            } else {
                badge.style.display = 'none';
            }
        }
    }
    
    // Public method to add a notification from other components
    addSystemNotification(title, message, category = 'system', icon = 'icon-notification') {
        this.addNotification({
            title,
            message,
            category,
            timestamp: new Date(),
            icon
        });
    }
    
    // Shorthand method for system notifications
    showSystemNotification(title, message) {
        this.addSystemNotification(title, message, 'system', 'icon-notification');
    }
    
    // Method to add a reminder notification
    addReminder(title, time, message) {
        this.addNotification({
            title: `Reminder: ${title}`,
            message: message || `Scheduled for ${time}`,
            category: 'reminder',
            timestamp: new Date(),
            icon: 'icon-alarm'
        });
    }
    
    // Method to schedule a notification for a future time
    scheduleNotification(title, message, scheduledTime, category = 'reminder') {
        const now = new Date();
        const scheduleDate = new Date(scheduledTime);
        
        // Calculate delay in milliseconds
        const delay = scheduleDate.getTime() - now.getTime();
        
        if (delay <= 0) {
            // If scheduled time is in the past, show notification immediately
            this.addNotification({
                title,
                message,
                category,
                timestamp: new Date(),
                icon: category === 'reminder' ? 'icon-alarm' : 'icon-notification'
            });
            return;
        }
        
        // Schedule notification
        setTimeout(() => {
            this.addNotification({
                title,
                message,
                category,
                timestamp: new Date(),
                icon: category === 'reminder' ? 'icon-alarm' : 'icon-notification'
            });
        }, delay);
        
        // Return scheduled time for confirmation
        return scheduleDate;
    }
}

// Initialize smart notification system when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Add notification system CSS
    const notificationSystemCSS = `
        /* Notification center styles */
        .notification-center {
            position: fixed;
            top: 0;
            right: -350px;
            width: 350px;
            height: 100vh;
            background: rgba(10, 20, 50, 0.9);
            backdrop-filter: blur(10px);
            z-index: 1000;
            transition: right 0.3s ease;
            display: flex;
            flex-direction: column;
            box-shadow: -5px 0 15px rgba(0, 0, 0, 0.5);
        }
        
        .notification-center.open {
            right: 0;
        }
        
        .notification-header {
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .notification-header h2 {
            margin: 0;
            font-size: 1.2rem;
        }
        
        .notification-actions {
            display: flex;
            gap: 10px;
        }
        
        .notification-action-btn {
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.7);
            cursor: pointer;
            font-size: 0.9rem;
            transition: color 0.2s ease;
        }
        
        .notification-action-btn:hover {
            color: white;
        }
        
        .notification-filters {
            padding: 10px;
            display: flex;
            gap: 5px;
            overflow-x: auto;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .filter-btn {
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: white;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.2s ease;
            white-space: nowrap;
        }
        
        .filter-btn:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        .filter-btn.active {
            background: var(--hologram-color, rgba(0, 120, 255, 0.5));
        }
        
        .notification-list {
            flex: 1;
            overflow-y: auto;
            padding: 10px;
        }
        
        .notification-item {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 10px;
            display: flex;
            gap: 10px;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
        }
        
        .notification-item:hover {
            background: rgba(255, 255, 255, 0.1);
        }
        
        .notification-item.unread {
            border-left: 3px solid var(--hologram-color, rgba(0, 120, 255, 0.8));
        }
        
        .notification-item.read {
            opacity: 0.7;
        }
        
        .notification-icon {
            width: 24px;
            height: 24px;
            flex-shrink: 0;
        }
        
        .notification-content {
            flex: 1;
        }
        
        .notification-title {
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .notification-message {
            font-size: 0.9rem;
            margin-bottom: 5px;
        }
        
        .notification-time {
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.5);
        }
        
        .notification-delete {
            position: absolute;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.5);
            font-size: 1.2rem;
            cursor: pointer;
            transition: color 0.2s ease;
        }
        
        .notification-delete:hover {
            color: rgba(255, 50, 50, 0.8);
        }
        
        .empty-notifications {
            text-align: center;
            padding: 20px;
            color: rgba(255, 255, 255, 0.5);
            font-style: italic;
        }
        
        .notification-settings {
            padding: 15px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .permission-status {
            margin: 5px 0;
            font-size: 0.9rem;
        }
        
        .permission-status.granted {
            color: rgba(0, 255, 60, 0.8);
        }
        
        .permission-status.denied {
            color: rgba(255, 50, 50, 0.8);
        }
        
        .permission-status.default {
            color: rgba(255, 180, 0, 0.8);
        }
        
        /* In-app notification styles */
        .in-app-notification {
            position: fixed;
            top: 20px;
            right: -350px;
            width: 300px;
            background: rgba(10, 20, 50, 0.9);
            backdrop-filter: blur(10px);
            border-radius: 10px;
            padding: 15px;
            display: flex;
            gap: 10px;
            z-index: 999;
            transition: right 0.3s ease;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            border-left: 3px solid var(--hologram-color, rgba(0, 120, 255, 0.8));
            cursor: pointer;
        }
        
        .in-app-notification.show {
            right: 20px;
        }
        
        .notification-close {
            position: absolute;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.5);
            font-size: 1.2rem;
            cursor: pointer;
            transition: color 0.2s ease;
        }
        
        .notification-close:hover {
            color: rgba(255, 50, 50, 0.8);
        }
        
        /* Notification badge */
        .notification-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            background: rgba(255, 50, 50, 0.9);
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            font-size: 0.7rem;
            display: flex;
            justify-content: center;
            align-items: center;
            font-weight: bold;
        }
        
        /* Category-specific colors */
        .notification-item[data-category="alarm"] {
            border-left-color: rgba(255, 50, 50, 0.8);
        }
        
        .notification-item[data-category="reminder"] {
            border-left-color: rgba(255, 180, 0, 0.8);
        }
        
        .notification-item[data-category="weather"] {
            border-left-color: rgba(0, 180, 255, 0.8);
        }
        
        .notification-item[data-category="system"] {
            border-left-color: rgba(180, 180, 180, 0.8);
        }
        
        .notification-item[data-category="message"] {
            border-left-color: rgba(0, 255, 120, 0.8);
        }
    `;
    
    // Add CSS to document
    const styleElement = document.createElement('style');
    styleElement.textContent = notificationSystemCSS;
    document.head.appendChild(styleElement);
    
    // Initialize notification system
    window.notificationSystem = new SmartNotificationSystem();
    
    // Load saved notifications
    window.notificationSystem.loadNotifications();
    
    // Add global method to show notifications
    window.showNotification = (title, message, category = 'system') => {
        window.notificationSystem.addSystemNotification(title, message, category);
    };
    
    // Add event dispatcher for alarms
    const originalShowNotification = window.showNotification;
    window.showNotification = (message) => {
        // Check if this is an alarm notification
        if (message.startsWith('Alarm:')) {
            // Extract alarm title
            const alarmTitle = message.replace('Alarm:', '').trim();
            
            // Dispatch alarm event
            const alarmEvent = new CustomEvent('alarmTriggered', {
                detail: {
                    alarm: {
                        title: alarmTitle || 'Alarm',
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                }
            });
            document.dispatchEvent(alarmEvent);
        } else {
            // Use original notification for other messages
            originalShowNotification(message);
        }
    };
    
    // Show welcome notification
    setTimeout(() => {
        window.notificationSystem.showSystemNotification(
            'Smart Notifications Enabled',
            'You will now receive prioritized notifications from the Futuristic Clock.'
        );
    }, 2000);
});
