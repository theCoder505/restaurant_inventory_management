<section id="hero-section" class="relative bg-[#070b19] h-[500vh]">
    <div id="hero-pin" class="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden bg-[#070b19] z-10">
        <!-- High-Performance Canvas Element -->
        <canvas id="hero-canvas" class="w-full h-full object-cover block"></canvas>

        <!-- Soft Ambient Vignette & Gradient Overlays -->
        <div class="absolute inset-0 pointer-events-none bg-linear-to-b from-[#070b19]/80 via-transparent to-[#070b19] z-10"></div>
        <div class="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-transparent via-[#070b19]/40 to-[#070b19]/90 z-10"></div>
        <!-- Preloader Spinner & Progress -->
        <div id="hero-loader" class="absolute inset-0 bg-[#070b19] flex flex-col items-center justify-center transition-opacity duration-700 z-30 pointer-events-none">
            <div class="relative w-14 h-14 mb-4">
                <div class="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                <div class="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <span id="hero-loader-text" class="text-indigo-200/90 text-xs font-semibold tracking-widest uppercase">
                Preparing Experience... 0%
            </span>
        </div>

        <!-- Hero Brand Overlay Texts (Clean, No Card Background) -->
        <!-- Card 1: Initial Brand Introduction -->
        <div id="hero-card-1" class="absolute z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-3xl pointer-events-auto transition-all duration-700 opacity-100 scale-100 text-center">
            <!-- Brand Headline -->
            <h1 class="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight mb-4 drop-shadow-xl">
                Where Kids Code with <span class="bg-linear-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">Joy &amp; Wonder</span>
            </h1>

            <!-- Brand Description -->
            <p class="text-base sm:text-lg md:text-xl text-slate-200 font-normal leading-relaxed max-w-2xl mx-auto mb-8 drop-shadow-md">
                We ignite curiosity and transform learning into an adventure. Young minds master programming through play, exploration, and wonder—gaining the skills to innovate, build, and conquer the world.
            </p>

            <!-- Action CTAs -->
            <div class="flex flex-wrap gap-4 justify-center items-center">
                <a href="/courses" class="px-7 py-3.5 rounded-full font-semibold text-sm text-white bg-linear-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-size-[200%_auto] hover:bg-right transition-all duration-500 shadow-xl shadow-indigo-500/30 hover:-translate-y-0.5">
                    Start the Adventure
                </a>
            </div>
        </div>

        <!-- Card 2: Appears on scroll -->
        <div id="hero-card-2" class="absolute z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-3xl pointer-events-none transition-all duration-700 opacity-0 scale-95 text-center">
            <!-- Headline -->
            <h2 class="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight mb-4 drop-shadow-xl">
                Turn Pure Curiosity into <span class="bg-linear-to-r from-purple-300 via-pink-300 to-amber-300 bg-clip-text text-transparent">Digital Mastery</span>
            </h2>
        </div>

        <!-- Scroll Indicator Hint -->
        <div id="scroll-hint" class="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none transition-all duration-500">
            <span class="text-xs uppercase tracking-[0.2em] text-slate-300/80 font-medium drop-shadow-md">Scroll to reveal</span>
            <div class="w-5 h-9 border-2 border-indigo-400/30 rounded-full flex justify-center p-1 backdrop-blur-md bg-slate-900/40 shadow-lg">
                <div class="w-1.5 h-2.5 bg-indigo-400 rounded-full animate-bounce"></div>
            </div>
        </div>
    </div>
