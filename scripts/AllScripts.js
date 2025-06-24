let carouselInterval;
let resizeTimer;
const swup = new Swup({
    plugins: [new SwupPreloadPlugin({
        preloadVisibleLinks: {
            threshold: 0.2,
            delay: 10
        }
    }),
    new SwupJsPlugin({
        animations: [{
            from: '(.*)',
            to: '(.*)',
            out: async () => {
                let instance = M.Sidenav.getInstance(document.querySelector('.sidenav'));
                instance.close()

                await gsap.to('#swup', {opacity: 0, duration: 0.25});
            },
            in: async () => {
                await gsap.fromTo('#swup', {opacity: 0}, {opacity: 1, duration: 0.25});
            }
        }]
    })]
});

// On window resize, resize items and adjust text
window.addEventListener("resize", () => {
    resizeItems()

    if (document.querySelector('.carousel-bottom-text')) {
        debouncedAdjustText()
    }
})

// Listen for DOMContentLoaded if first page viewed is this one
document.addEventListener('DOMContentLoaded', () => pageInit());

// Listen for page load if first page viewed is this one
window.addEventListener('load', () => {
    pageLoad();

    if (document.querySelector('.carousel-top')) {
        carouselInterval = setInterval(moveCarousel, 5000,
            document.querySelector('.carousel-top'), 'next');
    }
});

document.addEventListener('swup:page:view', () => {
    pageInit();
    pageLoad();
})

// swup.hooks.before('content:replace', () => pageUnload());

swup.preload(['index.html', 'about-us.html', 'features.html', 'faq.html']);


const pageInit = function () {
    gsap.registerPlugin(Flip);

    // Initialise Materialize components

    // Sidenav on all pages
    M.Sidenav.init(document.querySelectorAll('.sidenav'), {
        edge: 'right'
    });

    // Optional materialize components
    if (document.querySelectorAll('.carousel')) {
        M.Carousel.init(document.querySelectorAll('.carousel'), {})
    }

    if (document.querySelector('.carousel-top')) {
        M.Carousel.init(document.querySelectorAll('.carousel-top'), {
            onCycleTo: nextSlide
        });
    }

    if (document.querySelectorAll('.parallax')) {
        M.Parallax.init(document.querySelectorAll('.parallax'), {});
    }

    // Initialise video synchronisation
    if (document.querySelector('.video-background') && document.querySelector('.video-foreground')) {
        const backgroundVideo = document.querySelector('.video-background');
        const foregroundVideo = document.querySelector('.video-foreground');

        // Function to synchronise the videos
        const syncVideos = () => {
            if (backgroundVideo.readyState >= 3 && foregroundVideo.readyState >= 3) {
                const seekTime = foregroundVideo.currentTime;
                if (Math.abs(backgroundVideo.currentTime - seekTime) > 0.1) {
                    backgroundVideo.currentTime = seekTime;
                }
            }
        };

        // Listen for time updates on the foreground video
        foregroundVideo.addEventListener('timeupdate', syncVideos);

        // Initial sync when both videos are ready to play
        Promise.all([
            new Promise(resolve => backgroundVideo.oncanplaythrough = resolve),
            new Promise(resolve => foregroundVideo.oncanplaythrough = resolve)
        ]).then(() => {
            backgroundVideo.play();
            foregroundVideo.play();
        })
    }

    if (document.querySelector('.carousel-left-bottom') && document.querySelector('.carousel-right-bottom')) {
        // On carousel bottom click, move carousel to next or previous item
        document.querySelector('.carousel-left-bottom').addEventListener('click', () => {
            moveCarousel(document.querySelector('.carousel-bottom'), 'prev')
        })

        document.querySelector('.carousel-right-bottom').addEventListener('click', () => {
            moveCarousel(document.querySelector('.carousel-bottom'), 'next')
        })
    }

    if (document.querySelector('.zoom-image')) {
        const images = document.querySelectorAll(".zoom-image");
        const body = document.body;

        const overlay = document.createElement("div");
        overlay.classList.add("zoom-overlay");

        let isZoomed = false;
        let isAnimating = false; // Prevents conflicts from rapid-fire clicks.
        let allParentSections = document.querySelectorAll("section")

        // --- Function to handle the zoom-in animation ---
        function zoomIn() {
            let image = event.currentTarget;
            overlay.id = image.id;

            let parentSectionID = image.parentNode.parentNode.parentNode.parentNode.id

            allParentSections.forEach(section => {
                if (section.querySelector(".zoom-image")) {
                    if (section.id !== parentSectionID) {
                        section.style.zIndex = -1;
                    }
                }
            })

            if (isZoomed || isAnimating) return;
            isAnimating = true;

            const state = Flip.getState(image);

            body.appendChild(overlay);
            image.classList.add("image-zoomed");

            image.scrollIntoView({behavior: "smooth"})

            body.classList.add("body-no-scroll");

            gsap.to(overlay, {opacity: 1, duration: 0.6});

            Flip.from(state, {
                duration: 0.6,
                ease: "power3.inOut",
                scale: true,      // Animate scale for performance.
                absolute: true,   // Isolate the element from layout shifts.
                onComplete: () => {
                    isZoomed = true;
                    isAnimating = false;
                }
            });
        }

        // --- Function to handle the zoom-out animation ---
        function zoomOut() {
            let overlay = event.currentTarget;
            let image = document.getElementById(overlay.id);

            if (!isZoomed || isAnimating) return;
            isAnimating = true;

            const state = Flip.getState(image);

            image.classList.remove("image-zoomed");
            body.classList.remove("body-no-scroll");

            gsap.to(overlay, {
                opacity: 0,
                duration: 0.6,
                onComplete: () => {
                    // Only remove the overlay from the DOM after it's invisible.
                    if (overlay.parentNode) {
                        body.removeChild(overlay);
                    }
                }
            });

            Flip.from(state, {
                duration: 0.6,
                ease: "power3.inOut",
                scale: true,
                absolute: true,
                onComplete: () => {
                    isZoomed = false;
                    isAnimating = false;

                    allParentSections.forEach(section => {
                        if (section.querySelector(".zoom-image")) {
                            section.style.zIndex = 1;
                        }
                    })
                }
            });
        }

        images.forEach(image => {
            image.addEventListener("click", zoomIn);
        })

        overlay.addEventListener("click", zoomOut);
    }

}

