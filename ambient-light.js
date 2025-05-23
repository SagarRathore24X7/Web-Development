/**
 * Ambient Light Adaptation for Futuristic Clock
 * Automatically adjusts brightness and contrast based on ambient light conditions
 */

class AmbientLightAdaptation {
    constructor() {
        this.isLightSensorSupported = 'AmbientLightSensor' in window;
        this.isAutoModeEnabled = false;
        this.lightSensor = null;
        this.currentLightLevel = 100; // Default light level (0-100)
        this.nightModeEnabled = false;
        this.nightModeThreshold = 10; // Light level threshold for night mode
        this.lastLightUpdate = 0;
        this.updateInterval = 1000; // Minimum time between updates in ms
        
        // Create light adaptation button
        this.createLightButton();
        
        // Create light adaptation modal
        this.createLightModal();
        
        // Initialize light sensor if available
        this.initLightSensor();
    }
    
    createLightButton() {
        const controlsContainer = document.querySelector('.controls');
        const lightBtn = document.createElement('button');
        lightBtn.className = 'control-btn';
        lightBtn.id = 'lightBtn';
        lightBtn.innerHTML = '<span class="icon-light"></span> Light';
        
        // Add button to controls after customize button
        const customizeBtn = document.getElementById('customizeBtn');
        if (customizeBtn) {
            controlsContainer.insertBefore(lightBtn, customizeBtn.nextSibling);
        } else {
            controlsContainer.appendChild(lightBtn);
        }
        
        // Open light modal on button click
        lightBtn.addEventListener('click', () => {
            this.openLightModal();
        });
    }
    
    createLightModal() {
        // Create modal element
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'lightModal';
        
        // Create modal content
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Light Adaptation</h2>
                    <button class="close-modal" data-modal="lightModal">×</button>
                </div>
                <div class="light-options">
                    <div class="form-group">
                        <label>Auto Brightness</label>
                        <label class="switch">
                            <input type="checkbox" id="autoLightMode">
                            <span class="slider round"></span>
                        </label>
                        <div class="sensor-status" id="sensorStatus"></div>
                    </div>
                    
                    <div class="form-group">
                        <label>Brightness</label>
                        <div class="slider-container">
                            <input type="range" id="brightnessSlider" min="10" max="100" value="100" class="range-slider">
                            <span id="brightnessValue">100%</span>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Contrast</label>
                        <div class="slider-container">
                            <input type="range" id="contrastSlider" min="80" max="120" value="100" class="range-slider">
                            <span id="contrastValue">100%</span>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Night Mode</label>
                        <label class="switch">
                            <input type="checkbox" id="nightMode">
                            <span class="slider round"></span>
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label>Night Mode Threshold</label>
                        <div class="slider-container">
                            <input type="range" id="nightThresholdSlider" min="1" max="30" value="10" class="range-slider">
                            <span id="thresholdValue">10 lux</span>
                        </div>
                    </div>
                    
                    <div class="current-light-level">
                        <div class="light-indicator">
                            <div class="light-level-bar" id="lightLevelBar"></div>
                        </div>
                        <span id="lightLevelValue">Unknown</span>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to document
        document.body.appendChild(modal);
        
        // Add event listeners
        this.addLightEventListeners();
    }
    
