/**
 * Biometric Authentication for Futuristic Clock
 * Provides secure access using facial recognition and fingerprint authentication
 */

class BiometricAuthentication {
    constructor() {
        this.isAuthenticated = false;
        this.authMethod = 'none'; // 'none', 'face', 'fingerprint', 'password'
        this.securityLevel = 'medium'; // 'low', 'medium', 'high'
        this.lockTimeout = 5 * 60 * 1000; // 5 minutes in milliseconds
        this.lastActivity = Date.now();
        this.lockCheckInterval = null;
        this.faceData = null;
        this.fingerprintData = null;
        this.passwordHash = null;
        this.failedAttempts = 0;
        this.maxFailedAttempts = 5;
        this.lockoutDuration = 30 * 1000; // 30 seconds in milliseconds
        this.lockoutTime = 0;
        this.isSetupComplete = false;
        this.protectedFeatures = [
            'settings',
            'alarms',
            'notifications',
            'timeManagement'
        ];
        
        // Create authentication button
        this.createAuthButton();
        
        // Create authentication modal
        this.createAuthModal();
        
        // Load saved settings
        this.loadSavedSettings();
        
        // Start lock check interval
        this.startLockCheck();
    }
    
    createAuthButton() {
        const controlsContainer = document.querySelector('.controls');
        const authBtn = document.createElement('button');
        authBtn.className = 'control-btn';
        authBtn.id = 'authBtn';
        authBtn.innerHTML = '<span class="icon-lock"></span> Security';
        
        // Add button to controls after time management button
        const timeManagementBtn = document.getElementById('timeManagementBtn');
        if (timeManagementBtn) {
            controlsContainer.insertBefore(authBtn, timeManagementBtn.nextSibling);
        } else {
            controlsContainer.appendChild(authBtn);
        }
        
        // Open authentication modal on button click
        authBtn.addEventListener('click', () => {
            this.openAuthModal();
        });
    }
    
    createAuthModal() {
        // Create modal element
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'authModal';
        
        // Create modal content
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Biometric Security</h2>
                    <button class="close-modal" data-modal="authModal">×</button>
                </div>
                <div class="auth-content">
                    <!-- Authentication Status -->
                    <div class="auth-status">
                        <div class="auth-status-icon" id="authStatusIcon">
                            <span class="icon-lock"></span>
                        </div>
                        <div class="auth-status-text" id="authStatusText">
                            Not authenticated
                        </div>
                    </div>
                    
                    <!-- Authentication Setup -->
                    <div class="auth-setup" id="authSetup">
                        <h3>Setup Authentication</h3>
                        <p>Choose your preferred authentication method:</p>
                        
                        <div class="auth-methods">
                            <div class="auth-method" data-method="face">
                                <div class="auth-method-icon">
                                    <span class="icon-face"></span>
                                </div>
                                <div class="auth-method-name">Face ID</div>
                            </div>
                            <div class="auth-method" data-method="fingerprint">
                                <div class="auth-method-icon">
                                    <span class="icon-fingerprint"></span>
                                </div>
                                <div class="auth-method-name">Fingerprint</div>
                            </div>
                            <div class="auth-method" data-method="password">
                                <div class="auth-method-icon">
                                    <span class="icon-password"></span>
                                </div>
                                <div class="auth-method-name">Password</div>
                            </div>
                        </div>
                        
                        <div class="auth-setup-content" id="authSetupContent">
                            <!-- Content will be dynamically inserted based on selected method -->
                        </div>
                    </div>
                    
                    <!-- Authentication Login -->
                    <div class="auth-login" id="authLogin">
                        <h3>Authentication Required</h3>
                        <p>Please authenticate to access protected features.</p>
                        
                        <div class="auth-login-content" id="authLoginContent">
                            <!-- Content will be dynamically inserted based on auth method -->
                        </div>
                    </div>
                    
                    <!-- Authentication Settings -->
                    <div class="auth-settings" id="authSettings">
                        <h3>Security Settings</h3>
                        
                        <div class="form-group">
                            <label>Security Level</label>
                            <div class="security-level-selector">
                                <button class="security-level-btn" data-level="low">Low</button>
                                <button class="security-level-btn active" data-level="medium">Medium</button>
                                <button class="security-level-btn" data-level="high">High</button>
                            </div>
                            <div class="setting-description">
                                Higher security levels require more frequent authentication
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Auto-Lock Timeout</label>
                            <div class="slider-container">
                                <input type="range" id="lockTimeoutSlider" min="1" max="30" value="5" class="range-slider">
                                <span id="lockTimeoutValue">5 minutes</span>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Protected Features</label>
                            <div class="protected-features">
                                <label class="feature-checkbox">
                                    <input type="checkbox" value="settings" checked> Settings
                                </label>
                                <label class="feature-checkbox">
                                    <input type="checkbox" value="alarms" checked> Alarms
                                </label>
                                <label class="feature-checkbox">
                                    <input type="checkbox" value="notifications" checked> Notifications
                                </label>
                                <label class="feature-checkbox">
                                    <input type="checkbox" value="timeManagement" checked> Time Management
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <button class="btn-set" id="changeAuthBtn">Change Authentication Method</button>
                            <button class="btn-danger" id="resetAuthBtn">Reset Authentication</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to document
        document.body.appendChild(modal);
        
        // Add event listeners
        this.addAuthEventListeners();
    }
    
