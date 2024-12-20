document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Intersection Observer for fade-in and slide-in animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                if (entry.target.classList.contains('slide-in-trigger')) {
                    entry.target.classList.add('slide-in');
                }
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    // Add slide-in animation to specific elements
    document.querySelectorAll('.beneficio, .step, .testimonial, .trigger').forEach(el => {
        el.classList.add('slide-in-trigger');
    });

    // Countdown timer for limited offer
    const countdownElement = document.createElement('div');
    countdownElement.id = 'countdown';
    countdownElement.style.position = 'fixed';
    countdownElement.style.bottom = '20px';
    countdownElement.style.right = '20px';
    countdownElement.style.backgroundColor = 'var(--accent-color)';
    countdownElement.style.color = '#fff';
    countdownElement.style.padding = '10px';
    countdownElement.style.borderRadius = '5px';
    document.body.appendChild(countdownElement);

    function updateCountdown() {
        const now = new Date();
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const remaining = end - now;

        const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

        countdownElement.textContent = `Oferta expira em: ${hours}h ${minutes}m ${seconds}s`;
    }

    setInterval(updateCountdown, 1000);
    updateCountdown();

    // Simple animation for "Como Funciona" section
    const animationContainer = document.querySelector('.animation-container');
    const steps = ['Conecte', 'Analise', 'Resultados'];
    let currentStep = 0;

    function animateSteps() {
        animationContainer.textContent = steps[currentStep];
        currentStep = (currentStep + 1) % steps.length;
    }

    setInterval(animateSteps, 2000);
    animateSteps();
});
