let carouselInterval;
let resizeTimer;
let overlay;
let car_top
let car_bottom
let car_left
let car_right
let car_bottom_text
let zoom_images
let fav_house
let isZoomed
let isAnimating
let allParentSections
let body
let isIndex

const optional_components = [['.carousel', 'M_Carousel'], ['.parallax', 'M_Parallax'], ['.collapsible', 'M_Collapsible']]

gsap.registerPlugin(Flip);
gsap.registerPlugin(ScrollToPlugin);

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
                let tl = gsap.timeline();

                let urlSearchParams = new URLSearchParams(window.location.search);
                let anchor = urlSearchParams.get('anchor');

                if (anchor) {
                    await tl.fromTo('#swup', {opacity: 0}, {opacity: 1, duration: 0.25})
                        .to(window, {
                            duration: 0.5,
                            scrollTo:{y:anchor, autoKill: true},
                            ease: 'power3.inOut'
                        })
                } else {
                    await tl.fromTo('#swup', {opacity: 0}, {opacity: 1, duration: 0.25});
                }
            }
        }]
    })]
});

// Listen for DOMContentLoaded if first page viewed is this one
document.addEventListener('DOMContentLoaded', () => {pageInit()});

// Listen for page load if first page viewed is this one
window.addEventListener('load', () => {
    pageLoad();

    let resizeEvent = () => {
        pageInit();
        pageLoad();

        if (car_bottom_text) {debouncedAdjustText('.carousel-bottom-text')}
        if (fav_house) {debouncedAdjustText('.fave-house', true)}
    }

    // On window resize, resize items and adjust text
    window.addEventListener('resize', () => {resizeEvent()})
    screen.orientation.addEventListener('change', () => {resizeEvent()})
});

document.addEventListener('swup:page:view', () => {
    pageInit();
    pageLoad();
})

swup.hooks.before('content:replace', () => pageUnload());

swup.preload(['index.html', 'about-us.html', 'features.html', 'faq.html']);

const pageUnload = function () {
    // Sidenav on all pages
    M.Sidenav.getInstance(document.querySelector('.sidenav')).destroy();

    // Optional materialize components
    optional_components.forEach(component => {
        let elems = document.querySelectorAll(component[0])
        if (elems) {elems.forEach(elem => {elem[component[1]].destroy()})}
    })

    clearInterval(carouselInterval)
}

