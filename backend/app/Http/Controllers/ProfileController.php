<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'user' => $this->formatUser($user),
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'            => 'sometimes|string|max:255',
            'bio'             => 'nullable|string|max:500',
            'age'             => 'sometimes|integer|min:18|max:100',
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        if ($request->hasFile('profile_picture')) {
            $validated['profile_picture'] = $request->file('profile_picture')->store('avatars', 'public');
        } else {
            unset($validated['profile_picture']);
        }

        $user->update($validated);

        return response()->json(['user' => $this->formatUser($user->fresh())]);
    }

    private function formatUser($user): array
    {
        return [
            'id'                  => $user->id,
            'name'                => $user->name,
            'email'               => $user->email,
            'age'                 => $user->age,
            'bio'                 => $user->bio,
            'profile_picture_url' => $user->profile_picture ? asset('storage/' . $user->profile_picture) : null,
            'latitude'            => $user->latitude,
            'longitude'           => $user->longitude,
        ];
    }
}
