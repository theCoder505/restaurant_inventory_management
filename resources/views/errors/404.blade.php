<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>404 - Page Not Found</title>
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
</head>
<body class="bg-[#0d0906] text-slate-100 font-sans antialiased min-h-screen overflow-x-hidden flex items-center justify-center p-4 md:p-8">

    <!-- Dark Wood Plank Background Texture Overlay -->
    <div 
        class="pointer-events-none absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay"
        style="background-image: url('/images/404-food-wood.jpg')"
    ></div>

    <!-- Ambient Warm Lighting Glows -->
    <div class="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-amber-600/15 blur-3xl"></div>
    <div class="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-orange-700/15 blur-3xl"></div>

    <!-- Giant edge-bleeding status digits -->
    <div class="pointer-events-none absolute inset-0 flex select-none items-center justify-between overflow-hidden opacity-30">
        <span class="-translate-x-8 text-[8rem] font-black text-amber-950/40 leading-none md:text-[16rem]">4</span>
        <span class="translate-x-8 text-[8rem] font-black text-amber-950/40 leading-none md:text-[16rem]">04</span>
    </div>

    <!-- Main Container Card -->
    <main class="relative z-10 my-auto flex w-full max-w-3xl flex-col items-center">
        <div class="relative w-full overflow-hidden rounded-3xl border border-amber-900/40 bg-stone-900/90 shadow-2xl shadow-black/80 backdrop-blur-2xl transition-all">
            
            <!-- Food & Wood Hero Visual Banner -->
            <div class="relative aspect-[16/9] w-full overflow-hidden bg-black/60 sm:aspect-[21/9]">
                <img 
                    src="/images/404-food-wood.jpg" 
                    alt="404 Restaurant Food & Wooden Planks Visual" 
                    class="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-105"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent"></div>
                
                <!-- Status Tag Badge -->
                <div class="absolute top-4 left-4 flex items-center gap-2 rounded-full border border-amber-500/30 bg-black/70 px-3.5 py-1.5 backdrop-blur-md">
                    <span class="relative flex h-2 w-2">
                        <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                        <span class="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
                    </span>
                    <span class="text-[11px] font-bold tracking-wider text-amber-400 uppercase">
                        404 Culinary Out of Stock
                    </span>
                </div>
            </div>

            <!-- Content Body -->
            <div class="p-6 text-center sm:p-10">
                <div class="mx-auto max-w-xl">
                    <div class="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-400 mb-3">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        Page Not Found in the Pantry
                    </div>
                    <h1 class="text-3xl font-extrabold tracking-tight text-amber-100 sm:text-4xl">
                        Plate Broken, Page Missing
                    </h1>
                    <p class="mt-3 text-xs leading-relaxed text-amber-200/70 sm:text-sm">
                        Oops! The recipe or page you are searching for does not exist, has been moved, or is temporarily out of order.
                    </p>
                </div>

                <!-- Action Button -->
                <div class="mt-8 flex items-center justify-center gap-3">
                    <a 
                        href="/admin/dashboard" 
                        class="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-6 py-3 text-xs font-extrabold text-stone-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-300 active:scale-95"
                    >
                        Back to Admin Dashboard
                    </a>
                </div>
            </div>

        </div>
    </main>

</body>
</html>