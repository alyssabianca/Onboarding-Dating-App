<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            ['name' => 'Alice Chen',    'email' => 'alice@example.com',   'age' => 26, 'bio' => 'Coffee lover, bookworm, and weekend hiker. Looking for someone to share adventures with.',   'latitude' => 14.5995, 'longitude' => 120.9842],
            ['name' => 'Bob Santos',    'email' => 'bob@example.com',     'age' => 29, 'bio' => 'Software engineer by day, chef by night. Let\'s cook something together!',                   'latitude' => 14.6091, 'longitude' => 121.0223],
            ['name' => 'Clara Reyes',   'email' => 'clara@example.com',   'age' => 24, 'bio' => 'Artist, dreamer, cat mom. Looking for genuine connections.',                                 'latitude' => 14.5547, 'longitude' => 121.0244],
            ['name' => 'David Kim',     'email' => 'david@example.com',   'age' => 31, 'bio' => 'Avid traveler who has visited 20 countries. Always planning the next trip.',                 'latitude' => 14.6760, 'longitude' => 121.0437],
            ['name' => 'Eva Ramos',     'email' => 'eva@example.com',     'age' => 27, 'bio' => 'Yoga instructor and plant parent. Living life one breath at a time.',                        'latitude' => 14.5182, 'longitude' => 121.0509],
            ['name' => 'Frank Diaz',    'email' => 'frank@example.com',   'age' => 33, 'bio' => 'Music producer and live concert enthusiast. If you love good beats, let\'s vibe.',          'latitude' => 14.5243, 'longitude' => 121.0795],
            ['name' => 'Grace Tan',     'email' => 'grace@example.com',   'age' => 25, 'bio' => 'Med student surviving on coffee and dreams. Looking for chill hangouts.',                   'latitude' => 14.5995, 'longitude' => 120.9842],
            ['name' => 'Henry Lim',     'email' => 'henry@example.com',   'age' => 28, 'bio' => 'Fitness freak and amateur photographer. Let\'s go on a sunrise shoot!',                    'latitude' => 14.6312, 'longitude' => 121.0987],
            ['name' => 'Isla Cruz',     'email' => 'isla@example.com',    'age' => 23, 'bio' => 'Fresh grad finding her footing. Love movies, food, and honest conversations.',              'latitude' => 14.4445, 'longitude' => 121.0122],
            ['name' => 'James Torres',  'email' => 'james@example.com',   'age' => 30, 'bio' => 'Dad jokes enthusiast and proud nerd. Looking for someone who appreciates puns.',            'latitude' => 14.5800, 'longitude' => 121.0300],
        ];

        foreach ($users as $data) {
            User::firstOrCreate(['email' => $data['email']], array_merge($data, [
                'password' => Hash::make('password'),
            ]));
        }
    }
}