const pageLoad = function () {
    // Function to run on page load
    const hash = window.location.hash;
    if (hash) {
        const targetElement = document.querySelector(hash);
        if (targetElement) {
            targetElement.scrollIntoView({behavior: "smooth"});
        }
    }

    // Move all the carousels by one before adjusting sizes (prevents conflicts)
    if (document.querySelectorAll('.carousel')) {
        let carousels = document.querySelectorAll('.carousel');
        carousels.forEach(carousel => {
            let instance = M.Carousel.getInstance(carousel);
            instance.next()
        })
    }

    // Resize items and adjust text
    resizeItems()

    if (document.querySelector('.carousel-bottom-text')) {
        adjustCarouselText()
    }

    if (document.querySelector('.carousel-top')) {
        carouselInterval = setInterval(moveCarousel, 5000,
            document.querySelector('.carousel-top'), 'next');
    }

    if (document.querySelector('.zoom-image')) {
        let allParentSections = document.querySelectorAll("section")
        allParentSections.forEach(section => {
            if (section.querySelector(".zoom-image")) {
                let subSection = section.querySelector(".container");
                let currentHeight = subSection.clientHeight;

                subSection.style.height = currentHeight + "px";
            }
        })
    }
}

const nextSlide = function (activeSlide) {
    const h2 = activeSlide.querySelector('h2');
    const h5 = activeSlide.querySelector('h5');
    const icon = activeSlide.querySelector('i');

    gsap.killTweensOf([h2, h5, icon]);

    gsap.set(h2, {opacity: 1});

    let split = SplitText.create(h2, {
        type: "words",
        wordsClass: "word++",
        wordDelimiter: " "
    });

    gsap.from(split.words, {
        y: -50,
        opacity: 0,
        rotation: "random(-80, 80)",
        stagger: 0.2,
        duration: 1,
        ease: "back"
    });

    var tl = gsap.timeline({repeat: 1});

    tl.to(icon, {
        scale: 1.3,
        duration: 0.3,
        ease: "back"
    })
        .to(icon, {
            scale: 1,
            duration: 0.3,
            ease: "back"
        })
}