    addAuthEventListeners() {
        // Close modal button
        const closeBtn = document.querySelector('#authModal .close-modal');
        closeBtn.addEventListener('click', () => {
            this.closeAuthModal();
        });
        
        // Auth method selection
        const authMethods = document.querySelectorAll('.auth-method');
        authMethods.forEach(method => {
            method.addEventListener('click', () => {
                const selectedMethod = method.dataset.method;
                this.showAuthSetupContent(selectedMethod);
            });
        });
        
        // Security level selection
        const securityLevels = document.querySelectorAll('.security-level-btn');
        securityLevels.forEach(level => {
            level.addEventListener('click', () => {
                // Remove active class from all levels
                securityLevels.forEach(l => l.classList.remove('active'));
                
                // Add active class to selected level
                level.classList.add('active');
                
                // Set security level
                this.securityLevel = level.dataset.level;
                
                // Save settings
                this.saveSettings();
            });
        });
        
        // Lock timeout slider
        const lockTimeoutSlider = document.getElementById('lockTimeoutSlider');
        const lockTimeoutValue = document.getElementById('lockTimeoutValue');
        
        lockTimeoutSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            lockTimeoutValue.textContent = `${value} minute${value !== 1 ? 's' : ''}`;
            
            // Update lock timeout
            this.lockTimeout = value * 60 * 1000;
            
            // Save settings
            this.saveSettings();
        });
        
        // Protected features checkboxes
        const featureCheckboxes = document.querySelectorAll('.feature-checkbox input');
        featureCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                // Update protected features
                this.protectedFeatures = Array.from(
                    document.querySelectorAll('.feature-checkbox input:checked')
                ).map(cb => cb.value);
                
                // Save settings
                this.saveSettings();
            });
        });
        
        // Change authentication method button
        document.getElementById('changeAuthBtn').addEventListener('click', () => {
            this.showAuthSetup();
        });
        
        // Reset authentication button
        document.getElementById('resetAuthBtn').addEventListener('click', () => {
            this.resetAuthentication();
        });
    }
    
    openAuthModal() {
        const modal = document.getElementById('authModal');
        modal.classList.add('active');
        
        // Show appropriate content based on authentication state
        if (!this.isSetupComplete) {
            this.showAuthSetup();
        } else if (!this.isAuthenticated) {
            this.showAuthLogin();
        } else {
            this.showAuthSettings();
        }
        
        // Update authentication status
        this.updateAuthStatus();
    }
    
    closeAuthModal() {
        const modal = document.getElementById('authModal');
        modal.classList.remove('active');
    }
    
    updateAuthStatus() {
        const authStatusIcon = document.getElementById('authStatusIcon');
        const authStatusText = document.getElementById('authStatusText');
        
        if (!this.isSetupComplete) {
            authStatusIcon.innerHTML = '<span class="icon-lock-open"></span>';
            authStatusText.textContent = 'Security not set up';
            authStatusIcon.className = 'auth-status-icon not-setup';
        } else if (this.isAuthenticated) {
            authStatusIcon.innerHTML = '<span class="icon-lock-open"></span>';
            authStatusText.textContent = 'Authenticated';
            authStatusIcon.className = 'auth-status-icon authenticated';
        } else {
            authStatusIcon.innerHTML = '<span class="icon-lock"></span>';
            authStatusText.textContent = 'Locked';
            authStatusIcon.className = 'auth-status-icon locked';
        }
        
        // Update auth button in controls
        const authBtn = document.getElementById('authBtn');
        if (authBtn) {
            if (this.isAuthenticated) {
                authBtn.innerHTML = '<span class="icon-lock-open"></span> Security';
            } else {
                authBtn.innerHTML = '<span class="icon-lock"></span> Security';
            }
        }
    }
    
    showAuthSetup() {
        document.getElementById('authSetup').style.display = 'block';
        document.getElementById('authLogin').style.display = 'none';
        document.getElementById('authSettings').style.display = 'none';
        
        // Clear setup content
        document.getElementById('authSetupContent').innerHTML = '';
    }
    
    showAuthLogin() {
        document.getElementById('authSetup').style.display = 'none';
        document.getElementById('authLogin').style.display = 'block';
        document.getElementById('authSettings').style.display = 'none';
        
        // Show login content based on auth method
        this.showAuthLoginContent();
    }
    
    showAuthSettings() {
        document.getElementById('authSetup').style.display = 'none';
        document.getElementById('authLogin').style.display = 'none';
        document.getElementById('authSettings').style.display = 'block';
        
        // Update security level buttons
        document.querySelectorAll('.security-level-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.security-level-btn[data-level="${this.securityLevel}"]`).classList.add('active');
        
        // Update lock timeout slider
        const lockTimeoutMinutes = this.lockTimeout / (60 * 1000);
        document.getElementById('lockTimeoutSlider').value = lockTimeoutMinutes;
        document.getElementById('lockTimeoutValue').textContent = `${lockTimeoutMinutes} minute${lockTimeoutMinutes !== 1 ? 's' : ''}`;
        
        // Update protected features checkboxes
        document.querySelectorAll('.feature-checkbox input').forEach(checkbox => {
            checkbox.checked = this.protectedFeatures.includes(checkbox.value);
        });
    }
    
    showAuthSetupContent(method) {
        const setupContent = document.getElementById('authSetupContent');
        
        // Highlight selected method
        document.querySelectorAll('.auth-method').forEach(m => {
            m.classList.remove('active');
        });
        document.querySelector(`.auth-method[data-method="${method}"]`).classList.add('active');
        
        // Show setup content based on method
        switch (method) {
            case 'face':
                setupContent.innerHTML = `
                    <div class="face-setup">
                        <div class="camera-container">
                            <video id="faceSetupVideo" autoplay playsinline></video>
                            <canvas id="faceSetupCanvas"></canvas>
                            <div class="face-overlay">
                                <div class="face-outline"></div>
                            </div>
                        </div>
                        <div class="setup-instructions">
                            <p>Position your face in the center and look directly at the camera.</p>
                        </div>
                        <div class="setup-actions">
                            <button class="btn-set" id="captureFaceBtn">Capture Face</button>
                        </div>
                    </div>
                `;
                
                // Initialize face capture
                this.initFaceCapture();
                
                // Add event listener to capture button
                document.getElementById('captureFaceBtn').addEventListener('click', () => {
                    this.captureFace();
                });
                break;
                
            case 'fingerprint':
                setupContent.innerHTML = `
                    <div class="fingerprint-setup">
                        <div class="fingerprint-container">
                            <div class="fingerprint-scanner">
                                <div class="fingerprint-animation"></div>
                            </div>
                        </div>
                        <div class="setup-instructions">
                            <p>Place your finger on the scanner and hold until the scan is complete.</p>
                        </div>
                        <div class="setup-actions">
                            <button class="btn-set" id="scanFingerprintBtn">Scan Fingerprint</button>
                        </div>
                    </div>
                `;
                
                // Add event listener to scan button
                document.getElementById('scanFingerprintBtn').addEventListener('click', () => {
                    this.scanFingerprint();
                });
                break;
                
            case 'password':
                setupContent.innerHTML = `
                    <div class="password-setup">
                        <div class="form-group">
                            <label>Create Password</label>
                            <input type="password" id="setupPassword" placeholder="Enter password">
                        </div>
                        <div class="form-group">
                            <label>Confirm Password</label>
                            <input type="password" id="confirmPassword" placeholder="Confirm password">
                        </div>
                        <div class="setup-actions">
                            <button class="btn-set" id="savePasswordBtn">Save Password</button>
                        </div>
                    </div>
                `;
                
                // Add event listener to save button
                document.getElementById('savePasswordBtn').addEventListener('click', () => {
                    this.savePassword();
                });
                break;
        }
    }
    
    showAuthLoginContent() {
        const loginContent = document.getElementById('authLoginContent');
        
        // Show login content based on auth method
        switch (this.authMethod) {
            case 'face':
                loginContent.innerHTML = `
                    <div class="face-login">
                        <div class="camera-container">
                            <video id="faceLoginVideo" autoplay playsinline></video>
                            <canvas id="faceLoginCanvas"></canvas>
                            <div class="face-overlay">
                                <div class="face-outline"></div>
                            </div>
                        </div>
                        <div class="login-instructions">
                            <p>Position your face in the center for facial recognition.</p>
                        </div>
                        <div class="login-actions">
                            <button class="btn-set" id="verifyFaceBtn">Verify Face</button>
                            <button class="btn-alt" id="usePasswordBtn">Use Password Instead</button>
                        </div>
                    </div>
                `;
                
                // Initialize face verification
                this.initFaceVerification();
                
                // Add event listeners
                document.getElementById('verifyFaceBtn').addEventListener('click', () => {
                    this.verifyFace();
                });
                
                document.getElementById('usePasswordBtn').addEventListener('click', () => {
                    this.showPasswordFallback();
                });
                break;
                
            case 'fingerprint':
                loginContent.innerHTML = `
                    <div class="fingerprint-login">
                        <div class="fingerprint-container">
                            <div class="fingerprint-scanner">
                                <div class="fingerprint-animation"></div>
                            </div>
                        </div>
                        <div class="login-instructions">
                            <p>Place your finger on the scanner to verify your identity.</p>
                        </div>
                        <div class="login-actions">
                            <button class="btn-set" id="verifyFingerprintBtn">Verify Fingerprint</button>
                            <button class="btn-alt" id="usePasswordBtn">Use Password Instead</button>
                        </div>
                    </div>
                `;
                
                // Add event listeners
                document.getElementById('verifyFingerprintBtn').addEventListener('click', () => {
                    this.verifyFingerprint();
                });
                
                document.getElementById('usePasswordBtn').addEventListener('click', () => {
                    this.showPasswordFallback();
                });
                break;
                
            case 'password':
                loginContent.innerHTML = `
                    <div class="password-login">
                        <div class="form-group">
                            <label>Enter Password</label>
                            <input type="password" id="loginPassword" placeholder="Enter your password">
                        </div>
                        <div class="login-actions">
                            <button class="btn-set" id="verifyPasswordBtn">Verify Password</button>
                        </div>
                    </div>
                `;
                
                // Add event listener
                document.getElementById('verifyPasswordBtn').addEventListener('click', () => {
                    this.verifyPassword();
                });
                
                // Allow Enter key to submit
                document.getElementById('loginPassword').addEventListener('keyup', (e) => {
                    if (e.key === 'Enter') {
                        this.verifyPassword();
                    }
                });
                break;
        }
        
        // Show lockout message if locked out
        if (this.isLockedOut()) {
            this.showLockoutMessage();
        }
    }
    
    showPasswordFallback() {
        const loginContent = document.getElementById('authLoginContent');
        
        loginContent.innerHTML = `
            <div class="password-login">
                <div class="form-group">
                    <label>Enter Backup Password</label>
                    <input type="password" id="loginPassword" placeholder="Enter your password">
                </div>
                <div class="login-actions">
                    <button class="btn-set" id="verifyPasswordBtn">Verify Password</button>
                    <button class="btn-alt" id="backToMainAuthBtn">Back</button>
                </div>
            </div>
        `;
        
        // Add event listeners
        document.getElementById('verifyPasswordBtn').addEventListener('click', () => {
            this.verifyPassword();
        });
        
        document.getElementById('backToMainAuthBtn').addEventListener('click', () => {
            this.showAuthLoginContent();
        });
        
        // Allow Enter key to submit
        document.getElementById('loginPassword').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                this.verifyPassword();
            }
        });
    }
    
    initFaceCapture() {
        const video = document.getElementById('faceSetupVideo');
        const canvas = document.getElementById('faceSetupCanvas');
        
        if (!video || !canvas) return;
        
        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.showSetupError('Camera access not supported in this browser.');
            return;
        }
        
        // Request camera access
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
            .then(stream => {
                video.srcObject = stream;
                
                // Set canvas size to match video
                video.onloadedmetadata = () => {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                };
            })
            .catch(error => {
                console.error('Error accessing camera:', error);
                this.showSetupError('Could not access camera. Please check permissions.');
            });
    }
    
    captureFace() {
        const video = document.getElementById('faceSetupVideo');
        const canvas = document.getElementById('faceSetupCanvas');
        const context = canvas.getContext('2d');
        
        if (!video || !canvas || !context) return;
        
        // Draw current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // In a real implementation, this would use face detection and recognition
        // For this demo, we'll simulate face capture
        
        // Show processing animation
        const faceOverlay = document.querySelector('.face-overlay');
        faceOverlay.classList.add('processing');
        
        setTimeout(() => {
            // Simulate face data extraction
            this.faceData = {
                timestamp: Date.now(),
                // In a real implementation, this would contain facial feature data
                features: this.generateRandomFeatureVector(128)
            };
            
            // Stop video stream
            if (video.srcObject) {
                video.srcObject.getTracks().forEach(track => track.stop());
            }
            
            // Set auth method
            this.authMethod = 'face';
            
            // Set as authenticated
            this.isAuthenticated = true;
            this.isSetupComplete = true;
            
            // Save settings
            this.saveSettings();
            
            // Show success message
            this.showSetupSuccess('Face ID setup complete!');
            
            // Remove processing class
            faceOverlay.classList.remove('processing');
            
            // Update auth status
            this.updateAuthStatus();
            
            // Show settings after short delay
            setTimeout(() => {
                this.showAuthSettings();
            }, 1500);
        }, 2000);
    }
    
    initFaceVerification() {
        const video = document.getElementById('faceLoginVideo');
        const canvas = document.getElementById('faceLoginCanvas');
        
        if (!video || !canvas) return;
        
        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.showLoginError('Camera access not supported in this browser.');
            return;
        }
        
        // Request camera access
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
            .then(stream => {
                video.srcObject = stream;
                
                // Set canvas size to match video
                video.onloadedmetadata = () => {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                };
            })
            .catch(error => {
                console.error('Error accessing camera:', error);
                this.showLoginError('Could not access camera. Please check permissions.');
            });
    }
    
    verifyFace() {
        if (this.isLockedOut()) {
            this.showLockoutMessage();
            return;
        }
        
        const video = document.getElementById('faceLoginVideo');
        const canvas = document.getElementById('faceLoginCanvas');
        const context = canvas.getContext('2d');
        
        if (!video || !canvas || !context) return;
        
        // Draw current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // In a real implementation, this would use face detection and recognition
        // For this demo, we'll simulate face verification
        
        // Show processing animation
        const faceOverlay = document.querySelector('.face-overlay');
        faceOverlay.classList.add('processing');
        
        setTimeout(() => {
            // Simulate face verification
            // In a real implementation, this would compare the captured face with stored face data
            
            // 80% chance of success for demo purposes
            const isMatch = Math.random() < 0.8;
            
            if (isMatch) {
                // Authentication successful
                this.authenticationSuccess();
                
                // Stop video stream
                if (video.srcObject) {
                    video.srcObject.getTracks().forEach(track => track.stop());
                }
            } else {
                // Authentication failed
                this.authenticationFailed('Face not recognized. Please try again.');
            }
            
            // Remove processing class
            faceOverlay.classList.remove('processing');
        }, 2000);
    }
    
    scanFingerprint() {
        // Show scanning animation
        const scanner = document.querySelector('.fingerprint-scanner');
        scanner.classList.add('scanning');
        
        setTimeout(() => {
            // Simulate fingerprint scanning
            this.fingerprintData = {
                timestamp: Date.now(),
                // In a real implementation, this would contain fingerprint data
                features: this.generateRandomFeatureVector(64)
            };
            
            // Set auth method
            this.authMethod = 'fingerprint';
            
            // Set as authenticated
            this.isAuthenticated = true;
            this.isSetupComplete = true;
            
            // Save settings
            this.saveSettings();
            
            // Show success message
            this.showSetupSuccess('Fingerprint setup complete!');
            
            // Remove scanning class
            scanner.classList.remove('scanning');
            
            // Update auth status
            this.updateAuthStatus();
            
            // Show settings after short delay
            setTimeout(() => {
                this.showAuthSettings();
            }, 1500);
        }, 3000);
    }
    
    verifyFingerprint() {
        if (this.isLockedOut()) {
            this.showLockoutMessage();
            return;
        }
        
        // Show scanning animation
        const scanner = document.querySelector('.fingerprint-scanner');
        scanner.classList.add('scanning');
        
        setTimeout(() => {
            // Simulate fingerprint verification
            // In a real implementation, this would compare the scanned fingerprint with stored data
            
            // 80% chance of success for demo purposes
            const isMatch = Math.random() < 0.8;
            
            if (isMatch) {
                // Authentication successful
                this.authenticationSuccess();
            } else {
                // Authentication failed
                this.authenticationFailed('Fingerprint not recognized. Please try again.');
            }
            
            // Remove scanning class
            scanner.classList.remove('scanning');
        }, 2000);
    }
    
    savePassword() {
        const password = document.getElementById('setupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validate passwords
        if (!password) {
            this.showSetupError('Please enter a password.');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showSetupError('Passwords do not match.');
            return;
        }
        
        if (password.length < 6) {
            this.showSetupError('Password must be at least 6 characters.');
            return;
        }
        
        // Hash password (in a real implementation, use a proper hashing algorithm)
        this.passwordHash = this.simpleHash(password);
        
        // Set auth method
        this.authMethod = 'password';
        
        // Set as authenticated
        this.isAuthenticated = true;
        this.isSetupComplete = true;
        
        // Save settings
        this.saveSettings();
        
        // Show success message
        this.showSetupSuccess('Password setup complete!');
        
        // Update auth status
        this.updateAuthStatus();
        
        // Show settings after short delay
        setTimeout(() => {
            this.showAuthSettings();
        }, 1500);
    }
    
    verifyPassword() {
        if (this.isLockedOut()) {
            this.showLockoutMessage();
            return;
        }
        
        const password = document.getElementById('loginPassword').value;
        
        if (!password) {
            this.showLoginError('Please enter your password.');
            return;
        }
        
        // Hash password and compare with stored hash
        const hash = this.simpleHash(password);
        
        if (hash === this.passwordHash) {
            // Authentication successful
            this.authenticationSuccess();
        } else {
            // Authentication failed
            this.authenticationFailed('Incorrect password. Please try again.');
        }
    }
    
    authenticationSuccess() {
        // Set as authenticated
        this.isAuthenticated = true;
        
        // Reset failed attempts
        this.failedAttempts = 0;
        
        // Update last activity time
        this.lastActivity = Date.now();
        
        // Show success message
        this.showLoginSuccess('Authentication successful!');
        
        // Update auth status
        this.updateAuthStatus();
        
        // Show settings after short delay
        setTimeout(() => {
            this.showAuthSettings();
        }, 1500);
        
        // Show notification
        this.showNotification('Authentication Successful', 'You now have access to protected features.');
    }
    
    authenticationFailed(message) {
        // Increment failed attempts
        this.failedAttempts++;
        
        // Check if max failed attempts reached
        if (this.failedAttempts >= this.maxFailedAttempts) {
            // Set lockout time
            this.lockoutTime = Date.now() + this.lockoutDuration;
            
            // Show lockout message
            this.showLockoutMessage();
        } else {
            // Show error message
            this.showLoginError(`${message} (${this.failedAttempts}/${this.maxFailedAttempts} attempts)`);
        }
    }
    
    isLockedOut() {
        return Date.now() < this.lockoutTime;
    }
    
    showLockoutMessage() {
        const loginContent = document.getElementById('authLoginContent');
        
        // Calculate remaining lockout time
        const remainingTime = Math.ceil((this.lockoutTime - Date.now()) / 1000);
        
        loginContent.innerHTML = `
            <div class="lockout-message">
                <div class="lockout-icon">
                    <span class="icon-lock"></span>
                </div>
                <h3>Account Temporarily Locked</h3>
                <p>Too many failed attempts. Please try again in <span id="lockoutTimer">${remainingTime}</span> seconds.</p>
            </div>
        `;
        
        // Update timer
        const timerInterval = setInterval(() => {
            const remainingTime = Math.ceil((this.lockoutTime - Date.now()) / 1000);
            const timerElement = document.getElementById('lockoutTimer');
            
            if (timerElement) {
                timerElement.textContent = remainingTime;
            }
            
            if (remainingTime <= 0) {
                clearInterval(timerInterval);
                this.showAuthLoginContent();
            }
        }, 1000);
    }
    
    showSetupError(message) {
        const setupContent = document.getElementById('authSetupContent');
        const errorElement = setupContent.querySelector('.setup-error') || document.createElement('div');
        
        errorElement.className = 'setup-error';
        errorElement.textContent = message;
        
        if (!setupContent.querySelector('.setup-error')) {
            setupContent.appendChild(errorElement);
        }
    }
    
    showSetupSuccess(message) {
        const setupContent = document.getElementById('authSetupContent');
        const successElement = document.createElement('div');
        
        successElement.className = 'setup-success';
        successElement.textContent = message;
        
        // Remove any existing error messages
        const errorElement = setupContent.querySelector('.setup-error');
        if (errorElement) {
            setupContent.removeChild(errorElement);
        }
        
        setupContent.appendChild(successElement);
    }
    
    showLoginError(message) {
        const loginContent = document.getElementById('authLoginContent');
        const errorElement = loginContent.querySelector('.login-error') || document.createElement('div');
        
        errorElement.className = 'login-error';
        errorElement.textContent = message;
        
        if (!loginContent.querySelector('.login-error')) {
            loginContent.appendChild(errorElement);
        }
    }
    
    showLoginSuccess(message) {
        const loginContent = document.getElementById('authLoginContent');
        const successElement = document.createElement('div');
        
        successElement.className = 'login-success';
        successElement.textContent = message;
        
        // Remove any existing error messages
        const errorElement = loginContent.querySelector('.login-error');
        if (errorElement) {
            loginContent.removeChild(errorElement);
        }
        
        loginContent.appendChild(successElement);
    }
    
    resetAuthentication() {
        // Confirm reset
        if (!confirm('Are you sure you want to reset authentication? This will remove all biometric data and require setup again.')) {
            return;
        }
        
        // Reset authentication data
        this.isAuthenticated = false;
        this.isSetupComplete = false;
        this.authMethod = 'none';
        this.faceData = null;
        this.fingerprintData = null;
        this.passwordHash = null;
        
        // Save settings
        this.saveSettings();
        
        // Show setup
        this.showAuthSetup();
        
        // Update auth status
        this.updateAuthStatus();
        
        // Show notification
        this.showNotification('Authentication Reset', 'Security settings have been reset. Please set up authentication again.');
    }
    
    startLockCheck() {
        if (this.lockCheckInterval) {
            clearInterval(this.lockCheckInterval);
        }
        
        // Check for inactivity every 30 seconds
        this.lockCheckInterval = setInterval(() => {
            this.checkLock();
        }, 30000);
        
        // Add activity listeners
        document.addEventListener('mousemove', () => this.updateActivity());
        document.addEventListener('keydown', () => this.updateActivity());
        document.addEventListener('click', () => this.updateActivity());
        document.addEventListener('touchstart', () => this.updateActivity());
    }
    
    updateActivity() {
        // Only update activity if authenticated
        if (this.isAuthenticated) {
            this.lastActivity = Date.now();
        }
    }
    
    checkLock() {
        // Skip if not set up or already locked
        if (!this.isSetupComplete || !this.isAuthenticated) {
            return;
        }
        
        // Check if inactive for too long
        const inactiveTime = Date.now() - this.lastActivity;
        
        if (inactiveTime >= this.lockTimeout) {
            // Lock the clock
            this.lockClock();
        }
    }
    
    lockClock() {
        // Set as not authenticated
        this.isAuthenticated = false;
        
        // Update auth status
        this.updateAuthStatus();
        
        // Show notification
        this.showNotification('Clock Locked', 'Your clock has been locked due to inactivity.');
    }
    
    isFeatureProtected(feature) {
        return this.isSetupComplete && this.protectedFeatures.includes(feature) && !this.isAuthenticated;
    }
    
    authenticateForFeature(feature, callback) {
        if (!this.isFeatureProtected(feature)) {
            // Feature not protected or already authenticated
            if (callback) callback(true);
            return true;
        }
        
        // Show authentication modal
        this.openAuthModal();
        this.showAuthLogin();
        
        // Set callback to be called after successful authentication
        this.authCallback = callback;
        
        return false;
    }
    
    saveSettings() {
        const settings = {
            isSetupComplete: this.isSetupComplete,
            authMethod: this.authMethod,
            securityLevel: this.securityLevel,
            lockTimeout: this.lockTimeout,
            protectedFeatures: this.protectedFeatures,
            passwordHash: this.passwordHash,
            // In a real implementation, biometric data would be stored securely
            // For this demo, we'll store simplified data
            faceData: this.faceData,
            fingerprintData: this.fingerprintData
        };
        
        localStorage.setItem('clockAuthSettings', JSON.stringify(settings));
    }
    
    loadSavedSettings() {
        const savedSettings = localStorage.getItem('clockAuthSettings');
        
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                
                this.isSetupComplete = settings.isSetupComplete || false;
                this.authMethod = settings.authMethod || 'none';
                this.securityLevel = settings.securityLevel || 'medium';
                this.lockTimeout = settings.lockTimeout || 5 * 60 * 1000;
                this.protectedFeatures = settings.protectedFeatures || ['settings', 'alarms', 'notifications', 'timeManagement'];
                this.passwordHash = settings.passwordHash || null;
                this.faceData = settings.faceData || null;
                this.fingerprintData = settings.fingerprintData || null;
                
                // Update auth status
                this.updateAuthStatus();
            } catch (error) {
                console.error('Error loading auth settings:', error);
            }
        }
    }
    
    simpleHash(str) {
        // This is a very simple hash function for demo purposes only
        // In a real implementation, use a proper cryptographic hash function
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString(16);
    }
    
    generateRandomFeatureVector(size) {
        // Generate random feature vector for demo purposes
        const features = [];
        for (let i = 0; i < size; i++) {
            features.push(Math.random());
        }
        return features;
    }
    
    showNotification(title, message) {
        // Use notification system if available
        if (window.notificationSystem) {
            window.notificationSystem.addSystemNotification(title, message, 'system', 'icon-lock');
        } else {
            // Fallback to alert
            alert(`${title}: ${message}`);
        }
    }
}