    addLightEventListeners() {
        // Close modal button
        const closeBtn = document.querySelector('#lightModal .close-modal');
        closeBtn.addEventListener('click', () => {
            this.closeLightModal();
        });
        
        // Auto light mode toggle
        const autoLightToggle = document.getElementById('autoLightMode');
        autoLightToggle.addEventListener('change', (e) => {
            this.isAutoModeEnabled = e.target.checked;
            
            // Enable/disable manual brightness slider
            document.getElementById('brightnessSlider').disabled = this.isAutoModeEnabled;
            
            // Save preference
            localStorage.setItem('clockAutoLightMode', this.isAutoModeEnabled);
            
            if (this.isAutoModeEnabled) {
                this.initLightSensor();
            } else {
                this.stopLightSensor();
            }
        });
        
        // Brightness slider
        const brightnessSlider = document.getElementById('brightnessSlider');
        const brightnessValue = document.getElementById('brightnessValue');
        
        brightnessSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            brightnessValue.textContent = `${value}%`;
            this.applyBrightness(value);
            
            // Save preference if not in auto mode
            if (!this.isAutoModeEnabled) {
                localStorage.setItem('clockBrightness', value);
            }
        });
        
        // Contrast slider
        const contrastSlider = document.getElementById('contrastSlider');
        const contrastValue = document.getElementById('contrastValue');
        
        contrastSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            contrastValue.textContent = `${value}%`;
            this.applyContrast(value);
            
            // Save preference
            localStorage.setItem('clockContrast', value);
        });
        
        // Night mode toggle
        const nightModeToggle = document.getElementById('nightMode');
        nightModeToggle.addEventListener('change', (e) => {
            this.nightModeEnabled = e.target.checked;
            
            // Apply night mode immediately if enabled
            if (this.nightModeEnabled) {
                this.applyNightMode();
            } else {
                this.removeNightMode();
            }
            
            // Save preference
            localStorage.setItem('clockNightMode', this.nightModeEnabled);
        });
        
        // Night mode threshold slider
        const thresholdSlider = document.getElementById('nightThresholdSlider');
        const thresholdValue = document.getElementById('thresholdValue');
        
        thresholdSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            thresholdValue.textContent = `${value} lux`;
            this.nightModeThreshold = parseInt(value);
            
            // Save preference
            localStorage.setItem('clockNightThreshold', value);
            
            // Check if night mode should be applied based on new threshold
            this.checkNightMode();
        });
    }
    
    openLightModal() {
        const modal = document.getElementById('lightModal');
        modal.classList.add('active');
        
        // Update sensor status
        this.updateSensorStatus();
        
        // Update light level display
        this.updateLightLevelDisplay();
    }
    
    closeLightModal() {
        const modal = document.getElementById('lightModal');
        modal.classList.remove('active');
    }
    
    updateSensorStatus() {
        const sensorStatus = document.getElementById('sensorStatus');
        
        if (this.isLightSensorSupported) {
            sensorStatus.textContent = 'Light sensor available';
            sensorStatus.className = 'sensor-status available';
        } else {
            sensorStatus.textContent = 'Light sensor not available';
            sensorStatus.className = 'sensor-status unavailable';
            
            // Disable auto mode if sensor not available
            document.getElementById('autoLightMode').disabled = true;
        }
    }
    
    initLightSensor() {
        // Check if sensor is supported and auto mode is enabled
        if (!this.isLightSensorSupported || !this.isAutoModeEnabled) {
            // If not supported, use time-based adaptation as fallback
            this.initTimeBased();
            return;
        }
        
        try {
            // Request permission if needed
            if (navigator.permissions) {
                navigator.permissions.query({ name: 'ambient-light-sensor' })
                    .then(result => {
                        if (result.state === 'granted') {
                            this.startLightSensor();
                        } else {
                            console.log('Ambient light sensor permission not granted');
                            this.initTimeBased();
                        }
                    })
                    .catch(error => {
                        console.error('Error requesting ambient light sensor permission:', error);
                        this.initTimeBased();
                    });
            } else {
                // Try to start sensor directly
                this.startLightSensor();
            }
        } catch (error) {
            console.error('Error initializing ambient light sensor:', error);
            this.initTimeBased();
        }
    }
    
    startLightSensor() {
        try {
            this.lightSensor = new AmbientLightSensor({ frequency: 1 });
            
            this.lightSensor.addEventListener('reading', () => {
                const now = Date.now();
                
                // Limit update frequency
                if (now - this.lastLightUpdate > this.updateInterval) {
                    this.lastLightUpdate = now;
                    
                    // Get illuminance in lux
                    const lux = this.lightSensor.illuminance;
                    
                    // Convert lux to brightness percentage (0-100)
                    // Typical indoor lighting: 50-500 lux, bright daylight: 10,000+ lux
                    let brightness = 0;
                    
                    if (lux < 5) {
                        // Very dark: 10-30% brightness
                        brightness = 10 + (lux / 5) * 20;
                    } else if (lux < 50) {
                        // Dim indoor: 30-60% brightness
                        brightness = 30 + ((lux - 5) / 45) * 30;
                    } else if (lux < 500) {
                        // Normal indoor: 60-90% brightness
                        brightness = 60 + ((lux - 50) / 450) * 30;
                    } else {
                        // Bright: 90-100% brightness
                        brightness = 90 + Math.min(10, ((lux - 500) / 9500) * 10);
                    }
                    
                    // Round to nearest integer
                    brightness = Math.round(brightness);
                    
                    // Update current light level
                    this.currentLightLevel = brightness;
                    
                    // Apply brightness
                    this.applyBrightness(brightness);
                    
                    // Update light level display
                    this.updateLightLevelDisplay(lux);
                    
                    // Check if night mode should be applied
                    this.checkNightMode(lux);
                }
            });
            
            this.lightSensor.addEventListener('error', (event) => {
                console.error('Light sensor error:', event.error.message);
                this.initTimeBased();
            });
            
            this.lightSensor.start();
            
        } catch (error) {
            console.error('Error starting ambient light sensor:', error);
            this.initTimeBased();
        }
    }
    
    stopLightSensor() {
        if (this.lightSensor) {
            try {
                this.lightSensor.stop();
                this.lightSensor = null;
            } catch (error) {
                console.error('Error stopping light sensor:', error);
            }
        }
    }
    
    initTimeBased() {
        // Use time-based adaptation as fallback
        console.log('Using time-based light adaptation as fallback');
        
        // Update every minute
        setInterval(() => {
            if (!this.isAutoModeEnabled) return;
            
            const now = new Date();
            const hour = now.getHours();
            
            // Simulate light levels based on time of day
            let brightness;
            let simulatedLux;
            
            if (hour >= 22 || hour < 6) {
                // Night: 10-30% brightness
                brightness = 20;
                simulatedLux = 5;
            } else if (hour >= 6 && hour < 8) {
                // Dawn: 30-70% brightness
                const minute = now.getMinutes();
                const progress = (hour - 6) * 60 + minute;
                brightness = 30 + (progress / 120) * 40;
                simulatedLux = 20 + (progress / 120) * 180;
            } else if (hour >= 8 && hour < 18) {
                // Day: 70-100% brightness
                brightness = 70 + Math.sin((hour - 8) / 10 * Math.PI) * 30;
                simulatedLux = 200 + Math.sin((hour - 8) / 10 * Math.PI) * 300;
            } else if (hour >= 18 && hour < 22) {
                // Dusk: 70-30% brightness
                const minute = now.getMinutes();
                const progress = (hour - 18) * 60 + minute;
                brightness = 70 - (progress / 240) * 40;
                simulatedLux = 200 - (progress / 240) * 180;
            }
            
            // Round to nearest integer
            brightness = Math.round(brightness);
            simulatedLux = Math.round(simulatedLux);
            
            // Update current light level
            this.currentLightLevel = brightness;
            
            // Apply brightness
            this.applyBrightness(brightness);
            
            // Update light level display
            this.updateLightLevelDisplay(simulatedLux);
            
            // Check if night mode should be applied
            this.checkNightMode(simulatedLux);
            
        }, 60000); // Check every minute
        
        // Initial update
        const now = new Date();
        const hour = now.getHours();
        
        let brightness;
        let simulatedLux;
        
        if (hour >= 22 || hour < 6) {
            brightness = 20;
            simulatedLux = 5;
        } else if (hour >= 6 && hour < 8) {
            const minute = now.getMinutes();
            const progress = (hour - 6) * 60 + minute;
            brightness = 30 + (progress / 120) * 40;
            simulatedLux = 20 + (progress / 120) * 180;
        } else if (hour >= 8 && hour < 18) {
            brightness = 70 + Math.sin((hour - 8) / 10 * Math.PI) * 30;
            simulatedLux = 200 + Math.sin((hour - 8) / 10 * Math.PI) * 300;
        } else if (hour >= 18 && hour < 22) {
            const minute = now.getMinutes();
            const progress = (hour - 18) * 60 + minute;
            brightness = 70 - (progress / 240) * 40;
            simulatedLux = 200 - (progress / 240) * 180;
        }
        
        brightness = Math.round(brightness);
        simulatedLux = Math.round(simulatedLux);
        
        this.currentLightLevel = brightness;
        this.applyBrightness(brightness);
        this.updateLightLevelDisplay(simulatedLux);
        this.checkNightMode(simulatedLux);
    }
    
    updateLightLevelDisplay(lux = null) {
        const lightLevelBar = document.getElementById('lightLevelBar');
        const lightLevelValue = document.getElementById('lightLevelValue');
        
        if (lightLevelBar && lightLevelValue) {
            // Update bar width
            lightLevelBar.style.width = `${this.currentLightLevel}%`;
            
            // Update text value
            if (lux !== null) {
                lightLevelValue.textContent = `${lux} lux (${this.currentLightLevel}%)`;
            } else {
                lightLevelValue.textContent = `${this.currentLightLevel}%`;
            }
            
            // Update bar color based on light level
            if (this.currentLightLevel < 30) {
                lightLevelBar.style.backgroundColor = 'rgba(100, 100, 255, 0.8)';
            } else if (this.currentLightLevel < 70) {
                lightLevelBar.style.backgroundColor = 'rgba(100, 200, 255, 0.8)';
            } else {
                lightLevelBar.style.backgroundColor = 'rgba(255, 200, 100, 0.8)';
            }
        }
    }
    
    applyBrightness(brightness) {
        // Update brightness slider if in auto mode
        if (this.isAutoModeEnabled) {
            const brightnessSlider = document.getElementById('brightnessSlider');
            const brightnessValue = document.getElementById('brightnessValue');
            
            if (brightnessSlider && brightnessValue) {
                brightnessSlider.value = brightness;
                brightnessValue.textContent = `${brightness}%`;
            }
        }
        
        // Apply brightness to clock elements
        document.documentElement.style.setProperty('--brightness-filter', `brightness(${brightness / 100})`);
        
        // Apply combined filters
        this.applyCombinedFilters();
    }
    
    applyContrast(contrast) {
        // Apply contrast to clock elements
        document.documentElement.style.setProperty('--contrast-filter', `contrast(${contrast / 100})`);
        
        // Apply combined filters
        this.applyCombinedFilters();
    }
    
    applyCombinedFilters() {
        // Get current filter values
        const brightnessFilter = document.documentElement.style.getPropertyValue('--brightness-filter') || 'brightness(1)';
        const contrastFilter = document.documentElement.style.getPropertyValue('--contrast-filter') || 'contrast(1)';
        const nightModeFilter = document.documentElement.style.getPropertyValue('--night-mode-filter') || '';
        
        // Combine filters
        const combinedFilters = `${brightnessFilter} ${contrastFilter} ${nightModeFilter}`;
        
        // Apply to clock container and digital time
        const clockContainer = document.querySelector('.clock-container');
        const digitalTime = document.querySelector('.digital-time');
        const dateDisplay = document.querySelector('.date-display');
        const weatherWidget = document.querySelector('.weather-widget');
        
        if (clockContainer) clockContainer.style.filter = combinedFilters;
        if (digitalTime) digitalTime.style.filter = combinedFilters;
        if (dateDisplay) dateDisplay.style.filter = combinedFilters;
        if (weatherWidget) weatherWidget.style.filter = combinedFilters;
    }
    
    checkNightMode(lux = null) {
        if (!this.nightModeEnabled) return;
        
        // If lux is provided, check against threshold
        if (lux !== null) {
            if (lux <= this.nightModeThreshold) {
                this.applyNightMode();
            } else {
                this.removeNightMode();
            }
        } else {
            // If no lux value, use brightness level as approximation
            if (this.currentLightLevel <= 30) {
                this.applyNightMode();
            } else {
                this.removeNightMode();
            }
        }
    }
    
    applyNightMode() {
        // Apply night mode filter (red tint to preserve night vision)
        document.documentElement.style.setProperty('--night-mode-filter', 'sepia(0.5) hue-rotate(320deg)');
        
        // Apply combined filters
        this.applyCombinedFilters();
        
        // Add night mode class to body
        document.body.classList.add('night-mode');
    }
    
    removeNightMode() {
        // Remove night mode filter
        document.documentElement.style.setProperty('--night-mode-filter', '');
        
        // Apply combined filters
        this.applyCombinedFilters();
        
        // Remove night mode class from body
        document.body.classList.remove('night-mode');
    }
    
    loadSavedPreferences() {
        // Load auto light mode preference
        const savedAutoMode = localStorage.getItem('clockAutoLightMode');
        if (savedAutoMode !== null) {
            this.isAutoModeEnabled = savedAutoMode === 'true';
            document.getElementById('autoLightMode').checked = this.isAutoModeEnabled;
            document.getElementById('brightnessSlider').disabled = this.isAutoModeEnabled;
        }
        
        // Load brightness preference
        const savedBrightness = localStorage.getItem('clockBrightness');
        if (savedBrightness !== null && !this.isAutoModeEnabled) {
            const brightness = parseInt(savedBrightness);
            document.getElementById('brightnessSlider').value = brightness;
            document.getElementById('brightnessValue').textContent = `${brightness}%`;
            this.applyBrightness(brightness);
        }
        
        // Load contrast preference
        const savedContrast = localStorage.getItem('clockContrast');
        if (savedContrast !== null) {
            const contrast = parseInt(savedContrast);
            document.getElementById('contrastSlider').value = contrast;
            document.getElementById('contrastValue').textContent = `${contrast}%`;
            this.applyContrast(contrast);
        }
        
        // Load night mode preference
        const savedNightMode = localStorage.getItem('clockNightMode');
        if (savedNightMode !== null) {
            this.nightModeEnabled = savedNightMode === 'true';
            document.getElementById('nightMode').checked = this.nightModeEnabled;
        }
        
        // Load night mode threshold preference
        const savedThreshold = localStorage.getItem('clockNightThreshold');
        if (savedThreshold !== null) {
            this.nightModeThreshold = parseInt(savedThreshold);
            document.getElementById('nightThresholdSlider').value = this.nightModeThreshold;
            document.getElementById('thresholdValue').textContent = `${this.nightModeThreshold} lux`;
        }
        
        // Initialize light sensor if auto mode is enabled
        if (this.isAutoModeEnabled) {
            this.initLightSensor();
        }
    }
}

