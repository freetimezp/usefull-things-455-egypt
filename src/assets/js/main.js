gsap.registerPlugin(SplitText, ScrollTrigger);

/* ================================================= */
/* LENIS */
/* ================================================= */

const lenis = new Lenis({
    lerp: 0.075,
    smoothWheel: true,
    syncTouch: true,
    wheelMultiplier: 0.85,
});

lenis.on("scroll", ScrollTrigger.update);

/* GSAP + Lenis sync */

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

/* ================================================= */
/* ELEMENTS */
/* ================================================= */

const body = document.body;

const cursor = document.querySelector(".cursor-glow");

const hudCurrent = document.querySelector(".hud-current");
const hudProgress = document.querySelector(".hud-progress-bar");
const hudSite = document.querySelector(".hud-site");

const heroTitleLines = document.querySelectorAll(".hero-title-line > span");

const galleryRows = document.querySelectorAll(".gallery-row");

/* ================================================= */
/* NAV SCROLL STATE */
/* ================================================= */

const topNav = document.querySelector(".top-nav");

let navScrolled = false;

lenis.on("scroll", ({ scroll }) => {
    const shouldBeScrolled = scroll > 80;

    if (shouldBeScrolled !== navScrolled) {
        navScrolled = shouldBeScrolled;

        topNav.classList.toggle("scrolled", navScrolled);
    }
});

/* ================================================= */
/* NAV CONTENT MOTION */
/* ================================================= */

const navItems = topNav.querySelectorAll(".nav-left, .nav-center, .nav-right");

lenis.on("scroll", ({ scroll }) => {
    if (scroll > 80) {
        gsap.to(navItems, {
            y: 0,
            duration: 0.5,
            stagger: 0.03,
            ease: "power3.out",
            overwrite: true,
        });
    }
});

/* ================================================= */
/* CUSTOM CURSOR */
/* ================================================= */

if (window.matchMedia("(hover: hover)").matches) {
    gsap.set(cursor, {
        xPercent: -50,
        yPercent: -50,
    });

    window.addEventListener("mousemove", (event) => {
        gsap.to(cursor, {
            x: event.clientX,
            y: event.clientY,
            duration: 0.6,
            ease: "power3.out",
        });

        gsap.to(cursor, {
            opacity: 1,
            duration: 0.4,
        });
    });
}

/* ================================================= */
/* HERO INTRO */
/* ================================================= */

const heroIntro = gsap.timeline({
    defaults: {
        ease: "power4.out",
    },
});

gsap.set(heroTitleLines, {
    yPercent: 115,
});

gsap.set(
    [
        ".hero-topline",
        ".hero-kicker",
        ".hero-description",
        ".hero-bottom",
        ".hero-crosshair",
    ],
    {
        opacity: 0,
    },
);

heroIntro
    .to(".hero-topline", {
        opacity: 1,
        duration: 1,
    })
    .to(
        ".hero-crosshair",
        {
            opacity: 0.35,
            duration: 1.2,
            stagger: 0.15,
        },
        "-=0.7",
    )
    .to(
        ".hero-kicker",
        {
            opacity: 1,
            duration: 0.8,
        },
        "-=0.7",
    )
    .to(
        heroTitleLines,
        {
            yPercent: 0,
            duration: 1.6,
            stagger: 0.13,
            ease: "power4.out",
        },
        "-=0.55",
    )
    .to(
        ".hero-description",
        {
            opacity: 1,
            duration: 1,
        },
        "-=0.8",
    )
    .to(
        ".hero-bottom",
        {
            opacity: 1,
            duration: 1,
        },
        "-=0.7",
    );

/* ================================================= */
/* HERO PARALLAX */
/* ================================================= */

gsap.to(".hero-grid", {
    yPercent: 20,
    ease: "none",
    scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
    },
});

gsap.to(".hero-title", {
    yPercent: -18,
    opacity: 0.3,
    ease: "none",
    scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1,
    },
});

gsap.to(".hero-description", {
    yPercent: -35,
    ease: "none",
    scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1,
    },
});

gsap.to(".hero-crosshair-one", {
    xPercent: 80,
    yPercent: -100,
    rotation: 25,
    ease: "none",
    scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1,
    },
});

gsap.to(".hero-crosshair-two", {
    xPercent: -60,
    yPercent: 80,
    rotation: -20,
    ease: "none",
    scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1,
    },
});

