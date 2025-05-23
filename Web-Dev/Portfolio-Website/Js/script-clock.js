
document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const hourHand = document.getElementById('hr');
    const minuteHand = document.getElementById('mn');
    const secondHand = document.getElementById('sc');
    const glowTrail = document.getElementById('glow');
    const hourDigit1 = document.getElementById('hour1');
    const hourDigit2 = document.getElementById('hour2');
    const minDigit1 = document.getElementById('min1');
    const minDigit2 = document.getElementById('min2');
    const secDigit1 = document.getElementById('sec1');
    const secDigit2 = document.getElementById('sec2');
    const ampmElement = document.getElementById('ampm');
    const dateDisplay = document.getElementById('date');
    const greetingElement = document.querySelector('.greeting');

    // Modal elements
    const modals = document.querySelectorAll('.modal');
    const themeBtn = document.getElementById('themeBtn');
    const alarmBtn = document.getElementById('alarmBtn');
    const timezoneBtn = document.getElementById('timezoneBtn');
    const soundBtn = document.getElementById('soundBtn');
    const closeButtons = document.querySelectorAll('.close-modal');
    const themeOptions = document.querySelectorAll('.theme-option');
    const alarmForm = document.getElementById('alarmForm');
    const alarmsList = document.getElementById('alarmsList');
    const timezoneSelect = document.getElementById('timezone');
    const audioControl = document.getElementById('audioControl');
    const notification = document.getElementById('notification');

    // State variables
    let currentTheme = 'neon-blue';
    let selectedTimezone = 'local';
    let alarms = [];
    let soundEnabled = false;
    let audio = null;

    // Initialize audio
    function initAudio() {
        audio = new Audio('https://cdnjs.cloudflare.com/ajax/libs/sound-effects/1.0.0/clock-ticking-2.mp3');
        audio.loop = true;
    }

    initAudio();

    // Clock function
    function updateClock() {
        let now = new Date();

        // Adjust for selected timezone
        if (selectedTimezone !== 'local') {
            now = new Date(now.toLocaleString('en-US', { timeZone: selectedTimezone }));
        }

        let hour = now.getHours();
        let minute = now.getMinutes();
        let second = now.getSeconds();

        // Calculate rotation degrees
        let hrDeg = (hour % 12) * 30 + minute * 0.5;
        let minDeg = minute * 6;
        let secDeg = second * 6;

        // Rotate hands
        hourHand.style.transform = `rotate(${hrDeg}deg)`;
        minuteHand.style.transform = `rotate(${minDeg}deg)`;
        secondHand.style.transform = `rotate(${secDeg}deg)`;
        glowTrail.style.transform = `rotate(${secDeg - 30}deg)`;

        // Update digital clock
        let ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12;
        hour = hour ? hour : 12;

        let hourStr = hour.toString().padStart(2, '0');
        let minStr = minute.toString().padStart(2, '0');
        let secStr = second.toString().padStart(2, '0');

        updateDigit(hourDigit1, hourStr[0]);
        updateDigit(hourDigit2, hourStr[1]);
        updateDigit(minDigit1, minStr[0]);
        updateDigit(minDigit2, minStr[1]);
        updateDigit(secDigit1, secStr[0]);
        updateDigit(secDigit2, secStr[1]);

        ampmElement.textContent = ampm;

        // Update date
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateDisplay.textContent = now.toLocaleDateString('en-US', options);

        // Update greeting based on time
        updateGreeting(hour, ampm);

        // Check alarms
        checkAlarms(now);
    }

    function updateDigit(element, newValue) {
        if (element.textContent !== newValue) {
            element.className = 'digit old';

            setTimeout(() => {
                element.textContent = newValue;
                element.className = 'digit new';

                setTimeout(() => {
                    element.className = 'digit current';
                }, 150);
            }, 150);
        }
    }

    function updateGreeting(hour, ampm) {
        let greeting;
        const hour24 = ampm === 'PM' ? (hour === 12 ? 12 : hour + 12) : (hour === 12 ? 0 : hour);

        if (hour24 >= 5 && hour24 < 12) {
            greeting = 'Good Morning!';
        } else if (hour24 >= 12 && hour24 < 18) {
            greeting = 'Good Afternoon!';
        } else if (hour24 >= 18 && hour24 < 22) {
            greeting = 'Good Evening!';
        } else {
            greeting = 'Good Night!';
        }

        greetingElement.textContent = greeting;
    }

    // Modal functions
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('active');
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('active');
    }

    // Theme functions
    function setTheme(theme) {
        document.body.className = theme;
        currentTheme = theme;

        // Update active theme in modal
        themeOptions.forEach(option => {
            if (option.dataset.theme === theme) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });

        // Save preference to localStorage
        localStorage.setItem('clockTheme', theme);
    }

    // Alarm functions
    function addAlarm(time, title) {
        const alarmObj = {
            id: Date.now(),
            time: time,
            title: title || 'Alarm',
            active: true
        };

        alarms.push(alarmObj);
        renderAlarms();

        // Save to localStorage
        localStorage.setItem('clockAlarms', JSON.stringify(alarms));

        showNotification(`Alarm set for ${time} - ${title || 'Alarm'}`);
    }

    function deleteAlarm(id) {
        alarms = alarms.filter(alarm => alarm.id !== id);
        renderAlarms();
        localStorage.setItem('clockAlarms', JSON.stringify(alarms));
    }

    function renderAlarms() {
        alarmsList.innerHTML = '';

        if (alarms.length === 0) {
            alarmsList.innerHTML = '<div class="empty-state">No alarms set</div>';
            return;
        }

        alarms.forEach(alarm => {
            const alarmItem = document.createElement('div');
            alarmItem.className = 'alarm-item';
            alarmItem.innerHTML = `
            <div class="alarm-info">
                <div class="alarm-time">${alarm.time}</div>
                <div class="alarm-title">${alarm.title}</div>
            </div>
            <button class="delete-alarm" data-id="${alarm.id}">×</button>
        `;
            alarmsList.appendChild(alarmItem);
        });

        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-alarm').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                deleteAlarm(id);
            });
        });
    }

    function checkAlarms(now) {
        if (alarms.length === 0) return;

        const currentHour = now.getHours().toString().padStart(2, '0');
        const currentMinute = now.getMinutes().toString().padStart(2, '0');
        const currentTimeStr = `${currentHour}:${currentMinute}`;

        alarms.forEach(alarm => {
            if (alarm.active && alarm.time === currentTimeStr && now.getSeconds() === 0) {
                triggerAlarm(alarm);
            }
        });
    }

    function triggerAlarm(alarm) {
        // Play alarm sound
        if (soundEnabled) {
            const alarmSound = new Audio('https://cdnjs.cloudflare.com/ajax/libs/sound-effects/1.0.0/alarm-clock.mp3');
            alarmSound.play();
        }

        // Show notification
        showNotification(`Alarm: ${alarm.title}`);

        // Deactivate alarm if it's one-time
        alarm.active = false;
    }

    // Notification functions
    function showNotification(message) {
        notification.textContent = message;
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 5000);
    }

    // Audio control functions
    function toggleSound() {
        soundEnabled = !soundEnabled;

        if (soundEnabled) {
            audioControl.querySelector('.audio-icon').textContent = '🔊';
            audio.play();
        } else {
            audioControl.querySelector('.audio-icon').textContent = '🔇';
            audio.pause();
        }

        localStorage.setItem('clockSoundEnabled', soundEnabled);
    }

    // Timezone functions
    function setTimezone(tz) {
        selectedTimezone = tz;
        localStorage.setItem('clockTimezone', tz);
        updateClock(); // Update immediately
    }

    // Load saved settings
    function loadSettings() {
        // Load theme
        const savedTheme = localStorage.getItem('clockTheme');
        if (savedTheme) {
            setTheme(savedTheme);
        }

        // Load timezone
        const savedTimezone = localStorage.getItem('clockTimezone');
        if (savedTimezone) {
            selectedTimezone = savedTimezone;
            timezoneSelect.value = savedTimezone;
        }

        // Load alarms
        const savedAlarms = localStorage.getItem('clockAlarms');
        if (savedAlarms) {
            alarms = JSON.parse(savedAlarms);
            renderAlarms();
        }

        // Load sound preference
        const savedSound = localStorage.getItem('clockSoundEnabled');
        if (savedSound !== null) {
            soundEnabled = savedSound === 'true';
            audioControl.querySelector('.audio-icon').textContent = soundEnabled ? '🔊' : '🔇';
            if (soundEnabled) {
                audio.play();
            }
        }
    }

    // Event listeners
    themeBtn.addEventListener('click', () => openModal('themeModal'));
    alarmBtn.addEventListener('click', () => openModal('alarmModal'));
    timezoneBtn.addEventListener('click', () => openModal('timezoneModal'));
    soundBtn.addEventListener('click', toggleSound);
    audioControl.addEventListener('click', toggleSound);

    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.dataset.modal;
            closeModal(modalId);
        });
    });

    window.addEventListener('click', (e) => {
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.dataset.theme;
            setTheme(theme);
        });
    });

    alarmForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const timeInput = document.getElementById('alarmTime');
        const titleInput = document.getElementById('alarmTitle');

        if (timeInput.value) {
            addAlarm(timeInput.value, titleInput.value);
            timeInput.value = '';
            titleInput.value = '';
        }
    });

    timezoneSelect.addEventListener('change', () => {
        setTimezone(timezoneSelect.value);
    });

    // Initialize
    loadSettings();
    updateClock();
    setInterval(updateClock, 1000);

    // Create custom Pomodoro timer functionality
    const pomodoroBtn = document.createElement('button');
    pomodoroBtn.className = 'control-btn';
    pomodoroBtn.id = 'pomodoroBtn';
    pomodoroBtn.innerHTML = '🍅 Pomodoro';
    document.querySelector('.controls').appendChild(pomodoroBtn);

    // Pomodoro Modal
    const pomodoroModal = document.createElement('div');
    pomodoroModal.className = 'modal';
    pomodoroModal.id = 'pomodoroModal';
    pomodoroModal.innerHTML = `
    <div class="modal-content">
        <div class="modal-header">
            <h2>Pomodoro Timer</h2>
            <button class="close-modal" data-modal="pomodoroModal">×</button>
        </div>
        <div class="form-group">
            <label for="pomodoro-duration">Focus Time (minutes)</label>
            <input type="number" id="pomodoro-duration" value="25" min="1" max="60">
        </div>
        <div class="form-group">
            <label for="pomodoro-break">Break Time (minutes)</label>
            <input type="number" id="pomodoro-break" value="5" min="1" max="30">
        </div>
        <button class="btn-set" id="start-pomodoro">Start Pomodoro</button>
        <div id="pomodoro-status" style="margin-top: 15px; text-align: center;"></div>
    </div>
`;
    document.body.appendChild(pomodoroModal);

    // Pomodoro state
    let pomodoroActive = false;
    let pomodoroTimer = null;
    let pomodoroTimeLeft = 0;
    let pomodoroMode = 'focus'; // 'focus' or 'break'

    // Pomodoro functions
    function startPomodoro(duration, breakTime) {
        if (pomodoroActive) {
            clearInterval(pomodoroTimer);
        }

        pomodoroActive = true;
        pomodoroMode = 'focus';
        pomodoroTimeLeft = duration * 60;

        updatePomodoroStatus();
        closeModal('pomodoroModal');
        showNotification('Pomodoro started! Time to focus.');

        pomodoroTimer = setInterval(() => {
            pomodoroTimeLeft--;

            if (pomodoroTimeLeft <= 0) {
                if (pomodoroMode === 'focus') {
                    // Switch to break
                    pomodoroMode = 'break';
                    pomodoroTimeLeft = breakTime * 60;
                    showNotification('Break time! Take a rest.');
                } else {
                    // End pomodoro
                    clearInterval(pomodoroTimer);
                    pomodoroActive = false;
                    showNotification('Pomodoro completed!');
                }
            }

            updatePomodoroStatus();
        }, 1000);
    }

    function updatePomodoroStatus() {
        const statusElement = document.getElementById('pomodoro-status');

        if (!pomodoroActive) {
            statusElement.textContent = '';
            return;
        }

        const minutes = Math.floor(pomodoroTimeLeft / 60);
        const seconds = pomodoroTimeLeft % 60;
        const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        statusElement.textContent = `${pomodoroMode === 'focus' ? 'Focus' : 'Break'} time: ${timeStr}`;
    }

    // Pomodoro event listeners
    pomodoroBtn.addEventListener('click', () => openModal('pomodoroModal'));

    document.getElementById('start-pomodoro').addEventListener('click', () => {
        const duration = parseInt(document.getElementById('pomodoro-duration').value) || 25;
        const breakTime = parseInt(document.getElementById('pomodoro-break').value) || 5;
        startPomodoro(duration, breakTime);
    });

    // Add close button event listener for pomodoro modal
    document.querySelector(`button[data-modal="pomodoroModal"]`).addEventListener('click', () => {
        closeModal('pomodoroModal');
    });

    // Create dynamic background based on time
    function updateBackground() {
        const now = new Date();
        const hour = now.getHours();

        // Don't change if a specific theme is selected
        if (currentTheme !== 'neon-blue') return;

        let bgGradient;

        if (hour >= 5 && hour < 10) {
            // Morning/Sunrise
            bgGradient = 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)';
        } else if (hour >= 10 && hour < 16) {
            // Daytime
            bgGradient = 'linear-gradient(135deg, #56ccf2 0%, #2f80ed 100%)';
        } else if (hour >= 16 && hour < 20) {
            // Evening/Sunset
            bgGradient = 'linear-gradient(135deg, #3c1053 0%, #ad5389 100%)';
        } else {
            // Night
            bgGradient = 'linear-gradient(135deg, #050a27 0%, #000000 100%)';
        }

        // Only apply if in auto theme mode
        if (currentTheme === 'neon-blue') {
            document.body.style.background = bgGradient;
        }
    }

    // Update background with time
    setInterval(updateBackground, 60000); // Check every minute
    updateBackground(); // Initial check

    // Add smooth animation for clock hands
    function smoothAnimateClock() {
        const date = new Date();
        const seconds = date.getSeconds() + date.getMilliseconds() / 1000;
        const minutes = date.getMinutes() + seconds / 60;
        const hours = date.getHours() % 12 + minutes / 60;

        // Calculate smooth rotation angles
        const secDeg = seconds * 6;
        const minDeg = minutes * 6;
        const hrDeg = hours * 30;

        // Apply smooth transitions
        secondHand.style.transition = seconds === 0 ? 'none' : 'transform 0.5s cubic-bezier(0.4, 2.08, 0.55, 0.44)';
        minuteHand.style.transition = 'transform 0.5s cubic-bezier(0.4, 2.08, 0.55, 0.44)';
        hourHand.style.transition = 'transform 0.5s cubic-bezier(0.4, 2.08, 0.55, 0.44)';

        secondHand.style.transform = `rotate(${secDeg}deg)`;
        minuteHand.style.transform = `rotate(${minDeg}deg)`;
        hourHand.style.transform = `rotate(${hrDeg}deg)`;
        glowTrail.style.transform = `rotate(${secDeg - 30}deg)`;
    }

    // Update smooth clock animations
    setInterval(smoothAnimateClock, 50); // Smooth updates at 50ms intervals
    smoothAnimateClock();
    // Add smooth animation for clock hands
    function smoothAnimateClock() {
        const date = new Date();

        // Adjust for selected timezone
        let now = date;
        if (selectedTimezone !== 'local') {
            now = new Date(date.toLocaleString('en-US', { timeZone: selectedTimezone }));
        }

        const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
        const minutes = now.getMinutes() + seconds / 60;
        const hours = now.getHours() % 12 + minutes / 60;

        // Calculate smooth rotation angles
        const secDeg = seconds * 6;
        const minDeg = minutes * 6;
        const hrDeg = hours * 30;

        // Apply smooth transitions
        secondHand.style.transition = seconds === 0 ? 'none' : 'transform 0.1s linear';
        minuteHand.style.transition = 'transform 0.1s linear';
        hourHand.style.transition = 'transform 0.1s linear';

        secondHand.style.transform = `rotate(${secDeg}deg)`;
        minuteHand.style.transform = `rotate(${minDeg}deg)`;
        hourHand.style.transform = `rotate(${hrDeg}deg)`;
        glowTrail.style.transform = `rotate(${secDeg - 30}deg)`;
    }

    // Replace the standard interval with the smooth animation
    clearInterval(clockInterval); // Clear any existing interval

    // Use requestAnimationFrame for smoother animation
    function animateClock() {
        smoothAnimateClock();

        // Still update digital display and check alarms at 1 second intervals
        const now = new Date();
        if (now.getMilliseconds() < 50) {
            updateDigitalDisplay(now);
            checkAlarms(now);
        }

        requestAnimationFrame(animateClock);
    }

    // Function to update just the digital display without affecting analog clock
    function updateDigitalDisplay(now) {
        // Adjust for selected timezone
        if (selectedTimezone !== 'local') {
            now = new Date(now.toLocaleString('en-US', { timeZone: selectedTimezone }));
        }

        let hour = now.getHours();
        let minute = now.getMinutes();
        let second = now.getSeconds();

        // Update digital clock
        let ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12;
        hour = hour ? hour : 12;

        let hourStr = hour.toString().padStart(2, '0');
        let minStr = minute.toString().padStart(2, '0');
        let secStr = second.toString().padStart(2, '0');

        updateDigit(hourDigit1, hourStr[0]);
        updateDigit(hourDigit2, hourStr[1]);
        updateDigit(minDigit1, minStr[0]);
        updateDigit(minDigit2, minStr[1]);
        updateDigit(secDigit1, secStr[0]);
        updateDigit(secDigit2, secStr[1]);

        ampmElement.textContent = ampm;

        // Update date
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateDisplay.textContent = now.toLocaleDateString('en-US', options);

        // Update greeting based on time
        updateGreeting(hour, ampm);
    }

    // Clear the old interval and start the animation
    const clockInterval = setInterval(updateClock, 1000);
    clearInterval(clockInterval);

    // Initialize and start the smooth animation
    smoothAnimateClock();
    requestAnimationFrame(animateClock);

    // Add pulse effect to the clock on every minute change
    function addPulseEffect() {
        const clock = document.querySelector('.clock');
        clock.classList.add('pulse');

        setTimeout(() => {
            clock.classList.remove('pulse');
        }, 500);
    }

    // Add the CSS for the pulse effect
    const style = document.createElement('style');
    style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.03); }
        100% { transform: scale(1); }
    }
    
    .clock.pulse {
        animation: pulse 0.5s ease-out;
    }
`;
    document.head.appendChild(style);

    // Check for minute change to add pulse effect
    setInterval(() => {
        const now = new Date();
        if (now.getSeconds() === 0) {
            addPulseEffect();
        }
    }, 1000);
})