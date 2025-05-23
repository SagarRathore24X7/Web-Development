/**
 * Gesture Control Support for Futuristic Clock
 * Allows users to control the clock using hand gestures captured by the device camera
 */

class GestureControlSystem {
    constructor() {
        this.isGestureEnabled = false;
        this.videoElement = null;
        this.canvasElement = null;
        this.canvasContext = null;
        this.videoStream = null;
        this.gestureDetectionInterval = null;
        this.lastGestureTime = 0;
        this.gestureCooldown = 1000; // Cooldown between gestures in ms
        this.gestureHistory = [];
        this.gestureHistoryMax = 5;
        this.isCalibrating = false;
        this.calibrationStep = 0;
        this.calibrationPoints = [];
        this.gestureThreshold = 50; // Minimum pixel movement to detect a gesture
        this.gestureAreaSize = 100; // Size of the gesture detection area
        
        // Create gesture control button
        this.createGestureButton();
        
        // Create gesture control modal
        this.createGestureModal();
    }
    
    createGestureButton() {
        const controlsContainer = document.querySelector('.controls');
        const gestureBtn = document.createElement('button');
        gestureBtn.className = 'control-btn';
        gestureBtn.id = 'gestureBtn';
        gestureBtn.innerHTML = '<span class="icon-gesture"></span> Gesture';
        
        // Add button to controls after light button
        const lightBtn = document.getElementById('lightBtn');
        if (lightBtn) {
            controlsContainer.insertBefore(gestureBtn, lightBtn.nextSibling);
        } else {
            controlsContainer.appendChild(gestureBtn);
        }
        
        // Open gesture modal on button click
        gestureBtn.addEventListener('click', () => {
            this.openGestureModal();
        });
    }
    
