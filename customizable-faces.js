/**
 * Customizable Clock Face Designs for Futuristic Clock
 * Allows users to choose from multiple clock face designs and customize appearance
 */

class CustomizableClockFaces {
    constructor() {
        this.clockContainer = document.querySelector('.clock-container');
        this.clock = document.querySelector('.clock');
        this.hourHand = document.getElementById('hr');
        this.minuteHand = document.getElementById('mn');
        this.secondHand = document.getElementById('sc');
        this.glowTrail = document.getElementById('glow');
        
        this.currentDesign = 'classic';
        this.customColors = {
            face: '',
            hourHand: '',
            minuteHand: '',
            secondHand: ''
        };
        
        // Create customize button
        this.createCustomizeButton();
        
        // Create customize modal
        this.createCustomizeModal();
    }
    
    createCustomizeButton() {
        const controlsContainer = document.querySelector('.controls');
        const customizeBtn = document.createElement('button');
        customizeBtn.className = 'control-btn';
        customizeBtn.id = 'customizeBtn';
        customizeBtn.innerHTML = '<span class="icon-customize"></span> Customize';
        
        // Add button to controls after hologram button
        const hologramBtn = document.getElementById('hologramBtn');
        if (hologramBtn) {
            controlsContainer.insertBefore(customizeBtn, hologramBtn.nextSibling);
        } else {
            controlsContainer.appendChild(customizeBtn);
        }
        
        // Open customize modal on button click
        customizeBtn.addEventListener('click', () => {
            this.openCustomizeModal();
        });
    }
    
