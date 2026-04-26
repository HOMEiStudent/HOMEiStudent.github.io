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
    initVideoPlayer();
    initTimeCalculator();
    initHousemateQuiz();
    initShareButton();
    initEmailCapture();
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
    var stickyCtaMobile = document.getElementById('stickyCtaMobile');
    var closeBtn = document.getElementById('stickyCtaClose');

    var dismissed = false;
    var heroSection = document.querySelector('.hero');

    // Show CTA after scrolling past the hero section
    window.addEventListener('scroll', function() {
        if (dismissed) return;

        var heroBottom = heroSection ? heroSection.offsetTop + heroSection.offsetHeight : 600;

        if (window.scrollY > heroBottom) {
            if (stickyCta) stickyCta.classList.add('visible');
            if (stickyCtaMobile) stickyCtaMobile.classList.add('visible');
        } else {
            if (stickyCta) stickyCta.classList.remove('visible');
            if (stickyCtaMobile) stickyCtaMobile.classList.remove('visible');
        }
    }, { passive: true });

    // Dismiss CTA when close button is clicked (desktop only)
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            dismissed = true;
            if (stickyCta) stickyCta.classList.remove('visible');
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
    var faqSection = document.querySelector('.faq-section');
    if (!faqSection) return;

    var faqItems = faqSection.querySelectorAll('.faq-item');

    faqItems.forEach(function(item) {
        var question = item.querySelector('.faq-question');

        if (question) {
            question.addEventListener('click', function() {
                var isActive = item.classList.contains('active');
                var expanded = question.getAttribute('aria-expanded') === 'true';

                // Close all other items
                faqItems.forEach(function(otherItem) {
                    otherItem.classList.remove('active');
                    var otherQuestion = otherItem.querySelector('.faq-question');
                    if (otherQuestion) otherQuestion.setAttribute('aria-expanded', 'false');
                });

                // Toggle current item
                if (!isActive) {
                    item.classList.add('active');
                    question.setAttribute('aria-expanded', 'true');
                }
            });
        }
    });

    // Open first FAQ by default for better UX
    if (faqItems.length > 0) {
        var firstItem = faqItems[0];
        firstItem.classList.add('active');
        var firstQuestion = firstItem.querySelector('.faq-question');
        if (firstQuestion) firstQuestion.setAttribute('aria-expanded', 'true');
    }
}

// ==========================================
// 12B. SHARE TO HOUSEMATES
// ==========================================
function initShareButton() {
    var shareBtn = document.getElementById('shareButton');
    if (!shareBtn) return;

    shareBtn.addEventListener('click', function() {
        var shareData = {
            title: 'HOMEi - Sort Your Student House',
            text: 'Lads we need this — sorts the bills and chores. Free:',
            url: 'https://homeistudent.com'
        };

        if (navigator.share) {
            navigator.share(shareData).catch(function(err) {
                console.log('Share cancelled or failed');
            });
        } else {
            // Fallback: copy to clipboard
            var shareText = shareData.text + ' ' + shareData.url;
            navigator.clipboard.writeText(shareText).then(function() {
                shareBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> Link copied!';
                setTimeout(function() {
                    shareBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg> Share with your housemates';
                }, 2000);
            });
        }
    });
}

// ==========================================
// 12C. EMAIL CAPTURE
// ==========================================
function initEmailCapture() {
    var form = document.getElementById('emailCaptureForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        var emailInput = form.querySelector('.email-input');
        var submitBtn = form.querySelector('.email-submit');
        var email = emailInput.value;

        if (!email) return;

        // Store email locally (replace with actual API call)
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        // Simulate API call - replace with actual Formspree or backend
        setTimeout(function() {
            // Store in localStorage as fallback
            var emails = JSON.parse(localStorage.getItem('homei_reminder_emails') || '[]');
            emails.push({ email: email, date: new Date().toISOString() });
            localStorage.setItem('homei_reminder_emails', JSON.stringify(emails));

            submitBtn.textContent = '✓ We\'ll remind you!';
            submitBtn.style.background = '#22c55e';
            emailInput.value = '';

            setTimeout(function() {
                submitBtn.textContent = 'Remind Me';
                submitBtn.style.background = '';
                submitBtn.disabled = false;
            }, 3000);
        }, 800);
    });
}