/* ================================================= */
/* INTRO SECTION */
/* ================================================= */

const introText = document.querySelector(".intro-large");

const introSplit = SplitText.create(introText, {
    type: "words",
    mask: "words",
});

gsap.set(introSplit.words, {
    yPercent: 110,
});

gsap.to(introSplit.words, {
    yPercent: 0,
    duration: 1.2,
    stagger: 0.035,
    ease: "power4.out",

    scrollTrigger: {
        trigger: ".archive-intro",
        start: "top 70%",
    },
});

/* ================================================= */
/* SHARED GALLERY HOVER STATE */
/* ================================================= */

let activeCard = null;
let leaveTimer = null;

const hoverStates = new WeakMap();

function getHoverState(card) {
    if (!hoverStates.has(card)) {
        hoverStates.set(card, {
            timeline: null,
            leaving: false,
        });
    }

    return hoverStates.get(card);
}

function cancelLeave() {
    if (leaveTimer) {
        clearTimeout(leaveTimer);
        leaveTimer = null;
    }
}

function killHoverTimeline(card) {
    if (!card) return;

    const state = getHoverState(card);

    if (state.timeline) {
        state.timeline.kill();
        state.timeline = null;
    }
}

/* ================================================= */
/* GALLERY CARDS */
/* ================================================= */

