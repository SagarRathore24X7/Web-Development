
// Custom cursor
const cursor = document.querySelector('.cursor');

if (window.innerWidth > 768) {
    cursor.style.display = 'block';

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    document.addEventListener('mousedown', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(0.7)';
    });

    document.addEventListener('mouseup', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    });
}

// Expand/collapse functionality
document.querySelectorAll('.expand-btn').forEach(button => {
    button.addEventListener('click', () => {
        const content = button.previousElementSibling;
        const shortText = content.previousElementSibling;
        const icon = button.querySelector('i');

        if (content.style.display === 'none' || content.style.display === '') {
            content.style.display = 'block';
            shortText.style.display = 'none';
            button.innerHTML = 'Read Less <i class="fas fa-chevron-up"></i>';
        } else {
            content.style.display = 'none';
            shortText.style.display = 'block';
            button.innerHTML = 'Read More <i class="fas fa-chevron-down"></i>';
        }
    });
});

// Scroll reveal animation
const revealElements = document.querySelectorAll('.reveal');

function checkReveal() {
    const windowHeight = window.innerHeight;
    revealElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        if (elementTop < windowHeight - 100) {
            element.classList.add('animate__animated', 'animate__fadeInUp');
        }
    });
}

// Scroll to top button
const scrollBtn = document.querySelector('.scroll-top');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollBtn.classList.add('active');
    } else {
        scrollBtn.classList.remove('active');
    }

    checkReveal();
});

scrollBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Initialize animations on load
window.addEventListener('load', () => {
    checkReveal();
});

// Add hover effects for nav icons
const navIcons = document.querySelectorAll('.nav-icon');
navIcons.forEach(icon => {
    icon.addEventListener('mouseenter', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
        cursor.style.borderColor = '#FFBE0B';
    });

    icon.addEventListener('mouseleave', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        cursor.style.borderColor = '#FFBE0B';
    });
});

// Add particle background
function addParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles-container';
    particlesContainer.style.position = 'fixed';
    particlesContainer.style.top = '0';
    particlesContainer.style.left = '0';
    particlesContainer.style.width = '100%';
    particlesContainer.style.height = '100%';
    particlesContainer.style.pointerEvents = 'none';
    particlesContainer.style.zIndex = '-1';
    document.body.appendChild(particlesContainer);

    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.position = 'absolute';
        particle.style.width = '2px';
        particle.style.height = '2px';
        particle.style.background = 'rgba(255, 190, 11, 0.5)';
        particle.style.borderRadius = '50%';
        particle.style.top = Math.random() * 100 + 'vh';
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.boxShadow = '0 0 10px rgba(255, 190, 11, 0.8)';
        particle.style.animation = `floatAnimation ${5 + Math.random() * 10}s ease-in-out infinite`;
        particle.style.animationDelay = Math.random() * 5 + 's';
        particlesContainer.appendChild(particle);
    }
}

addParticles();
