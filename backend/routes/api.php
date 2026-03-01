<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Include Authentication Routes
require __DIR__ . '/auth.php';

Route::post('v1/requests', [\App\Http\Controllers\Api\V1\Customer\RequestController::class, 'store']);
Route::get('v1/requests/track/{id}', [\App\Http\Controllers\Api\V1\Customer\RequestController::class, 'track']);

Route::middleware(['auth:sanctum', 'role:customer'])->prefix('v1/customer')->group(function () {
    Route::get('/requests', [\App\Http\Controllers\Api\V1\Customer\RequestController::class, 'index']);
    Route::get('/requests/{id}', [\App\Http\Controllers\Api\V1\Customer\RequestController::class, 'show']);
    Route::post('/requests/{id}/cancel', [\App\Http\Controllers\Api\V1\Customer\RequestController::class, 'cancel']);
});

Route::middleware(['auth:sanctum', 'role:driver'])->prefix('v1/driver')->group(function () {
    Route::post('/availability', [\App\Http\Controllers\Api\V1\Driver\RequestController::class, 'toggleAvailability']);
    Route::get('/requests/available', [\App\Http\Controllers\Api\V1\Driver\RequestController::class, 'available']);
    Route::get('/requests/current', [\App\Http\Controllers\Api\V1\Driver\RequestController::class, 'current']);
    Route::get('/requests/history', [\App\Http\Controllers\Api\V1\Driver\RequestController::class, 'history']);
    Route::get('/requests/{id}', [\App\Http\Controllers\Api\V1\Driver\RequestController::class, 'show']);
    Route::post('/requests/{id}/accept', [\App\Http\Controllers\Api\V1\Driver\RequestController::class, 'accept']);
    Route::post('/requests/{id}/decline', [\App\Http\Controllers\Api\V1\Driver\RequestController::class, 'decline']);
    Route::post('/requests/{id}/status', [\App\Http\Controllers\Api\V1\Driver\RequestController::class, 'updateStatus']);
});

Route::middleware(['auth:sanctum', 'role:admin'])->prefix('v1/admin')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\Api\V1\Admin\RequestController::class, 'dashboard']);
    Route::get('/requests', [\App\Http\Controllers\Api\V1\Admin\RequestController::class, 'index']);
    Route::post('/requests/{id}/reassign', [\App\Http\Controllers\Api\V1\Admin\RequestController::class, 'reassign']);
    Route::post('/requests/{id}/status', [\App\Http\Controllers\Api\V1\Admin\RequestController::class, 'updateStatus']);
});
