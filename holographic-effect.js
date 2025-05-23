/**
 * Holographic Projection Effect for Futuristic Clock
 * Creates 3D holographic appearance with parallax and glow effects
 */

class HolographicEffect {
    constructor() {
        this.container = document.querySelector('.clock-container');
        this.clock = document.querySelector('.clock');
        this.isHolographicMode = false;
        this.hologramLayers = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.centerX = 0;
        this.centerY = 0;
        this.depthFactor = 15; // Controls the intensity of the 3D effect
        this.glowIntensity = 0.8; // Controls the intensity of the glow effect
        
        // Create hologram button
        this.createHologramButton();
        
        // Initialize event listeners
        this.initEventListeners();
    }
    
    createHologramButton() {
        const controlsContainer = document.querySelector('.controls');
        const hologramBtn = document.createElement('button');
        hologramBtn.className = 'control-btn';
        hologramBtn.id = 'hologramBtn';
        hologramBtn.innerHTML = '<span class="icon-hologram"></span> Hologram';
        
        // Add button to controls after voice button
        const voiceBtn = document.getElementById('voiceBtn');
        if (voiceBtn) {
            controlsContainer.insertBefore(hologramBtn, voiceBtn.nextSibling);
        } else {
            controlsContainer.appendChild(hologramBtn);
        }
        
        // Toggle holographic mode on button click
        hologramBtn.addEventListener('click', () => {
            this.toggleHolographicMode();
        });
    }
    
    initEventListeners() {
        // Track mouse movement for parallax effect
        document.addEventListener('mousemove', (e) => {
            if (!this.isHolographicMode) return;
            
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.updateParallaxEffect();
        });
        
        // Handle touch movement for mobile devices
        document.addEventListener('touchmove', (e) => {
            if (!this.isHolographicMode || e.touches.length === 0) return;
            
            this.mouseX = e.touches[0].clientX;
            this.mouseY = e.touches[0].clientY;
            this.updateParallaxEffect();
        });
        
        // Handle device orientation for mobile devices
        window.addEventListener('deviceorientation', (e) => {
            if (!this.isHolographicMode) return;
            
            // Convert orientation data to mouse position equivalent
            const gamma = e.gamma; // Left/Right tilt [-90, 90]
            const beta = e.beta;   // Front/Back tilt [-180, 180]
            
            if (gamma !== null && beta !== null) {
                // Map orientation to viewport coordinates
                const width = window.innerWidth;
                const height = window.innerHeight;
                
                this.mouseX = width / 2 + (gamma / 90) * (width / 2);
                this.mouseY = height / 2 + (beta / 180) * (height / 2);
                
                this.updateParallaxEffect();
            }
        });
        
        // Update center position on resize
        window.addEventListener('resize', () => {
            this.updateCenterPosition();
        });
    }
    
    toggleHolographicMode() {
        this.isHolographicMode = !this.isHolographicMode;
        
        if (this.isHolographicMode) {
            this.enableHolographicMode();
        } else {
            this.disableHolographicMode();
        }
        
        // Toggle active class on button
        const hologramBtn = document.getElementById('hologramBtn');
        if (hologramBtn) {
            if (this.isHolographicMode) {
                hologramBtn.classList.add('active');
            } else {
                hologramBtn.classList.remove('active');
            }
        }
    }
    
    enableHolographicMode() {
        // Add holographic class to container
        this.container.classList.add('holographic-mode');
        
        // Create holographic layers
        this.createHolographicLayers();
        
        // Update center position
        this.updateCenterPosition();
        
        // Add floating animation
        this.clock.classList.add('floating');
        
        // Add glow effect
        this.addGlowEffect();
        
        // Add scan line effect
        this.addScanLines();
        
        // Add flicker animation
        this.addFlickerEffect();
    }
    
    disableHolographicMode() {
        // Remove holographic class from container
        this.container.classList.remove('holographic-mode');
        
        // Remove holographic layers
        this.removeHolographicLayers();
        
        // Remove floating animation
        this.clock.classList.remove('floating');
        
        // Remove glow effect
        this.removeGlowEffect();
        
        // Remove scan lines
        this.removeScanLines();
        
        // Remove flicker animation
        this.removeFlickerEffect();
        
        // Reset clock transform
        this.clock.style.transform = '';
    }
    
    createHolographicLayers() {
        // Remove any existing layers
        this.removeHolographicLayers();
        
        // Create multiple layers for depth effect
        const numLayers = 5;
        
        for (let i = 0; i < numLayers; i++) {
            const layer = document.createElement('div');
            layer.className = 'hologram-layer';
            layer.style.zIndex = -1 - i;
            layer.style.opacity = 1 - (i * 0.15);
            layer.style.transform = `scale(${1 + (i * 0.05)})`;
            
            this.container.appendChild(layer);
            this.hologramLayers.push(layer);
        }
    }
    
    removeHolographicLayers() {
        // Remove all holographic layers
        this.hologramLayers.forEach(layer => {
            if (layer.parentNode) {
                layer.parentNode.removeChild(layer);
            }
        });
        
        this.hologramLayers = [];
    }
    
