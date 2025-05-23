/**
 * AI Assistant Integration for Futuristic Clock
 * Provides an intelligent virtual assistant with natural language interaction
 */

class AIAssistant {
    constructor() {
        this.isActive = false;
        this.isSpeaking = false;
        this.isListening = false;
        this.conversationHistory = [];
        this.maxHistoryItems = 20;
        this.assistantName = "Chronos";
        this.assistantVoice = null;
        this.recognition = null;
        this.speechSynthesis = window.speechSynthesis;
        this.voiceCommands = {
            "show time": () => this.respondToCommand("The current time is " + this.getCurrentTime()),
            "what time is it": () => this.respondToCommand("It's " + this.getCurrentTime()),
            "show date": () => this.respondToCommand("Today is " + this.getCurrentDate()),
            "what day is it": () => this.respondToCommand("Today is " + this.getCurrentDate()),
            "set alarm": (params) => this.handleSetAlarm(params),
            "set timer": (params) => this.handleSetTimer(params),
            "change theme": (params) => this.handleChangeTheme(params),
            "toggle sound": () => this.handleToggleSound(),
            "weather forecast": () => this.handleWeatherRequest(),
            "tell me about yourself": () => this.respondToCommand("I am " + this.assistantName + ", your personal time management AI. I can help you with alarms, timers, and provide information about time and weather."),
            "help": () => this.showHelp()
        };
        
        // Create assistant button
        this.createAssistantButton();
        
        // Create assistant modal
        this.createAssistantModal();
        
        // Initialize speech recognition if available
        this.initSpeechRecognition();
        
        // Initialize speech synthesis
        this.initSpeechSynthesis();
        
        // Load saved settings
        this.loadSavedSettings();
        
        // Add keyboard shortcut (Alt+A)
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 'a') {
                this.toggleAssistant();
            }
        });
    }
    
    createAssistantButton() {
        const controlsContainer = document.querySelector('.controls');
        const assistantBtn = document.createElement('button');
        assistantBtn.className = 'control-btn';
        assistantBtn.id = 'assistantBtn';
        assistantBtn.innerHTML = '<span class="icon-assistant"></span> Assistant';
        
        // Add button to controls after auth button
        const authBtn = document.getElementById('authBtn');
        if (authBtn) {
            controlsContainer.insertBefore(assistantBtn, authBtn.nextSibling);
        } else {
            controlsContainer.appendChild(assistantBtn);
        }
        
        // Toggle assistant on button click
        assistantBtn.addEventListener('click', () => {
            this.toggleAssistant();
        });
    }
    
    createAssistantModal() {
        // Create modal element
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'assistantModal';
        
        // Create modal content
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>AI Assistant</h2>
                    <button class="close-modal" data-modal="assistantModal">×</button>
                </div>
                <div class="assistant-content">
                    <!-- Assistant Avatar -->
                    <div class="assistant-avatar">
                        <div class="assistant-avatar-circle">
                            <div class="assistant-avatar-face">
                                <div class="assistant-avatar-eyes">
                                    <div class="assistant-avatar-eye"></div>
                                    <div class="assistant-avatar-eye"></div>
                                </div>
                                <div class="assistant-avatar-mouth"></div>
                            </div>
                        </div>
                        <div class="assistant-status">
                            <div class="assistant-status-indicator"></div>
                            <div class="assistant-status-text">Ready</div>
                        </div>
                    </div>
                    
                    <!-- Conversation Area -->
                    <div class="conversation-area" id="conversationArea">
                        <div class="conversation-welcome">
                            <h3>Hello, I'm ${this.assistantName}</h3>
                            <p>Your personal time management assistant. How can I help you today?</p>
                        </div>
                    </div>
                    
                    <!-- Input Area -->
                    <div class="assistant-input-area">
                        <input type="text" id="assistantInput" placeholder="Ask me anything...">
                        <button id="assistantMicBtn" class="assistant-mic-btn">
                            <span class="icon-mic"></span>
                        </button>
                        <button id="assistantSendBtn" class="assistant-send-btn">
                            <span class="icon-send"></span>
                        </button>
                    </div>
                    
                    <!-- Quick Actions -->
                    <div class="assistant-quick-actions">
                        <button class="quick-action-btn" data-command="what time is it">Time?</button>
                        <button class="quick-action-btn" data-command="what day is it">Date?</button>
                        <button class="quick-action-btn" data-command="set alarm">Set Alarm</button>
                        <button class="quick-action-btn" data-command="weather forecast">Weather</button>
                        <button class="quick-action-btn" data-command="help">Help</button>
                    </div>
                    
                    <!-- Assistant Settings -->
                    <div class="assistant-settings">
                        <button id="assistantSettingsBtn" class="assistant-settings-btn">
                            <span class="icon-settings"></span>
                        </button>
                        <div class="assistant-settings-panel" id="assistantSettingsPanel">
                            <h3>Assistant Settings</h3>
                            <div class="form-group">
                                <label>Assistant Name</label>
                                <input type="text" id="assistantNameInput" value="${this.assistantName}">
                            </div>
                            <div class="form-group">
                                <label>Voice</label>
                                <select id="assistantVoiceSelect">
                                    <option value="">System Default</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Speech Rate</label>
                                <div class="slider-container">
                                    <input type="range" id="speechRateSlider" min="0.5" max="2" step="0.1" value="1" class="range-slider">
                                    <span id="speechRateValue">1.0</span>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Speech Volume</label>
                                <div class="slider-container">
                                    <input type="range" id="speechVolumeSlider" min="0" max="1" step="0.1" value="1" class="range-slider">
                                    <span id="speechVolumeValue">1.0</span>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Voice Response</label>
                                <label class="switch">
                                    <input type="checkbox" id="voiceResponseToggle" checked>
                                    <span class="slider round"></span>
                                </label>
                            </div>
                            <div class="form-group">
                                <button id="saveAssistantSettingsBtn" class="btn-set">Save Settings</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to document
        document.body.appendChild(modal);
        
        // Add event listeners
        this.addAssistantEventListeners();
    }
    
    addAssistantEventListeners() {
        // Close modal button
        const closeBtn = document.querySelector('#assistantModal .close-modal');
        closeBtn.addEventListener('click', () => {
            this.closeAssistantModal();
        });
        
        // Send button
        document.getElementById('assistantSendBtn').addEventListener('click', () => {
            this.sendUserMessage();
        });
        
        // Mic button
        document.getElementById('assistantMicBtn').addEventListener('click', () => {
            this.toggleListening();
        });
        
        // Input field enter key
        document.getElementById('assistantInput').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                this.sendUserMessage();
            }
        });
        
        // Quick action buttons
        document.querySelectorAll('.quick-action-btn').forEach(button => {
            button.addEventListener('click', () => {
                const command = button.dataset.command;
                this.handleQuickAction(command);
            });
        });
        
        // Settings button
        document.getElementById('assistantSettingsBtn').addEventListener('click', () => {
            this.toggleSettingsPanel();
        });
        
        // Save settings button
        document.getElementById('saveAssistantSettingsBtn').addEventListener('click', () => {
            this.saveAssistantSettings();
        });
        
        // Speech rate slider
        const speechRateSlider = document.getElementById('speechRateSlider');
        const speechRateValue = document.getElementById('speechRateValue');
        
        speechRateSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value).toFixed(1);
            speechRateValue.textContent = value;
        });
        
        // Speech volume slider
        const speechVolumeSlider = document.getElementById('speechVolumeSlider');
        const speechVolumeValue = document.getElementById('speechVolumeValue');
        
        speechVolumeSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value).toFixed(1);
            speechVolumeValue.textContent = value;
        });
    }
    
    toggleAssistant() {
        const modal = document.getElementById('assistantModal');
        
        if (modal.classList.contains('active')) {
            this.closeAssistantModal();
        } else {
            this.openAssistantModal();
        }
    }
    
    openAssistantModal() {
        const modal = document.getElementById('assistantModal');
        modal.classList.add('active');
        
        // Set active state
        this.isActive = true;
        
        // Update assistant button
        const assistantBtn = document.getElementById('assistantBtn');
        if (assistantBtn) {
            assistantBtn.classList.add('active');
        }
        
        // Focus input field
        setTimeout(() => {
            document.getElementById('assistantInput').focus();
        }, 300);
        
        // Animate avatar
        this.animateAvatar('greeting');
        
        // Welcome message if conversation is empty
        if (this.conversationHistory.length === 0) {
            setTimeout(() => {
                this.addAssistantMessage(`Hello! I'm ${this.assistantName}, your personal time assistant. How can I help you today?`);
            }, 500);
        }
    }
    
    closeAssistantModal() {
        const modal = document.getElementById('assistantModal');
        modal.classList.remove('active');
        
        // Set inactive state
        this.isActive = false;
        
        // Update assistant button
        const assistantBtn = document.getElementById('assistantBtn');
        if (assistantBtn) {
            assistantBtn.classList.remove('active');
        }
        
        // Stop listening if active
        if (this.isListening) {
            this.stopListening();
        }
        
        // Stop speaking if active
        if (this.isSpeaking) {
            this.stopSpeaking();
        }
    }
    
    toggleSettingsPanel() {
        const settingsPanel = document.getElementById('assistantSettingsPanel');
        settingsPanel.classList.toggle('active');
    }
    
    initSpeechRecognition() {
        // Check if speech recognition is supported
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            // Configure recognition
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
            
            // Add event listeners
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                document.getElementById('assistantInput').value = transcript;
                this.sendUserMessage();
            };
            
            this.recognition.onend = () => {
                this.isListening = false;
                this.updateListeningState();
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.isListening = false;
                this.updateListeningState();
                
                if (event.error === 'not-allowed') {
                    this.addAssistantMessage("I don't have permission to access your microphone. Please check your browser settings.");
                } else {
                    this.addAssistantMessage("I couldn't hear you. Please try again or type your message.");
                }
            };
        } else {
            console.warn('Speech recognition not supported in this browser');
            // Hide mic button if not supported
            document.getElementById('assistantMicBtn').style.display = 'none';
        }
    }
    
    initSpeechSynthesis() {
        // Check if speech synthesis is supported
        if ('speechSynthesis' in window) {
            // Populate voice select dropdown
            setTimeout(() => {
                const voices = this.speechSynthesis.getVoices();
                const voiceSelect = document.getElementById('assistantVoiceSelect');
                
                voices.forEach((voice, index) => {
                    const option = document.createElement('option');
                    option.value = index;
                    option.textContent = `${voice.name} (${voice.lang})`;
                    voiceSelect.appendChild(option);
                });
                
                // Set selected voice if previously saved
                if (this.assistantVoice !== null) {
                    voiceSelect.value = this.assistantVoice;
                }
            }, 100);
            
            // Handle voices changed event
            if (this.speechSynthesis.onvoiceschanged !== undefined) {
                this.speechSynthesis.onvoiceschanged = () => {
                    const voices = this.speechSynthesis.getVoices();
                    const voiceSelect = document.getElementById('assistantVoiceSelect');
                    
                    // Clear existing options
                    while (voiceSelect.firstChild) {
                        voiceSelect.removeChild(voiceSelect.firstChild);
                    }
                    
                    // Add default option
                    const defaultOption = document.createElement('option');
                    defaultOption.value = "";
                    defaultOption.textContent = "System Default";
                    voiceSelect.appendChild(defaultOption);
                    
                    // Add available voices
                    voices.forEach((voice, index) => {
                        const option = document.createElement('option');
                        option.value = index;
                        option.textContent = `${voice.name} (${voice.lang})`;
                        voiceSelect.appendChild(option);
                    });
                    
                    // Set selected voice if previously saved
                    if (this.assistantVoice !== null) {
                        voiceSelect.value = this.assistantVoice;
                    }
                };
            }
        } else {
            console.warn('Speech synthesis not supported in this browser');
        }
    }
    
    saveAssistantSettings() {
        // Get settings values
        const name = document.getElementById('assistantNameInput').value.trim();
        const voice = document.getElementById('assistantVoiceSelect').value;
        const rate = document.getElementById('speechRateSlider').value;
        const volume = document.getElementById('speechVolumeSlider').value;
        const voiceResponse = document.getElementById('voiceResponseToggle').checked;
        
        // Validate name
        if (!name) {
            this.showSettingsError('Assistant name cannot be empty.');
            return;
        }
        
        // Update settings
        this.assistantName = name;
        this.assistantVoice = voice === "" ? null : parseInt(voice);
        this.speechRate = parseFloat(rate);
        this.speechVolume = parseFloat(volume);
        this.voiceResponseEnabled = voiceResponse;
        
        // Save settings to localStorage
        const settings = {
            assistantName: this.assistantName,
            assistantVoice: this.assistantVoice,
            speechRate: this.speechRate,
            speechVolume: this.speechVolume,
            voiceResponseEnabled: this.voiceResponseEnabled
        };
        
        localStorage.setItem('clockAssistantSettings', JSON.stringify(settings));
        
        // Update welcome message
        document.querySelector('.conversation-welcome h3').textContent = `Hello, I'm ${this.assistantName}`;
        
        // Hide settings panel
        document.getElementById('assistantSettingsPanel').classList.remove('active');
        
        // Show confirmation
        this.addAssistantMessage(`My settings have been updated. You can call me ${this.assistantName} now.`);
    }
    
    showSettingsError(message) {
        const settingsPanel = document.getElementById('assistantSettingsPanel');
        const errorElement = settingsPanel.querySelector('.settings-error') || document.createElement('div');
        
        errorElement.className = 'settings-error';
        errorElement.textContent = message;
        
        if (!settingsPanel.querySelector('.settings-error')) {
            settingsPanel.appendChild(errorElement);
        }
    }
    
    loadSavedSettings() {
        const savedSettings = localStorage.getItem('clockAssistantSettings');
        
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                
                this.assistantName = settings.assistantName || "Chronos";
                this.assistantVoice = settings.assistantVoice;
                this.speechRate = settings.speechRate || 1.0;
                this.speechVolume = settings.speechVolume || 1.0;
                this.voiceResponseEnabled = settings.voiceResponseEnabled !== undefined ? settings.voiceResponseEnabled : true;
                
                // Update UI with loaded settings
                document.getElementById('assistantNameInput').value = this.assistantName;
                document.getElementById('speechRateSlider').value = this.speechRate;
                document.getElementById('speechRateValue').textContent = this.speechRate.toFixed(1);
                document.getElementById('speechVolumeSlider').value = this.speechVolume;
                document.getElementById('speechVolumeValue').textContent = this.speechVolume.toFixed(1);
                document.getElementById('voiceResponseToggle').checked = this.voiceResponseEnabled;
                
                // Update welcome message
                document.querySelector('.conversation-welcome h3').textContent = `Hello, I'm ${this.assistantName}`;
            } catch (error) {
                console.error('Error loading assistant settings:', error);
            }
        }
        
        // Load conversation history
        const savedHistory = localStorage.getItem('clockAssistantHistory');
        
        if (savedHistory) {
            try {
                this.conversationHistory = JSON.parse(savedHistory);
                this.updateConversationArea();
            } catch (error) {
                console.error('Error loading conversation history:', error);
            }
        }
    }
    
    sendUserMessage() {
        const input = document.getElementById('assistantInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Add user message to conversation
        this.addUserMessage(message);
        
        // Clear input field
        input.value = '';
        
        // Process message
        this.processUserMessage(message);
    }
    
    processUserMessage(message) {
        // Animate avatar to thinking state
        this.animateAvatar('thinking');
        
        // Check for command matches
        let commandFound = false;
        
        // Check for exact command matches
        if (this.voiceCommands[message.toLowerCase()]) {
            this.voiceCommands[message.toLowerCase()]();
            commandFound = true;
        } else {
            // Check for command patterns
            for (const command in this.voiceCommands) {
                if (message.toLowerCase().includes(command)) {
                    // Extract parameters (everything after the command)
                    const params = message.toLowerCase().replace(command, '').trim();
                    this.voiceCommands[command](params);
                    commandFound = true;
                    break;
                }
            }
        }
        
        // If no command found, provide a generic response
        if (!commandFound) {
            this.handleGenericQuery(message);
        }
    }
    
    handleGenericQuery(message) {
        // Simple response patterns for common queries
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            this.respondToCommand(`Hello! How can I help you with your time management today?`);
        } else if (lowerMessage.includes('thank')) {
            this.respondToCommand(`You're welcome! Is there anything else I can help you with?`);
        } else if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
            this.respondToCommand(`Goodbye! I'll be here when you need me.`);
        } else if (lowerMessage.includes('name')) {
            this.respondToCommand(`My name is ${this.assistantName}, your personal time management assistant.`);
        } else if (lowerMessage.includes('time zone')) {
            this.respondToCommand(`Your current time zone is ${Intl.DateTimeFormat().resolvedOptions().timeZone}.`);
        } else if (lowerMessage.includes('feature') || lowerMessage.includes('can you')) {
            this.showHelp();
        } else {
            // Generic response for unrecognized queries
            const responses = [
                "I'm not sure I understand. Try asking about time, date, alarms, or say 'help' for more options.",
                "I didn't quite catch that. I can help with time management, alarms, and timers. Say 'help' for more information.",
                "I'm still learning. For now, I can assist with time-related tasks. Try asking for the time, setting an alarm, or say 'help'.",
                "I'm not programmed to understand that yet. I can help with time, date, alarms, and timers. Say 'help' for more options."
            ];
            
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            this.respondToCommand(randomResponse);
        }
    }
    
    respondToCommand(response) {
        // Add assistant message to conversation
        setTimeout(() => {
            this.addAssistantMessage(response);
            
            // Speak response if enabled
            if (this.voiceResponseEnabled) {
                this.speak(response);
            }
            
            // Animate avatar to speaking state
            this.animateAvatar('speaking');
        }, 500);
    }
    
    handleQuickAction(command) {
        // Add user message to conversation
        this.addUserMessage(command);
        
        // Process command
        this.processUserMessage(command);
    }
    
    handleSetAlarm(params) {
        // Extract time from params
        let time = params;
        
        if (!time) {
            // If no time provided, show alarm interface
            if (window.clockAlarms && typeof window.clockAlarms.showAlarmInterface === 'function') {
                window.clockAlarms.showAlarmInterface();
                this.respondToCommand("I've opened the alarm interface for you. Please set your alarm time.");
            } else {
                this.respondToCommand("To set an alarm, please specify a time like '7:30 AM' or '14:00'.");
            }
            return;
        }
        
        // Try to parse the time
        let hours, minutes, period;
        
        // Check for common time formats
        const timeRegex12h = /(\d{1,2}):?(\d{2})?\s*(am|pm)/i;
        const timeRegex24h = /(\d{1,2}):(\d{2})/;
        
        let match = time.match(timeRegex12h);
        
        if (match) {
            hours = parseInt(match[1]);
            minutes = match[2] ? parseInt(match[2]) : 0;
            period = match[3].toLowerCase();
            
            // Convert to 24-hour format
            if (period === 'pm' && hours < 12) {
                hours += 12;
            } else if (period === 'am' && hours === 12) {
                hours = 0;
            }
        } else {
            match = time.match(timeRegex24h);
            
            if (match) {
                hours = parseInt(match[1]);
                minutes = parseInt(match[2]);
            } else {
                // Try to parse as a single number (e.g., "7" for 7:00)
                const hourOnly = /(\d{1,2})/;
                match = time.match(hourOnly);
                
                if (match) {
                    hours = parseInt(match[1]);
                    minutes = 0;
                    
                    // Assume AM for hours 7-11, PM for hours 1-6
                    if (hours >= 1 && hours <= 6) {
                        hours += 12; // Assume PM
                    }
                } else {
                    this.respondToCommand("I couldn't understand that time format. Please try again with a format like '7:30 AM' or '14:00'.");
                    return;
                }
            }
        }
        
        // Validate hours and minutes
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            this.respondToCommand("That doesn't seem to be a valid time. Please try again with a valid time.");
            return;
        }
        
        // Format time for display
        const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedTime = `${formattedHours}:${formattedMinutes} ${ampm}`;
        
        // Set the alarm
        if (window.clockAlarms && typeof window.clockAlarms.setAlarm === 'function') {
            window.clockAlarms.setAlarm(hours, minutes);
            this.respondToCommand(`I've set an alarm for ${formattedTime}.`);
        } else {
            // Fallback if alarm function not available
            this.respondToCommand(`I would set an alarm for ${formattedTime}, but the alarm system isn't available right now.`);
        }
    }
    
    handleSetTimer(params) {
        // Extract duration from params
        let duration = params;
        
        if (!duration) {
            this.respondToCommand("To set a timer, please specify a duration like '5 minutes' or '2 hours 30 minutes'.");
            return;
        }
        
        // Try to parse the duration
        let totalSeconds = 0;
        
        // Check for hours
        const hoursRegex = /(\d+)\s*(?:h|hour|hours)/i;
        const hoursMatch = duration.match(hoursRegex);
        
        if (hoursMatch) {
            totalSeconds += parseInt(hoursMatch[1]) * 3600;
        }
        
        // Check for minutes
        const minutesRegex = /(\d+)\s*(?:m|min|minute|minutes)/i;
        const minutesMatch = duration.match(minutesRegex);
        
        if (minutesMatch) {
            totalSeconds += parseInt(minutesMatch[1]) * 60;
        }
        
        // Check for seconds
        const secondsRegex = /(\d+)\s*(?:s|sec|second|seconds)/i;
        const secondsMatch = duration.match(secondsRegex);
        
        if (secondsMatch) {
            totalSeconds += parseInt(secondsMatch[1]);
        }
        
        // If no specific units found, try to parse as minutes
        if (totalSeconds === 0) {
            const numberRegex = /(\d+)/;
            const numberMatch = duration.match(numberRegex);
            
            if (numberMatch) {
                totalSeconds = parseInt(numberMatch[1]) * 60;
            }
        }
        
        // Validate duration
        if (totalSeconds <= 0) {
            this.respondToCommand("I couldn't understand that duration. Please try again with a format like '5 minutes' or '2 hours 30 minutes'.");
            return;
        }
        
        // Format duration for display
        let formattedDuration = '';
        
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        if (hours > 0) {
            formattedDuration += `${hours} hour${hours !== 1 ? 's' : ''} `;
        }
        
        if (minutes > 0) {
            formattedDuration += `${minutes} minute${minutes !== 1 ? 's' : ''} `;
        }
        
        if (seconds > 0 && hours === 0) { // Only show seconds if less than an hour
            formattedDuration += `${seconds} second${seconds !== 1 ? 's' : ''}`;
        }
        
        formattedDuration = formattedDuration.trim();
        
        // Set the timer
        if (window.clockTimer && typeof window.clockTimer.startTimer === 'function') {
            window.clockTimer.startTimer(totalSeconds);
            this.respondToCommand(`I've started a timer for ${formattedDuration}.`);
        } else {
            // Create a simple timer if timer function not available
            this.createSimpleTimer(totalSeconds, formattedDuration);
        }
    }
    
    createSimpleTimer(totalSeconds, formattedDuration) {
        this.respondToCommand(`I've started a timer for ${formattedDuration}.`);
        
        // Create notification when timer ends
        setTimeout(() => {
            this.showNotification('Timer Complete', `Your ${formattedDuration} timer has finished.`);
            
            // Add message to conversation if assistant is active
            if (this.isActive) {
                this.addAssistantMessage(`Your ${formattedDuration} timer has finished.`);
                
                // Speak notification if enabled
                if (this.voiceResponseEnabled) {
                    this.speak(`Your ${formattedDuration} timer has finished.`);
                }
            }
        }, totalSeconds * 1000);
    }
    
    handleChangeTheme(params) {
        // Extract theme name from params
        let theme = params;
        
        if (!theme) {
            this.respondToCommand("To change the theme, please specify a theme like 'blue', 'gold', 'green', or 'monochrome'.");
            return;
        }
        
        // Map common theme names to actual theme values
        const themeMap = {
            'blue': 'neon-blue',
            'neon blue': 'neon-blue',
            'gold': 'sunrise-gold',
            'sunrise gold': 'sunrise-gold',
            'yellow': 'sunrise-gold',
            'green': 'matrix-green',
            'matrix green': 'matrix-green',
            'monochrome': 'monochrome',
            'black': 'monochrome',
            'white': 'monochrome',
            'gray': 'monochrome',
            'grey': 'monochrome'
        };
        
        const themeValue = themeMap[theme.toLowerCase()];
        
        if (!themeValue) {
            this.respondToCommand("I don't recognize that theme. Available themes are: Neon Blue, Sunrise Gold, Matrix Green, and Monochrome.");
            return;
        }
        
        // Change the theme
        if (window.clockTheme && typeof window.clockTheme.setTheme === 'function') {
            window.clockTheme.setTheme(themeValue);
            this.respondToCommand(`I've changed the theme to ${themeValue.replace('-', ' ')}.`);
        } else if (typeof setTheme === 'function') {
            // Try global function
            setTheme(themeValue);
            this.respondToCommand(`I've changed the theme to ${themeValue.replace('-', ' ')}.`);
        } else {
            // Fallback if theme function not available
            this.respondToCommand(`I would change the theme to ${themeValue.replace('-', ' ')}, but the theme system isn't available right now.`);
        }
    }
    
    handleToggleSound() {
        // Toggle sound
        if (typeof toggleSound === 'function') {
            const isSoundEnabled = toggleSound();
            
            if (isSoundEnabled) {
                this.respondToCommand("I've turned the sound on.");
            } else {
                this.respondToCommand("I've turned the sound off.");
            }
        } else {
            // Fallback if sound function not available
            this.respondToCommand("I can't control the sound right now. The sound system isn't available.");
        }
    }
    
    handleWeatherRequest() {
        // Simulate weather forecast
        const weatherConditions = [
            'sunny', 'partly cloudy', 'cloudy', 'rainy', 'stormy', 'snowy', 'foggy', 'windy'
        ];
        
        const temperatures = {
            'sunny': { min: 75, max: 95 },
            'partly cloudy': { min: 65, max: 85 },
            'cloudy': { min: 60, max: 75 },
            'rainy': { min: 55, max: 70 },
            'stormy': { min: 50, max: 65 },
            'snowy': { min: 20, max: 35 },
            'foggy': { min: 45, max: 65 },
            'windy': { min: 55, max: 75 }
        };
        
        const condition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
        const tempRange = temperatures[condition];
        const temp = Math.floor(Math.random() * (tempRange.max - tempRange.min + 1)) + tempRange.min;
        
        const response = `The current weather is ${condition} with a temperature of ${temp}°F. ` +
                        `The forecast for today shows temperatures between ${tempRange.min}°F and ${tempRange.max}°F.`;
        
        this.respondToCommand(response);
    }
    
    showHelp() {
        const helpMessage = `
            Here's what I can help you with:
            
            • Time and Date: Ask "What time is it?" or "What day is it?"
            • Alarms: Say "Set alarm for 7:30 AM"
            • Timers: Say "Set timer for 5 minutes"
            • Themes: Say "Change theme to blue"
            • Sound: Say "Toggle sound"
            • Weather: Ask for "Weather forecast"
            
            You can type your questions or use the microphone button to speak.
        `;
        
        this.respondToCommand(helpMessage);
    }
    
    addUserMessage(message) {
        // Add to conversation history
        this.conversationHistory.push({
            sender: 'user',
            message,
            timestamp: new Date().toISOString()
        });
        
        // Limit history size
        if (this.conversationHistory.length > this.maxHistoryItems) {
            this.conversationHistory.shift();
        }
        
        // Save history
        this.saveConversationHistory();
        
        // Update conversation area
        this.addMessageToConversationArea('user', message);
    }
    
    addAssistantMessage(message) {
        // Add to conversation history
        this.conversationHistory.push({
            sender: 'assistant',
            message,
            timestamp: new Date().toISOString()
        });
        
        // Limit history size
        if (this.conversationHistory.length > this.maxHistoryItems) {
            this.conversationHistory.shift();
        }
        
        // Save history
        this.saveConversationHistory();
        
        // Update conversation area
        this.addMessageToConversationArea('assistant', message);
    }
    
    addMessageToConversationArea(sender, message) {
        const conversationArea = document.getElementById('conversationArea');
        const messageElement = document.createElement('div');
        
        messageElement.className = `conversation-message ${sender}-message`;
        
        // Format message with line breaks
        const formattedMessage = message.replace(/\n/g, '<br>');
        
        messageElement.innerHTML = `
            <div class="message-content">${formattedMessage}</div>
            <div class="message-time">${this.formatMessageTime(new Date())}</div>
        `;
        
        // Hide welcome message if present
        const welcomeMessage = conversationArea.querySelector('.conversation-welcome');
        if (welcomeMessage) {
            welcomeMessage.style.display = 'none';
        }
        
        // Add message to conversation area
        conversationArea.appendChild(messageElement);
        
        // Scroll to bottom
        conversationArea.scrollTop = conversationArea.scrollHeight;
    }
    
    updateConversationArea() {
        const conversationArea = document.getElementById('conversationArea');
        
        // Clear existing messages
        conversationArea.innerHTML = '';
        
        // Add welcome message if no history
        if (this.conversationHistory.length === 0) {
            conversationArea.innerHTML = `
                <div class="conversation-welcome">
                    <h3>Hello, I'm ${this.assistantName}</h3>
                    <p>Your personal time management assistant. How can I help you today?</p>
                </div>
            `;
            return;
        }
        
        // Add messages from history
        this.conversationHistory.forEach(item => {
            const messageElement = document.createElement('div');
            messageElement.className = `conversation-message ${item.sender}-message`;
            
            // Format message with line breaks
            const formattedMessage = item.message.replace(/\n/g, '<br>');
            
            messageElement.innerHTML = `
                <div class="message-content">${formattedMessage}</div>
                <div class="message-time">${this.formatMessageTime(new Date(item.timestamp))}</div>
            `;
            
            conversationArea.appendChild(messageElement);
        });
        
        // Scroll to bottom
        conversationArea.scrollTop = conversationArea.scrollHeight;
    }
    
    saveConversationHistory() {
        localStorage.setItem('clockAssistantHistory', JSON.stringify(this.conversationHistory));
    }
    
    formatMessageTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    getCurrentDate() {
        const now = new Date();
        return now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
    
    toggleListening() {
        if (!this.recognition) {
            this.addAssistantMessage("Voice recognition is not supported in your browser.");
            return;
        }
        
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }
    
    startListening() {
        try {
            this.recognition.start();
            this.isListening = true;
            this.updateListeningState();
            this.animateAvatar('listening');
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            this.isListening = false;
            this.updateListeningState();
        }
    }
    
    stopListening() {
        try {
            this.recognition.stop();
            this.isListening = false;
            this.updateListeningState();
        } catch (error) {
            console.error('Error stopping speech recognition:', error);
        }
    }
    
    updateListeningState() {
        const micBtn = document.getElementById('assistantMicBtn');
        const statusIndicator = document.querySelector('.assistant-status-indicator');
        const statusText = document.querySelector('.assistant-status-text');
        
        if (this.isListening) {
            micBtn.classList.add('listening');
            statusIndicator.classList.add('listening');
            statusText.textContent = 'Listening...';
        } else {
            micBtn.classList.remove('listening');
            statusIndicator.classList.remove('listening');
            statusText.textContent = 'Ready';
        }
    }
    
    speak(text) {
        if (!this.speechSynthesis) return;
        
        // Stop any current speech
        this.stopSpeaking();
        
        // Create utterance
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set voice if specified
        if (this.assistantVoice !== null) {
            const voices = this.speechSynthesis.getVoices();
            if (voices.length > this.assistantVoice) {
                utterance.voice = voices[this.assistantVoice];
            }
        }
        
        // Set rate and volume
        utterance.rate = this.speechRate || 1.0;
        utterance.volume = this.speechVolume || 1.0;
        
        // Set event handlers
        utterance.onstart = () => {
            this.isSpeaking = true;
            this.animateAvatar('speaking');
        };
        
        utterance.onend = () => {
            this.isSpeaking = false;
            this.animateAvatar('idle');
        };
        
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            this.isSpeaking = false;
            this.animateAvatar('idle');
        };
        
        // Speak
        this.speechSynthesis.speak(utterance);
    }
    
    stopSpeaking() {
        if (!this.speechSynthesis) return;
        
        this.speechSynthesis.cancel();
        this.isSpeaking = false;
    }
    
    animateAvatar(state) {
        const avatar = document.querySelector('.assistant-avatar-face');
        const mouth = document.querySelector('.assistant-avatar-mouth');
        const eyes = document.querySelectorAll('.assistant-avatar-eye');
        
        // Reset all states
        avatar.classList.remove('thinking', 'speaking', 'listening', 'greeting');
        
        // Apply new state
        switch (state) {
            case 'thinking':
                avatar.classList.add('thinking');
                break;
                
            case 'speaking':
                avatar.classList.add('speaking');
                
                // Animate mouth
                if (!mouth.classList.contains('speaking')) {
                    mouth.classList.add('speaking');
                    
                    // Stop mouth animation when speech ends
                    setTimeout(() => {
                        if (!this.isSpeaking) {
                            mouth.classList.remove('speaking');
                        }
                    }, 3000);
                }
                break;
                
            case 'listening':
                avatar.classList.add('listening');
                break;
                
            case 'greeting':
                avatar.classList.add('greeting');
                
                // Blink eyes
                eyes.forEach(eye => {
                    eye.classList.add('blink');
                    
                    setTimeout(() => {
                        eye.classList.remove('blink');
                    }, 300);
                });
                break;
                
            default: // idle
                // Occasionally blink
                if (Math.random() < 0.1) {
                    eyes.forEach(eye => {
                        eye.classList.add('blink');
                        
                        setTimeout(() => {
                            eye.classList.remove('blink');
                        }, 300);
                    });
                }
                break;
        }
    }
    
    showNotification(title, message) {
        // Use notification system if available
        if (window.notificationSystem) {
            window.notificationSystem.addSystemNotification(title, message, 'system', 'icon-assistant');
        } else {
            // Fallback to alert
            alert(`${title}: ${message}`);
        }
    }
}