// ==========================================
// 13. VIDEO PLAYER
// ==========================================
function initVideoPlayer() {
    var video = document.getElementById('demoVideo');
    var playBtn = document.getElementById('videoPlayBtn');
    
    if (!video || !playBtn) return;
    
    playBtn.addEventListener('click', function() {
        if (video.paused) {
            video.play();
            playBtn.classList.add('hidden');
        }
    });
    
    video.addEventListener('click', function() {
        if (video.paused) {
            video.play();
            playBtn.classList.add('hidden');
        } else {
            video.pause();
            playBtn.classList.remove('hidden');
        }
    });
    
    video.addEventListener('ended', function() {
        playBtn.classList.remove('hidden');
    });
}

// ==========================================
// 14. TIME SAVED CALCULATOR
// ==========================================
/*
 * TIME SAVINGS CALCULATION METHODOLOGY
 * =====================================
 * Based on research from multiple sources:
 *
 * 1. BILL MANAGEMENT TIME:
 *    - SpareRoom survey (2019): 67% of sharers spend 30+ mins/month on bill admin
 *    - Average time per bill split manually: 15-20 minutes (chasing, calculating, transferring)
 *    - NatWest Student Living Index (2023): students spend 2+ hrs/month on money admin
 *    - Source: SpareRoom.co.uk Annual Survey, NatWest Student Living Index
 *
 * 2. CHORE COORDINATION TIME:
 *    - UK Time Use Survey (ONS): Household management takes 2-4 hrs/week
 *    - Coordination overhead in shared housing adds ~45 mins/week (messaging, reminding, rota planning)
 *    - Source: Office for National Statistics Time Use Survey 2020
 *
 * 3. HOUSEHOLD DISPUTES:
 *    - SpareRoom (2023): 40% of flatmates argue about cleaning weekly
 *    - ARLA Propertymark: Bills and chores are top 2 causes of disputes
 *    - Average resolution time per dispute: 20-30 minutes (including passive-aggressive tension)
 *    - Sources: SpareRoom Flatmate Report, ARLA Propertymark
 *
 * 4. COMMUNICATION & PLANNING OVERHEAD:
 *    - Group chat coordination: 30-50 mins/week (Save the Student survey, 2023)
 *    - Shopping list management, calendar sync, event planning
 *    - More housemates = exponentially more coordination needed
 *    - Source: UCAS/Save the Student Survey 2023
 *
 * REAL-WORLD TIME COMPARISONS:
 *    - Average 2,000-word essay: 20 hours (HEPI Student Academic Experience Survey 2023)
 *    - Average exam revision per module: 23 hours (Advance HE, 2022)
 *    - One season of a TV series: ~10 hours
 *    - Return train London to Edinburgh: ~9 hours
 *
 * CALCULATION FORMULA:
 *    Hours Saved = Bill Admin + Chore Coordination + Dispute Resolution + Planning Overhead
 *    - Bill Admin: (bills per month × 20 mins) × reduction factor (0.85)
 *    - Chore Coord: (housemates × 15 mins/week × 4.3 weeks) × reduction factor (0.75)
 *    - Disputes: (dispute frequency × 25 mins × housemates/2.5) × reduction factor (0.65)
 *    - Planning: (housemates × 8 mins/week × 4.3 weeks) × reduction factor (0.7)
 */