</section>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const TOTAL_FRAMES = 300;
    const heroSection = document.getElementById('hero-section');
    const canvas = document.getElementById('hero-canvas');
    if (!heroSection || !canvas) return;

    const ctx = canvas.getContext('2d');
    const loader = document.getElementById('hero-loader');
    const loaderText = document.getElementById('hero-loader-text');
    const scrollHint = document.getElementById('scroll-hint');
    const heroCard1 = document.getElementById('hero-card-1');
    const heroCard2 = document.getElementById('hero-card-2');

    const frames = new Array(TOTAL_FRAMES + 1);
    let loadedCount = 0;
    let targetFrame = 1;
    let currentFrame = 1;
    let isInitialFrameDrawn = false;

    // Generates 3-digit zero-padded frame paths (/assets/frames/ezgif-frame-001.jpg)
    function getFrameUrl(index) {
        const paddedIndex = String(index).padStart(3, '0');
        return `/images/frames/ezgif-frame-${paddedIndex}.jpg`;
    }

    // Handles Retina/High-DPI displays while ensuring canvas fits viewport
    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        renderFrame(Math.round(currentFrame));
    }

    // Renders specified frame to canvas using image cover calculation
    function renderFrame(frameIndex) {
        const safeIndex = Math.max(1, Math.min(TOTAL_FRAMES, frameIndex));
        let img = frames[safeIndex];

        // Fallback to nearest preloaded frame if current frame image is downloading
        if (!img || !img.complete || img.naturalWidth === 0) {
            for (let offset = 1; offset <= 30; offset++) {
                const prev = safeIndex - offset;
                if (prev >= 1 && frames[prev] && frames[prev].complete && frames[prev].naturalWidth > 0) {
                    img = frames[prev];
                    break;
                }
                const next = safeIndex + offset;
                if (next <= TOTAL_FRAMES && frames[next] && frames[next].complete && frames[next].naturalWidth > 0) {
                    img = frames[next];
                    break;
                }
            }
        }

        if (!img || !img.complete || img.naturalWidth === 0) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const cw = canvas.width;
        const ch = canvas.height;
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;

        // Cover fit logic
        const scale = Math.max(cw / iw, ch / ih);
        const nw = iw * scale;
        const nh = ih * scale;
        const cx = (cw - nw) / 2;
        const cy = (ch - nh) / 2;

        ctx.drawImage(img, cx, cy, nw, nh);
    }

    // Asynchronous priority preloading strategy
    function loadFrames() {
        // Priority 1: First frame for instant render
        const firstImg = new Image();
        firstImg.src = getFrameUrl(1);
        firstImg.onload = function() {
            frames[1] = firstImg;
            loadedCount++;
            if (!isInitialFrameDrawn) {
                renderFrame(1);
                isInitialFrameDrawn = true;
            }
            startBatchLoading();
        };
        firstImg.onerror = function() {
            startBatchLoading();
        };
    }

    function startBatchLoading() {
        for (let i = 2; i <= TOTAL_FRAMES; i++) {
            const img = new Image();
            img.src = getFrameUrl(i);
            img.onload = function() {
                frames[i] = img;
                loadedCount++;
                onFrameLoaded();
            };
            img.onerror = function() {
                loadedCount++;
                onFrameLoaded();
            };
        }
    }

    function onFrameLoaded() {
        const progress = Math.min(100, Math.floor((loadedCount / TOTAL_FRAMES) * 100));
        if (loaderText) {
            loaderText.textContent = `Preparing Experience... ${progress}%`;
        }

        // Hide preloader once initial frames or all frames are ready for smooth scrolling
        if (progress >= 100 || loadedCount >= 45) {
            if (loader) {
                loader.classList.add('opacity-0');
                setTimeout(() => loader.style.display = 'none', 700);
            }
        }
    }

    // Scroll progress handler: Locks screen sticky top until all 300 frames play completely
    function updateTargetFrame() {
        const rect = heroSection.getBoundingClientRect();
        const scrollableDistance = heroSection.offsetHeight - window.innerHeight;
        
        if (scrollableDistance <= 0) return;

        const scrolled = -rect.top;
        const progress = Math.max(0, Math.min(1, scrolled / scrollableDistance));

        // Map progress (0.0 to 0.88) to frames (1 to 300).
        // The remaining progress (0.88 to 1.0) locks on frame 300 before unpinning to the next section.
        const PLAYBACK_END_RATIO = 0.88;
        const normalizedProgress = Math.min(1, progress / PLAYBACK_END_RATIO);
        
        targetFrame = 1 + normalizedProgress * (TOTAL_FRAMES - 1);

        if (scrollHint) {
            if (progress > 0.03) {
                scrollHint.classList.add('opacity-0', 'translate-y-4');
            } else {
                scrollHint.classList.remove('opacity-0', 'translate-y-4');
            }
        }

        if (heroCard1) {
            if (progress < 0.28) {
                heroCard1.classList.remove('opacity-0', 'scale-95', 'pointer-events-none');
                heroCard1.classList.add('opacity-100', 'scale-100', 'pointer-events-auto');
            } else {
                heroCard1.classList.remove('opacity-100', 'scale-100', 'pointer-events-auto');
                heroCard1.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
            }
        }

        if (heroCard2) {
            if (progress >= 0.35 && progress < 0.68) {
                heroCard2.classList.remove('opacity-0', 'scale-95', 'pointer-events-none');
                heroCard2.classList.add('opacity-100', 'scale-100', 'pointer-events-auto');
            } else {
                heroCard2.classList.remove('opacity-100', 'scale-100', 'pointer-events-auto');
                heroCard2.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
            }
        }
    }

    // Render loop with lerp easing
    function animate() {
        const delta = targetFrame - currentFrame;
        if (Math.abs(delta) > 0.001) {
            currentFrame += delta * 0.35; // Snappy smooth interpolation rate
            renderFrame(Math.round(currentFrame));
        }
        requestAnimationFrame(animate);
    }

    window.addEventListener('scroll', updateTargetFrame, { passive: true });
    window.addEventListener('resize', resizeCanvas, { passive: true });

    // Initialize
    resizeCanvas();
    loadFrames();
    updateTargetFrame();
    requestAnimationFrame(animate);
});
</script>