// Initialize biometric authentication when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Add biometric authentication CSS
    const biometricAuthCSS = `
        /* Biometric authentication styles */
        .auth-status {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            margin-bottom: 20px;
        }
        
        .auth-status-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 1.5rem;
        }
        
        .auth-status-icon.not-setup {
            background: rgba(255, 180, 0, 0.2);
            color: rgba(255, 180, 0, 0.8);
        }
        
        .auth-status-icon.authenticated {
            background: rgba(0, 255, 60, 0.2);
            color: rgba(0, 255, 60, 0.8);
        }
        
        .auth-status-icon.locked {
            background: rgba(255, 50, 50, 0.2);
            color: rgba(255, 50, 50, 0.8);
        }
        
        .auth-status-text {
            font-size: 1.1rem;
        }
        
        .auth-setup, .auth-login, .auth-settings {
            display: none;
        }
        
        .auth-methods {
            display: flex;
            justify-content: space-between;
            gap: 15px;
            margin: 20px 0;
        }
        
        .auth-method {
            flex: 1;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            padding: 15px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .auth-method:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: translateY(-2px);
        }
        
        .auth-method.active {
            background: rgba(0, 120, 255, 0.2);
            border: 1px solid rgba(0, 120, 255, 0.5);
        }
        
        .auth-method-icon {
            font-size: 2rem;
            margin-bottom: 10px;
        }
        
        .auth-method-name {
            font-size: 0.9rem;
        }
        
        /* Face recognition styles */
        .camera-container {
            position: relative;
            width: 100%;
            height: 240px;
            background: #000;
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 15px;
        }
        
        #faceSetupVideo, #faceLoginVideo {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        #faceSetupCanvas, #faceLoginCanvas {
            display: none;
        }
        
        .face-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
        }
        
        .face-outline {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 150px;
            height: 150px;
            border: 2px dashed rgba(0, 120, 255, 0.8);
            border-radius: 50%;
        }
        
        .face-overlay.processing .face-outline {
            border-style: solid;
            animation: pulse 1.5s infinite;
        }
        
        /* Fingerprint styles */
        .fingerprint-container {
            display: flex;
            justify-content: center;
            margin: 20px 0;
        }
        
        .fingerprint-scanner {
            width: 120px;
            height: 120px;
            background: rgba(0, 0, 0, 0.8);
            border-radius: 10px;
            position: relative;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .fingerprint-animation {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80px;
            height: 80px;
            background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMCwgMTIwLCAyNTUsIDAuOCkiIHN0cm9rZS13aWR0aD0iMiIgZD0iTTUwLDIwIEM2NS41LDIwIDc4LDMyLjUgNzgsNDggQzc4LDYzLjUgNjUuNSw3NiA1MCw3NiBDMzQuNSw3NiAyMiw2My41IDIyLDQ4IEMyMiwzMi41IDM0LjUsMjAgNTAsMjAgWiBNNTAsMjggQzYxLjA0NiwyOCA3MCwzNi45NTQgNzAsNDggQzcwLDU5LjA0NiA2MS4wNDYsNjggNTAsNjggQzM4Ljk1NCw2OCAzMCw1OS4wNDYgMzAsNDggQzMwLDM2Ljk1NCAzOC45NTQsMjggNTAsMjggWiBNNTAsMzYgQzU2LjYyNywzNiA2Miw0MS4zNzMgNjIsNDggQzYyLDU0LjYyNyA1Ni42MjcsNjAgNTAsNjAgQzQzLjM3Myw2MCAzOCw1NC42MjcgMzgsNDggQzM4LDQxLjM3MyA0My4zNzMsMzYgNTAsMzYgWiBNNTAsNDQgQzUyLjIwOSw0NCA1NCw0NS43OTEgNTQsNDggQzU0LDUwLjIwOSA1Mi4yMDksNTIgNTAsNTIgQzQ3Ljc5MSw1MiA0Niw1MC4yMDkgNDYsNDggQzQ2LDQ1Ljc5MSA0Ny43OTEsNDQgNTAsNDQgWiIvPjwvc3ZnPg==');
            background-size: contain;
            opacity: 0.5;
        }
        
        .fingerprint-scanner.scanning .fingerprint-animation {
            opacity: 1;
            animation: scan 2s infinite;
        }
        
        /* Setup and login messages */
        .setup-error, .login-error {
            background: rgba(255, 50, 50, 0.2);
            color: rgba(255, 50, 50, 0.8);
            padding: 10px;
            border-radius: 5px;
            margin-top: 15px;
        }
        
        .setup-success, .login-success {
            background: rgba(0, 255, 60, 0.2);
            color: rgba(0, 255, 60, 0.8);
            padding: 10px;
            border-radius: 5px;
            margin-top: 15px;
        }
        
        /* Security level selector */
        .security-level-selector {
            display: flex;
            gap: 10px;
            margin-bottom: 10px;
        }
        
        .security-level-btn {
            flex: 1;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: white;
            padding: 8px;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .security-level-btn:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        .security-level-btn.active {
            background: var(--hologram-color, rgba(0, 120, 255, 0.5));
        }
        
        /* Protected features */
        .protected-features {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }
        
        .feature-checkbox {
            display: flex;
            align-items: center;
            gap: 5px;
            cursor: pointer;
        }
        
        /* Lockout message */
        .lockout-message {
            text-align: center;
            padding: 20px;
        }
        
        .lockout-icon {
            font-size: 3rem;
            color: rgba(255, 50, 50, 0.8);
            margin-bottom: 15px;
        }
        
        /* Alternative button */
        .btn-alt {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: none;
            border-radius: 5px;
            padding: 8px 15px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .btn-alt:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        /* Animations */
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(0, 120, 255, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(0, 120, 255, 0); }
            100% { box-shadow: 0 0 0 0 rgba(0, 120, 255, 0); }
        }
        
        @keyframes scan {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
            50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
        }
    `;
    
    // Add CSS to document
    const styleElement = document.createElement('style');
    styleElement.textContent = biometricAuthCSS;
    document.head.appendChild(styleElement);
    
    // Initialize biometric authentication
    window.biometricAuth = new BiometricAuthentication();
    
    // Add global authentication check function
    window.requireAuth = function(feature, callback) {
        return window.biometricAuth.authenticateForFeature(feature, callback);
    };
    
    // Patch existing button click handlers to check authentication
    const patchButtonHandlers = () => {
        // List of buttons and their associated features
        const protectedButtons = [
            { id: 'settingsBtn', feature: 'settings' },
            { id: 'alarmBtn', feature: 'alarms' },
            { id: 'notificationBtn', feature: 'notifications' },
            { id: 'timeManagementBtn', feature: 'timeManagement' }
        ];
        
        protectedButtons.forEach(button => {
            const element = document.getElementById(button.id);
            if (element) {
                const originalClickHandler = element.onclick;
                
                element.onclick = function(event) {
                    // Check if authentication is required
                    if (window.requireAuth(button.feature, () => {
                        if (originalClickHandler) {
                            originalClickHandler.call(element, event);
                        }
                    })) {
                        // Already authenticated or feature not protected
                        if (originalClickHandler) {
                            originalClickHandler.call(element, event);
                        }
                    }
                };
            }
        });
    };
    
    // Patch button handlers after a short delay to ensure all buttons are loaded
    setTimeout(patchButtonHandlers, 1000);
});