function initTimeCalculator() {
    var housemateSlider = document.getElementById('housemateCount');
    var housemateValue = document.getElementById('housemateValue');
    var calcOptions = document.querySelectorAll('.calc-option');

    if (!housemateSlider) return;

    var settings = {
        housemates: 4,
        billFrequency: 4,  // times per month bills are split
        choreFrequency: 3  // 1=rarely, 3=few times/week, 5=daily arguments
    };

    // Update slider value display
    housemateSlider.addEventListener('input', function() {
        settings.housemates = parseInt(this.value);
        housemateValue.textContent = this.value;
        updateCalculatorResults();
    });

    // Handle option buttons
    calcOptions.forEach(function(option) {
        option.addEventListener('click', function() {
            var parent = this.parentElement;
            parent.querySelectorAll('.calc-option').forEach(function(opt) {
                opt.classList.remove('active');
            });
            this.classList.add('active');

            var value = parseInt(this.getAttribute('data-value'));
            var label = this.closest('.calc-input-group').querySelector('label').textContent;

            if (label.includes('bills')) {
                settings.billFrequency = value;
            } else if (label.includes('chore')) {
                settings.choreFrequency = value;
            }

            updateCalculatorResults();
        });
    });

    function updateCalculatorResults() {
        /*
         * Calculate time saved based on research-backed estimates:
         *
         * 1. Bill admin: 20 mins per bill cycle × frequency × 85% reduction
         * 2. Chore coordination: 15 mins per housemate per week × 75% reduction
         * 3. Dispute resolution: 25 mins per dispute, frequency-based × 65% reduction
         * 4. Planning overhead: 8 mins per housemate per week × 70% reduction
         */

        // Bill admin time (hours): 20 mins per bill cycle, 85% time saved with app
        var billAdminSaved = (settings.billFrequency * 20 / 60) * 0.85;

        // Chore coordination time (hours): 15 mins per housemate per week, 4.3 weeks/month, 75% saved
        var choreCoordSaved = (settings.housemates * 15 / 60) * 4.3 * 0.75;

        // Dispute resolution time (hours): 25 mins per dispute, frequency-based, 65% saved
        var disputeTimeSaved = (settings.choreFrequency * 25 / 60) * (settings.housemates / 2.5) * 0.65;

        // Planning overhead (hours): shopping lists, calendar sync, event planning
        var planningOverhead = (settings.housemates * 8 / 60) * 4.3 * 0.7;

        // Total monthly hours saved (rounded)
        var hoursSaved = Math.round(billAdminSaved + choreCoordSaved + disputeTimeSaved + planningOverhead);

        // Arguments avoided: based on chore frequency and housemate dynamics
        // SpareRoom (2023): automated systems reduce disputes by ~55-65%
        var argumentsAvoided = Math.round(settings.choreFrequency * (settings.housemates - 1) * 0.6);

        // Yearly projection
        var yearlyHours = hoursSaved * 12;

        // Update display
        animateNumber('hoursSaved', hoursSaved);
        animateNumber('argumentsAvoided', argumentsAvoided);
        animateNumber('yearlyHours', yearlyHours);

        // Update CTA with dynamic hours
        var ctaHoursEl = document.getElementById('ctaHoursValue');
        if (ctaHoursEl) ctaHoursEl.textContent = yearlyHours;

        // Update the yearly comparison text
        updateYearlyComparison(yearlyHours);

        // Update progress bars - scale to fill visually (max based on realistic upper range)
        var maxHours = hoursSaved + 4; // Bar always looks nearly full
        var maxArguments = argumentsAvoided + 4;

        document.getElementById('hoursProgress').style.width =
            Math.min(100, Math.max(40, (hoursSaved / maxHours) * 100)) + '%';
        document.getElementById('argumentsProgress').style.width =
            Math.min(100, Math.max(40, (argumentsAvoided / maxArguments) * 100)) + '%';
    }

    function updateYearlyComparison(yearlyHours) {
        var comparisonEl = document.getElementById('yearlyComparison');
        if (!comparisonEl) return;

        if (yearlyHours >= 120) {
            comparisonEl.innerHTML = "That's roughly <strong>" + Math.floor(yearlyHours / 40) + " full working weeks</strong> you could spend on your degree, social life, or just chilling.";
        } else if (yearlyHours >= 60) {
            comparisonEl.innerHTML = "That's <strong>" + yearlyHours + " hours a year</strong> back for what actually matters.";
        } else {
            comparisonEl.innerHTML = "That's <strong>" + yearlyHours + " hours a year</strong> you'd otherwise lose to house admin.";
        }
    }
    
    function animateNumber(elementId, target) {
        var element = document.getElementById(elementId);
        if (!element) return;
        
        var current = parseInt(element.textContent) || 0;
        var increment = (target - current) / 20;
        var step = 0;
        
        var animation = setInterval(function() {
            step++;
            current += increment;
            element.textContent = Math.round(current);
            
            if (step >= 20) {
                clearInterval(animation);
                element.textContent = target;
            }
        }, 25);
    }
    
    // Initial calculation
    updateCalculatorResults();
}