const pageInit = function () {
    // Update all the init variables (needed because of swup reload process)
    isZoomed = false;
    isAnimating = false;
    allParentSections = document.querySelectorAll('section')
    body = document.body;

    isIndex = document.querySelector('.index-body')
    if (isIndex) {
        car_top = document.querySelector('.carousel-top')
        car_bottom = document.querySelector('.carousel-bottom')
        car_left = document.querySelector('.carousel-left-bottom')
        car_right = document.querySelector('.carousel-right-bottom')
        car_bottom_text = document.querySelector('.carousel-bottom-text')
    }

    zoom_images = document.querySelectorAll('.zoom-image')
    fav_house = document.querySelector('.fave-house')


    // Initialise Materialize components
    M.AutoInit();

    // Sidenav on all pages
    M.Sidenav.init(document.querySelectorAll('.sidenav'), {edge: 'right'});

    if (car_top) {M.Carousel.init(car_top, {onCycleTo: nextSlide})}

    // Initialise video synchronisation
    const backgroundVideo = document.querySelector('.video-background');
    const foregroundVideo = document.querySelector('.video-foreground');
    if (backgroundVideo && foregroundVideo) {
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

    if (car_left && car_right) {
        car_left.addEventListener('click', () => {moveCarousel(car_bottom, 'prev')})
        car_right.addEventListener('click', () => {moveCarousel(car_bottom, 'next')})
    }

    if (zoom_images) {
        overlay = document.createElement('div');
        overlay.classList.add('zoom-overlay');

        zoom_images.forEach(image => {
            image.addEventListener('click', zoomIn);
        })

        overlay.addEventListener('click', zoomOut);
    }
}

const pageLoad = function () {
    // Function to run on page load

    // Resize items and adjust text
    resizeItems()

    if (car_bottom_text) {FitTextToBox('.carousel-bottom-text')}
    if (fav_house) {FitTextToBox('.fave-house', true)}

    if (car_top) {
        clearInterval(carouselInterval)
        carouselInterval = setInterval(moveCarousel, 5000, car_top, 'next');
    }

    if (zoom_images) {
        allParentSections.forEach(section => {
            if (section.querySelector('.zoom-image')) {
                let subSection = section.querySelector('.container');
                subSection.style.height = subSection.clientHeight + 'px';
            }
        })
    }
}

// --- Function to handle the zoom-in animation ---
function zoomIn() {
    let image = event.currentTarget;
    overlay.id = image.id;

    let parentSectionID = image.parentNode.parentNode.parentNode.parentNode.id

    allParentSections.forEach(section => {
        if (section.querySelector('.zoom-image') && section.id !== parentSectionID) {
              section.style.zIndex = -1;
        }
    })

    if (isZoomed || isAnimating) {return}
    isAnimating = true;

    const state = Flip.getState(image);

    body.appendChild(overlay);

    image.classList.add('image-zoomed');
    image.scrollIntoView({behavior: 'smooth'})

    body.classList.add('body-no-scroll');

    gsap.to(overlay, {opacity: 1, duration: 0.6});

    Flip.from(state, {
        duration: 0.6,
        ease: 'power3.inOut',
        scale: true,
        absolute: true,
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
    
    if (!isZoomed || isAnimating) {return}
    isAnimating = true;

    const state = Flip.getState(image);

    image.classList.remove('image-zoomed');
    body.classList.remove('body-no-scroll');

    gsap.to(overlay, {
        opacity: 0,
        duration: 0.6,
        onComplete: () => {
            if (overlay.parentNode) {body.removeChild(overlay)}
        }
    });

    Flip.from(state, {
        duration: 0.6,
        ease: 'power3.inOut',
        scale: true,
        absolute: true,
        onComplete: () => {
            isZoomed = false;
            isAnimating = false;

            allParentSections.forEach(section => {
                if (section.querySelector('.zoom-image')) {
                    section.style.zIndex = 1;
                }
            })
        }
    });
}

const nextSlide = function (activeSlide) {
    const h2 = activeSlide.querySelector('h2');
    const h5 = activeSlide.querySelector('h5');
    const icon = activeSlide.querySelector('i');

    gsap.killTweensOf([h2, h5, icon]);

    gsap.set(h2, {opacity: 1});

    let split = SplitText.create(h2, {
        type: 'words',
        wordsClass: 'word++',
        wordDelimiter: ' '
    });

    gsap.from(split.words, {
        y: -50,
        opacity: 0,
        rotation: 'random(-80, 80)',
        stagger: 0.2,
        duration: 1,
        ease: 'back'
    });

    let tl = gsap.timeline({repeat: 1});

    tl.to(icon, {
        scale: 1.3,
        duration: 0.3,
        ease: 'back'
    })
        .to(icon, {
            scale: 1,
            duration: 0.3,
            ease: 'back'
        })
}

// Generic transform function for all browsers
const transformItem = function (elem, transform) {
    elem.style.transform = transform
    elem.style.webkitTransform = transform
    elem.style.MozTransform = transform
    elem.style.msTransform = transform
    elem.style.OTransform = transform
}

function resizeItems() {
    // Function to resize webpage items on the window load and window resize

    let parents = document.querySelectorAll('.height-parent')
    if (parents) {
        parents.forEach(parent => {
            let definer = parent.querySelector('.height-definer');
            let child  = parent.querySelector('.height-child');

            let H = definer.clientHeight;
            parent.style.height = H + 'px';

            let offset = (H - child.clientHeight) / 2;

            child.style.paddingTop  = offset + 'px';
        })
    }

    if (isIndex) {
        // Resize video to fit inside the phone SVG container
        let phone_width = document.querySelector('.phone-svg').clientWidth
        let phone_height = phone_width * 1.97073170732

        let video_element = document.querySelector('.phone-video')
        let translation = 'translate(' + (phone_width * 0.073) + 'px, -' + (phone_height * 0.98) + 'px)'

        video_element.style.width = (phone_width * 0.87) + 'px'
        transformItem(video_element, translation)

        document.querySelector('.video-foreground').style.height = (phone_height * 0.955) + 'px'

        // Reformat background gradient to match the height of the phone SVG container
        document.querySelector('.gradient-container').style = 'background: linear-gradient(transparent ' + phone_height * 0.28 + 'px, #ffa000 ' + phone_height * 0.30 + 'px, #ff6a00 100%);' +
            'background: -moz-linear-gradient(transparent ' + phone_height * 0.28 + 'px, #ffa000 ' + phone_height * 0.30 + 'px, #ff6a00 100%); ' +
            'background: -webkit-gradient(linear, left top, left bottom, color-stop(' + phone_height * 0.28 + 'px,transparent), color-stop(' + phone_height * 0.30 + 'px,#ffa000), color-stop(100%,#ff6a00)); ' +
            'background: -webkit-linear-gradient(transparent ' + phone_height * 0.28 + 'px, #ffa000 ' + phone_height * 0.30 + 'px, #ff6a00 100%); ' +
            'background: -o-linear-gradient(transparent ' + phone_height * 0.28 + 'px, #ffa000 ' + phone_height * 0.30 + 'px, #ff6a00 100%); ' +
            'background: -ms-linear-gradient(transparent ' + phone_height * 0.28 + 'px, #ffa000 ' + phone_height * 0.30 + 'px, #ff6a00 100%); '

        // Resize the bottom carousel to fit image and title inside
        let car_item_bottom = document.querySelector('.carousel-item-bottom')
        car_bottom.style.height = (car_item_bottom.clientWidth * 1.25) + 'px'
        car_bottom_text.style.height = (car_item_bottom.clientWidth * 0.25) + 'px'

        // Move left and right buttons for carousel bottom to be halfway down the carousel
        let car_height = document.querySelector('.carousel-row').clientHeight
        let button_height = car_left.clientHeight
        car_height = (car_height * 0.5) - (button_height * 0.5)

        transformItem(car_left, 'translateY(' + car_height + 'px)')
        transformItem(car_right, 'translateY(' + car_height + 'px)')
    }

    let people = document.querySelector('#people')
    if (people) {
        let person = people.querySelectorAll('.person')

        person.forEach(elem => {
            let image_row = elem.querySelector('.image-row')
            let quote_row = elem.querySelector('.quote-row')

            quote_row.style.height = image_row.clientHeight + 'px'
        })
    }

    let quote_elems = document.querySelectorAll('.quote-text')
    if (quote_elems) {
        quote_elems.forEach(elem => {
            let quote_text = elem.querySelector('.quote-text-inner')
            let quote_left = elem.querySelector('.quote-left')
            let quote_right = elem.querySelector('.quote-right')

            let quote_bbox = quote_text.getBoundingClientRect()

            quote_left.style.left = (quote_bbox.left - quote_left.getBoundingClientRect().width) + 'px'
            quote_left.style.top = ((quote_bbox.top - quote_bbox.height) - quote_left.getBoundingClientRect().height * 2) + 'px'
            quote_right.style.right = (quote_bbox.left - quote_left.getBoundingClientRect().width) + 'px'
            quote_right.style.top = (quote_bbox.top - quote_right.getBoundingClientRect().height) + 'px'
        })
    }
}

function FitTextToBox(selector, oneLine=false) {
    // Function to adjust the font size of the text in the bottom carousel to fit inside its container

    const elements = document.querySelectorAll(selector);
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

         if (oneLine) {
            // Ensure the text does not wrap to multiple lines
            element.style.whiteSpace = 'nowrap'
            element.style.overflow = 'hidden'
        }

        // Adjust font size based on whether we're enforcing one line or not
        while (
            (oneLine && element.scrollWidth > element.clientWidth) ||
            (!oneLine && element.scrollHeight > element.clientHeight)
        ) {
            currentFontSize--
            if (currentFontSize <= 0) {break}
            element.style.fontSize = currentFontSize + 'px'
        }

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

function debouncedAdjustText(selector, oneLine=false) {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {FitTextToBox(selector, oneLine)}, 100);
}

function moveCarousel(elem, direction) {
    let instance = M.Carousel.getInstance(elem);
    if (direction === 'next') {
        instance.next()
    } else {
        instance.prev()
    }
}