    createCustomizeModal() {
        // Create modal element
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'customizeModal';
        
        // Create modal content
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Customize Clock</h2>
                    <button class="close-modal" data-modal="customizeModal">×</button>
                </div>
                <div class="customize-options">
                    <div class="form-group">
                        <label>Clock Design</label>
                        <div class="design-options">
                            <div class="design-option active" data-design="classic">
                                <div class="design-preview classic-preview"></div>
                                <span>Classic</span>
                            </div>
                            <div class="design-option" data-design="minimal">
                                <div class="design-preview minimal-preview"></div>
                                <span>Minimal</span>
                            </div>
                            <div class="design-option" data-design="binary">
                                <div class="design-preview binary-preview"></div>
                                <span>Binary</span>
                            </div>
                            <div class="design-option" data-design="futuristic">
                                <div class="design-preview futuristic-preview"></div>
                                <span>Futuristic</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Clock Face Color</label>
                        <input type="color" id="faceColor" class="color-picker">
                    </div>
                    
                    <div class="form-group">
                        <label>Hour Hand Color</label>
                        <input type="color" id="hourColor" class="color-picker">
                    </div>
                    
                    <div class="form-group">
                        <label>Minute Hand Color</label>
                        <input type="color" id="minuteColor" class="color-picker">
                    </div>
                    
                    <div class="form-group">
                        <label>Second Hand Color</label>
                        <input type="color" id="secondColor" class="color-picker">
                    </div>
                    
                    <div class="form-group">
                        <label>Show Seconds</label>
                        <label class="switch">
                            <input type="checkbox" id="showSeconds" checked>
                            <span class="slider round"></span>
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label>Show Digital Time</label>
                        <label class="switch">
                            <input type="checkbox" id="showDigital" checked>
                            <span class="slider round"></span>
                        </label>
                    </div>
                    
                    <button class="btn-set" id="resetCustomization">Reset to Default</button>
                </div>
            </div>
        `;
        
        // Add modal to document
        document.body.appendChild(modal);
        
        // Add event listeners
        this.addCustomizeEventListeners();
    }
    
    addCustomizeEventListeners() {
        // Close modal button
        const closeBtn = document.querySelector('#customizeModal .close-modal');
        closeBtn.addEventListener('click', () => {
            this.closeCustomizeModal();
        });
        
        // Design options
        const designOptions = document.querySelectorAll('.design-option');
        designOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remove active class from all options
                designOptions.forEach(opt => opt.classList.remove('active'));
                
                // Add active class to selected option
                option.classList.add('active');
                
                // Apply selected design
                const design = option.dataset.design;
                this.applyClockDesign(design);
            });
        });
        
        // Color pickers
        document.getElementById('faceColor').addEventListener('input', (e) => {
            this.customColors.face = e.target.value;
            this.applyCustomColors();
        });
        
        document.getElementById('hourColor').addEventListener('input', (e) => {
            this.customColors.hourHand = e.target.value;
            this.applyCustomColors();
        });
        
        document.getElementById('minuteColor').addEventListener('input', (e) => {
            this.customColors.minuteHand = e.target.value;
            this.applyCustomColors();
        });
        
        document.getElementById('secondColor').addEventListener('input', (e) => {
            this.customColors.secondHand = e.target.value;
            this.applyCustomColors();
        });
        
        // Toggle switches
        document.getElementById('showSeconds').addEventListener('change', (e) => {
            if (e.target.checked) {
                this.secondHand.style.display = 'block';
                this.glowTrail.style.display = 'block';
            } else {
                this.secondHand.style.display = 'none';
                this.glowTrail.style.display = 'none';
            }
            
            // Save preference
            localStorage.setItem('clockShowSeconds', e.target.checked);
        });
        
        document.getElementById('showDigital').addEventListener('change', (e) => {
            const digitalTime = document.querySelector('.digital-time');
            if (e.target.checked) {
                digitalTime.style.display = 'flex';
            } else {
                digitalTime.style.display = 'none';
            }
            
            // Save preference
            localStorage.setItem('clockShowDigital', e.target.checked);
        });
        
        // Reset button
        document.getElementById('resetCustomization').addEventListener('click', () => {
            this.resetToDefault();
        });
    }
    
    openCustomizeModal() {
        const modal = document.getElementById('customizeModal');
        modal.classList.add('active');
        
        // Set color picker values to current colors
        this.updateColorPickers();
    }
    
    closeCustomizeModal() {
        const modal = document.getElementById('customizeModal');
        modal.classList.remove('active');
    }
    
    updateColorPickers() {
        // Get computed styles
        const computedStyle = getComputedStyle(document.documentElement);
        
        // Set color picker values
        document.getElementById('faceColor').value = this.customColors.face || this.getDefaultColor('face');
        document.getElementById('hourColor').value = this.customColors.hourHand || this.getDefaultColor('hourHand');
        document.getElementById('minuteColor').value = this.customColors.minuteHand || this.getDefaultColor('minuteHand');
        document.getElementById('secondColor').value = this.customColors.secondHand || this.getDefaultColor('secondHand');
    }
    
    getDefaultColor(element) {
        // Get default colors based on current theme
        const theme = document.body.className;
        
        switch (element) {
            case 'face':
                return 'rgba(255, 255, 255, 0.05)';
            case 'hourHand':
                return '#ffffff';
            case 'minuteHand':
                return theme === 'neon-blue' ? '#60c3ff' : 
                       theme === 'sunrise-gold' ? '#ffbc40' : 
                       theme === 'matrix-green' ? '#40ff60' : '#aaaaaa';
            case 'secondHand':
                return theme === 'neon-blue' ? '#ff2c2c' : 
                       theme === 'sunrise-gold' ? '#ff6a00' : 
                       theme === 'matrix-green' ? '#00ff9d' : '#dddddd';
            default:
                return '#ffffff';
        }
    }
    
    applyClockDesign(design) {
        // Remove all design classes
        this.clock.classList.remove('classic-design', 'minimal-design', 'binary-design', 'futuristic-design');
        
        // Add selected design class
        this.clock.classList.add(`${design}-design`);
        
        // Update current design
        this.currentDesign = design;
        
        // Save preference
        localStorage.setItem('clockDesign', design);
        
        // Special handling for binary clock
        if (design === 'binary') {
            this.createBinaryClockFace();
        } else if (design === 'futuristic') {
            this.createFuturisticClockFace();
        } else {
            // Remove binary or futuristic elements if they exist
            this.removeBinaryClockFace();
            this.removeFuturisticClockFace();
        }
    }
    
    createBinaryClockFace() {
        // Remove existing binary clock face if it exists
        this.removeBinaryClockFace();
        
        // Create binary clock face
        const binaryFace = document.createElement('div');
        binaryFace.className = 'binary-clock-face';
        
        // Create binary indicators for hours, minutes, and seconds
        const hoursRow = this.createBinaryRow('hours', 4);
        const minutesRow = this.createBinaryRow('minutes', 6);
        const secondsRow = this.createBinaryRow('seconds', 6);
        
        binaryFace.appendChild(hoursRow);
        binaryFace.appendChild(minutesRow);
        binaryFace.appendChild(secondsRow);
        
        this.clock.appendChild(binaryFace);
        
        // Start binary clock update
        this.updateBinaryClock();
    }
    
    createBinaryRow(unit, bits) {
        const row = document.createElement('div');
        row.className = `binary-row ${unit}-row`;
        
        // Add label
        const label = document.createElement('div');
        label.className = 'binary-label';
        label.textContent = unit.charAt(0).toUpperCase();
        row.appendChild(label);
        
        // Add bits
        for (let i = 0; i < bits; i++) {
            const bit = document.createElement('div');
            bit.className = 'binary-bit';
            bit.dataset.value = Math.pow(2, bits - i - 1);
            bit.dataset.unit = unit;
            row.appendChild(bit);
        }
        
        return row;
    }
    
    updateBinaryClock() {
        if (this.currentDesign !== 'binary') return;
        
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        
        // Update hours bits
        const hourBits = document.querySelectorAll('.hours-row .binary-bit');
        this.updateBinaryBits(hourBits, hours);
        
        // Update minutes bits
        const minuteBits = document.querySelectorAll('.minutes-row .binary-bit');
        this.updateBinaryBits(minuteBits, minutes);
        
        // Update seconds bits
        const secondBits = document.querySelectorAll('.seconds-row .binary-bit');
        this.updateBinaryBits(secondBits, seconds);
        
        // Schedule next update
        setTimeout(() => this.updateBinaryClock(), 1000);
    }
    
    updateBinaryBits(bits, value) {
        bits.forEach(bit => {
            const bitValue = parseInt(bit.dataset.value);
            if (value & bitValue) {
                bit.classList.add('active');
            } else {
                bit.classList.remove('active');
            }
        });
    }
    
    removeBinaryClockFace() {
        const binaryFace = document.querySelector('.binary-clock-face');
        if (binaryFace) {
            binaryFace.parentNode.removeChild(binaryFace);
        }
    }
    
    createFuturisticClockFace() {
        // Remove existing futuristic clock face if it exists
        this.removeFuturisticClockFace();
        
        // Create futuristic clock face
        const futuristicFace = document.createElement('div');
        futuristicFace.className = 'futuristic-clock-face';
        
        // Create hour markers
        for (let i = 1; i <= 12; i++) {
            const marker = document.createElement('div');
            marker.className = 'futuristic-marker';
            
            // Position marker
            const angle = (i * 30) - 90; // 30 degrees per hour, starting at -90 degrees (12 o'clock)
            const radian = angle * (Math.PI / 180);
            const radius = 130; // Distance from center
            
            const x = Math.cos(radian) * radius;
            const y = Math.sin(radian) * radius;
            
            marker.style.transform = `translate(${x}px, ${y}px)`;
            
            // Add hour number
            marker.textContent = i;
            
            futuristicFace.appendChild(marker);
        }
        
        // Create circular progress indicators
        const hourProgress = document.createElement('div');
        hourProgress.className = 'progress-ring hour-progress';
        
        const minuteProgress = document.createElement('div');
        minuteProgress.className = 'progress-ring minute-progress';
        
        const secondProgress = document.createElement('div');
        secondProgress.className = 'progress-ring second-progress';
        
        futuristicFace.appendChild(hourProgress);
        futuristicFace.appendChild(minuteProgress);
        futuristicFace.appendChild(secondProgress);
        
        this.clock.appendChild(futuristicFace);
        
        // Start futuristic clock update
        this.updateFuturisticClock();
    }
    
    updateFuturisticClock() {
        if (this.currentDesign !== 'futuristic') return;
        
        const now = new Date();
        const hours = now.getHours() % 12;
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        
        // Calculate progress percentages
        const hourProgress = (hours * 60 + minutes) / (12 * 60) * 100;
        const minuteProgress = minutes / 60 * 100;
        const secondProgress = seconds / 60 * 100;
        
        // Update progress rings
        document.querySelector('.hour-progress').style.background = `conic-gradient(var(--hour-color) ${hourProgress}%, transparent ${hourProgress}%)`;
        document.querySelector('.minute-progress').style.background = `conic-gradient(var(--minute-color) ${minuteProgress}%, transparent ${minuteProgress}%)`;
        document.querySelector('.second-progress').style.background = `conic-gradient(var(--second-color) ${secondProgress}%, transparent ${secondProgress}%)`;
        
        // Schedule next update
        setTimeout(() => this.updateFuturisticClock(), 1000);
    }
    
    removeFuturisticClockFace() {
        const futuristicFace = document.querySelector('.futuristic-clock-face');
        if (futuristicFace) {
            futuristicFace.parentNode.removeChild(futuristicFace);
        }
    }
    
    applyCustomColors() {
        // Apply custom colors to clock elements
        if (this.customColors.face) {
            this.clock.style.background = this.customColors.face;
        }
        
        if (this.customColors.hourHand) {
            this.hourHand.style.background = this.customColors.hourHand;
            document.documentElement.style.setProperty('--hour-color', this.customColors.hourHand);
        }
        
        if (this.customColors.minuteHand) {
            this.minuteHand.style.background = this.customColors.minuteHand;
            document.documentElement.style.setProperty('--minute-color', this.customColors.minuteHand);
        }
        
        if (this.customColors.secondHand) {
            this.secondHand.style.background = this.customColors.secondHand;
            document.documentElement.style.setProperty('--second-color', this.customColors.secondHand);
        }
        
        // Save custom colors
        localStorage.setItem('clockCustomColors', JSON.stringify(this.customColors));
    }
    
    resetToDefault() {
        // Reset to default design
        this.applyClockDesign('classic');
        
        // Reset custom colors
        this.customColors = {
            face: '',
            hourHand: '',
            minuteHand: '',
            secondHand: ''
        };
        
        // Clear custom styles
        this.clock.style.background = '';
        this.hourHand.style.background = '';
        this.minuteHand.style.background = '';
        this.secondHand.style.background = '';
        
        // Reset CSS variables
        document.documentElement.style.removeProperty('--hour-color');
        document.documentElement.style.removeProperty('--minute-color');
        document.documentElement.style.removeProperty('--second-color');
        
        // Reset switches
        document.getElementById('showSeconds').checked = true;
        document.getElementById('showDigital').checked = true;
        
        // Show second hand and digital time
        this.secondHand.style.display = 'block';
        this.glowTrail.style.display = 'block';
        document.querySelector('.digital-time').style.display = 'flex';
        
        // Update color pickers
        this.updateColorPickers();
        
        // Clear saved preferences
        localStorage.removeItem('clockDesign');
        localStorage.removeItem('clockCustomColors');
        localStorage.removeItem('clockShowSeconds');
        localStorage.removeItem('clockShowDigital');
    }
    
    loadSavedPreferences() {
        // Load saved design
        const savedDesign = localStorage.getItem('clockDesign');
        if (savedDesign) {
            this.applyClockDesign(savedDesign);
            
            // Update active design option
            const designOptions = document.querySelectorAll('.design-option');
            designOptions.forEach(opt => opt.classList.remove('active'));
            document.querySelector(`.design-option[data-design="${savedDesign}"]`).classList.add('active');
        }
        
        // Load saved custom colors
        const savedColors = localStorage.getItem('clockCustomColors');
        if (savedColors) {
            this.customColors = JSON.parse(savedColors);
            this.applyCustomColors();
        }
        
        // Load saved show seconds preference
        const showSeconds = localStorage.getItem('clockShowSeconds');
        if (showSeconds !== null) {
            const showSecondsValue = showSeconds === 'true';
            document.getElementById('showSeconds').checked = showSecondsValue;
            
            if (!showSecondsValue) {
                this.secondHand.style.display = 'none';
                this.glowTrail.style.display = 'none';
            }
        }
        
        // Load saved show digital preference
        const showDigital = localStorage.getItem('clockShowDigital');
        if (showDigital !== null) {
            const showDigitalValue = showDigital === 'true';
            document.getElementById('showDigital').checked = showDigitalValue;
            
            if (!showDigitalValue) {
                document.querySelector('.digital-time').style.display = 'none';
            }
        }
    }
}

// Initialize customizable clock faces when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Add customizable clock faces CSS
    const customizableClockCSS = `
        /* Design Options */
        .design-options {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .design-option {
            padding: 10px;
            border-radius: 10px;
            cursor: pointer;
            text-align: center;
            border: 2px solid transparent;
            transition: all 0.3s ease;
        }
        
        .design-option.active {
            border-color: rgba(255, 255, 255, 0.5);
            box-shadow: 0 0 10px var(--hologram-color, rgba(0, 120, 255, 0.5));
        }
        
        .design-option:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: translateY(-2px);
        }
        
        .design-preview {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            margin: 0 auto 10px;
            position: relative;
        }
        
        /* Classic design preview */
        .classic-preview {
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.2);
        }
        
