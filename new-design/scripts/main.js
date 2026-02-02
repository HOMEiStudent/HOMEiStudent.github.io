/* ==========================================
   HOMEi STUDENT - MAIN JAVASCRIPT
   ==========================================
   Table of Contents:
   1. DOM Content Loaded
   2. Loading Screen
   3. Navigation
   4. Carousel Class (Reusable)
   5. Screenshot Carousel
   6. Initialize Carousels
   7. Scroll Animations
   ========================================== */

// ==========================================
// 1. DOM CONTENT LOADED
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    initLoadingScreen();
    initNavigation();
    initCarousels();
    initScreenshotCarousel();
    initTestimonialsScroll();
});

// ==========================================
// 2. LOADING SCREEN
// ==========================================
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (!loadingScreen) return;

    window.addEventListener('load', function() {
        setTimeout(function() {
            loadingScreen.classList.add('hidden');
        }, 1500);
    });
}

// ==========================================
// 3. NAVIGATION
// ==========================================
function initNavigation() {
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobileNav');
    const navOverlay = document.getElementById('navOverlay');

    if (!hamburger || !mobileNav) return;

    // Toggle mobile menu
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        mobileNav.classList.toggle('active');
        if (navOverlay) navOverlay.classList.toggle('active');
        document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu on overlay click
    if (navOverlay) {
        navOverlay.addEventListener('click', function() {
            hamburger.classList.remove('active');
            mobileNav.classList.remove('active');
            navOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Close menu on link click
    mobileNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            mobileNav.classList.remove('active');
            if (navOverlay) navOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Set active nav link based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// ==========================================
// 4. CAROUSEL CLASS (REUSABLE)
// ==========================================
class Carousel {
    constructor(options) {
        this.container = document.querySelector(options.container);
        if (!this.container) return;

        this.carousel = this.container.querySelector(options.carousel);
        this.items = this.carousel.querySelectorAll(options.items);
        this.prevBtn = this.container.querySelector(options.prevBtn);
        this.nextBtn = this.container.querySelector(options.nextBtn);
        this.dotsContainer = this.container.querySelector(options.dotsContainer);

        this.currentIndex = 0;
        this.totalItems = this.items.length;
        this.autoPlayInterval = null;
        this.autoPlayDelay = options.autoPlayDelay || 5000;
        this.loop = options.loop !== false; // Default to true
        this.gap = options.gap || 32; // 2rem default

        if (this.totalItems === 0) return;

        this.init();
    }

    init() {
        this.createDots();
        this.bindEvents();
        this.updateCarousel();

        if (this.autoPlayDelay > 0) {
            this.startAutoPlay();
        }
    }

    createDots() {
        if (!this.dotsContainer) return;

        this.dotsContainer.innerHTML = '';
        for (let i = 0; i < this.totalItems; i++) {
            const dot = document.createElement('div');
            dot.className = 'carousel-dot';
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => this.goToSlide(i));
            this.dotsContainer.appendChild(dot);
        }
    }

    updateDots() {
        if (!this.dotsContainer) return;

        const dots = this.dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }

    getCardWidth(index) {
        return this.items[index].offsetWidth;
    }

    calculateScrollPosition() {
        const containerWidth = this.carousel.offsetWidth;
        const cardWidth = this.getCardWidth(this.currentIndex);

        // Calculate total width of all cards before current
        let scrollPosition = 0;
        for (let i = 0; i < this.currentIndex; i++) {
            scrollPosition += this.getCardWidth(i) + this.gap;
        }

        // Center the current card
        const centerOffset = (containerWidth - cardWidth) / 2;
        scrollPosition = scrollPosition - centerOffset;

        // Clamp to valid range
        const maxScroll = this.carousel.scrollWidth - containerWidth;
        return Math.max(0, Math.min(scrollPosition, maxScroll));
    }

    updateCarousel() {
        const scrollPosition = this.calculateScrollPosition();

        this.carousel.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });

        this.updateDots();
    }

    goToSlide(index) {
        if (this.loop) {
            // Handle looping
            if (index < 0) {
                this.currentIndex = this.totalItems - 1;
            } else if (index >= this.totalItems) {
                this.currentIndex = 0;
            } else {
                this.currentIndex = index;
            }
        } else {
            // Clamp without looping
            this.currentIndex = Math.max(0, Math.min(index, this.totalItems - 1));
        }

        this.updateCarousel();
    }

    prev() {
        this.goToSlide(this.currentIndex - 1);
    }

    next() {
        this.goToSlide(this.currentIndex + 1);
    }

    startAutoPlay() {
        this.stopAutoPlay();
        this.autoPlayInterval = setInterval(() => {
            this.next();
        }, this.autoPlayDelay);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    bindEvents() {
        // Button clicks
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prev());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.next());
        }

        // Pause auto-play on hover
        this.carousel.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.carousel.addEventListener('mouseleave', () => {
            if (this.autoPlayDelay > 0) this.startAutoPlay();
        });

        // Touch swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        this.carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            this.stopAutoPlay();
        }, { passive: true });

        this.carousel.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
            if (this.autoPlayDelay > 0) this.startAutoPlay();
        }, { passive: true });

        // Mouse drag support
        let isDragging = false;
        let startX = 0;
        let scrollLeft = 0;

        this.carousel.addEventListener('mousedown', (e) => {
            isDragging = true;
            this.carousel.style.cursor = 'grabbing';
            startX = e.pageX - this.carousel.offsetLeft;
            scrollLeft = this.carousel.scrollLeft;
            this.stopAutoPlay();
        });

        this.carousel.addEventListener('mouseleave', () => {
            if (isDragging) {
                isDragging = false;
                this.carousel.style.cursor = 'grab';
                if (this.autoPlayDelay > 0) this.startAutoPlay();
            }
        });

        this.carousel.addEventListener('mouseup', (e) => {
            if (isDragging) {
                isDragging = false;
                this.carousel.style.cursor = 'grab';

                // Determine direction based on drag distance
                const endX = e.pageX - this.carousel.offsetLeft;
                const diff = startX - endX;

                if (Math.abs(diff) > 50) {
                    if (diff > 0) {
                        this.next();
                    } else {
                        this.prev();
                    }
                }

                if (this.autoPlayDelay > 0) this.startAutoPlay();
            }
        });

        this.carousel.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - this.carousel.offsetLeft;
            const walk = (x - startX) * 1.5;
            this.carousel.scrollLeft = scrollLeft - walk;
        });

        // Set grab cursor
        this.carousel.style.cursor = 'grab';

        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.updateCarousel();
            }, 100);
        });
    }

    handleSwipe(startX, endX) {
        const threshold = 50;
        const diff = startX - endX;

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                this.next();
            } else {
                this.prev();
            }
        }
    }

    destroy() {
        this.stopAutoPlay();
    }
}

