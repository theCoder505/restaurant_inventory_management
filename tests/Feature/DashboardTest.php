<?php

use App\Models\Admin;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get('/dashboard')->assertRedirect('/administration-control/login');
});

test('authenticated users can visit the dashboard', function () {
    $this->actingAs($user = Admin::factory()->create());

    $this->get('/administration-control/dashboard')->assertOk();
});

test('legacy admin dashboard url redirects to administration control dashboard', function () {
    $this->actingAs($user = Admin::factory()->create());

    $this->get('/admin/dashboard')->assertRedirect('/administration-control/dashboard');
});