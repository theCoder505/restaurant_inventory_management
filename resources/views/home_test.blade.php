<!DOCTYPE html>

<html class="dark" lang="en">

<head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1.0" name="viewport" />
    <title>NOCTURNE AFTER HOURS</title>
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
    <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap"
        rel="stylesheet" />
    <link href="https://fonts.googleapis.com" rel="preconnect" />
    <link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect" />
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&amp;family=Montserrat:wght@700;800&amp;display=swap"
        rel="stylesheet" />
    <script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "tertiary": "#c8c6c5",
                        "on-background": "#e5e2e1",
                        "inverse-surface": "#e5e2e1",
                        "surface-container-lowest": "#0e0e0e",
                        "on-tertiary": "#313030",
                        "outline-variant": "#5c4037",
                        "primary-fixed-dim": "#ffb59e",
                        "error": "#ffb4ab",
                        "secondary-fixed": "#ffe16d",
                        "tertiary-fixed": "#e5e2e1",
                        "on-secondary-container": "#725f00",
                        "on-error": "#690005",
                        "outline": "#ad897e",
                        "surface-dim": "#131313",
                        "surface-container-low": "#1c1b1b",
                        "secondary-fixed-dim": "#e9c400",
                        "surface": "#131313",
                        "background": "#131313",
                        "inverse-primary": "#ae3200",
                        "primary-fixed": "#ffdbd0",
                        "on-primary-fixed": "#3a0b00",
                        "on-surface": "#e5e2e1",
                        "on-tertiary-fixed": "#1c1b1b",
                        "surface-tint": "#ffb59e",
                        "on-secondary-fixed": "#221b00",
                        "on-tertiary-fixed-variant": "#474746",
                        "error-container": "#93000a",
                        "on-secondary-fixed-variant": "#544600",
                        "on-tertiary-container": "#2a2a2a",
                        "on-error-container": "#ffdad6",
                        "on-surface-variant": "#e6beb2",
                        "on-primary-fixed-variant": "#852400",
                        "tertiary-container": "#929090",
                        "surface-container-highest": "#353534",
                        "tertiary-fixed-dim": "#c8c6c5",
                        "surface-bright": "#3a3939",
                        "primary-container": "#ff571a",
                        "inverse-on-surface": "#313030",
                        "on-primary": "#5e1700",
                        "surface-variant": "#353534",
                        "surface-container": "#201f1f",
                        "on-primary-container": "#521300",
                        "surface-container-high": "#2a2a2a",
                        "on-secondary": "#3a3000",
                        "secondary": "#fff9ef",
                        "secondary-container": "#ffdb3c",
                        "primary": "#ffb59e"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "container-max": "1280px",
                        "margin-desktop": "64px",
                        "margin-mobile": "16px",
                        "base": "8px",
                        "gutter": "24px"
                    },
                    "fontFamily": {
                        "body-lg": [
                            "Inter"
                        ],
                        "label-md": [
                            "Inter"
                        ],
                        "body-md": [
                            "Inter"
                        ],
                        "headline-lg": [
                            "Montserrat"
                        ],
                        "display-lg": [
                            "Montserrat"
                        ],
                        "headline-md": [
                            "Montserrat"
                        ],
                        "headline-lg-mobile": [
                            "Montserrat"
                        ]
                    },
                    "fontSize": {
                        "body-lg": [
                            "18px",
                            {
                                "lineHeight": "1.6",
                                "fontWeight": "400"
                            }
                        ],
                        "label-md": [
                            "14px",
                            {
                                "lineHeight": "1.2",
                                "letterSpacing": "0.05em",
                                "fontWeight": "600"
                            }
                        ],
                        "body-md": [
                            "16px",
                            {
                                "lineHeight": "1.6",
                                "fontWeight": "400"
                            }
                        ],
                        "headline-lg": [
                            "40px",
                            {
                                "lineHeight": "1.2",
                                "fontWeight": "700"
                            }
                        ],
                        "display-lg": [
                            "64px",
                            {
                                "lineHeight": "1.1",
                                "letterSpacing": "-0.02em",
                                "fontWeight": "800"
                            }
                        ],
                        "headline-md": [
                            "24px",
                            {
                                "lineHeight": "1.3",
                                "fontWeight": "700"
                            }
                        ],
                        "headline-lg-mobile": [
                            "32px",
                            {
                                "lineHeight": "1.2",
                                "fontWeight": "700"
                            }
                        ]
                    }
                },
            },
        }
    </script>
    <style>
        body {
            background-color: #0A0A0A;
            color: #e5e2e1;
        }

        .neon-glow {
            box-shadow: 0 0 30px rgba(255, 87, 26, 0.3);
        }

        .neon-glow-hover:hover {
            box-shadow: 0 0 40px rgba(255, 87, 26, 0.5);
        }

        .glass-panel {
            background: rgba(26, 26, 26, 0.8);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .tracker-pulse {
            animation: trackerPulse 2s infinite;
        }

        @keyframes trackerPulse {
            0% {
                box-shadow: 0 0 0 0 rgba(255, 87, 26, 0.4);
            }

            70% {
                box-shadow: 0 0 0 15px rgba(255, 87, 26, 0);
            }

            100% {
                box-shadow: 0 0 0 0 rgba(255, 87, 26, 0);
            }
        }
    </style>
</head>

<body class="bg-background text-on-background font-body-md antialiased selection:bg-primary selection:text-on-primary">
    <!-- Navigation -->
    <nav class="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-white/10 shadow-sm transition-all duration-300"
        id="topNav">
        <div
            class="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
            <div class="font-display-lg text-headline-md tracking-tighter text-primary">
                NOCTURNE
            </div>
            <div class="hidden md:flex gap-gutter items-center font-body-lg text-body-lg">
                <a class="text-primary font-bold border-b-2 border-primary pb-1" href="#">Menu</a>
                <a class="text-on-background/70 hover:text-on-background hover:text-primary transition-all duration-300"
                    href="#lounge">Lounge</a>
                <a class="text-on-background/70 hover:text-on-background hover:text-primary transition-all duration-300"
                    href="#specials">Exclusives</a>
                <a class="text-on-background/70 hover:text-on-background hover:text-primary transition-all duration-300"
                    href="#locations">Find Us</a>
            </div>
            <button
                class="bg-primary-container text-on-primary-container font-label-md text-label-md px-6 py-3 rounded-full hover:brightness-110 active:scale-95 transition-all duration-300 neon-glow-hover flex items-center gap-2">
                Order Now
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">arrow_forward</span>
            </button>
        </div>
    </nav>
    <!-- Hero Section -->
    <section class="relative min-h-screen flex items-center pt-24 overflow-hidden">
        <div class="absolute inset-0 z-0">
            <div class="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10"></div>
            <img alt="A stunning, high-contrast photograph of a gourmet double cheeseburger in a dimly lit, moody late-night restaurant setting. The burger features melted cheddar cheese dripping over thick, juicy beef patties, with crispy bacon, fresh lettuce, and red onion visible. The lighting highlights the glossy, toasted sesame seed bun and the rich textures of the ingredients. In the blurred background, warm bokeh lights create an atmospheric, exclusive nightlife vibe, with hints of other patrons enjoying their meals. The overall composition is centered and emphasizes the premium, irresistible quality of the food."
                class="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRJZggvezLijFrwuSzgIKkA9FngFa4JmIxEzmBboWeXLcrDepudFnLkwjW40C-7ux15j6qNOGnPvpRIh8urmva2y5Wwi-UUj68XkMgofMssSvj7n4cmXfvpMaxVHKlpsIQsMFbNXvkSn21qKHvmIjf96RQYHRU_GDUo6LOgv6LqdPEm8A95XRFmlaJDTTB2M5ApJ9aSMZ64NvVH9JPlsF30EhNhGzYRajswWEXulMn72jUmCfGlzcBlw" />
        </div>
        <div
            class="relative z-20 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-col md:w-2/3 lg:w-1/2 items-start mt-24">
            <h1
                class="font-display-lg text-headline-lg-mobile md:text-display-lg text-on-background mb-6 drop-shadow-2xl uppercase">
                CRAVINGS<br /><span class="text-primary">NEVER SLEEP</span>
            </h1>
            <p class="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-xl">
                Premium fast food for the late-night elite. Delivered hot, fast, and fresh when the city goes dark.
            </p>
            <button
                class="bg-primary-container text-on-primary-container font-label-md text-label-md px-8 py-4 rounded-full hover:brightness-110 active:scale-95 transition-all duration-300 neon-glow flex items-center gap-3">
                <span class="material-symbols-outlined">local_fire_department</span>
                IGNITE ORDER
            </button>
        </div>
    </section>
    <!-- The After-Hours Atmosphere Section -->
    <section class="py-24 relative overflow-hidden bg-background">
        <div
            class="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop relative z-10 flex flex-col lg:flex-row items-center gap-16">
            <div class="w-full lg:w-1/2">
                <h2
                    class="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-6 uppercase tracking-wider">
                    The After-Hours Atmosphere</h2>
                <p class="font-body-lg text-body-lg text-on-surface-variant mb-6">
                    Step into a world where culinary excellence meets nightlife seduction. Nocturne isn't just a meal;
                    it's a sensory experience designed for those who thrive when the sun goes down.
                </p>
                <p class="font-body-md text-body-md text-on-surface-variant mb-8">
                    Our atmospheric lounges blend pulsating beats with intimate lighting, creating the perfect backdrop
                    for savoring gourmet flavors. Whether you're fueling a late-night endeavor or unwinding after hours,
                    Nocturne provides an escape from the ordinary.
                </p>
                <a class="font-label-md text-label-md text-primary flex items-center gap-2 hover:underline"
                    href="#">
                    Explore The Experience <span class="material-symbols-outlined">arrow_right_alt</span>
                </a>
            </div>
            <div class="w-full lg:w-1/2 h-96 lg:h-[500px] relative rounded-2xl overflow-hidden glass-panel">
                <img alt="Atmospheric lounge with people enjoying drinks and food in dim, moody lighting"
                    class="w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBr-PEhknluR3U5ZxZSQVN215jF8nIDoib8TqvEE6wEdFYmPoKLvd7zdftAZXhSd30fhnoEz0lnIbkDa3C825hFSkUYui5dlfyZaqnLRhihj6KbjBpNPBAPpjN0XY1X1ZcbbKC37agTtuMTK0RhYjRLRao3ie8vnrzfm02kZPe12pu6ro1uVGmoFIvXelNWnM8RH17U_AoyJwL-lhyYvM2kWMnDXesagLCZc6NgQaG5-weyoS2CI6i_9w" />
                <div class="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
            </div>
        </div>
    </section>
    <!-- The Lineup Section -->
    <section class="py-24 bg-surface-container-lowest">
        <div class="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div class="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                <div>
                    <h2
                        class="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4 uppercase tracking-wider">
                        The Lineup</h2>
                    <p class="font-body-md text-body-md text-on-surface-variant">Signature creations for the midnight
                        hour.</p>
                </div>
                <a class="font-label-md text-label-md text-primary flex items-center gap-2 hover:underline"
                    href="#">
                    View Full Menu <span class="material-symbols-outlined">arrow_right_alt</span>
                </a>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-gutter">
                <!-- Card 1 -->
                <div
                    class="glass-panel rounded-xl overflow-hidden group cursor-pointer transition-transform duration-500 hover:-translate-y-2">
                    <div class="relative h-64 overflow-hidden">
                        <div class="absolute inset-0 bg-gradient-to-t from-surface-container-low to-transparent z-10">
                        </div>
                        <img alt="A close-up, mouth-watering shot of a tall, gourmet double burger on a dark slate board. The burger is the undisputed hero, perfectly lit to show the melted cheese, crispy edges of the beef patties, and fresh toppings. The background is completely black, drawing all focus to the vibrant colors and textures of the burger itself, creating a luxurious and intense visual craving."
                            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRJZggvezLijFrwuSzgIKkA9FngFa4JmIxEzmBboWeXLcrDepudFnLkwjW40C-7ux15j6qNOGnPvpRIh8urmva2y5Wwi-UUj68XkMgofMssSvj7n4cmXfvpMaxVHKlpsIQsMFbNXvkSn21qKHvmIjf96RQYHRU_GDUo6LOgv6LqdPEm8A95XRFmlaJDTTB2M5ApJ9aSMZ64NvVH9JPlsF30EhNhGzYRajswWEXulMn72jUmCfGlzcBlw" />
                        <div
                            class="absolute top-4 right-4 z-20 bg-surface-container/80 backdrop-blur px-3 py-1 rounded text-secondary-container font-label-md text-label-md">
                            $18
                        </div>
                    </div>
                    <div class="p-6 relative">
                        <h3
                            class="font-headline-md text-headline-md text-on-surface mb-2 group-hover:text-primary transition-colors">
                            The Midnight Burger</h3>
                        <p class="font-body-md text-body-md text-on-surface-variant mb-6 line-clamp-2">Gourmet beef with
                            signature sauce, aged cheddar, and crispy bacon on a brioche bun.</p>
                        <div class="flex items-center justify-between mt-auto">
                            <span class="text-xs text-primary uppercase tracking-widest font-bold">Signature</span>
                            <button
                                class="w-10 h-10 rounded-full border border-primary text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors neon-glow-hover">
                                <span class="material-symbols-outlined">add</span>
                            </button>
                        </div>
                    </div>
                </div>
                <!-- Card 2 -->
                <div
                    class="glass-panel rounded-xl overflow-hidden group cursor-pointer transition-transform duration-500 hover:-translate-y-2">
                    <div class="relative h-64 overflow-hidden">
                        <div class="absolute inset-0 bg-gradient-to-t from-surface-container-low to-transparent z-10">
                        </div>
                        <img alt="A sleek, modern presentation of thick-cut, golden-brown french fries served in a matte black rectangular bowl. The fries are perfectly crisp, sprinkled with coarse sea salt and fine green herbs. The lighting is dramatic, coming from the side to emphasize the texture of the fries against a completely dark, moody background. The overall aesthetic is minimal, high-end, and intensely appetizing."
                            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAgx_WRv3kuWUFuNT_Wia142uEUZYtTvie7-4E7aVozFm0HRA-dXviDoaRMcpRGlJlX6fR34IAi6c9iJOC8mgBeyRQP0FQgUP2uQximWxWWaYRDG1dRg-BHc_sohGQFcP9GIejGrZp93hsjNLMBJ_oUblGrTxNzidjyXOlfZ9OMah8LYLo7n8y1DSqi7rguI-skewLi1YLaj6TlviJV02EHc7PUpAmDP4SHhz4FWQMhZKYuOas0gHyyg" />
                        <div
                            class="absolute top-4 right-4 z-20 bg-surface-container/80 backdrop-blur px-3 py-1 rounded text-secondary-container font-label-md text-label-md">
                            $8
                        </div>
                    </div>
                    <div class="p-6 relative">
                        <h3
                            class="font-headline-md text-headline-md text-on-surface mb-2 group-hover:text-primary transition-colors">
                            Golden Embers</h3>
                        <p class="font-body-md text-body-md text-on-surface-variant mb-6 line-clamp-2">Hand-cut fries,
                            double-fried for crunch, tossed with sea salt and fresh herbs.</p>
                        <div class="flex items-center justify-between mt-auto">
                            <span class="text-xs text-primary uppercase tracking-widest font-bold">Sides</span>
                            <button
                                class="w-10 h-10 rounded-full border border-primary text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors neon-glow-hover">
                                <span class="material-symbols-outlined">add</span>
                            </button>
                        </div>
                    </div>
                </div>
                <!-- Card 3 -->
                <div
                    class="glass-panel rounded-xl overflow-hidden group cursor-pointer transition-transform duration-500 hover:-translate-y-2">
                    <div class="relative h-64 overflow-hidden">
                        <div class="absolute inset-0 bg-gradient-to-t from-surface-container-low to-transparent z-10">
                        </div>
                        <img alt="A tall, elegant glass filled with an amber-colored artisanal soda, brimming with ice cubes and condensation. A slice of fresh orange and a sprig of mint garnish the rim, alongside a sleek metal straw. The glass sits on a distressed, dark wooden surface. The background is a soft, out-of-focus bar setting with subtle warm ambient lights, creating a sophisticated, refreshing late-night beverage atmosphere."
                            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2LxGOqn8H8R482FU2ybovgZYVI73qnI0D-7A_qlb48iiZzKd1OqBYVB-Aw_-U_L40FiICYgyno3npqB_bo9E9vTV-vSfji9qvM2ACKrAol3QR-QKucFllf5kneD9Y5Y0Td0_LLHnk1BK2g8Fppq4Bax64oI5uT0Bg6tNDLqBhamGUzO5WGTgKP41S3_CuwMz46Nz98-_c8ch2VcOvJmk1ugwZgJQ7fonJL1LedVQ53seGQHFOvo7N-Q" />
                        <div
                            class="absolute top-4 right-4 z-20 bg-surface-container/80 backdrop-blur px-3 py-1 rounded text-secondary-container font-label-md text-label-md">
                            $6
                        </div>
                    </div>
                    <div class="p-6 relative">
                        <h3
                            class="font-headline-md text-headline-md text-on-surface mb-2 group-hover:text-primary transition-colors">
                            Liquid Gold</h3>
                        <p class="font-body-md text-body-md text-on-surface-variant mb-6 line-clamp-2">Artisanal soda
                            with complex citrus notes, poured over perfectly clear ice.</p>
                        <div class="flex items-center justify-between mt-auto">
                            <span class="text-xs text-primary uppercase tracking-widest font-bold">Drinks</span>
                            <button
                                class="w-10 h-10 rounded-full border border-primary text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors neon-glow-hover">
                                <span class="material-symbols-outlined">add</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <!-- Chef's Specials Grid Section -->
    <section class="py-24 bg-surface-container-low" id="specials">
        <div class="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <h2
                class="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-center text-on-background mb-4 uppercase">
                Chef's Exclusives</h2>
            <p class="text-center font-body-md text-body-md text-on-surface-variant mb-16 max-w-2xl mx-auto">Seasonal,
                limited-run creations crafted for the true nocturnal connoisseur.</p>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Special 1 -->
                <div class="relative h-80 rounded-xl overflow-hidden group">
                    <img alt="Premium truffle burger"
                        class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2_bVlvk1Q4Ba3dX6u6d1yxVzE8kiIZ6E2xlx8ZtxEYUlpCJ9BCu3SX-p4gr2MYdToU92-z_egfMoydPvEEM9lo_qEPATvFGEIispZE0dHgvLm0I_k3d9b2mm4K9_pNAHonyLyma_tnn8v6YNZHHA3OFlK4UO0PydJjf59Dm6GsnCkcQ9koHT0M21mRKaT8MDeWsgemp75RvkAqJIMpceQoyAC_UOJWs-MrT4RyD_rvoR9KZ7KNF8rPA" />
                    <div class="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent">
                    </div>
                    <div class="absolute bottom-0 left-0 p-6">
                        <span
                            class="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block">Limited</span>
                        <h3
                            class="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors">
                            The Truffle Void</h3>
                        <p
                            class="font-body-sm text-sm text-on-surface-variant mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Wagyu blend, black truffle aioli, aged gruyere.</p>
                    </div>
                </div>
                <!-- Special 2 -->
                <div class="relative h-80 rounded-xl overflow-hidden group">
                    <img alt="Loaded spicy fries"
                        class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaXOM7tTH5HnLYmcDiQLKL5bAhIGyALz8jLJw9l-qygbDG-NeP9rTsEcoMKX2lZdqroMMjdhfFB_tk2hpoXITm76Ova2jkkYOyU16_bJRaXSb7lU9v6SbmUVUvA-nH15JFD9uNZ7Jj8TmW63KjXWSqPwarVQSaGEfTNqH_c5dAkuXucfdRP9ZS26NhtDMGSWNF2zJub7SGC2Th1OcIrd1DsX2HNvk-SNAOMMQvRehaedm7xSMuCxJvFg" />
                    <div class="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent">
                    </div>
                    <div class="absolute bottom-0 left-0 p-6">
                        <h3
                            class="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors">
                            Inferno Fries</h3>
                        <p
                            class="font-body-sm text-sm text-on-surface-variant mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Ghost pepper dust, melted pepper jack, scallions.</p>
                    </div>
                </div>
                <!-- Special 3 -->
                <div class="relative h-80 rounded-xl overflow-hidden group md:col-span-2">
                    <img alt="Decadent chocolate dessert"
                        class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdaiSEGwKgEQKSa0zVyqa1MOufsYEMG5n3bJfdR_3IP0HFeiHOgyfUq8FXEHH4xEYXy1ex5Z8Zcwq9gLWhlHCc8UcMUyrmixdQPR67YEweTGLydMDk2gn8hv7Czgd3EPZp27FN67s_ZpxGtvvjTTwJWhbb2jthdbMrg3r2yZnRjocW1gAR3iO6Z_MM7-by9b7HmHxyMcORiL1Sfvt6NrhHUp4swqLRfxd4xUYBd1A1FZrTMp55t4eqfg" />
                    <div class="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent">
                    </div>
                    <div class="absolute bottom-0 left-0 p-6">
                        <span
                            class="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block">New</span>
                        <h3
                            class="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors">
                            Midnight Eclipse Shake</h3>
                        <p
                            class="font-body-sm text-sm text-on-surface-variant mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Dark chocolate ganache, espresso infusion, activated charcoal rim.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <!-- Real-Time Heat Tracker Section -->
    <section class="py-24 relative overflow-hidden bg-background border-y border-white/5">
        <div
            class="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div class="w-full md:w-1/2">
                <div class="flex items-center gap-3 mb-4">
                    <span class="relative flex h-4 w-4">
                        <span
                            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-4 w-4 bg-primary"></span>
                    </span>
                    <h2 class="font-headline-md text-headline-md text-on-surface uppercase tracking-wider">Real-Time
                        Heat</h2>
                </div>
                <p class="font-body-lg text-body-lg text-on-surface-variant mb-8">
                    Watch the nocturnal network in action. Our optimized delivery grid ensures your order cuts through
                    the night, arriving hot and fast.
                </p>
                <div class="space-y-4">
                    <div class="glass-panel p-4 rounded-lg flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div
                                class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                                <span class="material-symbols-outlined">directions_car</span>
                            </div>
                            <div>
                                <p class="font-label-md text-label-md text-on-surface">Order #8892 - En Route</p>
                                <p class="text-xs text-on-surface-variant">Est. 8 mins</p>
                            </div>
                        </div>
                        <span class="text-primary font-bold">Downtown</span>
                    </div>
                    <div class="glass-panel p-4 rounded-lg flex items-center justify-between opacity-70">
                        <div class="flex items-center gap-4">
                            <div
                                class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                                <span class="material-symbols-outlined">local_dining</span>
                            </div>
                            <div>
                                <p class="font-label-md text-label-md text-on-surface">Order #8894 - Firing</p>
                                <p class="text-xs text-on-surface-variant">Prep Stage</p>
                            </div>
                        </div>
                        <span class="text-on-surface-variant">Midtown</span>
                    </div>
                </div>
            </div>
            <div
                class="w-full md:w-1/2 h-80 relative bg-surface-container-lowest rounded-xl border border-white/10 overflow-hidden flex items-center justify-center">
                <!-- Abstract Map Representation -->
                <div class="absolute inset-0 opacity-20"
                    style="background-image: radial-gradient(circle, var(--tw-colors-primary) 1px, transparent 1px); background-size: 20px 20px;">
                </div>
                <div class="relative z-10 w-full h-full">
                    <!-- Delivery node pulses -->
                    <div class="absolute top-1/4 left-1/4 w-3 h-3 bg-primary rounded-full tracker-pulse"></div>
                    <div class="absolute top-1/2 left-2/3 w-3 h-3 bg-primary rounded-full tracker-pulse"
                        style="animation-delay: 0.5s;"></div>
                    <div class="absolute bottom-1/3 left-1/2 w-3 h-3 bg-primary rounded-full tracker-pulse"
                        style="animation-delay: 1s;"></div>
                    <!-- Connections -->
                    <svg class="absolute inset-0 w-full h-full pointer-events-none opacity-30"
                        preserveaspectratio="none">
                        <path class="animate-pulse" d="M 25% 25% L 66% 50% L 50% 66%" fill="none"
                            stroke="var(--tw-colors-primary)" stroke-dasharray="4 4" stroke-width="2"></path>
                    </svg>
                </div>
            </div>
        </div>
    </section>
    <!-- Why Us Section -->
    <section class="py-24 relative overflow-hidden bg-background">
        <div class="absolute inset-0 opacity-10 pointer-events-none"
            style="background-image: radial-gradient(circle at 50% 50%, var(--tw-colors-primary-container) 0%, transparent 50%);">
        </div>
        <div class="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop relative z-10">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
                <div class="flex flex-col items-center">
                    <div
                        class="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-6 text-primary neon-glow">
                        <span class="material-symbols-outlined text-4xl">schedule</span>
                    </div>
                    <h3 class="font-headline-md text-headline-md text-on-surface mb-4">24/7 Delivery</h3>
                    <p class="font-body-md text-body-md text-on-surface-variant">We own the night. When cravings hit,
                        we deliver without hesitation.</p>
                </div>
                <div class="flex flex-col items-center">
                    <div
                        class="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-6 text-primary neon-glow">
                        <span class="material-symbols-outlined text-4xl">star</span>
                    </div>
                    <h3 class="font-headline-md text-headline-md text-on-surface mb-4">Gourmet Ingredients</h3>
                    <p class="font-body-md text-body-md text-on-surface-variant">No shortcuts. Only premium cuts,
                        artisanal buns, and fresh produce.</p>
                </div>
                <div class="flex flex-col items-center">
                    <div
                        class="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-6 text-primary neon-glow">
                        <span class="material-symbols-outlined text-4xl">bolt</span>
                    </div>
                    <h3 class="font-headline-md text-headline-md text-on-surface mb-4">Neon Speed</h3>
                    <p class="font-body-md text-body-md text-on-surface-variant">Optimized kitchens mean your food
                        arrives fast, maintaining peak heat.</p>
                </div>
            </div>
        </div>
    </section>
    <!-- The Lounge Membership Section -->
    <section class="py-32 relative overflow-hidden" id="lounge">
        <div class="absolute inset-0 z-0">
            <img alt="Dark, moody velvet lounge interior" class="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6mjjWNkLxHsdoFa4-6ySTHYf1InNUWssex9OeZfi3cMnOAEliJu_exu4MFK49fvvalvxuFuYY0jel4uaN7h778nO5WMaQTa1BCTzZn3e4wGrSd7GsgTKJ-WWw87WBdPGv6Zm0NlUJhrJMtTnDFMz1LBQvgQ8gceUFPZmWfoBDVhecp2n_rBnOvxuujPE9kFcF7XMhZhW3zaWtAqCrd9HuDpWh28bVDvw4WirTRMwZmYubGgfMJfG5mA" />
            <div class="absolute inset-0 bg-background/90"></div>
        </div>
        <div class="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop relative z-10">
            <div class="glass-panel p-12 md:p-16 rounded-2xl max-w-3xl mx-auto text-center border-primary/20">
                <span class="material-symbols-outlined text-primary text-5xl mb-6">diamond</span>
                <h2
                    class="font-display-lg text-headline-lg-mobile md:text-headline-lg text-on-background mb-6 uppercase">
                    The Elite Syndicate</h2>
                <p class="font-body-lg text-body-lg text-on-surface-variant mb-10">
                    Unlock the inner circle. Syndicate members receive priority routing on all deliveries, access to
                    secret off-menu items, and reserved seating at physical lounge locations.
                </p>
                <button
                    class="bg-transparent border-2 border-primary text-primary font-headline-md text-label-md px-10 py-4 rounded-full hover:bg-primary hover:text-on-primary active:scale-95 transition-all duration-300 neon-glow-hover uppercase tracking-widest">
                    Join The Elite
                </button>
            </div>
        </div>
    </section>
    <!-- Testimonials -->
    <section class="py-24 bg-surface-container-low">
        <div class="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <h2
                class="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-center text-on-background mb-16 uppercase">
                The Word on the Street</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="glass-panel p-10 rounded-xl relative">
                    <span class="material-symbols-outlined absolute top-6 right-6 text-4xl text-primary/20"
                        style="font-variation-settings: 'FILL' 1;">format_quote</span>
                    <p class="font-body-lg text-body-lg text-on-surface italic mb-6">"The best burger I've had at 3 AM.
                        It doesn't feel like late-night food, it feels like an event."</p>
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-full bg-surface-container-high"></div>
                        <div>
                            <p class="font-label-md text-label-md text-primary">John D.</p>
                            <p class="text-sm text-on-surface-variant">Night Owl</p>
                        </div>
                    </div>
                </div>
                <div class="glass-panel p-10 rounded-xl relative">
                    <span class="material-symbols-outlined absolute top-6 right-6 text-4xl text-primary/20"
                        style="font-variation-settings: 'FILL' 1;">format_quote</span>
                    <p class="font-body-lg text-body-lg text-on-surface italic mb-6">"Finally, a place that takes
                        delivery seriously. The fries were still crispy. Unheard of."</p>
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-full bg-surface-container-high"></div>
                        <div>
                            <p class="font-label-md text-label-md text-primary">Sarah M.</p>
                            <p class="text-sm text-on-surface-variant">Creative Director</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <!-- Location & Hours Section -->
    <section class="py-24 bg-background" id="locations">
        <div class="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div class="flex flex-col lg:flex-row gap-16 items-center">
                <div class="w-full lg:w-1/3">
                    <h2
                        class="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-8 uppercase tracking-wider">
                        Find the Fire</h2>
                    <div class="mb-8">
                        <h3 class="font-headline-md text-xl text-on-surface mb-2">The Flagship Lounge</h3>
                        <p class="font-body-md text-on-surface-variant mb-1 flex items-start gap-2">
                            <span class="material-symbols-outlined text-primary text-sm mt-1">location_on</span>
                            889 Midnight Ave, Suite B<br />Downtown District, 90210
                        </p>
                    </div>
                    <div class="mb-8">
                        <h3 class="font-headline-md text-xl text-on-surface mb-2">Operating Hours</h3>
                        <ul class="font-body-md text-on-surface-variant space-y-2">
                            <li class="flex justify-between"><span>Mon - Thu</span> <span>8 PM - 4 AM</span></li>
                            <li class="flex justify-between text-primary font-bold"><span>Fri - Sat</span> <span>8 PM -
                                    6 AM</span></li>
                            <li class="flex justify-between"><span>Sunday</span> <span>Dark (Closed)</span></li>
                        </ul>
                    </div>
                    <button
                        class="w-full bg-surface-container text-on-surface font-label-md py-4 rounded-lg hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined">directions</span> Get Directions
                    </button>
                </div>
                <div class="w-full lg:w-2/3 h-96 rounded-2xl overflow-hidden relative glass-panel">
                    <!-- Decorative dark map image -->
                    <img alt="Dark stylized city map"
                        class="w-full h-full object-cover mix-blend-luminosity opacity-60"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuARDeeU-C81WWBvM98bm7lsMrrCm2bzFqm4dsQ8Em0TGn6hacteXuXXAaW_-zYT5KvRWJc5D0F68d9vlxHQk3hdSg-qs6ZQCg0WLm__IJeLfsUTQLB1_DyUdF9AMosEmlfEGEFQ1z338JYZcswioGSJ6Fp4tbtBkKDcsmuW1sJdm28lfeWBrARoIDivANL5FQ_TBLFKjjy7EDXlIDYR-erc5DTkWi6qUmV1wziiPp6zJZ0YXNvYRZcf0g" />
                    <div class="absolute inset-0 bg-background/30"></div>
                    <!-- Map Marker -->
                    <div
                        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                        <span class="relative flex h-8 w-8 mb-2">
                            <span
                                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span
                                class="relative inline-flex rounded-full h-8 w-8 bg-primary items-center justify-center text-on-primary">
                                <span class="material-symbols-outlined text-sm">local_fire_department</span>
                            </span>
                        </span>
                        <span
                            class="bg-surface-container-high px-3 py-1 rounded text-xs font-bold tracking-wider uppercase shadow-lg border border-white/5">Nocturne
                            HQ</span>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <!-- Order CTA Section -->
    <section class="py-32 relative bg-surface-container-lowest flex items-center justify-center text-center">
        <div class="absolute inset-0 z-0 opacity-20">
            <img alt="Abstract, highly stylized close-up of burger textures and melted cheese in extreme macro, creating a dark, fiery, organic background pattern that hints at the intense flavors of the food without being explicitly clear."
                class="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRJZggvezLijFrwuSzgIKkA9FngFa4JmIxEzmBboWeXLcrDepudFnLkwjW40C-7ux15j6qNOGnPvpRIh8urmva2y5Wwi-UUj68XkMgofMssSvj7n4cmXfvpMaxVHKlpsIQsMFbNXvkSn21qKHvmIjf96RQYHRU_GDUo6LOgv6LqdPEm8A95XRFmlaJDTTB2M5ApJ9aSMZ64NvVH9JPlsF30EhNhGzYRajswWEXulMn72jUmCfGlzcBlw" />
            <div class="absolute inset-0 bg-background/90"></div>
        </div>
        <div class="relative z-10 max-w-2xl px-margin-mobile">
            <h2 class="font-display-lg text-headline-lg-mobile md:text-display-lg text-on-background mb-8 uppercase">
                Ready to ignite your tastebuds?</h2>
            <p class="font-body-lg text-body-lg text-on-surface-variant mb-10">The kitchen is hot. The city is waiting.
            </p>
            <button
                class="bg-primary-container text-on-primary-container font-headline-md text-headline-md px-12 py-6 rounded-full hover:brightness-110 active:scale-95 transition-all duration-300 neon-glow inline-flex items-center gap-4 uppercase tracking-wider">
                Order Now
                <span class="material-symbols-outlined text-3xl">arrow_forward</span>
            </button>
        </div>
    </section>
    <!-- Footer -->
    <footer
        class="w-full py-16 px-margin-desktop bg-surface-container-lowest flex flex-col md:flex-row justify-between items-start gap-gutter max-w-container-max mx-auto border-t border-white/5 mt-12">
        <div>
            <div class="font-display-lg text-headline-lg text-primary mb-4">
                NOCTURNE
            </div>
            <p class="font-body-md text-body-md text-on-surface-variant max-w-xs">
                © 2024 NOCTURNE AFTER HOURS. ALL RIGHTS RESERVED.
            </p>
        </div>
        <div class="flex flex-col gap-4 font-body-md text-body-md">
            <a class="text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a class="text-on-surface-variant hover:text-primary transition-colors" href="#">Terms of
                Service</a>
            <a class="text-on-surface-variant hover:text-primary transition-colors" href="#">Nutrition</a>
            <a class="text-on-surface-variant hover:text-primary transition-colors" href="#">Careers</a>
        </div>
    </footer>
    <script>
        // Simple nav scroll effect
        window.addEventListener('scroll', () => {
            const nav = document.getElementById('topNav');
            if (window.scrollY > 50) {
                nav.classList.add('shadow-md', 'bg-background/95');
                nav.classList.remove('bg-background/80');
            } else {
                nav.classList.remove('shadow-md', 'bg-background/95');
                nav.classList.add('bg-background/80');
            }
        });
    </script>
</body>

</html>
