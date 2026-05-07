<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('swipes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('swiper_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('swiped_id')->constrained('users')->cascadeOnDelete();
            $table->enum('direction', ['like', 'skip']);
            $table->timestamps();

            $table->unique(['swiper_id', 'swiped_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('swipes');
    }
};
