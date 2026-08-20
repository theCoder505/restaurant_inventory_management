<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ \App\Models\AppSetting::getByKey('brand_name', config('app.name', 'Restaurant')) }}</title>

        <link rel="icon" href="{{ \App\Models\AppSetting::getByKey('brand_icon', '/uploads/branding/icon.svg') }}" />
        <link rel="shortcut icon" href="{{ \App\Models\AppSetting::getByKey('brand_icon', '/uploads/branding/icon.svg') }}" />

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
