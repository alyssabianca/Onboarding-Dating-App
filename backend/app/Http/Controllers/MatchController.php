<?php

namespace App\Http\Controllers;

use App\Models\UserMatch;
use Illuminate\Http\Request;

class MatchController extends Controller
{
    public function index(Request $request)
    {
        $me = $request->user();

        $matches = UserMatch::where('user1_id', $me->id)
            ->orWhere('user2_id', $me->id)
            ->with(['user1', 'user2'])
            ->latest()
            ->get()
            ->map(function ($match) use ($me) {
                $other        = $match->getOtherUser($me->id);
                $lastMessage  = $match->messages()->latest()->first();

                return [
                    'id'                     => $match->id,
                    'matched_at'             => $match->created_at,
                    'other_user'             => [
                        'id'                  => $other->id,
                        'name'                => $other->name,
                        'age'                 => $other->age,
                        'bio'                 => $other->bio,
                        'profile_picture_url' => $other->profile_picture
                            ? asset('storage/' . $other->profile_picture)
                            : null,
                    ],
                    'last_message'           => $lastMessage ? [
                        'content'    => $lastMessage->content,
                        'sender_id'  => $lastMessage->sender_id,
                        'created_at' => $lastMessage->created_at,
                    ] : null,
                    'unread_count'           => $match->messages()
                        ->where('sender_id', '!=', $me->id)
                        ->whereNull('read_at')
                        ->count(),
                ];
            });

        return response()->json(['matches' => $matches]);
    }

    public function show(Request $request, int $id)
    {
        $me    = $request->user();
        $match = UserMatch::where('id', $id)
            ->where(function ($q) use ($me) {
                $q->where('user1_id', $me->id)->orWhere('user2_id', $me->id);
            })
            ->with(['user1', 'user2'])
            ->firstOrFail();

        $other = $match->getOtherUser($me->id);

        return response()->json([
            'match' => [
                'id'         => $match->id,
                'matched_at' => $match->created_at,
                'other_user' => [
                    'id'                  => $other->id,
                    'name'                => $other->name,
                    'age'                 => $other->age,
                    'bio'                 => $other->bio,
                    'profile_picture_url' => $other->profile_picture
                        ? asset('storage/' . $other->profile_picture)
                        : null,
                ],
            ],
        ]);
    }

    public function destroy(Request $request, int $id)
    {
        $me    = $request->user();
        $match = UserMatch::where(function ($q) use ($me, $id) {
            $q->where('id', $id)
                ->where(function ($q2) use ($me) {
                    $q2->where('user1_id', $me->id)->orWhere('user2_id', $me->id);
                });
        })->firstOrFail();

        $match->delete();

        return response()->json(['message' => 'Unmatched successfully.']);
    }
}
