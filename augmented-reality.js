/**
 * Augmented Reality Features for Futuristic Clock
 * Overlays clock information on real-world environment using device camera
 */

class AugmentedRealitySystem {
    constructor() {
        this.isAREnabled = false;
        this.videoElement = null;
        this.canvasElement = null;
        this.canvasContext = null;
        this.videoStream = null;
        this.arOverlay = null;
        this.arMode = 'basic'; // 'basic', 'environment', 'full'
        this.arUpdateInterval = null;
        this.lastMarkerPosition = null;
        this.isCalibrating = false;
        this.calibrationStep = 0;
        this.calibrationPoints = [];
        
        // Create AR button
        this.createARButton();
        
        // Create AR modal
        this.createARModal();
    }
    
    createARButton() {
        const controlsContainer = document.querySelector('.controls');
        const arBtn = document.createElement('button');
        arBtn.className = 'control-btn';
        arBtn.id = 'arBtn';
        arBtn.innerHTML = '<span class="icon-ar"></span> AR Mode';
        
        // Add button to controls after notification button
        const notificationBtn = document.getElementById('notificationBtn');
        if (notificationBtn) {
            controlsContainer.insertBefore(arBtn, notificationBtn.nextSibling);
        } else {
            controlsContainer.appendChild(arBtn);
        }
        
        // Open AR modal on button click
        arBtn.addEventListener('click', () => {
            this.openARModal();
        });
    }
    
