/**
 * Confetti Animation Module
 * Creates celebration confetti effects with physics
 */

const Confetti = (() => {
    let canvas = null;
    let ctx = null;
    let particles = [];
    let animationId = null;

    const colors = ['#14b8a6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#f97316'];

    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 8 + 4;
            this.speedX = Math.random() * 6 - 3;
            this.speedY = Math.random() * -15 - 5;
            this.gravity = 0.5;
            this.friction = 0.98;
            this.opacity = 1;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 10 - 5;
            this.shape = Math.random() > 0.5 ? 'circle' : 'square';
        }

        update() {
            this.speedY += this.gravity;
            this.speedX *= this.friction;
            this.speedY *= this.friction;
            this.x += this.speedX;
            this.y += this.speedY;
            this.rotation += this.rotationSpeed;
            
            // Fade out as particles fall
            if (this.y > canvas.height / 2) {
                this.opacity -= 0.02;
            }
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);

            if (this.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            } else {
                ctx.fillStyle = this.color;
                ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            }

            ctx.restore();
        }

        isAlive() {
            return this.opacity > 0 && this.y < canvas.height + 100;
        }
    }

    function init() {
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'confetti-canvas';
            canvas.style.position = 'fixed';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.pointerEvents = 'none';
            canvas.style.zIndex = '9999';
            document.body.appendChild(canvas);
            
            ctx = canvas.getContext('2d');
            resizeCanvas();
            
            window.addEventListener('resize', resizeCanvas);
        }
    }

    function resizeCanvas() {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }

    function animate() {
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles = particles.filter(particle => {
            particle.update();
            particle.draw();
            return particle.isAlive();
        });

        if (particles.length > 0) {
            animationId = requestAnimationFrame(animate);
        } else {
            stopAnimation();
        }
    }

    function stopAnimation() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        if (ctx && canvas) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    function burst(x, y, count = 50) {
        init();
        
        // Create particles at position
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(x, y));
        }

        // Start animation if not already running
        if (!animationId) {
            animate();
        }
    }

    function celebrate(options = {}) {
        const {
            duration = 3000,
            particleCount = 150,
            spread = true
        } = options;

        init();

        if (spread) {
            // Multiple bursts across the screen
            const burstCount = 5;
            const burstInterval = duration / burstCount;
            
            for (let i = 0; i < burstCount; i++) {
                setTimeout(() => {
                    const x = Math.random() * canvas.width;
                    const y = Math.random() * (canvas.height / 3);
                    burst(x, y, particleCount / burstCount);
                }, i * burstInterval);
            }
        } else {
            // Single burst from center
            burst(canvas.width / 2, canvas.height / 2, particleCount);
        }
    }

    function burstFromElement(element, particleCount = 50) {
        if (!element) return;
        
        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        burst(x, y, particleCount);
    }

    function clear() {
        particles = [];
        stopAnimation();
    }

    // Public API
    return {
        burst,
        celebrate,
        burstFromElement,
        clear
    };
})();

// Make available globally
window.Confetti = Confetti;
