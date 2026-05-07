<?php

namespace App\Http\Controllers;

use App\Models\UserMatch;
use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(Request $request, int $matchId)
    {
        $me    = $request->user();
        $match = $this->getAuthorizedMatch($matchId, $me->id);

        $messages = $match->messages()
            ->with('sender:id,name,profile_picture')
            ->orderBy('created_at')
            ->get()
            ->map(fn($msg) => $this->formatMessage($msg));

        $match->messages()
            ->where('sender_id', '!=', $me->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['messages' => $messages]);
    }

    public function store(Request $request, int $matchId)
    {
        $me    = $request->user();
        $match = $this->getAuthorizedMatch($matchId, $me->id);

        $request->validate([
            'content' => 'required|string|max:2000',
        ]);

        $message = Message::create([
            'match_id'  => $match->id,
            'sender_id' => $me->id,
            'content'   => $request->content,
        ]);

        $message->load('sender:id,name,profile_picture');

        return response()->json(['message' => $this->formatMessage($message)], 201);
    }

    private function getAuthorizedMatch(int $matchId, int $userId): UserMatch
    {
        return UserMatch::where('id', $matchId)
            ->where(function ($q) use ($userId) {
                $q->where('user1_id', $userId)->orWhere('user2_id', $userId);
            })
            ->firstOrFail();
    }

    private function formatMessage(Message $message): array
    {
        return [
            'id'         => $message->id,
            'match_id'   => $message->match_id,
            'sender_id'  => $message->sender_id,
            'content'    => $message->content,
            'read_at'    => $message->read_at,
            'created_at' => $message->created_at,
            'sender'     => $message->sender ? [
                'id'                  => $message->sender->id,
                'name'                => $message->sender->name,
                'profile_picture_url' => $message->sender->profile_picture
                    ? asset('storage/' . $message->sender->profile_picture)
                    : null,
            ] : null,
        ];
    }
}
