/**
 * Voice Control System for Futuristic Clock
 * Implements speech recognition and voice commands
 */

class VoiceControlSystem {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.commands = {};
        this.synthesis = window.speechSynthesis;
        this.commandFeedback = document.createElement('div');
        this.commandFeedback.className = 'voice-feedback';
        document.body.appendChild(this.commandFeedback);
        
        this.initSpeechRecognition();
    }
    
    initSpeechRecognition() {
        // Check for browser support
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.error('Speech recognition not supported in this browser');
            return;
        }
        
        // Initialize speech recognition
        this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
        
        // Set up event handlers
        this.recognition.onstart = () => {
            this.isListening = true;
            this.showFeedback('Listening...');
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            this.hideFeedback();
            
            // Restart listening if in continuous mode
            if (this.continuousListening) {
                setTimeout(() => {
                    this.startListening();
                }, 1000);
            }
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.showFeedback('Error: ' + event.error);
            this.isListening = false;
        };
        
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase().trim();
            const confidence = event.results[0][0].confidence;
            
            console.log(`Voice command recognized: "${transcript}" (confidence: ${confidence})`);
            this.showFeedback(`"${transcript}"`);
            
            // Process the command
            this.processCommand(transcript);
        };
    }
    
    registerCommands(commandsObject) {
        this.commands = { ...this.commands, ...commandsObject };
    }
    
    processCommand(transcript) {
        let commandExecuted = false;
        
        // Check for wake word
        if (transcript.includes('hey clock') || transcript.includes('hey futuristic') || transcript.includes('hey time')) {
            transcript = transcript.replace(/hey clock|hey futuristic|hey time/g, '').trim();
        } else {
            // If no wake word and not in continuous mode, ignore
            if (!this.continuousListening) {
                return;
            }
        }
        
        // Process registered commands
        for (const [pattern, handler] of Object.entries(this.commands)) {
            const regex = new RegExp(pattern, 'i');
            if (regex.test(transcript)) {
                const match = transcript.match(regex);
                handler(match);
                commandExecuted = true;
                break;
            }
        }
        
        // If no command matched, provide feedback
        if (!commandExecuted) {
            this.speak("I didn't understand that command. Try again.");
        }
    }
    
    startListening(continuous = false) {
        if (this.isListening) return;
        
        this.continuousListening = continuous;
        
        try {
            this.recognition.start();
        } catch (error) {
            console.error('Error starting speech recognition:', error);
        }
    }
    
    stopListening() {
        if (!this.isListening) return;
        
        this.continuousListening = false;
        
        try {
            this.recognition.stop();
        } catch (error) {
            console.error('Error stopping speech recognition:', error);
        }
    }
    
    speak(text) {
        if (!this.synthesis) {
            console.error('Speech synthesis not supported');
            return;
        }
        
        // Stop any current speech
        this.synthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        // Get a more robotic/futuristic voice if available
        const voices = this.synthesis.getVoices();
        const preferredVoices = voices.filter(voice => 
            voice.name.includes('Google') || 
            voice.name.includes('Microsoft') ||
            voice.name.toLowerCase().includes('en-us')
        );
        
        if (preferredVoices.length > 0) {
            utterance.voice = preferredVoices[0];
        }
        
        this.synthesis.speak(utterance);
    }
    
    showFeedback(message) {
        this.commandFeedback.textContent = message;
        this.commandFeedback.classList.add('active');
    }
    
    hideFeedback() {
        setTimeout(() => {
            this.commandFeedback.classList.remove('active');
        }, 2000);
    }
}