function resizeItems() {
    // Function to resize webpage items on the window load and window resize

    if (document.querySelector('.index-body')) {
        // Resize video to fit inside the phone SVG container
        let phone_width = document.querySelector('.phone-svg').clientWidth
        let phone_height = phone_width * 1.97073170732

        console.log(phone_width, phone_height)

        document.querySelector('.phone-video').style.width = (phone_width * 0.87) + "px"
        document.querySelector('.phone-video').style.left = (phone_width * 0.073) + "px"
        document.querySelector('.phone-video').style.transform = "translateY(-" + (phone_height * 0.98) + "px)"

        document.querySelector('.video-foreground').style.height = (phone_height * 0.955) + "px"

        // Reformat background gradient to match the height of the phone SVG container
        document.querySelector('.gradient-container').style = "background: linear-gradient(transparent " + phone_height * 0.28 + "px, #ffa000 " + phone_height * 0.30 + "px, #ff6a00 100%);" +
            "background: -moz-linear-gradient(transparent " + phone_height * 0.28 + "px, #ffa000 " + phone_height * 0.30 + "px, #ff6a00 100%); " +
            "background: -webkit-gradient(linear, left top, left bottom, color-stop(" + phone_height * 0.28 + "px,transparent), color-stop(" + phone_height * 0.30 + "px,#ffa000), color-stop(100%,#ff6a00)); " +
            "background: -webkit-linear-gradient(transparent " + phone_height * 0.28 + "px, #ffa000 " + phone_height * 0.30 + "px, #ff6a00 100%); " +
            "background: -o-linear-gradient(transparent " + phone_height * 0.28 + "px, #ffa000 " + phone_height * 0.30 + "px, #ff6a00 100%); " +
            "background: -ms-linear-gradient(transparent " + phone_height * 0.28 + "px, #ffa000 " + phone_height * 0.30 + "px, #ff6a00 100%); "

        // Resize the bottom carousel to fit image and title inside
        document.querySelector('.carousel-bottom').style.height = (document.querySelector('.carousel-item-bottom').clientHeight * 1.25) + "px"
        document.querySelector('.carousel-bottom-text').style.height = (document.querySelector('.carousel-item-bottom').clientHeight * 0.25) + "px"

        // Move left and right buttons for carousel bottom to be halfway down the carousel
        let car_height = document.querySelector('.carousel-row').clientHeight
        let button_height = document.querySelector('.carousel-left-bottom').clientHeight
        car_height = (car_height * 0.5) - (button_height * 0.5)
        document.querySelector('.carousel-left-bottom').style.transform = "translateY(" + car_height + "px)"
        document.querySelector('.carousel-right-bottom').style.transform = "translateY(" + car_height + "px)"
    }
}

function adjustCarouselText() {
    // Function to adjust the font size of the text in the bottom carousel to fit inside its container

    const elements = document.querySelectorAll('.carousel-bottom-text');
    const fontSizes = [];

    elements.forEach(element => {
        // Adjust the font size until the text fits inside the container
        element.style.fontSize = '';

        let originalFontSize = element.getAttribute('data-original-font-size');

        if (!originalFontSize) {
            originalFontSize = window.getComputedStyle(element).fontSize;
            element.setAttribute('data-original-font-size', originalFontSize);
        }

        let currentFontSize = parseInt(originalFontSize);
        element.style.fontSize = currentFontSize + 'px';

        while (element.scrollHeight > element.clientHeight && currentFontSize > 0) {
            currentFontSize--;
            element.style.fontSize = currentFontSize + 'px';
        }

        // Store the font size so it can match across slides
        fontSizes.push(currentFontSize);
    });

    // Adjust the font size to match across all the slides
    if (fontSizes.length > 0) {
        const minSize = Math.min(...fontSizes);
        const finalSize = Math.max(0, minSize - 2); // Ensure it doesn't go below 0

        elements.forEach(element => {
            element.style.fontSize = finalSize + 'px';
        });
    }
}

function debouncedAdjustText() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(adjustCarouselText, 100);
}

function moveCarousel(elem, direction) {
    let instance = M.Carousel.getInstance(elem);
    if (direction === 'next') {
        instance.next()
    } else {
        instance.prev()
    }
}