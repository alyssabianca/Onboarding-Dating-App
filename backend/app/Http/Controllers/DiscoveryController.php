<?php

namespace App\Http\Controllers;

use App\Models\UserMatch;
use App\Models\Swipe;
use App\Models\User;
use Illuminate\Http\Request;

class DiscoveryController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'age_min' => 'nullable|integer|min:18|max:100',
            'age_max' => 'nullable|integer|min:18|max:100',
        ]);

        $me = $request->user();

        $alreadySwiped = Swipe::where('swiper_id', $me->id)->pluck('swiped_id');

        $query = User::where('id', '!=', $me->id)
            ->whereNotIn('id', $alreadySwiped);

        if ($request->filled('age_min')) {
            $query->where('age', '>=', $request->age_min);
        }
        if ($request->filled('age_max')) {
            $query->where('age', '<=', $request->age_max);
        }

        $profiles = $query->limit(20)->get()->map(fn($u) => $this->formatUser($u));

        return response()->json(['profiles' => $profiles]);
    }

    public function swipe(Request $request)
    {
        $request->validate([
            'user_id'   => 'required|exists:users,id',
            'direction' => 'required|in:like,skip',
        ]);

        $me     = $request->user();
        $target = (int) $request->user_id;

        if ($me->id === $target) {
            return response()->json(['message' => 'Cannot swipe yourself.'], 422);
        }

        Swipe::updateOrCreate(
            ['swiper_id' => $me->id, 'swiped_id' => $target],
            ['direction' => $request->direction]
        );

        $matched = false;
        $matchId = null;

        if ($request->direction === 'like') {
            $mutualLike = Swipe::where('swiper_id', $target)
                ->where('swiped_id', $me->id)
                ->where('direction', 'like')
                ->exists();

            if ($mutualLike) {
                $existingMatch = UserMatch::where(function ($q) use ($me, $target) {
                    $q->where('user1_id', $me->id)->where('user2_id', $target);
                })->orWhere(function ($q) use ($me, $target) {
                    $q->where('user1_id', $target)->where('user2_id', $me->id);
                })->first();

                if (!$existingMatch) {
                    $match   = UserMatch::create(['user1_id' => $me->id, 'user2_id' => $target]);
                    $matched = true;
                    $matchId = $match->id;
                }
            }
        }

        return response()->json([
            'matched'  => $matched,
            'match_id' => $matchId,
        ]);
    }

    private function formatUser(User $user): array
    {
        return [
            'id'                  => $user->id,
            'name'                => $user->name,
            'age'                 => $user->age,
            'bio'                 => $user->bio,
            'profile_picture_url' => $user->profile_picture ? asset('storage/' . $user->profile_picture) : null,
        ];
    }
}