        .classic-preview::before, .classic-preview::after {
            content: '';
            position: absolute;
            background: white;
            top: 50%;
            left: 50%;
            transform-origin: left center;
        }
        
        .classic-preview::before {
            width: 20px;
            height: 2px;
            transform: translateY(-50%) rotate(45deg);
        }
        
        .classic-preview::after {
            width: 15px;
            height: 2px;
            transform: translateY(-50%) rotate(120deg);
        }
        
        /* Minimal design preview */
        .minimal-preview {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .minimal-preview::before, .minimal-preview::after {
            content: '';
            position: absolute;
            background: white;
            top: 50%;
            left: 50%;
            transform-origin: left center;
        }
        
        .minimal-preview::before {
            width: 18px;
            height: 1px;
            transform: translateY(-50%) rotate(45deg);
        }
        
        .minimal-preview::after {
            width: 12px;
            height: 1px;
            transform: translateY(-50%) rotate(120deg);
        }
        
        /* Binary design preview */
        .binary-preview {
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 5px;
        }
        
        .binary-preview::before {
            content: '';
            width: 40px;
            height: 6px;
            background: linear-gradient(to right, 
                rgba(255, 255, 255, 0.8) 20%, 
                rgba(255, 255, 255, 0.2) 20%, 
                rgba(255, 255, 255, 0.2) 40%, 
                rgba(255, 255, 255, 0.8) 40%, 
                rgba(255, 255, 255, 0.8) 60%, 
                rgba(255, 255, 255, 0.2) 60%);
        }
        
        .binary-preview::after {
            content: '';
            width: 40px;
            height: 6px;
            background: linear-gradient(to right, 
                rgba(255, 255, 255, 0.2) 20%, 
                rgba(255, 255, 255, 0.8) 20%, 
                rgba(255, 255, 255, 0.8) 40%, 
                rgba(255, 255, 255, 0.2) 40%, 
                rgba(255, 255, 255, 0.2) 60%, 
                rgba(255, 255, 255, 0.8) 60%);
        }
        
        /* Futuristic design preview */
        .futuristic-preview {
            background: rgba(0, 0, 0, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.2);
            overflow: hidden;
        }
        
        .futuristic-preview::before {
            content: '';
            position: absolute;
            width: 40px;
            height: 40px;
            top: 10px;
            left: 10px;
            border-radius: 50%;
            border: 2px solid rgba(0, 120, 255, 0.8);
            border-top: 2px solid transparent;
            border-left: 2px solid transparent;
        }
        
        .futuristic-preview::after {
            content: '';
            position: absolute;
            width: 30px;
            height: 30px;
            top: 15px;
            left: 15px;
            border-radius: 50%;
            border: 2px solid rgba(255, 50, 50, 0.8);
            border-bottom: 2px solid transparent;
            border-right: 2px solid transparent;
        }
        
        /* Color picker styles */
        .color-picker {
            width: 100%;
            height: 40px;
            border: none;
            border-radius: 5px;
            background: none;
            cursor: pointer;
        }
        
        /* Toggle switch */
        .switch {
            position: relative;
            display: inline-block;
            width: 60px;
            height: 30px;
        }
        
        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(255, 255, 255, 0.2);
            transition: .4s;
        }
        