    createGestureModal() {
        // Create modal element
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'gestureModal';
        
        // Create modal content
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Gesture Control</h2>
                    <button class="close-modal" data-modal="gestureModal">×</button>
                </div>
                <div class="gesture-options">
                    <div class="form-group">
                        <label>Enable Gesture Control</label>
                        <label class="switch">
                            <input type="checkbox" id="enableGestures">
                            <span class="slider round"></span>
                        </label>
                    </div>
                    
                    <div class="gesture-preview">
                        <div class="video-container">
                            <video id="gestureVideo" autoplay playsinline muted></video>
                            <canvas id="gestureCanvas"></canvas>
                            <div class="gesture-overlay" id="gestureOverlay"></div>
                        </div>
                        <div class="gesture-status" id="gestureStatus">Gesture control inactive</div>
                    </div>
                    
                    <div class="gesture-instructions">
                        <h3>Available Gestures:</h3>
                        <ul>
                            <li><strong>Swipe Left:</strong> Change to previous theme</li>
                            <li><strong>Swipe Right:</strong> Change to next theme</li>
                            <li><strong>Swipe Up:</strong> Increase volume/brightness</li>
                            <li><strong>Swipe Down:</strong> Decrease volume/brightness</li>
                            <li><strong>Circle:</strong> Toggle holographic mode</li>
                            <li><strong>Two Finger Pinch:</strong> Toggle clock face design</li>
                        </ul>
                    </div>
                    
                    <button class="btn-set" id="calibrateGestures">Calibrate Gestures</button>
                </div>
            </div>
        `;
        
        // Add modal to document
        document.body.appendChild(modal);
        
        // Add event listeners
        this.addGestureEventListeners();
    }
    
    addGestureEventListeners() {
        // Close modal button
        const closeBtn = document.querySelector('#gestureModal .close-modal');
        closeBtn.addEventListener('click', () => {
            this.closeGestureModal();
        });
        
        // Enable gestures toggle
        const enableGesturesToggle = document.getElementById('enableGestures');
        enableGesturesToggle.addEventListener('change', (e) => {
            this.isGestureEnabled = e.target.checked;
            
            if (this.isGestureEnabled) {
                this.startGestureDetection();
            } else {
                this.stopGestureDetection();
            }
            
            // Save preference
            localStorage.setItem('clockGestureEnabled', this.isGestureEnabled);
        });
        
        // Calibrate gestures button
        const calibrateBtn = document.getElementById('calibrateGestures');
        calibrateBtn.addEventListener('click', () => {
            this.startCalibration();
        });
    }
    
    openGestureModal() {
        const modal = document.getElementById('gestureModal');
        modal.classList.add('active');
        
        // Initialize video and canvas elements
        this.videoElement = document.getElementById('gestureVideo');
        this.canvasElement = document.getElementById('gestureCanvas');
        this.canvasContext = this.canvasElement.getContext('2d');
        
        // Start camera if gesture control is enabled
        if (this.isGestureEnabled) {
            this.startCamera();
        }
    }
    
    closeGestureModal() {
        const modal = document.getElementById('gestureModal');
        modal.classList.remove('active');
        
        // Stop camera when modal is closed
        this.stopCamera();
    }
    
    startCamera() {
        if (this.videoStream) return;
        
        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.updateGestureStatus('Camera access not supported in this browser', 'error');
            return;
        }
        
        // Request camera access
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 320, height: 240 } })
            .then(stream => {
                this.videoElement.srcObject = stream;
                this.videoStream = stream;
                
                // Set canvas size to match video
                this.videoElement.onloadedmetadata = () => {
                    this.canvasElement.width = this.videoElement.videoWidth;
                    this.canvasElement.height = this.videoElement.videoHeight;
                };
                
                this.updateGestureStatus('Camera active', 'success');
            })
            .catch(error => {
                console.error('Error accessing camera:', error);
                this.updateGestureStatus('Camera access denied', 'error');
            });
    }
    
    stopCamera() {
        if (!this.videoStream) return;
        
        // Stop all video tracks
        this.videoStream.getTracks().forEach(track => track.stop());
        this.videoStream = null;
        
        // Clear video source
        if (this.videoElement) {
            this.videoElement.srcObject = null;
        }
        
        this.updateGestureStatus('Gesture control inactive', 'inactive');
    }
    
    startGestureDetection() {
        if (this.gestureDetectionInterval) return;
        
        // Start camera
        this.startCamera();
        
        // Update status
        this.updateGestureStatus('Gesture detection active', 'success');
        
        // Start detection interval
        this.gestureDetectionInterval = setInterval(() => {
            if (!this.videoElement || !this.canvasElement || !this.videoStream) return;
            
            // Capture current frame
            this.canvasContext.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);
            
            // Process frame for gesture detection
            this.detectGestures();
            
        }, 100); // Check every 100ms
        
        // Update button state
        const gestureBtn = document.getElementById('gestureBtn');
        if (gestureBtn) {
            gestureBtn.classList.add('active');
        }
    }
    
    stopGestureDetection() {
        if (!this.gestureDetectionInterval) return;
        
        // Clear detection interval
        clearInterval(this.gestureDetectionInterval);
        this.gestureDetectionInterval = null;
        
        // Stop camera if modal is not open
        if (!document.getElementById('gestureModal').classList.contains('active')) {
            this.stopCamera();
        }
        
        // Update status
        this.updateGestureStatus('Gesture detection inactive', 'inactive');
        
        // Update button state
        const gestureBtn = document.getElementById('gestureBtn');
        if (gestureBtn) {
            gestureBtn.classList.remove('active');
        }
    }
    
    detectGestures() {
        if (this.isCalibrating) return;
        
        // Get current frame data
        const imageData = this.canvasContext.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height);
        const data = imageData.data;
        
        // Simple motion detection by comparing with previous frame
        // In a real implementation, this would use more sophisticated algorithms
        // such as optical flow or machine learning-based gesture recognition
        
        // For this demo, we'll use a simplified approach:
        // 1. Detect significant movement in different regions of the frame
        // 2. Determine gesture direction based on movement patterns
        
        // Divide the frame into regions
        const centerX = this.canvasElement.width / 2;
        const centerY = this.canvasElement.height / 2;
        const regionSize = this.gestureAreaSize;
        
        // Check for movement in different regions
        const leftRegion = this.detectMovementInRegion(data, centerX - regionSize, centerY, regionSize, regionSize);
        const rightRegion = this.detectMovementInRegion(data, centerX, centerY, regionSize, regionSize);
        const topRegion = this.detectMovementInRegion(data, centerX, centerY - regionSize, regionSize, regionSize);
        const bottomRegion = this.detectMovementInRegion(data, centerX, centerY, regionSize, regionSize);
        
        // Determine gesture based on movement patterns
        const now = Date.now();
        if (now - this.lastGestureTime < this.gestureCooldown) return;
        
        // Detect horizontal swipes
        if (leftRegion > this.gestureThreshold && rightRegion < this.gestureThreshold / 2) {
            this.handleGesture('swipe-left');
            this.lastGestureTime = now;
        } else if (rightRegion > this.gestureThreshold && leftRegion < this.gestureThreshold / 2) {
            this.handleGesture('swipe-right');
            this.lastGestureTime = now;
        }
        
        // Detect vertical swipes
        if (topRegion > this.gestureThreshold && bottomRegion < this.gestureThreshold / 2) {
            this.handleGesture('swipe-up');
            this.lastGestureTime = now;
        } else if (bottomRegion > this.gestureThreshold && topRegion < this.gestureThreshold / 2) {
            this.handleGesture('swipe-down');
            this.lastGestureTime = now;
        }
        
        // More complex gestures would require tracking motion over time
        // and analyzing the pattern of movement
    }
    
    detectMovementInRegion(imageData, x, y, width, height) {
        // In a real implementation, this would compare current frame with previous frame
        // and calculate the amount of movement in the specified region
        
        // For this demo, we'll use a simplified approach that detects
        // changes in pixel brightness as a proxy for movement
        
        // This is a placeholder implementation
        // In a real system, you would use more sophisticated algorithms
        
        // Return a random value for demonstration purposes
        // In a real implementation, this would return actual movement detection
        return Math.random() * 100;
    }
    
    handleGesture(gestureType) {
        // Add gesture to history
        this.gestureHistory.push({
            type: gestureType,
            time: Date.now()
        });
        
        // Limit history size
        if (this.gestureHistory.length > this.gestureHistoryMax) {
            this.gestureHistory.shift();
        }
        
        // Update status
        this.updateGestureStatus(`Detected: ${gestureType}`, 'detected');
        
        // Perform action based on gesture
        switch (gestureType) {
            case 'swipe-left':
                this.performAction('previous-theme');
                break;
            case 'swipe-right':
                this.performAction('next-theme');
                break;
            case 'swipe-up':
                this.performAction('increase-brightness');
                break;
            case 'swipe-down':
                this.performAction('decrease-brightness');
                break;
            case 'circle':
                this.performAction('toggle-hologram');
                break;
            case 'pinch':
                this.performAction('toggle-design');
                break;
        }
    }
    
    performAction(action) {
        // Perform action based on gesture
        switch (action) {
            case 'previous-theme':
                this.cycleToPreviousTheme();
                break;
            case 'next-theme':
                this.cycleToNextTheme();
                break;
            case 'increase-brightness':
                this.adjustBrightness(10);
                break;
            case 'decrease-brightness':
                this.adjustBrightness(-10);
                break;
            case 'toggle-hologram':
                this.toggleHologram();
                break;
            case 'toggle-design':
                this.cycleClockDesign();
                break;
        }
    }
    
    cycleToPreviousTheme() {
        const themes = ['neon-blue', 'sunrise-gold', 'matrix-green', 'monochrome'];
        const currentTheme = document.body.className;
        const currentIndex = themes.indexOf(currentTheme);
        const previousIndex = (currentIndex - 1 + themes.length) % themes.length;
        
        // Apply previous theme
        document.body.className = themes[previousIndex];
        
        // Save preference
        localStorage.setItem('clockTheme', themes[previousIndex]);
        
        // Show notification
        this.showGestureNotification(`Theme changed to ${themes[previousIndex].replace('-', ' ')}`);
    }
    
    cycleToNextTheme() {
        const themes = ['neon-blue', 'sunrise-gold', 'matrix-green', 'monochrome'];
        const currentTheme = document.body.className;
        const currentIndex = themes.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        
        // Apply next theme
        document.body.className = themes[nextIndex];
        
        // Save preference
        localStorage.setItem('clockTheme', themes[nextIndex]);
        
        // Show notification
        this.showGestureNotification(`Theme changed to ${themes[nextIndex].replace('-', ' ')}`);
    }
    
    adjustBrightness(amount) {
        // Get current brightness
        const brightnessSlider = document.getElementById('brightnessSlider');
        if (!brightnessSlider) return;
        
        const currentBrightness = parseInt(brightnessSlider.value);
        const newBrightness = Math.max(10, Math.min(100, currentBrightness + amount));
        
        // Update brightness
        brightnessSlider.value = newBrightness;
        
        // Trigger input event to apply brightness
        brightnessSlider.dispatchEvent(new Event('input'));
        
        // Show notification
        this.showGestureNotification(`Brightness: ${newBrightness}%`);
    }
    
    toggleHologram() {
        const hologramBtn = document.getElementById('hologramBtn');
        if (!hologramBtn) return;
        
        // Click hologram button
        hologramBtn.click();
        
        // Show notification
        const isActive = hologramBtn.classList.contains('active');
        this.showGestureNotification(`Hologram mode ${isActive ? 'enabled' : 'disabled'}`);
    }
    
    cycleClockDesign() {
        const designs = ['classic', 'minimal', 'binary', 'futuristic'];
        
        // Find current design
        let currentDesign = 'classic';
        for (const design of designs) {
            if (document.querySelector('.clock').classList.contains(`${design}-design`)) {
                currentDesign = design;
                break;
            }
        }
        
        // Get next design
        const currentIndex = designs.indexOf(currentDesign);
        const nextIndex = (currentIndex + 1) % designs.length;
        const nextDesign = designs[nextIndex];
        
        // Apply next design
        const designOption = document.querySelector(`.design-option[data-design="${nextDesign}"]`);
        if (designOption) {
            // Open customize modal if not already open
            const customizeModal = document.getElementById('customizeModal');
            const wasModalClosed = !customizeModal.classList.contains('active');
            
            if (wasModalClosed) {
                document.getElementById('customizeBtn').click();
            }
            
            // Click design option
            setTimeout(() => {
                designOption.click();
                
                // Close modal if it was closed before
                if (wasModalClosed) {
                    setTimeout(() => {
                        document.querySelector('#customizeModal .close-modal').click();
                    }, 500);
                }
            }, 300);
        }
        
        // Show notification
        this.showGestureNotification(`Clock design: ${nextDesign}`);
    }
    
    startCalibration() {
        if (!this.videoElement || !this.canvasElement || !this.videoStream) {
            this.startCamera();
            
            // Wait for camera to initialize
            setTimeout(() => {
                this.startCalibration();
            }, 1000);
            return;
        }
        
        this.isCalibrating = true;
        this.calibrationStep = 0;
        this.calibrationPoints = [];
        
        // Update status
        this.updateGestureStatus('Calibration started. Follow the instructions.', 'calibrating');
        
        // Start calibration sequence
        this.showCalibrationStep();
    }
    
    showCalibrationStep() {
        const overlay = document.getElementById('gestureOverlay');
        
        switch (this.calibrationStep) {
            case 0:
                overlay.innerHTML = '<div class="calibration-target center">Look at the camera and place your hand in the center</div>';
                overlay.className = 'gesture-overlay calibrating';
                break;
            case 1:
                overlay.innerHTML = '<div class="calibration-target left">Move your hand to the left</div>';
                break;
            case 2:
                overlay.innerHTML = '<div class="calibration-target right">Move your hand to the right</div>';
                break;
            case 3:
                overlay.innerHTML = '<div class="calibration-target top">Move your hand up</div>';
                break;
            case 4:
                overlay.innerHTML = '<div class="calibration-target bottom">Move your hand down</div>';
                break;
            case 5:
                // Calibration complete
                overlay.innerHTML = '';
                overlay.className = 'gesture-overlay';
                this.finishCalibration();
                return;
        }
        
        // Capture calibration point after a delay
        setTimeout(() => {
            // In a real implementation, this would capture the current hand position
            // For this demo, we'll just simulate it
            this.calibrationPoints.push({
                step: this.calibrationStep,
                position: { x: Math.random() * 100, y: Math.random() * 100 }
            });
            
            // Move to next step
            this.calibrationStep++;
            this.showCalibrationStep();
        }, 2000);
    }
    
    finishCalibration() {
        // In a real implementation, this would use the calibration points
        // to improve gesture detection accuracy
        
        // For this demo, we'll just adjust the threshold based on the number of points
        this.gestureThreshold = 30 + (this.calibrationPoints.length * 5);
        
        this.isCalibrating = false;
        
        // Update status
        this.updateGestureStatus('Calibration complete. Gesture detection active.', 'success');
        
        // Show notification
        this.showGestureNotification('Gesture calibration complete');
    }
    
    updateGestureStatus(message, status = 'info') {
        const statusElement = document.getElementById('gestureStatus');
        if (!statusElement) return;
        
        statusElement.textContent = message;
        statusElement.className = `gesture-status ${status}`;
    }
    
    showGestureNotification(message) {
        // Create or get notification element
        let notification = document.querySelector('.gesture-notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'gesture-notification';
            document.body.appendChild(notification);
        }
        
        // Update message
        notification.textContent = message;
        notification.classList.add('show');
        
        // Hide after delay
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }
    
    loadSavedPreferences() {
        // Load gesture enabled preference
        const savedGestureEnabled = localStorage.getItem('clockGestureEnabled');
        if (savedGestureEnabled !== null) {
            this.isGestureEnabled = savedGestureEnabled === 'true';
            document.getElementById('enableGestures').checked = this.isGestureEnabled;
            
            // Start gesture detection if enabled
            if (this.isGestureEnabled) {
                this.startGestureDetection();
            }
        }
    }
}

// Initialize gesture control when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Add gesture control CSS
    const gestureControlCSS = `
        /* Gesture control styles */
        .gesture-options {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .gesture-preview {
            width: 100%;
            margin: 15px 0;
        }
        
        .video-container {
            position: relative;
            width: 100%;
            height: 240px;
            background: #000;
            border-radius: 10px;
            overflow: hidden;
        }
        
        #gestureVideo {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        #gestureCanvas {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: none; /* Hidden canvas for processing */
        }
        
        .gesture-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
        }
        