// Initialize voice control when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Create voice control button
    const controlsContainer = document.querySelector('.controls');
    const voiceBtn = document.createElement('button');
    voiceBtn.className = 'control-btn';
    voiceBtn.id = 'voiceBtn';
    voiceBtn.innerHTML = '<span class="icon-voice"></span> Voice';
    
    // Add button to controls
    controlsContainer.appendChild(voiceBtn);
    
    // Initialize voice control system
    const voiceControl = new VoiceControlSystem();
    
    // Register commands
    voiceControl.registerCommands({
        // Theme commands
        'change (the )?theme to (neon )?blue': () => {
            document.getElementById('themeBtn').click();
            setTimeout(() => {
                document.querySelector('[data-theme="neon-blue"]').click();
                voiceControl.speak("Theme changed to Neon Blue");
            }, 500);
        },
        'change (the )?theme to (sunrise )?gold': () => {
            document.getElementById('themeBtn').click();
            setTimeout(() => {
                document.querySelector('[data-theme="sunrise-gold"]').click();
                voiceControl.speak("Theme changed to Sunrise Gold");
            }, 500);
        },
        'change (the )?theme to (matrix )?green': () => {
            document.getElementById('themeBtn').click();
            setTimeout(() => {
                document.querySelector('[data-theme="matrix-green"]').click();
                voiceControl.speak("Theme changed to Matrix Green");
            }, 500);
        },
        'change (the )?theme to monochrome': () => {
            document.getElementById('themeBtn').click();
            setTimeout(() => {
                document.querySelector('[data-theme="monochrome"]').click();
                voiceControl.speak("Theme changed to Monochrome");
            }, 500);
        },
        
        // Alarm commands
        'set (an )?alarm for (.+)': (match) => {
            const timeStr = match[2];
            document.getElementById('alarmBtn').click();
            
            setTimeout(() => {
                // Try to parse the time from natural language
                let alarmTime = parseTimeFromText(timeStr);
                if (alarmTime) {
                    document.getElementById('alarmTime').value = alarmTime;
                    document.getElementById('alarmTitle').value = "Voice Alarm";
                    document.querySelector('#alarmForm .btn-set').click();
                    voiceControl.speak(`Alarm set for ${alarmTime}`);
                } else {
                    voiceControl.speak("I couldn't understand that time format. Please try again.");
                }
            }, 500);
        },
        
        // Sound commands
        'turn (the )?sound (on|off)': (match) => {
            const action = match[2];
            document.getElementById('soundBtn').click();
            voiceControl.speak(`Sound turned ${action}`);
        },
        
        // Pomodoro commands
        'start (a )?pomodoro( timer)?': () => {
            document.getElementById('pomodoroBtn').click();
            setTimeout(() => {
                document.getElementById('start-pomodoro').click();
                voiceControl.speak("Pomodoro timer started");
            }, 500);
        },
        'set pomodoro (time )?to ([0-9]+) minutes': (match) => {
            const duration = match[2];
            document.getElementById('pomodoroBtn').click();
            setTimeout(() => {
                document.getElementById('pomodoro-duration').value = duration;
                voiceControl.speak(`Pomodoro time set to ${duration} minutes`);
            }, 500);
        },
        
        // Timezone commands
        'change (the )?timezone to (.+)': (match) => {
            const timezone = match[2].toLowerCase();
            document.getElementById('timezoneBtn').click();
            
            setTimeout(() => {
                const select = document.getElementById('timezone');
                let found = false;
                
                for (let i = 0; i < select.options.length; i++) {
                    const option = select.options[i];
                    const optionText = option.text.toLowerCase();
                    
                    if (optionText.includes(timezone)) {
                        select.selectedIndex = i;
                        select.dispatchEvent(new Event('change'));
                        found = true;
                        voiceControl.speak(`Timezone changed to ${option.text}`);
                        break;
                    }
                }
                
                if (!found) {
                    voiceControl.speak(`I couldn't find the timezone ${timezone}`);
                }
            }, 500);
        },
        
        // General commands
        'what time is it': () => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            voiceControl.speak(`The current time is ${timeStr}`);
        },
        'what is the date( today)?': () => {
            const now = new Date();
            const dateStr = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
            voiceControl.speak(`Today is ${dateStr}`);
        },
        'what is the weather': () => {
            const weatherTemp = document.querySelector('.weather-temp').textContent;
            const weatherCondition = document.querySelector('.weather-info div:last-child').textContent;
            voiceControl.speak(`The current weather is ${weatherTemp} and ${weatherCondition}`);
        },
        'help( me)?': () => {
            voiceControl.speak("You can ask me to change themes, set alarms, control sound, start pomodoro timers, or check the time, date, and weather.");
        }
    });
    
    // Toggle voice control on button click
    let voiceActive = false;
    voiceBtn.addEventListener('click', () => {
        if (voiceActive) {
            voiceControl.stopListening();
            voiceBtn.classList.remove('active');
            voiceActive = false;
        } else {
            voiceControl.speak("Voice control activated. How can I help you?");
            voiceControl.startListening(true);
            voiceBtn.classList.add('active');
            voiceActive = true;
        }
    });
    
    // Helper function to parse time from natural language
    function parseTimeFromText(timeStr) {
        // Try to extract hours and minutes from various formats
        
        // Format: "X:YY" or "X:YY AM/PM"
        const timeRegex = /(\d{1,2}):(\d{2})(\s*(am|pm))?/i;
        let match = timeStr.match(timeRegex);
        
        if (match) {
            let hours = parseInt(match[1]);
            const minutes = match[2];
            const ampm = match[3] ? match[3].trim().toLowerCase() : null;
            
            // Adjust hours for 24-hour format
            if (ampm) {
                if (ampm === 'pm' && hours < 12) {
                    hours += 12;
                } else if (ampm === 'am' && hours === 12) {
                    hours = 0;
                }
            }
            
            // Format for input value
            return `${hours.toString().padStart(2, '0')}:${minutes}`;
        }
        
        // Format: "X AM/PM"
        const hourRegex = /(\d{1,2})(\s*(am|pm))/i;
        match = timeStr.match(hourRegex);
        
        if (match) {
            let hours = parseInt(match[1]);
            const ampm = match[2].trim().toLowerCase();
            
            // Adjust hours for 24-hour format
            if (ampm === 'pm' && hours < 12) {
                hours += 12;
            } else if (ampm === 'am' && hours === 12) {
                hours = 0;
            }
            
            // Format for input value
            return `${hours.toString().padStart(2, '0')}:00`;
        }
        
        // Try to parse common time phrases
        if (timeStr.includes('noon')) {
            return '12:00';
        } else if (timeStr.includes('midnight')) {
            return '00:00';
        }
        
        return null;
    }
});