        .slider:before {
            position: absolute;
            content: "";
            height: 22px;
            width: 22px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .4s;
        }
        
        input:checked + .slider {
            background-color: var(--hologram-color, rgba(0, 120, 255, 0.8));
        }
        
        input:checked + .slider:before {
            transform: translateX(30px);
        }
        
        .slider.round {
            border-radius: 34px;
        }
        
        .slider.round:before {
            border-radius: 50%;
        }
        
        /* Clock design styles */
        /* Classic design - default */
        
        /* Minimal design */
        .minimal-design {
            background: rgba(0, 0, 0, 0.5) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            box-shadow: none !important;
        }
        
        .minimal-design::before {
            width: 8px !important;
            height: 8px !important;
            background: white !important;
        }
        
        .minimal-design .hr-hand {
            width: 4px !important;
            box-shadow: none !important;
        }
        
        .minimal-design .min-hand {
            width: 3px !important;
            box-shadow: none !important;
        }
        
        .minimal-design .sec-hand {
            width: 1px !important;
            box-shadow: none !important;
        }
        
        .minimal-design .glow-trail {
            display: none !important;
        }
        
        /* Binary design */
        .binary-design {
            background: rgba(0, 0, 0, 0.7) !important;
            border: none !important;
            box-shadow: none !important;
        }
        