// Initialize ambient light adaptation when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Add ambient light adaptation CSS
    const ambientLightCSS = `
        /* Light adaptation styles */
        .light-options {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .slider-container {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .range-slider {
            flex-grow: 1;
            height: 10px;
            -webkit-appearance: none;
            appearance: none;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 5px;
            outline: none;
        }
        
        .range-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: var(--hologram-color, rgba(0, 120, 255, 0.8));
            cursor: pointer;
        }
        
        .range-slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: var(--hologram-color, rgba(0, 120, 255, 0.8));
            cursor: pointer;
            border: none;
        }
        
        .sensor-status {
            font-size: 0.8rem;
            margin-top: 5px;
        }
        
        .sensor-status.available {
            color: rgba(0, 255, 60, 0.8);
        }
        
        .sensor-status.unavailable {
            color: rgba(255, 100, 100, 0.8);
        }
        
        .current-light-level {
            margin-top: 20px;
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .light-indicator {
            width: 100%;
            height: 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            overflow: hidden;
        }
        
        .light-level-bar {
            height: 100%;
            width: 50%;
            background: rgba(100, 200, 255, 0.8);
            border-radius: 10px;
            transition: width 0.5s ease, background-color 0.5s ease;
        }
        
        /* Night mode styles */
        body.night-mode {
            background: linear-gradient(135deg, #1a0000 0%, #000000 100%) !important;
        }
        
        body.night-mode .clock {
            box-shadow: 0 0 20px rgba(255, 50, 50, 0.3),
                        inset 0 0 20px rgba(255, 50, 50, 0.1) !important;
        }
    `;
    
    // Add CSS to document
    const styleElement = document.createElement('style');
    styleElement.textContent = ambientLightCSS;
    document.head.appendChild(styleElement);
    
    // Add filter CSS variables
    document.documentElement.style.setProperty('--brightness-filter', 'brightness(1)');
    document.documentElement.style.setProperty('--contrast-filter', 'contrast(1)');
    document.documentElement.style.setProperty('--night-mode-filter', '');
    
    // Initialize ambient light adaptation
    const ambientLightAdaptation = new AmbientLightAdaptation();
    
    // Load saved preferences
    ambientLightAdaptation.loadSavedPreferences();
});