// ==========================================
// 5. SCREENSHOT CAROUSEL (Hero Phone)
// ==========================================
function initScreenshotCarousel() {
    const phoneScreen = document.getElementById('phoneScreen');
    const dotsContainer = document.getElementById('screenshotDots');

    if (!phoneScreen || !dotsContainer) return;

    const screenshots = phoneScreen.querySelectorAll('.phone-screenshot, .screenshot-placeholder');
    const dots = dotsContainer.querySelectorAll('.screenshot-dot');

    if (screenshots.length === 0) return;

    let currentIndex = 0;
    const totalScreenshots = screenshots.length;

    function updateScreenshot() {
        screenshots.forEach((s, i) => s.classList.toggle('active', i === currentIndex));
        dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
    }

    function nextScreenshot() {
        currentIndex = (currentIndex + 1) % totalScreenshots;
        updateScreenshot();
    }

    // Auto-rotate every 4 seconds
    setInterval(nextScreenshot, 4000);

    // Click dots to change screenshot
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentIndex = index;
            updateScreenshot();
        });
    });
}

// ==========================================
// 6. INITIALIZE CAROUSELS
// ==========================================
function initCarousels() {
    // Features Carousel
    const featuresCarousel = new Carousel({
        container: '#featuresCarouselContainer',
        carousel: '.carousel',
        items: '.feature-card',
        prevBtn: '.carousel-btn.prev',
        nextBtn: '.carousel-btn.next',
        dotsContainer: '.carousel-dots',
        autoPlayDelay: 5000,
        loop: true,
        gap: 32
    });

    // Blog Carousel
    const blogCarousel = new Carousel({
        container: '#blogCarouselContainer',
        carousel: '.carousel',
        items: '.blog-card',
        prevBtn: '.carousel-btn.prev',
        nextBtn: '.carousel-btn.next',
        dotsContainer: '.carousel-dots',
        autoPlayDelay: 5000,
        loop: true,
        gap: 32
    });

    // Testimonials Carousel (if on testimonials page)
    const testimonialsCarousel = new Carousel({
        container: '#testimonialsCarouselContainer',
        carousel: '.carousel',
        items: '.testimonial-card',
        prevBtn: '.carousel-btn.prev',
        nextBtn: '.carousel-btn.next',
        dotsContainer: '.carousel-dots',
        autoPlayDelay: 6000,
        loop: true,
        gap: 32
    });
}

// ==========================================
// 7. SCROLL ANIMATIONS (Optional enhancement)
// ==========================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements with animation classes
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// Initialize scroll animations if needed
// initScrollAnimations();

// ==========================================
// 8. TESTIMONIALS SCROLL (Mobile Carousel)
// ==========================================
function initTestimonialsScroll() {
    const grid = document.querySelector('.testimonials-grid');
    const dotsContainer = document.getElementById('testimonialDots');

    if (!grid || !dotsContainer) return;

    const cards = grid.querySelectorAll('.testimonial-card');
    const dots = dotsContainer.querySelectorAll('.testimonial-dot');

    if (cards.length === 0 || dots.length === 0) return;

    // Update dots based on scroll position
    grid.addEventListener('scroll', function() {
        const scrollLeft = grid.scrollLeft;
        const cardWidth = cards[0].offsetWidth + 16; // Card width + gap
        const currentIndex = Math.round(scrollLeft / cardWidth);

        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    });

    // Click dots to scroll to card
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            const cardWidth = cards[0].offsetWidth + 16;
            grid.scrollTo({
                left: index * cardWidth,
                behavior: 'smooth'
            });
        });
    });
}
