<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>404 - Page Not Found</title>
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
</head>
<body class="bg-slate-950 text-slate-100 font-sans antialiased min-h-screen flex items-center justify-center p-6">
    <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-amber-500/10 text-amber-500 rounded-2xl mb-4">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
        </div>
        <h1 class="text-4xl font-extrabold text-amber-500 mb-2">404</h1>
        <h2 class="text-xl font-bold text-slate-100 mb-2">Page Not Found</h2>
        <p class="text-xs text-slate-400 mb-6">The page you are looking for does not exist or has been relocated.</p>
        <a href="/admin/dashboard" class="inline-block bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20">
            Back to Admin Dashboard
        </a>
    </div>
</body>
</html>