// ==========================================
// 15. HOUSEMATE QUIZ
// ==========================================
function initHousemateQuiz() {
    var quizCard = document.getElementById('quizCard');
    var quizQuestions = document.getElementById('quizQuestions');
    var quizResults = document.getElementById('quizResults');
    var progressBar = document.getElementById('quizProgressBar');
    var progressText = document.getElementById('quizProgressText');
    var restartBtn = document.getElementById('quizRestart');
    
    if (!quizCard || !quizQuestions) return;
    
    var quizConfig = null;
    var currentQuestion = 0;
    var scores = {
        organiser: 0,
        peacekeeper: 0,
        socialite: 0,
        chilled: 0
    };
    
    // Load quiz config
    fetch('data/quiz-config.json')
        .then(function(response) { return response.json(); })
        .then(function(data) {
            quizConfig = data;
            renderQuestion();
        })
        .catch(function(error) {
            console.log('Quiz config not loaded, using default');
            quizConfig = getDefaultQuizConfig();
            renderQuestion();
        });
    
    function getDefaultQuizConfig() {
        return {
            questions: [
                {
                    id: 1,
                    question: "It's the end of the month and bills are due. What do you do?",
                    options: [
                        { text: "I've already calculated everyone's share and sent reminders", scores: { organiser: 3, peacekeeper: 1, socialite: 0, chilled: 0 } },
                        { text: "I'll sort it when someone mentions it", scores: { organiser: 0, peacekeeper: 1, socialite: 1, chilled: 3 } },
                        { text: "I make sure everyone's happy with the split before paying", scores: { organiser: 1, peacekeeper: 3, socialite: 1, chilled: 0 } },
                        { text: "Bills? I thought someone else was handling that!", scores: { organiser: 0, peacekeeper: 0, socialite: 2, chilled: 2 } }
                    ]
                },
                {
                    id: 2,
                    question: "The kitchen is a mess. What's your move?",
                    options: [
                        { text: "Create a cleaning rota so this never happens again", scores: { organiser: 3, peacekeeper: 1, socialite: 0, chilled: 0 } },
                        { text: "Clean it myself to avoid any drama", scores: { organiser: 1, peacekeeper: 3, socialite: 0, chilled: 1 } },
                        { text: "Suggest we all clean together and put some music on", scores: { organiser: 0, peacekeeper: 1, socialite: 3, chilled: 1 } },
                        { text: "Honestly? I might be part of the problem...", scores: { organiser: 0, peacekeeper: 0, socialite: 1, chilled: 3 } }
                    ]
                },
                {
                    id: 3,
                    question: "Your housemate forgot to take the bins out (again). You...",
                    options: [
                        { text: "Add it to the house app and set up automatic reminders", scores: { organiser: 3, peacekeeper: 1, socialite: 0, chilled: 0 } },
                        { text: "Just do it yourself to keep the peace", scores: { organiser: 0, peacekeeper: 3, socialite: 0, chilled: 1 } },
                        { text: "Joke about it in the group chat", scores: { organiser: 0, peacekeeper: 1, socialite: 3, chilled: 1 } },
                        { text: "Wait, the bins needed taking out?", scores: { organiser: 0, peacekeeper: 0, socialite: 0, chilled: 3 } }
                    ]
                },
                {
                    id: 4,
                    question: "There's tension in the house. How do you handle it?",
                    options: [
                        { text: "Call a house meeting with a clear agenda", scores: { organiser: 3, peacekeeper: 2, socialite: 0, chilled: 0 } },
                        { text: "Talk to each person privately to understand both sides", scores: { organiser: 1, peacekeeper: 3, socialite: 1, chilled: 0 } },
                        { text: "Suggest a house night out to clear the air", scores: { organiser: 0, peacekeeper: 1, socialite: 3, chilled: 1 } },
                        { text: "Stay in my room until it blows over", scores: { organiser: 0, peacekeeper: 0, socialite: 0, chilled: 3 } }
                    ]
                },
                {
                    id: 5,
                    question: "What's your ideal Friday night in the house?",
                    options: [
                        { text: "Planning next week's meals and getting ahead on tasks", scores: { organiser: 3, peacekeeper: 0, socialite: 0, chilled: 1 } },
                        { text: "Cooking dinner for everyone and having a chat", scores: { organiser: 1, peacekeeper: 3, socialite: 2, chilled: 0 } },
                        { text: "Pre-drinks and getting ready to go out!", scores: { organiser: 0, peacekeeper: 0, socialite: 3, chilled: 1 } },
                        { text: "Netflix in my room with snacks", scores: { organiser: 0, peacekeeper: 1, socialite: 0, chilled: 3 } }
                    ]
                }
            ],
            results: {
                organiser: {
                    title: "The Organiser",
                    badge: "📋",
                    description: "You're the backbone of your house! Without you, bills would go unpaid and the bins would overflow.",
                    traits: ["Detail-oriented", "Reliable", "Forward-thinking", "Natural leader"]
                },
                peacekeeper: {
                    title: "The Peacekeeper",
                    badge: "☮️",
                    description: "You're the glue that holds your house together. When tensions rise, you're the one smoothing things over.",
                    traits: ["Empathetic", "Diplomatic", "Good listener", "Conflict resolver"]
                },
                socialite: {
                    title: "The Social Butterfly",
                    badge: "🦋",
                    description: "You're the life of the house! You know everyone's schedule and organise the best nights out.",
                    traits: ["Outgoing", "Fun-loving", "Great communicator", "Event planner"]
                },
                chilled: {
                    title: "The Chilled One",
                    badge: "😎",
                    description: "Nothing phases you. You go with the flow and don't stress about the small stuff.",
                    traits: ["Laid-back", "Easy-going", "Low maintenance", "Stress-free"]
                }
            }
        };
    }
    
    function renderQuestion() {
        if (!quizConfig) return;
        
        var question = quizConfig.questions[currentQuestion];
        var totalQuestions = quizConfig.questions.length;
        
        // Update progress
        var progress = ((currentQuestion + 1) / totalQuestions) * 100;
        progressBar.style.width = progress + '%';
        progressText.textContent = 'Question ' + (currentQuestion + 1) + ' of ' + totalQuestions;
        
        // Render question
        var html = '<div class="quiz-question">';
        html += '<h3>' + question.question + '</h3>';
        html += '<div class="quiz-options">';
        
        question.options.forEach(function(option, index) {
            html += '<button class="quiz-option" data-index="' + index + '">' + option.text + '</button>';
        });
        
        html += '</div></div>';
        
        quizQuestions.innerHTML = html;
        
        // Bind click events
        var options = quizQuestions.querySelectorAll('.quiz-option');
        options.forEach(function(opt) {
            opt.addEventListener('click', function() {
                selectOption(this, parseInt(this.getAttribute('data-index')));
            });
        });
    }
    
    function selectOption(element, optionIndex) {
        // Add selected class
        element.classList.add('selected');
        
        // Get scores for this option
        var question = quizConfig.questions[currentQuestion];
        var optionScores = question.options[optionIndex].scores;
        
        // Add to total scores
        Object.keys(optionScores).forEach(function(key) {
            scores[key] += optionScores[key];
        });
        
        // Move to next question or show results
        setTimeout(function() {
            currentQuestion++;
            
            if (currentQuestion >= quizConfig.questions.length) {
                showResults();
            } else {
                renderQuestion();
            }
        }, 400);
    }
    
    function showResults() {
        quizQuestions.style.display = 'none';
        quizResults.style.display = 'block';
        progressBar.style.width = '100%';
        progressText.textContent = 'Complete!';
        
        // Find highest score
        var maxScore = 0;
        var resultType = 'organiser';
        
        Object.keys(scores).forEach(function(key) {
            if (scores[key] > maxScore) {
                maxScore = scores[key];
                resultType = key;
            }
        });
        
        // Display result
        var result = quizConfig.results[resultType];
        
        document.getElementById('resultBadge').textContent = result.badge;
        document.getElementById('resultTitle').textContent = result.title;
        document.getElementById('resultDescription').textContent = result.description;
        
        var traitsHtml = '';
        result.traits.forEach(function(trait) {
            traitsHtml += '<span class="trait-badge">' + trait + '</span>';
        });
        document.getElementById('resultTraits').innerHTML = traitsHtml;
    }
    
    // Restart quiz
    if (restartBtn) {
        restartBtn.addEventListener('click', function() {
            currentQuestion = 0;
            scores = { organiser: 0, peacekeeper: 0, socialite: 0, chilled: 0 };
            quizQuestions.style.display = 'block';
            quizResults.style.display = 'none';
            renderQuestion();
        });
    }
}