// Initialize AI assistant when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Add AI assistant CSS
    const aiAssistantCSS = `
        /* AI Assistant styles */
        .assistant-content {
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        
        /* Avatar */
        .assistant-avatar {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .assistant-avatar-circle {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(0, 120, 255, 0.2), rgba(0, 60, 120, 0.5));
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 0 20px rgba(0, 120, 255, 0.3);
            position: relative;
            overflow: hidden;
        }
        
        .assistant-avatar-face {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.2);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            position: relative;
        }
        
        .assistant-avatar-eyes {
            display: flex;
            justify-content: space-between;
            width: 30px;
            margin-bottom: 10px;
        }
        
        .assistant-avatar-eye {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: rgba(0, 200, 255, 0.8);
            transition: all 0.2s ease;
        }
        
        .assistant-avatar-eye.blink {
            transform: scaleY(0.1);
        }
        
        .assistant-avatar-mouth {
            width: 20px;
            height: 3px;
            background: rgba(0, 200, 255, 0.8);
            border-radius: 3px;
            transition: all 0.2s ease;
        }
        
        .assistant-avatar-mouth.speaking {
            animation: mouth-speak 0.5s infinite alternate;
        }
        
        .assistant-status {
            display: flex;
            align-items: center;
            margin-top: 10px;
        }
        
        .assistant-status-indicator {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: rgba(0, 255, 60, 0.8);
            margin-right: 5px;
        }
        
        .assistant-status-indicator.listening {
            background: rgba(255, 60, 0, 0.8);
            animation: pulse 1.5s infinite;
        }
        
        .assistant-status-text {
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.7);
        }
        
        /* Avatar animations */
        .assistant-avatar-face.thinking .assistant-avatar-eyes {
            animation: eyes-thinking 2s infinite;
        }
        
        .assistant-avatar-face.listening .assistant-avatar-mouth {
            animation: mouth-listening 1.5s infinite alternate;
        }
        
        .assistant-avatar-face.greeting .assistant-avatar-mouth {
            transform: scaleX(1.5);
            height: 4px;
        }
        
        /* Conversation area */
        .conversation-area {
            flex: 1;
            overflow-y: auto;
            padding: 10px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
            margin-bottom: 15px;
            max-height: 300px;
        }
        
        .conversation-welcome {
            text-align: center;
            padding: 20px;
            color: rgba(255, 255, 255, 0.8);
        }
        
        .conversation-welcome h3 {
            margin-bottom: 10px;
            color: var(--hologram-color, rgba(0, 120, 255, 0.8));
        }
        
        .conversation-message {
            margin-bottom: 15px;
            max-width: 80%;
            animation: message-appear 0.3s ease;
        }
        
        .user-message {
            margin-left: auto;
        }
        
        .assistant-message {
            margin-right: auto;
        }
        
        .message-content {
            padding: 10px;
            border-radius: 10px;
            word-wrap: break-word;
        }
        
        .user-message .message-content {
            background: rgba(0, 120, 255, 0.3);
            border-top-right-radius: 0;
        }
        
        .assistant-message .message-content {
            background: rgba(255, 255, 255, 0.1);
            border-top-left-radius: 0;
        }
        
        .message-time {
            font-size: 0.7rem;
            color: rgba(255, 255, 255, 0.5);
            margin-top: 5px;
            text-align: right;
        }
        
        /* Input area */
        .assistant-input-area {
            display: flex;
            margin-bottom: 15px;
        }
        
        #assistantInput {
            flex: 1;
            padding: 10px;
            border-radius: 20px;
            border: none;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            margin-right: 10px;
        }
        
        #assistantInput:focus {
            outline: none;
            background: rgba(255, 255, 255, 0.15);
        }
        
        .assistant-mic-btn, .assistant-send-btn {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: none;
            background: rgba(0, 120, 255, 0.5);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .assistant-mic-btn {
            margin-right: 10px;
        }
        
        .assistant-mic-btn:hover, .assistant-send-btn:hover {
            background: rgba(0, 150, 255, 0.7);
            transform: translateY(-2px);
        }
        
        .assistant-mic-btn.listening {
            background: rgba(255, 60, 0, 0.8);
            animation: pulse 1.5s infinite;
        }
        
        /* Quick actions */
        .assistant-quick-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .quick-action-btn {
            padding: 8px 15px;
            border-radius: 20px;
            border: none;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 0.9rem;
        }
        
        .quick-action-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
        }
        
        /* Settings */
        .assistant-settings {
            position: relative;
            align-self: flex-end;
        }
        
        .assistant-settings-btn {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: none;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .assistant-settings-btn:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        .assistant-settings-panel {
            position: absolute;
            bottom: 40px;
            right: 0;
            width: 250px;
            background: rgba(10, 20, 30, 0.95);
            border-radius: 10px;
            padding: 15px;
            display: none;
            z-index: 10;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        
        .assistant-settings-panel.active {
            display: block;
            animation: panel-appear 0.3s ease;
        }
        
        .settings-error {
            background: rgba(255, 50, 50, 0.2);
            color: rgba(255, 50, 50, 0.8);
            padding: 10px;
            border-radius: 5px;
            margin-top: 15px;
            font-size: 0.9rem;
        }
        
        /* Animations */
        @keyframes message-appear {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes panel-appear {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(255, 60, 0, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(255, 60, 0, 0); }
            100% { box-shadow: 0 0 0 0 rgba(255, 60, 0, 0); }
        }
        
        @keyframes mouth-speak {
            0% { height: 3px; width: 20px; }
            50% { height: 8px; width: 15px; }
            100% { height: 3px; width: 20px; }
        }
        
        @keyframes mouth-listening {
            0% { width: 10px; }
            100% { width: 25px; }
        }
        
        @keyframes eyes-thinking {
            0% { transform: translateX(0); }
            25% { transform: translateX(3px); }
            50% { transform: translateX(0); }
            75% { transform: translateX(-3px); }
            100% { transform: translateX(0); }
        }
    `;
    
    // Add CSS to document
    const styleElement = document.createElement('style');
    styleElement.textContent = aiAssistantCSS;
    document.head.appendChild(styleElement);
    
    // Initialize AI assistant
    window.aiAssistant = new AIAssistant();
});
