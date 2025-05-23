/**
 * NEXUS - Futuristic Clock
 * Core functionality script
 */

document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements for clock hands
    const hourHand = document.querySelector('.hour-hand');
    const minuteHand = document.querySelector('.minute-hand');
    const secondHand = document.querySelector('.second-hand');
    
    // DOM Elements for digital clock
    const digitalTime = document.querySelector('.digital-clock .time');
    const dateDisplay = document.querySelector('.digital-clock .date');
    const timezoneDisplay = document.querySelector('.digital-clock .timezone');
    
    // Modal elements
    const modals = document.querySelectorAll('.modal');
    const themeBtn = document.getElementById('themeBtn');
    const alarmBtn = document.getElementById('alarmBtn');
    const timerBtn = document.getElementById('timerBtn');
    const soundBtn = document.getElementById('soundBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const notificationBtn = document.getElementById('notificationBtn');
    const weatherBtn = document.getElementById('weatherBtn');
    const voiceBtn = document.getElementById('voiceBtn');
    const hologramBtn = document.getElementById('hologramBtn');
    const gestureBtn = document.getElementById('gestureBtn');
    const aiBtn = document.getElementById('aiBtn');
    const closeButtons = document.querySelectorAll('.close-modal');
    const themeOptions = document.querySelectorAll('.theme-option');
    
    // State variables
    let currentTheme = localStorage.getItem('clockTheme') || 'neon-blue';
    let alarms = JSON.parse(localStorage.getItem('clockAlarms')) || [];
    let soundEnabled = localStorage.getItem('clockSoundEnabled') !== 'false';
    let is24HourFormat = localStorage.getItem('clock24HourFormat') === 'true';
    let showSeconds = localStorage.getItem('clockShowSeconds') !== 'false';
    let showDate = localStorage.getItem('clockShowDate') !== 'false';
    let clockSize = localStorage.getItem('clockSize') || 1;
    let clockOpacity = localStorage.getItem('clockOpacity') || 1;
    let dynamicBackground = localStorage.getItem('dynamicBackground') !== 'false';
    
    // Initialize the clock
    function init() {
        // Set initial theme
        setTheme(currentTheme);
        
        // Set up event listeners
        setupEventListeners();
        
        // Start the clock
        updateClock();
        
        // Initialize settings
        initializeSettings();
        
        // Show welcome notification
        showNotification('Welcome to NEXUS!');
    }
    
    // Clock function
    function updateClock() {
        const now = new Date();
        
        // Calculate rotation angles for hands
        const seconds = now.getSeconds();
        const minutes = now.getMinutes();
        const hours = now.getHours() % 12;
        
        const secondsDegrees = ((seconds / 60) * 360) + 90;
        const minutesDegrees = ((minutes / 60) * 360) + ((seconds / 60) * 6) + 90;
        const hoursDegrees = ((hours / 12) * 360) + ((minutes / 60) * 30) + 90;
        
        // Apply rotation to hands with smooth transition
        secondHand.style.transform = `rotate(${secondsDegrees}deg)`;
        minuteHand.style.transform = `rotate(${minutesDegrees}deg)`;
        hourHand.style.transform = `rotate(${hoursDegrees}deg)`;
        
        // Update digital time
        let timeString;
        if (is24HourFormat) {
            timeString = `${now.getHours().toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        } else {
            const displayHours = hours === 0 ? 12 : hours;
            const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
            timeString = `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
        }
        
        // Add seconds if enabled
        if (showSeconds) {
            if (is24HourFormat) {
                timeString += `:${seconds.toString().padStart(2, '0')}`;
            } else {
                timeString = timeString.replace(' ', `:${seconds.toString().padStart(2, '0')} `);
            }
        }
        
        digitalTime.textContent = timeString;
        
        // Update date if enabled
        if (showDate) {
            const options = { weekday: 'long', month: 'long', day: 'numeric' };
            dateDisplay.textContent = now.toLocaleDateString('en-US', options);
            dateDisplay.style.display = 'block';
        } else {
            dateDisplay.style.display = 'none';
        }
        
        // Update timezone
        const timeZoneString = Intl.DateTimeFormat().resolvedOptions().timeZone;
        timezoneDisplay.textContent = timeZoneString;
        
        // Check alarms
        checkAlarms(now);
        
        // Update dynamic background if enabled
        if (dynamicBackground) {
            updateDynamicBackground(now);
        }
        
        // Request next animation frame
        requestAnimationFrame(updateClock);
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Theme button
        themeBtn.addEventListener('click', () => openModal('themeModal'));
        
        // Alarm button
        alarmBtn.addEventListener('click', () => openModal('alarmModal'));
        
        // Timer button
        timerBtn.addEventListener('click', () => openModal('timerModal'));
        
        // Sound button
        soundBtn.addEventListener('click', toggleSound);
        
        // Settings button
        settingsBtn.addEventListener('click', () => openModal('settingsModal'));
        
        // Notification button
        notificationBtn.addEventListener('click', () => openModal('notificationModal'));
        
        // Weather button
        weatherBtn.addEventListener('click', () => openModal('weatherModal'));
        
        // Voice button
        voiceBtn.addEventListener('click', () => openModal('voiceModal'));
        
        // Hologram button
        hologramBtn.addEventListener('click', () => openModal('hologramModal'));
        
        // Gesture button
        gestureBtn.addEventListener('click', () => openModal('gestureModal'));
        
        // AI button
        aiBtn.addEventListener('click', () => openModal('aiModal'));
        
        // Close modal buttons
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modalId = button.getAttribute('data-modal');
                closeModal(modalId);
            });
        });
        
        // Theme options
        themeOptions.forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.getAttribute('data-theme');
                setTheme(theme);
                closeModal('themeModal');
            });
        });
        
        // Settings event listeners
        document.getElementById('showSeconds').addEventListener('change', (e) => {
            showSeconds = e.target.checked;
            localStorage.setItem('clockShowSeconds', showSeconds);
        });
        
        document.getElementById('showDate').addEventListener('change', (e) => {
            showDate = e.target.checked;
            localStorage.setItem('clockShowDate', showDate);
        });
        
        document.getElementById('hourFormat').addEventListener('change', (e) => {
            is24HourFormat = e.target.checked;
            localStorage.setItem('clock24HourFormat', is24HourFormat);
        });
        
        document.getElementById('clockSize').addEventListener('input', (e) => {
            clockSize = e.target.value;
            document.querySelector('.clock').style.transform = `scale(${clockSize})`;
            localStorage.setItem('clockSize', clockSize);
        });
        
        document.getElementById('clockOpacity').addEventListener('input', (e) => {
            clockOpacity = e.target.value;
            document.querySelector('.clock').style.opacity = clockOpacity;
            localStorage.setItem('clockOpacity', clockOpacity);
        });
        
        document.getElementById('dynamicBackground').addEventListener('change', (e) => {
            dynamicBackground = e.target.checked;
            localStorage.setItem('dynamicBackground', dynamicBackground);
        });
        
        // Alarm form
        document.getElementById('setAlarmBtn').addEventListener('click', () => {
            const alarmTime = document.getElementById('alarmTime').value;
            if (alarmTime) {
                addAlarm(alarmTime);
            }
        });
        
        // Timer controls
        document.getElementById('startTimerBtn').addEventListener('click', startTimer);
        document.getElementById('pauseTimerBtn').addEventListener('click', pauseTimer);
        document.getElementById('resetTimerBtn').addEventListener('click', resetTimer);
        
        // Timer presets
        document.querySelectorAll('.timer-preset').forEach(preset => {
            preset.addEventListener('click', () => {
                const seconds = parseInt(preset.getAttribute('data-time'));
                setTimerFromSeconds(seconds);
            });
        });
        
        // Pomodoro timer
        document.getElementById('startPomodoroBtn').addEventListener('click', startPomodoro);
        
        // Hologram toggle
        document.getElementById('enableHologram').addEventListener('change', (e) => {
            if (e.target.checked) {
                enableHolographicMode();
            } else {
                disableHolographicMode();
            }
        });
        
        // Voice control toggle
        document.getElementById('startVoiceBtn').addEventListener('click', toggleVoiceControl);
        
        // AI Assistant
        document.getElementById('aiSendBtn').addEventListener('click', sendAIMessage);
        document.getElementById('aiInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendAIMessage();
            }
        });
        
        // AI suggestion chips
        document.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const query = chip.getAttribute('data-query');
                document.getElementById('aiInput').value = query;
                sendAIMessage();
            });
        });
    }
    
    // Initialize settings
    function initializeSettings() {
        // Set initial values from localStorage
        document.getElementById('showSeconds').checked = showSeconds;
        document.getElementById('showDate').checked = showDate;
        document.getElementById('hourFormat').checked = is24HourFormat;
        document.getElementById('clockSize').value = clockSize;
        document.getElementById('clockOpacity').value = clockOpacity;
        document.getElementById('dynamicBackground').checked = dynamicBackground;
        
        // Apply initial settings
        document.querySelector('.clock').style.transform = `scale(${clockSize})`;
        document.querySelector('.clock').style.opacity = clockOpacity;
        
        // Populate timezone select
        populateTimezones();
    }
    
    // Populate timezone select
    function populateTimezones() {
        const timezoneSelect = document.getElementById('timezoneSelect');
        const timezones = [
            'UTC',
            'America/New_York',
            'America/Chicago',
            'America/Denver',
            'America/Los_Angeles',
            'Europe/London',
            'Europe/Paris',
            'Europe/Berlin',
            'Asia/Tokyo',
            'Asia/Shanghai',
            'Australia/Sydney',
            'Pacific/Auckland'
        ];
        
        const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        timezones.forEach(timezone => {
            const option = document.createElement('option');
            option.value = timezone;
            option.textContent = timezone;
            if (timezone === currentTimezone) {
                option.selected = true;
            }
            timezoneSelect.appendChild(option);
        });
    }
    
    // Modal functions
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }
    
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    // Theme functions
    function setTheme(theme) {
        document.body.className = theme;
        currentTheme = theme;
        localStorage.setItem('clockTheme', theme);
        
        // Update active theme in modal
        themeOptions.forEach(option => {
            const optionTheme = option.getAttribute('data-theme');
            if (optionTheme === theme) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
        
        // Update theme button icon color
        updateThemeColors();
    }
    
    // Update theme colors
    function updateThemeColors() {
        // This function would update any theme-specific colors or styles
        // based on the current theme
        const root = document.documentElement;
        
        switch (currentTheme) {
            case 'neon-blue':
                root.style.setProperty('--primary-color', 'rgba(0, 120, 255, 0.8)');
                root.style.setProperty('--accent-color', 'rgba(255, 44, 44, 0.8)');
                root.style.setProperty('--hologram-color', 'rgba(0, 120, 255, 0.8)');
                break;
            case 'sunrise-gold':
                root.style.setProperty('--primary-color', 'rgba(255, 180, 0, 0.8)');
                root.style.setProperty('--accent-color', 'rgba(255, 106, 0, 0.8)');
                root.style.setProperty('--hologram-color', 'rgba(255, 180, 0, 0.8)');
                break;
            case 'matrix-green':
                root.style.setProperty('--primary-color', 'rgba(0, 255, 60, 0.8)');
                root.style.setProperty('--accent-color', 'rgba(0, 255, 157, 0.8)');
                root.style.setProperty('--hologram-color', 'rgba(0, 255, 60, 0.8)');
                break;
            case 'monochrome':
                root.style.setProperty('--primary-color', 'rgba(200, 200, 200, 0.8)');
                root.style.setProperty('--accent-color', 'rgba(255, 255, 255, 0.8)');
                root.style.setProperty('--hologram-color', 'rgba(200, 200, 200, 0.8)');
                break;
        }
    }
    
    // Sound functions
    function toggleSound() {
        soundEnabled = !soundEnabled;
        localStorage.setItem('clockSoundEnabled', soundEnabled);
        
        // Update sound button icon
        if (soundEnabled) {
            soundBtn.innerHTML = '<span class="icon-sound-on"></span>';
        } else {
            soundBtn.innerHTML = '<span class="icon-sound-off"></span>';
        }
        
        showNotification(soundEnabled ? 'Sound enabled' : 'Sound disabled');
    }
    
    // Notification functions
    function showNotification(message) {
        const notificationSystem = document.createElement('div');
        notificationSystem.className = 'notification';
        notificationSystem.textContent = message;
        
        // Create notification container if it doesn't exist
        let notificationContainer = document.querySelector('.notification-system');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.className = 'notification-system';
            document.body.appendChild(notificationContainer);
        }
        
        notificationContainer.appendChild(notificationSystem);
        
        // Play notification sound if enabled
        if (soundEnabled) {
            playSound('notification');
        }
        
        // Remove notification after delay
        setTimeout(() => {
            notificationSystem.style.opacity = '0';
            setTimeout(() => {
                if (notificationSystem.parentNode) {
                    notificationSystem.parentNode.removeChild(notificationSystem);
                }
            }, 300);
        }, 5000);
    }
    
    // Play sound
    function playSound(type) {
        if (!soundEnabled) return;
        
        // In a real implementation, this would play actual sound files
        // For this demo, we'll just log the sound type
        console.log(`Playing sound: ${type}`);
        
        // Simulate sound with Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch (type) {
            case 'notification':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(1320, audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.3);
                break;
            case 'alarm':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.25);
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime + 0.5);
                oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.75);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 1);
                break;
            case 'timer':
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(1320, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.2);
                oscillator.frequency.setValueAtTime(1320, audioContext.currentTime + 0.4);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.6);
                break;
        }
    }
    
    // Alarm functions
    function addAlarm(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        
        const alarm = {
            id: Date.now(),
            hours,
            minutes,
            enabled: true
        };
        
        alarms.push(alarm);
        localStorage.setItem('clockAlarms', JSON.stringify(alarms));
        
        updateAlarmsList();
        showNotification(`Alarm set for ${formatTime(hours, minutes)}`);
    }
    
    function updateAlarmsList() {
        const alarmsList = document.getElementById('alarmsList');
        alarmsList.innerHTML = '';
        
        if (alarms.length === 0) {
            alarmsList.innerHTML = '<div class="no-alarms">No active alarms</div>';
            return;
        }
        
        alarms.forEach(alarm => {
            const alarmItem = document.createElement('div');
            alarmItem.className = 'alarm-item';
            
            const alarmTime = document.createElement('div');
            alarmTime.className = 'alarm-time';
            alarmTime.textContent = formatTime(alarm.hours, alarm.minutes);
            
            const alarmControls = document.createElement('div');
            alarmControls.className = 'alarm-controls';
            
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'alarm-toggle';
            toggleBtn.innerHTML = alarm.enabled ? 
                '<span class="icon-alarm"></span>' : 
                '<span class="icon-alarm-off"></span>';
            toggleBtn.addEventListener('click', () => toggleAlarm(alarm.id));
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'alarm-delete';
            deleteBtn.innerHTML = '×';
            deleteBtn.addEventListener('click', () => deleteAlarm(alarm.id));
            
            alarmControls.appendChild(toggleBtn);
            alarmControls.appendChild(deleteBtn);
            
            alarmItem.appendChild(alarmTime);
            alarmItem.appendChild(alarmControls);
            
            alarmsList.appendChild(alarmItem);
        });
    }
    
    function toggleAlarm(id) {
        alarms = alarms.map(alarm => {
            if (alarm.id === id) {
                return { ...alarm, enabled: !alarm.enabled };
            }
            return alarm;
        });
        
        localStorage.setItem('clockAlarms', JSON.stringify(alarms));
        updateAlarmsList();
    }
    
    function deleteAlarm(id) {
        alarms = alarms.filter(alarm => alarm.id !== id);
        localStorage.setItem('clockAlarms', JSON.stringify(alarms));
        updateAlarmsList();
    }
    
    function checkAlarms(now) {
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentSeconds = now.getSeconds();
        
        // Only check when seconds is 0 to avoid multiple triggers
        if (currentSeconds !== 0) return;
        
        alarms.forEach(alarm => {
            if (alarm.enabled && alarm.hours === currentHours && alarm.minutes === currentMinutes) {
                triggerAlarm(alarm);
            }
        });
    }
    
    function triggerAlarm(alarm) {
        showNotification(`Alarm: ${formatTime(alarm.hours, alarm.minutes)}`);
        playSound('alarm');
        
        // In a real implementation, this would show a more prominent alarm UI
        // and continue playing sound until dismissed
    }
    
    function formatTime(hours, minutes) {
        if (is24HourFormat) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        } else {
            const h = hours % 12 || 12;
            const ampm = hours >= 12 ? 'PM' : 'AM';
            return `${h.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
        }
    }
    
    // Timer variables
    let timerInterval = null;
    let timerRunning = false;
    let timerPaused = false;
    let timerSeconds = 0;
    
    // Timer functions
    function startTimer() {
        if (timerRunning && !timerPaused) return;
        
        if (!timerRunning) {
            // Get timer values
            const hours = parseInt(document.getElementById('timerHours').value) || 0;
            const minutes = parseInt(document.getElementById('timerMinutes').value) || 0;
            const seconds = parseInt(document.getElementById('timerSeconds').value) || 0;
            
            timerSeconds = hours * 3600 + minutes * 60 + seconds;
            
            if (timerSeconds <= 0) return;
        }
        
        timerRunning = true;
        timerPaused = false;
        
        document.getElementById('startTimerBtn').disabled = true;
        document.getElementById('pauseTimerBtn').disabled = false;
        document.getElementById('resetTimerBtn').disabled = false;
        
        timerInterval = setInterval(() => {
            timerSeconds--;
            updateTimerDisplay();
            
            if (timerSeconds <= 0) {
                clearInterval(timerInterval);
                timerRunning = false;
                timerPaused = false;
                
                document.getElementById('startTimerBtn').disabled = false;
                document.getElementById('pauseTimerBtn').disabled = true;
                
                playSound('timer');
                showNotification('Timer complete!');
            }
        }, 1000);
    }
    
    function pauseTimer() {
        if (!timerRunning || timerPaused) return;
        
        clearInterval(timerInterval);
        timerPaused = true;
        
        document.getElementById('startTimerBtn').disabled = false;
        document.getElementById('pauseTimerBtn').disabled = true;
    }
    
    function resetTimer() {
        clearInterval(timerInterval);
        timerRunning = false;
        timerPaused = false;
        timerSeconds = 0;
        
        document.getElementById('timerHours').value = 0;
        document.getElementById('timerMinutes').value = 0;
        document.getElementById('timerSeconds').value = 0;
        
        document.getElementById('startTimerBtn').disabled = false;
        document.getElementById('pauseTimerBtn').disabled = true;
        document.getElementById('resetTimerBtn').disabled = true;
    }
    
    function updateTimerDisplay() {
        const hours = Math.floor(timerSeconds / 3600);
        const minutes = Math.floor((timerSeconds % 3600) / 60);
        const seconds = timerSeconds % 60;
        
        document.getElementById('timerHours').value = hours;
        document.getElementById('timerMinutes').value = minutes;
        document.getElementById('timerSeconds').value = seconds;
    }
    
    function setTimerFromSeconds(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        
        document.getElementById('timerHours').value = hours;
        document.getElementById('timerMinutes').value = minutes;
        document.getElementById('timerSeconds').value = remainingSeconds;
        
        document.getElementById('resetTimerBtn').disabled = false;
    }
    
    // Pomodoro variables
    let pomodoroInterval = null;
    let pomodoroRunning = false;
    let pomodoroSeconds = 0;
    let pomodoroCount = 0;
    let pomodoroMode = 'work'; // 'work' or 'break'
    
    // Pomodoro functions
    function startPomodoro() {
        if (pomodoroRunning) return;
        
        pomodoroRunning = true;
        pomodoroCount = 0;
        startPomodoroWork();
        
        document.getElementById('startPomodoroBtn').textContent = 'Stop Pomodoro';
        document.getElementById('startPomodoroBtn').addEventListener('click', stopPomodoro, { once: true });
    }
    
    function stopPomodoro() {
        if (!pomodoroRunning) return;
        
        clearInterval(pomodoroInterval);
        pomodoroRunning = false;
        
        document.getElementById('pomodoroStatus').textContent = 'Not active';
        document.getElementById('pomodoroCount').textContent = '';
        document.getElementById('startPomodoroBtn').textContent = 'Start Pomodoro';
        document.getElementById('startPomodoroBtn').addEventListener('click', startPomodoro, { once: true });
    }
    
    function startPomodoroWork() {
        pomodoroMode = 'work';
        pomodoroSeconds = 25 * 60; // 25 minutes
        
        document.getElementById('pomodoroStatus').textContent = 'Working';
        document.getElementById('pomodoroCount').textContent = `Round ${pomodoroCount + 1}`;
        
        updatePomodoroTimer();
        
        pomodoroInterval = setInterval(() => {
            pomodoroSeconds--;
            updatePomodoroTimer();
            
            if (pomodoroSeconds <= 0) {
                clearInterval(pomodoroInterval);
                pomodoroCount++;
                
                if (pomodoroCount % 4 === 0) {
                    startPomodoroLongBreak();
                } else {
                    startPomodoroBreak();
                }
                
                playSound('timer');
                showNotification('Pomodoro work session complete! Take a break.');
            }
        }, 1000);
    }
    
    function startPomodoroBreak() {
        pomodoroMode = 'break';
        pomodoroSeconds = 5 * 60; // 5 minutes
        
        document.getElementById('pomodoroStatus').textContent = 'Short Break';
        
        updatePomodoroTimer();
        
        pomodoroInterval = setInterval(() => {
            pomodoroSeconds--;
            updatePomodoroTimer();
            
            if (pomodoroSeconds <= 0) {
                clearInterval(pomodoroInterval);
                startPomodoroWork();
                
                playSound('timer');
                showNotification('Break time over! Back to work.');
            }
        }, 1000);
    }
    
    function startPomodoroLongBreak() {
        pomodoroMode = 'longBreak';
        pomodoroSeconds = 15 * 60; // 15 minutes
        
        document.getElementById('pomodoroStatus').textContent = 'Long Break';
        
        updatePomodoroTimer();
        
        pomodoroInterval = setInterval(() => {
            pomodoroSeconds--;
            updatePomodoroTimer();
            
            if (pomodoroSeconds <= 0) {
                clearInterval(pomodoroInterval);
                startPomodoroWork();
                
                playSound('timer');
                showNotification('Long break over! Back to work.');
            }
        }, 1000);
    }
    
    function updatePomodoroTimer() {
        const minutes = Math.floor(pomodoroSeconds / 60);
        const seconds = pomodoroSeconds % 60;
        
        document.getElementById('pomodoroStatus').textContent = 
            `${pomodoroMode === 'work' ? 'Working' : pomodoroMode === 'break' ? 'Short Break' : 'Long Break'} - ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Dynamic background
    function updateDynamicBackground(now) {
        const hours = now.getHours();
        
        // Early morning (5-8)
        if (hours >= 5 && hours < 8) {
            document.body.style.background = 'linear-gradient(135deg, #614385 0%, #516395 100%)';
        }
        // Morning (8-12)
        else if (hours >= 8 && hours < 12) {
            document.body.style.background = 'linear-gradient(135deg, #2980b9 0%, #6dd5fa 100%)';
        }
        // Afternoon (12-17)
        else if (hours >= 12 && hours < 17) {
            document.body.style.background = 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)';
        }
        // Evening (17-20)
        else if (hours >= 17 && hours < 20) {
            document.body.style.background = 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)';
        }
        // Night (20-5)
        else {
            document.body.style.background = 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)';
        }
    }
    
    // Holographic mode functions
    function enableHolographicMode() {
        const hologramBtn = document.getElementById('hologramBtn');
        hologramBtn.classList.add('active');
        
        // The actual implementation is in holographic-effect.js
        // This is just a placeholder to toggle the button state
    }
    
    function disableHolographicMode() {
        const hologramBtn = document.getElementById('hologramBtn');
        hologramBtn.classList.remove('active');
        
        // The actual implementation is in holographic-effect.js
        // This is just a placeholder to toggle the button state
    }
    
    // Voice control functions
    function toggleVoiceControl() {
        const voiceBtn = document.getElementById('voiceBtn');
        const startVoiceBtn = document.getElementById('startVoiceBtn');
        const voiceIndicator = document.getElementById('voiceIndicator');
        const voiceStatusText = document.getElementById('voiceStatusText');
        
        if (voiceBtn.classList.contains('active')) {
            voiceBtn.classList.remove('active');
            startVoiceBtn.textContent = 'Activate Voice Control';
            voiceIndicator.classList.remove('active');
            voiceStatusText.textContent = 'Voice control inactive';
            
            // The actual implementation is in voice-control.js
            // This is just a placeholder to toggle the UI state
        } else {
            voiceBtn.classList.add('active');
            startVoiceBtn.textContent = 'Deactivate Voice Control';
            voiceIndicator.classList.add('active');
            voiceStatusText.textContent = 'Listening for commands...';
            
            // The actual implementation is in voice-control.js
            // This is just a placeholder to toggle the UI state
        }
    }
    
    // AI Assistant functions
    function sendAIMessage() {
        const aiInput = document.getElementById('aiInput');
        const message = aiInput.value.trim();
        
        if (!message) return;
        
        // Add user message to chat
        addAIMessage(message, 'user');
        
        // Clear input
        aiInput.value = '';
        
        // Simulate AI response
        setTimeout(() => {
            let response;
            
            if (message.toLowerCase().includes('time')) {
                const now = new Date();
                response = `The current time is ${now.toLocaleTimeString()}.`;
            } else if (message.toLowerCase().includes('date')) {
                const now = new Date();
                response = `Today is ${now.toLocaleDateString()}.`;
            } else if (message.toLowerCase().includes('weather')) {
                response = 'I don\'t have access to real-time weather data in this demo, but you can check the weather by clicking the weather button.';
            } else if (message.toLowerCase().includes('theme')) {
                response = 'You can change the theme by clicking the theme button or saying "change theme to blue/gold/green/monochrome".';
            } else if (message.toLowerCase().includes('timer') || message.toLowerCase().includes('alarm')) {
                response = 'You can set timers and alarms by clicking the respective buttons or using voice commands like "set timer for 5 minutes" or "set alarm for 7:30 AM".';
            } else if (message.toLowerCase().includes('what can you do')) {
                response = 'I can help you with time management, setting alarms and timers, checking weather, changing themes, and controlling various features of the NEXUS clock. Try asking me specific questions or giving me commands.';
            } else {
                response = 'I\'m a simple AI assistant for the NEXUS clock. I can help with time management, settings, and basic information. Try asking about time, date, weather, or how to use specific features.';
            }
            
            addAIMessage(response, 'system');
        }, 1000);
    }
    
    function addAIMessage(message, type) {
        const aiMessages = document.getElementById('aiMessages');
        const messageElement = document.createElement('div');
        messageElement.className = `ai-message ${type}`;
        messageElement.textContent = message;
        
        aiMessages.appendChild(messageElement);
        aiMessages.scrollTop = aiMessages.scrollHeight;
    }
    
    // Initialize the clock
    init();
});
