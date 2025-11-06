<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\ChatMessage;
use App\Models\User;

class ChatController extends Controller
{
    public function getConversations(Request $request)
    {
        $user = Auth::user();
        
        // Get all unique conversations for the user
        $conversations = DB::table('chat_messages')
            ->where('sender_id', $user->id)
            ->orWhere('recipient_id', $user->id)
            ->select('sender_id', 'recipient_id')
            ->distinct()
            ->get()
            ->map(function ($conv) use ($user) {
                $otherUserId = $conv->sender_id == $user->id ? $conv->recipient_id : $conv->sender_id;
                $otherUser = User::find($otherUserId);
                if (!$otherUser) return null;
                
                $unreadCount = ChatMessage::where('sender_id', $otherUserId)
                    ->where('recipient_id', $user->id)
                    ->where('read_at', null)
                    ->count();
                
                $lastMessage = ChatMessage::where(function ($q) use ($user, $otherUserId) {
                    $q->where('sender_id', $user->id)->where('recipient_id', $otherUserId);
                })->orWhere(function ($q) use ($user, $otherUserId) {
                    $q->where('sender_id', $otherUserId)->where('recipient_id', $user->id);
                })->latest()->first();
                
                return [
                    'user_id' => $otherUser->id,
                    'name' => $otherUser->name,
                    'unread_count' => $unreadCount,
                    'last_message' => $lastMessage ? [
                        'message' => $lastMessage->message,
                        'created_at' => $lastMessage->created_at
                    ] : null
                ];
            })
            ->filter()
            ->values();
        
        return response()->json(['conversations' => $conversations]);
    }

    public function getMessages(Request $request)
    {
        $user = Auth::user();
        $recipientId = $request->query('recipient_id');
        
        if (!$recipientId) {
            return response()->json(['error' => 'recipient_id required'], 400);
        }
        
        $messages = ChatMessage::where(function ($q) use ($user, $recipientId) {
            $q->where('sender_id', $user->id)->where('recipient_id', $recipientId);
        })->orWhere(function ($q) use ($user, $recipientId) {
            $q->where('sender_id', $recipientId)->where('recipient_id', $user->id);
        })->orderBy('created_at', 'asc')->get();
        
        // Mark messages as read
        ChatMessage::where('sender_id', $recipientId)
            ->where('recipient_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
        
        return response()->json(['messages' => $messages]);
    }

    public function sendMessage(Request $request)
    {
        $request->validate([
            'recipient_id' => 'required|exists:users,id',
            'message' => 'required|string|max:1000'
        ]);
        
        $message = ChatMessage::create([
            'sender_id' => Auth::id(),
            'recipient_id' => $request->recipient_id,
            'message' => $request->message
        ]);
        
        return response()->json(['message' => $message], 201);
    }

    public function markAsRead(Request $request, $messageId)
    {
        $message = ChatMessage::findOrFail($messageId);
        
        if ($message->recipient_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $message->update(['read_at' => now()]);
        
        return response()->json(['message' => 'Marked as read']);
    }

    public function getUnreadCount(Request $request)
    {
        $unreadCount = ChatMessage::where('recipient_id', Auth::id())
            ->whereNull('read_at')
            ->count();
        
        return response()->json(['unread_count' => $unreadCount]);
    }
}

