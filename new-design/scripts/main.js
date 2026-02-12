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
   8. Testimonials Scroll
   9. Counter Animation
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
    initScrollAnimations();
    initCounterAnimation();
    initStickyCta();
    initBeforeAfterToggle();
    initFaqAccordion();
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
    const navbar = document.querySelector('.navbar');

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

    // Navbar shrink on scroll
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }, { passive: true });
    }
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
        this.loop = options.loop !== false;
        this.gap = options.gap || 32;

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

        let scrollPosition = 0;
        for (let i = 0; i < this.currentIndex; i++) {
            scrollPosition += this.getCardWidth(i) + this.gap;
        }

        const centerOffset = (containerWidth - cardWidth) / 2;
        scrollPosition = scrollPosition - centerOffset;

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
            if (index < 0) {
                this.currentIndex = this.totalItems - 1;
            } else if (index >= this.totalItems) {
                this.currentIndex = 0;
            } else {
                this.currentIndex = index;
            }
        } else {
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
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prev());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.next());
        }

        this.carousel.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.carousel.addEventListener('mouseleave', () => {
            if (this.autoPlayDelay > 0) this.startAutoPlay();
        });

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

        this.carousel.style.cursor = 'grab';

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
    let autoPlayInterval = null;

    function updateScreenshot() {
        screenshots.forEach((s, i) => s.classList.toggle('active', i === currentIndex));
        dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
    }

    function nextScreenshot() {
        currentIndex = (currentIndex + 1) % totalScreenshots;
        updateScreenshot();
    }

    function prevScreenshot() {
        currentIndex = (currentIndex - 1 + totalScreenshots) % totalScreenshots;
        updateScreenshot();
    }

    function startAutoPlay() {
        stopAutoPlay();
        autoPlayInterval = setInterval(nextScreenshot, 4000);
    }

    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
    }

    // Start auto-play
    startAutoPlay();

    // Dot click handlers
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentIndex = index;
            updateScreenshot();
            // Restart autoplay after manual interaction
            startAutoPlay();
        });
    });

    // Touch swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    let isSwiping = false;

    phoneScreen.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        isSwiping = true;
        stopAutoPlay();
    }, { passive: true });

    phoneScreen.addEventListener('touchmove', function(e) {
        // Optional: Add visual feedback during swipe
    }, { passive: true });

    phoneScreen.addEventListener('touchend', function(e) {
        if (!isSwiping) return;
        isSwiping = false;

        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        const threshold = 50;

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                // Swipe left - next screenshot
                nextScreenshot();
            } else {
                // Swipe right - previous screenshot
                prevScreenshot();
            }
        }

        // Restart autoplay
        startAutoPlay();
    }, { passive: true });

    // Pause on hover (desktop)
    phoneScreen.addEventListener('mouseenter', stopAutoPlay);
    phoneScreen.addEventListener('mouseleave', startAutoPlay);
}

