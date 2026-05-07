<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'age',
        'bio',
        'profile_picture',
        'latitude',
        'longitude',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'age' => 'integer',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
        ];
    }

    public function swipesMade()
    {
        return $this->hasMany(Swipe::class, 'swiper_id');
    }

    public function swipesReceived()
    {
        return $this->hasMany(Swipe::class, 'swiped_id');
    }

    public function matches()
    {
        return \App\Models\UserMatch::where('user1_id', $this->id)->orWhere('user2_id', $this->id);
    }

    public function getProfilePictureUrlAttribute(): ?string
    {
        if (!$this->profile_picture) {
            return null;
        }
        return asset('storage/' . $this->profile_picture);
    }

    public function appendProfilePictureUrl(): array
    {
        return array_merge($this->toArray(), [
            'profile_picture_url' => $this->profile_picture_url,
        ]);
    }
}
