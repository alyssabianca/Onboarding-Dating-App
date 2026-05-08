<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DiscoveryController;
use App\Http\Controllers\MatchController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('health', fn () => response()->json(['status' => 'ok']));
Route::get('socket-url', fn () => response()->json(['url' => env('SOCKET_SERVER_URL', '')]));

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me', [AuthController::class, 'me']);

    Route::get('profile', [ProfileController::class, 'show']);
    Route::post('profile', [ProfileController::class, 'update']);

    Route::get('discovery', [DiscoveryController::class, 'index']);
    Route::post('swipes', [DiscoveryController::class, 'swipe']);

    Route::get('matches', [MatchController::class, 'index']);
    Route::get('matches/{id}', [MatchController::class, 'show']);
    Route::delete('matches/{id}', [MatchController::class, 'destroy']);

    Route::get('matches/{matchId}/messages', [MessageController::class, 'index']);
    Route::post('matches/{matchId}/messages', [MessageController::class, 'store']);
});