// ==========================================
// 6. INITIALIZE CAROUSELS
// ==========================================
function initCarousels() {
    new Carousel({
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

    new Carousel({
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

    new Carousel({
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
// 7. SCROLL ANIMATIONS
// ==========================================
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.fade-up, .fade-in, .fade-right, .fade-left, .scale-in');

    if (animatedElements.length === 0) return;

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    });

    animatedElements.forEach(function(el) {
        observer.observe(el);
    });
}

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

    grid.addEventListener('scroll', function() {
        const scrollLeft = grid.scrollLeft;
        const cardWidth = cards[0].offsetWidth + 16;
        const currentIndex = Math.round(scrollLeft / cardWidth);

        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    });

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

// ==========================================
// 9. COUNTER ANIMATION
// ==========================================
function initCounterAnimation() {
    const counters = document.querySelectorAll('[data-count]');

    if (counters.length === 0) return;

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(function(counter) {
        observer.observe(counter);
    });
}

function animateCounter(element) {
    const target = element.getAttribute('data-count');
    const prefix = element.getAttribute('data-prefix') || '';
    const suffix = element.getAttribute('data-suffix') || '';
    const numericTarget = parseFloat(target.replace(/[^0-9.]/g, ''));
    const hasDecimal = target.includes('.');
    const duration = 1500;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = numericTarget * eased;

        if (hasDecimal) {
            element.textContent = prefix + current.toFixed(1) + suffix;
        } else {
            element.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = prefix + target + suffix;
        }
    }

    requestAnimationFrame(update);
}

// ==========================================
// 10. STICKY MOBILE CTA
// ==========================================
function initStickyCta() {
    var stickyCta = document.getElementById('stickyCta');
    var closeBtn = document.getElementById('stickyCtaClose');

    if (!stickyCta) return;

    var dismissed = false;
    var heroSection = document.querySelector('.hero');

    // Show CTA after scrolling past the hero section
    window.addEventListener('scroll', function() {
        if (dismissed) return;

        var heroBottom = heroSection ? heroSection.offsetTop + heroSection.offsetHeight : 600;

        if (window.scrollY > heroBottom) {
            stickyCta.classList.add('visible');
        } else {
            stickyCta.classList.remove('visible');
        }
    }, { passive: true });

    // Dismiss CTA when close button is clicked
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            dismissed = true;
            stickyCta.classList.remove('visible');
        });
    }
}

// ==========================================
// 11. BEFORE/AFTER TOGGLE
// ==========================================
function initBeforeAfterToggle() {
    var toggleContainer = document.getElementById('beforeAfterToggle');
    if (!toggleContainer) return;

    var toggleTabs = toggleContainer.querySelectorAll('.toggle-tab');
    var beforeContent = document.getElementById('before-content');
    var afterContent = document.getElementById('after-content');

    if (!beforeContent || !afterContent || toggleTabs.length === 0) return;

    toggleTabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            var targetTab = this.getAttribute('data-tab');

            // Update active tab
            toggleTabs.forEach(function(t) {
                t.classList.remove('active');
            });
            this.classList.add('active');

            // Update content visibility
            if (targetTab === 'before') {
                beforeContent.classList.add('active');
                afterContent.classList.remove('active');
            } else {
                beforeContent.classList.remove('active');
                afterContent.classList.add('active');
            }
        });
    });

    // Add swipe support for toggle content
    var wrapper = document.querySelector('.toggle-content-wrapper');
    if (wrapper) {
        var touchStartX = 0;
        var touchEndX = 0;

        wrapper.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        wrapper.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            var diff = touchStartX - touchEndX;

            if (Math.abs(diff) > 50) {
                if (diff > 0 && beforeContent.classList.contains('active')) {
                    // Swipe left - show After
                    toggleTabs[1].click();
                } else if (diff < 0 && afterContent.classList.contains('active')) {
                    // Swipe right - show Before
                    toggleTabs[0].click();
                }
            }
        }, { passive: true });
    }
}

// ==========================================
// 12. FAQ ACCORDION
// ==========================================
function initFaqAccordion() {
    var accordion = document.getElementById('faqAccordion');
    if (!accordion) return;

    var faqItems = accordion.querySelectorAll('.faq-item');

    faqItems.forEach(function(item) {
        var question = item.querySelector('.faq-question');
        var toggle = item.querySelector('.faq-toggle');

        if (question) {
            question.addEventListener('click', function() {
                var isActive = item.classList.contains('active');

                // Close all other items
                faqItems.forEach(function(otherItem) {
                    otherItem.classList.remove('active');
                    var otherToggle = otherItem.querySelector('.faq-toggle');
                    if (otherToggle) otherToggle.textContent = '+';
                });

                // Toggle current item
                if (!isActive) {
                    item.classList.add('active');
                    if (toggle) toggle.textContent = '−';
                }
            });
        }
    });

    // Open first FAQ by default for better UX
    if (faqItems.length > 0) {
        var firstItem = faqItems[0];
        firstItem.classList.add('active');
        var firstToggle = firstItem.querySelector('.faq-toggle');
        if (firstToggle) firstToggle.textContent = '−';
    }
}