        .gesture-overlay.calibrating {
            background: rgba(0, 0, 0, 0.5);
        }
        
        .calibration-target {
            position: absolute;
            width: 80px;
            height: 80px;
            border-radius: 50%;
            border: 2px solid var(--hologram-color, rgba(0, 120, 255, 0.8));
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
            font-size: 0.8rem;
            color: white;
            animation: pulse 1.5s infinite;
        }
        
        .calibration-target.center {
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        
        .calibration-target.left {
            top: 50%;
            left: 20%;
            transform: translate(-50%, -50%);
        }
        
        .calibration-target.right {
            top: 50%;
            left: 80%;
            transform: translate(-50%, -50%);
        }
        
        .calibration-target.top {
            top: 20%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        
        .calibration-target.bottom {
            top: 80%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        
        .gesture-status {
            margin-top: 10px;
            padding: 8px;
            border-radius: 5px;
            text-align: center;
            font-size: 0.9rem;
        }
        
        .gesture-status.success {
            background: rgba(0, 255, 60, 0.2);
            color: rgba(0, 255, 60, 0.8);
        }
        
        .gesture-status.error {
            background: rgba(255, 50, 50, 0.2);
            color: rgba(255, 50, 50, 0.8);
        }
        
        .gesture-status.detected {
            background: rgba(0, 120, 255, 0.2);
            color: rgba(0, 120, 255, 0.8);
        }
        
        .gesture-status.calibrating {
            background: rgba(255, 180, 0, 0.2);
            color: rgba(255, 180, 0, 0.8);
        }
        
        .gesture-status.inactive {
            background: rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.6);
        }
        
        .gesture-instructions {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            padding: 15px;
        }
        
        .gesture-instructions h3 {
            margin-top: 0;
            margin-bottom: 10px;
            font-size: 1rem;
        }
        
        .gesture-instructions ul {
            margin: 0;
            padding-left: 20px;
        }
        
        .gesture-instructions li {
            margin-bottom: 5px;
            font-size: 0.9rem;
        }
        
        .gesture-notification {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 30px;
            font-size: 0.9rem;
            z-index: 1000;
            transition: transform 0.3s ease;
            backdrop-filter: blur(5px);
            border: 1px solid var(--hologram-color, rgba(0, 120, 255, 0.5));
            box-shadow: 0 0 15px var(--hologram-color, rgba(0, 120, 255, 0.3));
        }
        
        .gesture-notification.show {
            transform: translateX(-50%) translateY(0);
        }
    `;
    
    // Add CSS to document
    const styleElement = document.createElement('style');
    styleElement.textContent = gestureControlCSS;
    document.head.appendChild(styleElement);
    
    // Initialize gesture control
    const gestureControl = new GestureControlSystem();
    
    // Load saved preferences
    gestureControl.loadSavedPreferences();
});