galleryRows.forEach((row, index) => {
    const card = row.querySelector(".gallery-card");

    const frame = card.querySelector(".image-frame");
    const imageWrap = card.querySelector(".image-wrap");
    const imageHover = card.querySelector(".image-hover");

    const image = card.querySelector("img");
    const glow = card.querySelector(".image-glow");
    const scan = card.querySelector(".image-scan");

    const title = card.querySelector(".card-title h2");
    const kicker = card.querySelector(".title-kicker");
    const description = card.querySelector(".card-description");

    const originalRotation = row.classList.contains("gallery-row-right")
        ? 1.25
        : -1.2;

    /* --------------------------------------------- */
    /* INITIAL STATE */
    /* --------------------------------------------- */

    gsap.set(card, {
        opacity: 0,
        y: 100,
    });

    gsap.set(imageWrap, {
        clipPath: "inset(12% 12% 12% 12% round 1rem)",
    });

    gsap.set(image, {
        scale: 1.18,
        yPercent: 8,
        xPercent: 0,
    });

    gsap.set([kicker, title, description], {
        opacity: 0,
        y: 35,
    });

    /* --------------------------------------------- */
    /* SCROLL REVEAL */
    /* --------------------------------------------- */

    const reveal = gsap.timeline({
        scrollTrigger: {
            trigger: row,
            start: "top 82%",
            end: "top 38%",
            scrub: 1.1,
        },
    });

    reveal
        .to(
            card,
            {
                opacity: 1,
                y: 0,
                ease: "power3.out",
            },
            0,
        )
        .to(
            imageWrap,
            {
                clipPath: "inset(0% 0% 0% 0% round 0.45rem)",
                ease: "power3.out",
            },
            0,
        )
        .to(
            image,
            {
                scale: 1,
                yPercent: 0,
                ease: "power3.out",
            },
            0,
        )
        .to(
            kicker,
            {
                opacity: 1,
                y: 0,
                ease: "power3.out",
            },
            0.2,
        )
        .to(
            title,
            {
                opacity: 1,
                y: 0,
                ease: "power4.out",
            },
            0.25,
        )
        .to(
            description,
            {
                opacity: 1,
                y: 0,
                ease: "power3.out",
            },
            0.32,
        );

    /* --------------------------------------------- */
    /* IMAGE CAMERA PARALLAX */
    /* --------------------------------------------- */

    gsap.to(image, {
        yPercent: -10,

        ease: "none",

        scrollTrigger: {
            trigger: row,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
        },
    });

    /* --------------------------------------------- */
    /* FRAME ROTATION */
    /* --------------------------------------------- */

    gsap.fromTo(
        frame,
        {
            rotation: originalRotation * 1.8,
            y: 50,
        },
        {
            rotation: originalRotation,
            y: 0,

            ease: "none",

            scrollTrigger: {
                trigger: row,
                start: "top 90%",
                end: "top 40%",
                scrub: 1,
            },
        },
    );

    /* --------------------------------------------- */
    /* CARD DEPTH */
    /* --------------------------------------------- */

    gsap.to(card, {
        yPercent: index % 2 === 0 ? -4 : 4,

        ease: "none",

        scrollTrigger: {
            trigger: row,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
        },
    });

    /* ================================================= */
    /* HOVER STATE */
    /* ================================================= */

    let hoverTimeline = null;
    let pointerInside = false;

    /* --------------------------------------------- */
    /* INITIAL HOVER STATE */
    /* --------------------------------------------- */

    gsap.set(imageHover, {
        clipPath: "inset(9% 9% 9% 9% round 0.8rem)",
    });

    gsap.set(image, {
        scale: 1.16,
    });

    gsap.set(glow, {
        opacity: 0,
        scale: 0.7,
    });

    gsap.set(scan, {
        opacity: 0,
        yPercent: -120,
    });

    gsap.set(title, {
        x: 0,
    });

    /* --------------------------------------------- */
    /* HOVER IN */
    /* --------------------------------------------- */

    card.addEventListener("pointerenter", () => {
        if (!window.matchMedia("(hover: hover)").matches) return;

        pointerInside = true;

        if (hoverTimeline) {
            hoverTimeline.kill();
        }

        hoverTimeline = gsap.timeline({
            defaults: {
                overwrite: "auto",
            },
        });

        hoverTimeline
            /* ---------------------------------- */
            /* IMAGE CLIP REVEAL */
            /* ---------------------------------- */

            .to(
                imageHover,
                {
                    clipPath: "inset(0% 0% 0% 0% round 0.2rem)",
                    duration: 1.1,
                    ease: "power4.out",
                },
                0,
            )

            /* ---------------------------------- */
            /* IMAGE SCALE */
            /* ---------------------------------- */

            .to(
                image,
                {
                    scale: 1.06,
                    filter: "saturate(0.9) contrast(1) sepia(0.03)",
                    duration: 1.15,
                    ease: "power3.out",
                },
                0,
            )

            /* ---------------------------------- */
            /* GOLD GLOW */
            /* ---------------------------------- */

            .to(
                glow,
                {
                    opacity: 0.55,
                    scale: 1,
                    duration: 0.9,
                    ease: "power3.out",
                },
                0.05,
            )

            /* ---------------------------------- */
            /* SCAN LINE */
            /* ---------------------------------- */

            .fromTo(
                scan,
                {
                    yPercent: -120,
                    opacity: 0,
                },
                {
                    yPercent: 120,
                    opacity: 0.75,
                    duration: 1.25,
                    ease: "power2.inOut",
                },
                0.1,
            )

            /* fade scan back out */
            .to(
                scan,
                {
                    opacity: 0,
                    duration: 0.35,
                    ease: "power2.out",
                },
                1.0,
            )

            /* ---------------------------------- */
            /* TITLE */
            /* ---------------------------------- */

            .to(
                title,
                {
                    x: 8,
                    duration: 0.65,
                    ease: "power3.out",
                },
                0.15,
            );

        /* ---------------------------------- */
        /* CURSOR */
        /* ---------------------------------- */

        gsap.to(cursor, {
            scale: 1.45,
            opacity: 1,
            duration: 0.35,
            ease: "power3.out",
            overwrite: true,
        });
    });

    /* --------------------------------------------- */
    /* HOVER OUT */
    /* --------------------------------------------- */

    card.addEventListener("pointerleave", () => {
        if (!window.matchMedia("(hover: hover)").matches) return;

        pointerInside = false;

        if (hoverTimeline) {
            hoverTimeline.kill();
        }

        hoverTimeline = gsap.timeline({
            defaults: {
                overwrite: "auto",
            },
            onComplete: () => {
                hoverTimeline = null;
            },
        });

        hoverTimeline
            /* ---------------------------------- */
            /* IMAGE CLIP CLOSE */
            /* ---------------------------------- */

            .to(
                imageHover,
                {
                    clipPath: "inset(9% 9% 9% 9% round 0.8rem)",
                    duration: 0.8,
                    ease: "power3.inOut",
                },
                0,
            )

            /* ---------------------------------- */
            /* IMAGE SCALE RESET */
            /* ---------------------------------- */

            .to(
                image,
                {
                    scale: 1.16,
                    filter: "saturate(0.68) contrast(0.92) sepia(0.08)",
                    duration: 0.9,
                    ease: "power3.inOut",
                },
                0,
            )

            /* ---------------------------------- */
            /* GLOW OUT */
            /* ---------------------------------- */

            .to(
                glow,
                {
                    opacity: 0,
                    scale: 0.7,
                    duration: 0.5,
                    ease: "power3.inOut",
                },
                0,
            )

            /* ---------------------------------- */
            /* SCAN RESET */
            /* ---------------------------------- */

            .to(
                scan,
                {
                    opacity: 0,
                    yPercent: -120,
                    duration: 0.4,
                    ease: "power2.out",
                },
                0,
            )

            /* ---------------------------------- */
            /* TITLE RESET */
            /* ---------------------------------- */

            .to(
                title,
                {
                    x: 0,
                    duration: 0.5,
                    ease: "power3.out",
                },
                0,
            );

        /* ---------------------------------- */
        /* CURSOR RESET */
        /* ---------------------------------- */

        gsap.to(cursor, {
            scale: 1,
            duration: 0.3,
            ease: "power3.out",
            overwrite: true,
        });
    });

    /* --------------------------------------------- */
    /* IMAGE MICRO PARALLAX */
    /* --------------------------------------------- */

    card.addEventListener("pointermove", (event) => {
        if (!pointerInside) return;

        const rect = card.getBoundingClientRect();

        const x = (event.clientX - rect.left) / rect.width - 0.5;

        const y = (event.clientY - rect.top) / rect.height - 0.5;

        gsap.to(image, {
            x: x * 12,
            y: y * 8,
            duration: 0.6,
            ease: "power3.out",
            overwrite: "auto",
        });
    });

    /* --------------------------------------------- */
    /* RESET IMAGE POSITION */
    /* --------------------------------------------- */

    card.addEventListener("pointerleave", () => {
        gsap.to(image, {
            x: 0,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            overwrite: "auto",
        });
    });
});

