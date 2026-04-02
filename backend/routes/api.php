<?php

declare(strict_types=1);

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Catalog\ProductController as CatalogProductController;
use App\Http\Controllers\Api\Supplier\ProductController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'api',
    ]);
});

Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:12,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:12,1');

Route::get('/products', [CatalogProductController::class, 'index'])->middleware('throttle:60,1');
Route::get('/products/{product}', [CatalogProductController::class, 'show'])->middleware('throttle:60,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    Route::prefix('supplier')->group(function () {
        Route::apiResource('products', ProductController::class);
    });
});