        .binary-design .hour,
        .binary-design .min,
        .binary-design .sec,
        .binary-design::before {
            display: none !important;
        }
        
        .binary-clock-face {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 20px;
        }
        
        .binary-row {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .binary-label {
            width: 20px;
            text-align: center;
            font-weight: bold;
        }
        
        .binary-bit {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.3);
            transition: all 0.3s ease;
        }
        
        .binary-bit.active {
            background: var(--hologram-color, rgba(0, 120, 255, 0.8));
            box-shadow: 0 0 10px var(--hologram-color, rgba(0, 120, 255, 0.5));
        }
        
        /* Futuristic design */
        .futuristic-design {
            background: rgba(0, 0, 0, 0.7) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            box-shadow: none !important;
            overflow: hidden;
        }
        
        .futuristic-design .hour,
        .futuristic-design .min,
        .futuristic-design .sec,
        .futuristic-design::before {
            display: none !important;
        }
        
        .futuristic-clock-face {
            width: 100%;
            height: 100%;
            position: relative;
        }
        
        .futuristic-marker {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 30px;
            height: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.7);
        }
        
        .progress-ring {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            border-radius: 50%;
        }
        
        .hour-progress {
            width: 200px;
            height: 200px;
            background: conic-gradient(var(--hour-color, white) 30%, transparent 30%);
            mask: radial-gradient(transparent 70px, black 70px, black 80px, transparent 80px);
            -webkit-mask: radial-gradient(transparent 70px, black 70px, black 80px, transparent 80px);
        }
        
        .minute-progress {
            width: 160px;
            height: 160px;
            background: conic-gradient(var(--minute-color, #60c3ff) 45%, transparent 45%);
            mask: radial-gradient(transparent 50px, black 50px, black 60px, transparent 60px);
            -webkit-mask: radial-gradient(transparent 50px, black 50px, black 60px, transparent 60px);
        }
        
        .second-progress {
            width: 120px;
            height: 120px;
            background: conic-gradient(var(--second-color, #ff2c2c) 75%, transparent 75%);
            mask: radial-gradient(transparent 30px, black 30px, black 40px, transparent 40px);
            -webkit-mask: radial-gradient(transparent 30px, black 30px, black 40px, transparent 40px);
        }
    `;
    
    // Add CSS to document
    const styleElement = document.createElement('style');
    styleElement.textContent = customizableClockCSS;
    document.head.appendChild(styleElement);
    
    // Initialize customizable clock faces
    const customizableClockFaces = new CustomizableClockFaces();
    
    // Load saved preferences
    customizableClockFaces.loadSavedPreferences();
});