    createARModal() {
        // Create modal element
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'arModal';
        
        // Create modal content
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Augmented Reality</h2>
                    <button class="close-modal" data-modal="arModal">×</button>
                </div>
                <div class="ar-options">
                    <div class="form-group">
                        <label>Enable AR Mode</label>
                        <label class="switch">
                            <input type="checkbox" id="enableAR">
                            <span class="slider round"></span>
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label>AR Mode</label>
                        <div class="ar-mode-selector">
                            <button class="ar-mode-btn active" data-mode="basic">Basic</button>
                            <button class="ar-mode-btn" data-mode="environment">Environment</button>
                            <button class="ar-mode-btn" data-mode="full">Full AR</button>
                        </div>
                    </div>
                    
                    <div class="ar-preview">
                        <div class="video-container">
                            <video id="arVideo" autoplay playsinline muted></video>
                            <canvas id="arCanvas"></canvas>
                            <div class="ar-overlay" id="arOverlay"></div>
                        </div>
                        <div class="ar-status" id="arStatus">AR mode inactive</div>
                    </div>
                    
                    <div class="ar-instructions">
                        <h3>AR Mode Instructions:</h3>
                        <ul>
                            <li><strong>Basic:</strong> Overlays time and date on camera view</li>
                            <li><strong>Environment:</strong> Adapts clock to environment lighting and colors</li>
                            <li><strong>Full AR:</strong> Projects clock as 3D object in your environment</li>
                        </ul>
                        <p>For best results, ensure good lighting and point camera at a flat surface.</p>
                    </div>
                    
                    <button class="btn-set" id="calibrateAR">Calibrate AR</button>
                    <button class="btn-set" id="toggleARFullscreen">Fullscreen AR</button>
                </div>
            </div>
        `;
        
        // Add modal to document
        document.body.appendChild(modal);
        
        // Add event listeners
        this.addAREventListeners();
    }
    
    addAREventListeners() {
        // Close modal button
        const closeBtn = document.querySelector('#arModal .close-modal');
        closeBtn.addEventListener('click', () => {
            this.closeARModal();
        });
        
        // Enable AR toggle
        const enableARToggle = document.getElementById('enableAR');
        enableARToggle.addEventListener('change', (e) => {
            this.isAREnabled = e.target.checked;
            
            if (this.isAREnabled) {
                this.startAR();
            } else {
                this.stopAR();
            }
            
            // Save preference
            localStorage.setItem('clockAREnabled', this.isAREnabled);
        });
        
        // AR mode buttons
        const arModeButtons = document.querySelectorAll('.ar-mode-btn');
        arModeButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                arModeButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Set AR mode
                this.arMode = button.dataset.mode;
                
                // Save preference
                localStorage.setItem('clockARMode', this.arMode);
                
                // Update AR if enabled
                if (this.isAREnabled) {
                    this.updateAROverlay();
                }
            });
        });
        
        // Calibrate AR button
        const calibrateBtn = document.getElementById('calibrateAR');
        calibrateBtn.addEventListener('click', () => {
            this.startCalibration();
        });
        
        // Fullscreen AR button
        const fullscreenBtn = document.getElementById('toggleARFullscreen');
        fullscreenBtn.addEventListener('click', () => {
            this.toggleFullscreen();
        });
    }
    
    openARModal() {
        const modal = document.getElementById('arModal');
        modal.classList.add('active');
        
        // Initialize video and canvas elements
        this.videoElement = document.getElementById('arVideo');
        this.canvasElement = document.getElementById('arCanvas');
        this.canvasContext = this.canvasElement.getContext('2d');
        this.arOverlay = document.getElementById('arOverlay');
        
        // Start camera if AR is enabled
        if (this.isAREnabled) {
            this.startCamera();
        }
    }
    
    closeARModal() {
        const modal = document.getElementById('arModal');
        modal.classList.remove('active');
        
        // Stop camera if not in fullscreen mode
        if (!document.fullscreenElement) {
            this.stopCamera();
        }
    }
    
    startCamera() {
        if (this.videoStream) return;
        
        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.updateARStatus('Camera access not supported in this browser', 'error');
            return;
        }
        
        // Set camera constraints based on AR mode
        const constraints = {
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };
        
        // Use environment camera for environment and full AR modes
        if (this.arMode === 'environment' || this.arMode === 'full') {
            constraints.video.facingMode = { ideal: 'environment' };
        }
        
        // Request camera access
        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                this.videoElement.srcObject = stream;
                this.videoStream = stream;
                
                // Set canvas size to match video
                this.videoElement.onloadedmetadata = () => {
                    this.canvasElement.width = this.videoElement.videoWidth;
                    this.canvasElement.height = this.videoElement.videoHeight;
                    
                    // Start AR processing
                    this.startARProcessing();
                };
                
                this.updateARStatus('Camera active', 'success');
            })
            .catch(error => {
                console.error('Error accessing camera:', error);
                this.updateARStatus('Camera access denied', 'error');
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
        
        this.updateARStatus('AR mode inactive', 'inactive');
    }
    
    startAR() {
        // Start camera
        this.startCamera();
        
        // Update button state
        const arBtn = document.getElementById('arBtn');
        if (arBtn) {
            arBtn.classList.add('active');
        }
    }
    
    stopAR() {
        // Stop camera
        this.stopCamera();
        
        // Stop AR processing
        if (this.arUpdateInterval) {
            clearInterval(this.arUpdateInterval);
            this.arUpdateInterval = null;
        }
        
        // Clear AR overlay
        if (this.arOverlay) {
            this.arOverlay.innerHTML = '';
        }
        
        // Update button state
        const arBtn = document.getElementById('arBtn');
        if (arBtn) {
            arBtn.classList.remove('active');
        }
    }
    
    startARProcessing() {
        if (this.arUpdateInterval) {
            clearInterval(this.arUpdateInterval);
        }
        
        // Create initial AR overlay
        this.updateAROverlay();
        
        // Update AR overlay every 100ms
        this.arUpdateInterval = setInterval(() => {
            if (this.isCalibrating) return;
            
            // Process video frame for AR
            this.processVideoFrame();
            
            // Update AR overlay
            this.updateAROverlay();
        }, 100);
    }
    
    processVideoFrame() {
        if (!this.canvasContext || !this.videoElement) return;
        
        // Draw current video frame to canvas
        this.canvasContext.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);
        
        // Get image data for processing
        const imageData = this.canvasContext.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height);
        
        // Process image data based on AR mode
        if (this.arMode === 'environment' || this.arMode === 'full') {
            // Analyze environment lighting and colors
            const environmentData = this.analyzeEnvironment(imageData);
            
            // Apply environment data to clock
            this.applyEnvironmentData(environmentData);
        }
        
        if (this.arMode === 'full') {
            // Detect surfaces for 3D projection
            this.detectSurfaces(imageData);
        }
    }
    
    analyzeEnvironment(imageData) {
        // Simple environment analysis
        // In a real implementation, this would use more sophisticated algorithms
        
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        
        // Sample pixels to determine average brightness and color
        let totalBrightness = 0;
        let totalRed = 0;
        let totalGreen = 0;
        let totalBlue = 0;
        
        // Sample every 20th pixel for performance
        const sampleStep = 20;
        let sampleCount = 0;
        
        for (let y = 0; y < height; y += sampleStep) {
            for (let x = 0; x < width; x += sampleStep) {
                const i = (y * width + x) * 4;
                
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                // Calculate brightness (simple average)
                const brightness = (r + g + b) / 3;
                
                totalBrightness += brightness;
                totalRed += r;
                totalGreen += g;
                totalBlue += b;
                
                sampleCount++;
            }
        }
        
        // Calculate averages
        const avgBrightness = totalBrightness / sampleCount;
        const avgRed = totalRed / sampleCount;
        const avgGreen = totalGreen / sampleCount;
        const avgBlue = totalBlue / sampleCount;
        
        // Determine dominant color
        const maxColor = Math.max(avgRed, avgGreen, avgBlue);
        let dominantColor = 'neutral';
        
        if (maxColor === avgRed && avgRed > avgGreen * 1.2 && avgRed > avgBlue * 1.2) {
            dominantColor = 'red';
        } else if (maxColor === avgGreen && avgGreen > avgRed * 1.2 && avgGreen > avgBlue * 1.2) {
            dominantColor = 'green';
        } else if (maxColor === avgBlue && avgBlue > avgRed * 1.2 && avgBlue > avgGreen * 1.2) {
            dominantColor = 'blue';
        } else if (avgRed > 200 && avgGreen > 200 && avgBlue < 100) {
            dominantColor = 'yellow';
        } else if (avgRed > 200 && avgGreen < 100 && avgBlue > 200) {
            dominantColor = 'purple';
        } else if (avgRed < 100 && avgGreen > 200 && avgBlue > 200) {
            dominantColor = 'cyan';
        }
        
        // Determine lighting condition
        let lighting = 'normal';
        
        if (avgBrightness < 50) {
            lighting = 'dark';
        } else if (avgBrightness > 200) {
            lighting = 'bright';
        }
        
        return {
            brightness: avgBrightness,
            dominantColor,
            lighting,
            colorValues: {
                red: avgRed,
                green: avgGreen,
                blue: avgBlue
            }
        };
    }
    
    applyEnvironmentData(environmentData) {
        // Apply environment data to clock appearance
        
        // Adjust brightness based on environment
        let brightness = 100;
        
        if (environmentData.lighting === 'dark') {
            brightness = 70; // Dimmer in dark environments
        } else if (environmentData.lighting === 'bright') {
            brightness = 100; // Full brightness in bright environments
        }
        
        // Apply brightness to AR overlay
        this.arOverlay.style.filter = `brightness(${brightness / 100})`;
        
        // Adjust colors based on dominant environment color
        let accentColor = 'rgba(0, 120, 255, 0.8)'; // Default blue
        
        switch (environmentData.dominantColor) {
            case 'red':
                accentColor = 'rgba(255, 60, 60, 0.8)';
                break;
            case 'green':
                accentColor = 'rgba(60, 255, 100, 0.8)';
                break;
            case 'blue':
                accentColor = 'rgba(60, 100, 255, 0.8)';
                break;
            case 'yellow':
                accentColor = 'rgba(255, 230, 60, 0.8)';
                break;
            case 'purple':
                accentColor = 'rgba(200, 60, 255, 0.8)';
                break;
            case 'cyan':
                accentColor = 'rgba(60, 230, 255, 0.8)';
                break;
        }
        
        // Apply accent color to AR overlay
        this.arOverlay.style.setProperty('--ar-accent-color', accentColor);
    }
    
    detectSurfaces(imageData) {
        // In a real implementation, this would use computer vision algorithms
        // to detect flat surfaces for AR projection
        
        // For this demo, we'll use a simplified approach that looks for
        // areas of consistent color that might represent surfaces
        
        // This is a placeholder implementation
        // In a real system, you would use more sophisticated algorithms
        
        // Update marker position for AR projection
        // For demo purposes, we'll just use the center of the frame
        this.lastMarkerPosition = {
            x: this.canvasElement.width / 2,
            y: this.canvasElement.height / 2
        };
    }
    
    updateAROverlay() {
        if (!this.arOverlay) return;
        
        // Get current time
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        
        // Format time
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Format date
        const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
        const dateString = now.toLocaleDateString(undefined, dateOptions);
        
        // Create AR content based on mode
        let arContent = '';
        
        switch (this.arMode) {
            case 'basic':
                arContent = `
                    <div class="ar-basic-overlay">
                        <div class="ar-time">${timeString}</div>
                        <div class="ar-date">${dateString}</div>
                    </div>
                `;
                break;
                
            case 'environment':
                arContent = `
                    <div class="ar-environment-overlay">
                        <div class="ar-time">${timeString}</div>
                        <div class="ar-date">${dateString}</div>
                        <div class="ar-environment-info">
                            <div class="ar-weather">
                                <span class="icon-weather-sunny"></span>
                                <span>72°F</span>
                            </div>
                            <div class="ar-location">
                                <span class="icon-location"></span>
                                <span>Current Location</span>
                            </div>
                        </div>
                    </div>
                `;
                break;
                
            case 'full':
                // Position 3D clock based on detected surface
                let projectionStyle = '';
                
                if (this.lastMarkerPosition) {
                    projectionStyle = `
                        left: ${this.lastMarkerPosition.x}px;
                        top: ${this.lastMarkerPosition.y}px;
                    `;
                }
                
                arContent = `
                    <div class="ar-full-overlay">
                        <div class="ar-projection" style="${projectionStyle}">
                            <div class="ar-3d-clock">
                                <div class="ar-clock-face">
                                    <div class="ar-hour-hand" style="transform: rotate(${(hours % 12) * 30 + minutes * 0.5}deg)"></div>
                                    <div class="ar-minute-hand" style="transform: rotate(${minutes * 6}deg)"></div>
                                    <div class="ar-second-hand" style="transform: rotate(${seconds * 6}deg)"></div>
                                </div>
                                <div class="ar-digital-time">${timeString}</div>
                            </div>
                        </div>
                        <div class="ar-info-panel">
                            <div class="ar-date">${dateString}</div>
                            <div class="ar-weather">
                                <span class="icon-weather-sunny"></span>
                                <span>72°F</span>
                            </div>
                        </div>
                    </div>
                `;
                break;
        }
        
        // Update AR overlay
        this.arOverlay.innerHTML = arContent;
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
        this.updateARStatus('Calibration started. Follow the instructions.', 'calibrating');
        
        // Start calibration sequence
        this.showCalibrationStep();
    }
    
    showCalibrationStep() {
        const overlay = this.arOverlay;
        
        switch (this.calibrationStep) {
            case 0:
                overlay.innerHTML = '<div class="calibration-target center">Look at a flat surface</div>';
                overlay.className = 'ar-overlay calibrating';
                break;
            case 1:
                overlay.innerHTML = '<div class="calibration-target left">Tilt device to the left</div>';
                break;
            case 2:
                overlay.innerHTML = '<div class="calibration-target right">Tilt device to the right</div>';
                break;
            case 3:
                overlay.innerHTML = '<div class="calibration-target top">Tilt device up</div>';
                break;
            case 4:
                overlay.innerHTML = '<div class="calibration-target bottom">Tilt device down</div>';
                break;
            case 5:
                // Calibration complete
                overlay.innerHTML = '';
                overlay.className = 'ar-overlay';
                this.finishCalibration();
                return;
        }
        
        // Capture calibration point after a delay
        setTimeout(() => {
            // In a real implementation, this would capture device orientation
            // For this demo, we'll just simulate it
            this.calibrationPoints.push({
                step: this.calibrationStep,
                orientation: {
                    alpha: Math.random() * 360,
                    beta: Math.random() * 180 - 90,
                    gamma: Math.random() * 180 - 90
                }
            });
            
            // Move to next step
            this.calibrationStep++;
            this.showCalibrationStep();
        }, 2000);
    }
    
    finishCalibration() {
        // In a real implementation, this would use the calibration points
        // to improve AR projection accuracy
        
        this.isCalibrating = false;
        
        // Update status
        this.updateARStatus('Calibration complete. AR mode active.', 'success');
        
        // Restart AR processing
        this.startARProcessing();
    }
    
    toggleFullscreen() {
        const container = document.querySelector('.video-container');
        
        if (!document.fullscreenElement) {
            // Enter fullscreen
            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.webkitRequestFullscreen) {
                container.webkitRequestFullscreen();
            } else if (container.msRequestFullscreen) {
                container.msRequestFullscreen();
            }
            
            // Add fullscreen class
            container.classList.add('fullscreen');
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            
            // Remove fullscreen class
            container.classList.remove('fullscreen');
        }
        
        // Listen for fullscreen change
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                container.classList.remove('fullscreen');
            }
        });
    }
    
    updateARStatus(message, status = 'info') {
        const statusElement = document.getElementById('arStatus');
        if (!statusElement) return;
        
        statusElement.textContent = message;
        statusElement.className = `ar-status ${status}`;
    }
    
    loadSavedPreferences() {
        // Load AR enabled preference
        const savedAREnabled = localStorage.getItem('clockAREnabled');
        if (savedAREnabled !== null) {
            this.isAREnabled = savedAREnabled === 'true';
            document.getElementById('enableAR').checked = this.isAREnabled;
            
            // Start AR if enabled
            if (this.isAREnabled && document.getElementById('arModal').classList.contains('active')) {
                this.startAR();
            }
        }
        
        // Load AR mode preference
        const savedARMode = localStorage.getItem('clockARMode');
        if (savedARMode) {
            this.arMode = savedARMode;
            
            // Update active button
            const arModeButtons = document.querySelectorAll('.ar-mode-btn');
            arModeButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelector(`.ar-mode-btn[data-mode="${this.arMode}"]`).classList.add('active');
        }
    }
}

// Initialize augmented reality system when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Add augmented reality CSS
    const augmentedRealityCSS = `
        /* AR styles */
        .ar-options {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .ar-mode-selector {
            display: flex;
            gap: 10px;
        }
        
        .ar-mode-btn {
            flex: 1;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: white;
            padding: 8px;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .ar-mode-btn:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        .ar-mode-btn.active {
            background: var(--hologram-color, rgba(0, 120, 255, 0.5));
        }
        
        .ar-preview {
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
        
        .video-container.fullscreen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 2000;
            border-radius: 0;
        }
        
        #arVideo {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        #arCanvas {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: none; /* Hidden canvas for processing */
        }
        
        .ar-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            --ar-accent-color: rgba(0, 120, 255, 0.8);
        }
        
        .ar-overlay.calibrating {
            background: rgba(0, 0, 0, 0.5);
        }
        
        /* Basic AR overlay */
        .ar-basic-overlay {
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(10px);
            border-radius: 10px;
            padding: 15px;
            color: white;
            border-left: 3px solid var(--ar-accent-color);
        }
        
        .ar-time {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .ar-date {
            font-size: 1rem;
            opacity: 0.8;
        }
        
        /* Environment AR overlay */
        .ar-environment-overlay {
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(10px);
            border-radius: 10px;
            padding: 15px;
            color: white;
            border-left: 3px solid var(--ar-accent-color);
            max-width: 80%;
        }
        
        .ar-environment-info {
            display: flex;
            justify-content: space-between;
            margin-top: 10px;
            font-size: 0.9rem;
        }
        
        .ar-weather, .ar-location {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        /* Full AR overlay */
        .ar-full-overlay {
            position: relative;
            width: 100%;
            height: 100%;
        }
        
        .ar-projection {
            position: absolute;
            transform: translate(-50%, -50%);
            perspective: 1000px;
        }
        
        .ar-3d-clock {
            width: 150px;
            height: 150px;
            display: flex;
            flex-direction: column;
            align-items: center;
            transform-style: preserve-3d;
            animation: ar-float 6s ease-in-out infinite;
        }
        
        .ar-clock-face {
            width: 120px;
            height: 120px;
            background: rgba(0, 0, 0, 0.7);
            border-radius: 50%;
            position: relative;
            border: 2px solid var(--ar-accent-color);
            box-shadow: 0 0 20px var(--ar-accent-color);
        }
        
        .ar-hour-hand, .ar-minute-hand, .ar-second-hand {
            position: absolute;
            bottom: 50%;
            left: 50%;
            transform-origin: bottom center;
            background: white;
        }
        
        .ar-hour-hand {
            width: 4px;
            height: 30px;
            margin-left: -2px;
            border-radius: 4px;
        }
        
        .ar-minute-hand {
            width: 3px;
            height: 45px;
            margin-left: -1.5px;
            border-radius: 3px;
            background: var(--ar-accent-color);
        }
        
        .ar-second-hand {
            width: 2px;
            height: 50px;
            margin-left: -1px;
            border-radius: 2px;
            background: red;
        }
        
        .ar-digital-time {
            margin-top: 10px;
            font-size: 1.2rem;
            color: white;
            background: rgba(0, 0, 0, 0.7);
            padding: 5px 10px;
            border-radius: 20px;
            border: 1px solid var(--ar-accent-color);
        }
        
        .ar-info-panel {
            position: absolute;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(10px);
            border-radius: 10px;
            padding: 10px 15px;
            color: white;
            border-left: 3px solid var(--ar-accent-color);
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .ar-status {
            margin-top: 10px;
            padding: 8px;
            border-radius: 5px;
            text-align: center;
            font-size: 0.9rem;
        }
        
        .ar-status.success {
            background: rgba(0, 255, 60, 0.2);
            color: rgba(0, 255, 60, 0.8);
        }
        
        .ar-status.error {
            background: rgba(255, 50, 50, 0.2);
            color: rgba(255, 50, 50, 0.8);
        }
        
        .ar-status.calibrating {
            background: rgba(255, 180, 0, 0.2);
            color: rgba(255, 180, 0, 0.8);
        }
        
        .ar-status.inactive {
            background: rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.6);
        }
        
        .ar-instructions {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            padding: 15px;
        }
        
        .ar-instructions h3 {
            margin-top: 0;
            margin-bottom: 10px;
            font-size: 1rem;
        }
        
        .ar-instructions ul {
            margin: 0;
            padding-left: 20px;
        }
        
        .ar-instructions li {
            margin-bottom: 5px;
            font-size: 0.9rem;
        }
        
        .ar-instructions p {
            margin-top: 10px;
            margin-bottom: 0;
            font-size: 0.9rem;
            font-style: italic;
            opacity: 0.8;
        }
        
        @keyframes ar-float {
            0% { transform: translateY(0px) rotateX(10deg) rotateY(10deg); }
            50% { transform: translateY(-10px) rotateX(-5deg) rotateY(-5deg); }
            100% { transform: translateY(0px) rotateX(10deg) rotateY(10deg); }
        }
    `;
    
    // Add CSS to document
    const styleElement = document.createElement('style');
    styleElement.textContent = augmentedRealityCSS;
    document.head.appendChild(styleElement);
    
    // Initialize augmented reality system
    const augmentedRealitySystem = new AugmentedRealitySystem();
    
    // Load saved preferences
    augmentedRealitySystem.loadSavedPreferences();
});