    updateCenterPosition() {
        const rect = this.container.getBoundingClientRect();
        this.centerX = rect.left + rect.width / 2;
        this.centerY = rect.top + rect.height / 2;
    }
    
    updateParallaxEffect() {
        if (!this.isHolographicMode) return;
        
        // Calculate the distance from center
        const deltaX = (this.mouseX - this.centerX) / window.innerWidth;
        const deltaY = (this.mouseY - this.centerY) / window.innerHeight;
        
        // Apply parallax effect to main clock
        this.clock.style.transform = `
            rotateX(${-deltaY * this.depthFactor}deg) 
            rotateY(${deltaX * this.depthFactor}deg)
            translateZ(20px)
        `;
        
        // Apply parallax effect to layers with different intensities
        this.hologramLayers.forEach((layer, index) => {
            const layerDepth = (index + 1) * 5;
            const layerFactor = this.depthFactor * (1 - index * 0.1);
            
            layer.style.transform = `
                rotateX(${-deltaY * layerFactor}deg) 
                rotateY(${deltaX * layerFactor}deg)
                translateZ(${-layerDepth}px)
                scale(${1 + (index * 0.05)})
            `;
        });
    }
    
    addGlowEffect() {
        // Add glow effect to clock
        this.clock.classList.add('hologram-glow');
        
        // Create base glow
        const baseGlow = document.createElement('div');
        baseGlow.className = 'hologram-base-glow';
        this.container.appendChild(baseGlow);
    }
    
    removeGlowEffect() {
        // Remove glow effect from clock
        this.clock.classList.remove('hologram-glow');
        
        // Remove base glow
        const baseGlow = document.querySelector('.hologram-base-glow');
        if (baseGlow) {
            baseGlow.parentNode.removeChild(baseGlow);
        }
    }
    
    addScanLines() {
        // Create scan lines element
        const scanLines = document.createElement('div');
        scanLines.className = 'hologram-scan-lines';
        this.container.appendChild(scanLines);
    }
    
    removeScanLines() {
        // Remove scan lines
        const scanLines = document.querySelector('.hologram-scan-lines');
        if (scanLines) {
            scanLines.parentNode.removeChild(scanLines);
        }
    }
    
    addFlickerEffect() {
        // Add flicker animation class
        this.container.classList.add('hologram-flicker');
    }
    
    removeFlickerEffect() {
        // Remove flicker animation class
        this.container.classList.remove('hologram-flicker');
    }
}

// Initialize holographic effect when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Add holographic CSS
    const holographicCSS = `
        /* Holographic Mode Styles */
        .holographic-mode {
            perspective: 1000px;
            transform-style: preserve-3d;
        }
        
        .hologram-layer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.05);
            pointer-events: none;
        }
        
        .hologram-glow {
            box-shadow: 0 0 30px var(--hologram-color), 
                        inset 0 0 20px var(--hologram-color) !important;
            border: 1px solid rgba(255, 255, 255, 0.3) !important;
        }
        
        .hologram-base-glow {
            position: absolute;
            bottom: -20px;
            left: 50%;
            transform: translateX(-50%);
            width: 80%;
            height: 20px;
            background: radial-gradient(ellipse at center, var(--hologram-color) 0%, transparent 70%);
            filter: blur(5px);
            opacity: 0.7;
            pointer-events: none;
        }
        
        .hologram-scan-lines {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(
                to bottom,
                transparent 0%,
                rgba(255, 255, 255, 0.05) 50%,
                transparent 100%
            );
            background-size: 100% 4px;
            pointer-events: none;
            opacity: 0.3;
            animation: scanlines 8s linear infinite;
        }
        
        .floating {
            animation: float 6s ease-in-out infinite;
        }
        
        .hologram-flicker {
            animation: flicker 8s linear infinite;
        }
        
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }
        
        @keyframes scanlines {
            0% { background-position: 0 0; }
            100% { background-position: 0 100%; }
        }
        
        @keyframes flicker {
            0% { opacity: 1; }
            1% { opacity: 0.8; }
            2% { opacity: 1; }
            59% { opacity: 1; }
            60% { opacity: 0.7; }
            61% { opacity: 1; }
            89% { opacity: 1; }
            90% { opacity: 0.9; }
            100% { opacity: 1; }
        }
        
        /* Theme-specific hologram colors */
        body.neon-blue {
            --hologram-color: rgba(0, 120, 255, 0.8);
        }
        
        body.sunrise-gold {
            --hologram-color: rgba(255, 180, 0, 0.8);
        }
        
        body.matrix-green {
            --hologram-color: rgba(0, 255, 60, 0.8);
        }
        
        body.monochrome {
            --hologram-color: rgba(200, 200, 200, 0.8);
        }
        
        /* Active button state */
        .control-btn.active {
            background: rgba(255, 255, 255, 0.2);
            box-shadow: 0 0 10px var(--hologram-color);
        }
    `;
    
    // Add CSS to document
    const styleElement = document.createElement('style');
    styleElement.textContent = holographicCSS;
    document.head.appendChild(styleElement);
    
    // Initialize holographic effect
    const holographicEffect = new HolographicEffect();
});