/* ================================================= */
/* ARCHIVE HUD UPDATE */
/* ================================================= */

const updateHud = (row) => {
    if (!row) return;

    const index = row.dataset.index;
    const site = row.dataset.site;

    gsap.to(hudCurrent, {
        opacity: 0,
        y: 8,
        duration: 0.15,
        onComplete: () => {
            hudCurrent.textContent = index;

            gsap.to(hudCurrent, {
                opacity: 1,
                y: 0,
                duration: 0.35,
                ease: "power3.out",
            });
        },
    });

    gsap.to(hudSite, {
        opacity: 0,
        duration: 0.15,
        onComplete: () => {
            hudSite.textContent = site;

            gsap.to(hudSite, {
                opacity: 1,
                duration: 0.35,
            });
        },
    });

    gsap.to(hudProgress, {
        scaleX: Number(index) / galleryRows.length,
        duration: 0.6,
        ease: "power3.out",
    });
};

/* ================================================= */
/* HUD SCROLL OBSERVER */
/* ================================================= */

galleryRows.forEach((row) => {
    ScrollTrigger.create({
        trigger: row,

        start: "top 55%",
        end: "bottom 55%",

        onEnter: () => updateHud(row),

        onEnterBack: () => updateHud(row),
    });
});

/* ================================================= */
/* GRID MOVEMENT */
/* ================================================= */

lenis.on("scroll", ({ scroll }) => {
    gsap.to(body, {
        "--grid-y": `${scroll * 0.018}px`,
        duration: 0.5,
        ease: "power2.out",
        overwrite: true,
    });
});

/* ================================================= */
/* OUTRO REVEAL */
/* ================================================= */

const outroTitle = document.querySelector(".outro-center h2");

if (outroTitle) {
    const outroSplit = SplitText.create(outroTitle, {
        type: "lines",
        mask: "lines",
    });

    gsap.set(outroSplit.lines, {
        yPercent: 110,
    });

    gsap.to(outroSplit.lines, {
        yPercent: 0,
        duration: 1.4,
        stagger: 0.12,
        ease: "power4.out",

        scrollTrigger: {
            trigger: ".outro",
            start: "top 65%",
        },
    });
}

/* ================================================= */
/* OUTRO PARALLAX */
/* ================================================= */

gsap.to(".outro-center", {
    yPercent: -15,

    ease: "none",

    scrollTrigger: {
        trigger: ".outro",
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
    },
});

/* ================================================= */
/* REFRESH */
/* ================================================= */

window.addEventListener("load", () => {
    ScrollTrigger.refresh();
});

window.addEventListener("resize", () => {
    location.reload();
    ScrollTrigger.refresh();
});
