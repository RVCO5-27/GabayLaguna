<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class CacheApiResponse
{
    public function handle(Request $request, Closure $next, $ttl = 60): Response
    {
        // Only cache GET requests
        if ($request->method() !== 'GET') {
            return $next($request);
        }

        $key = 'api:' . $request->fullUrl() . ':' . $request->user()?->id;
        
        $cached = Cache::get($key);
        if ($cached !== null) {
            return response()->json(json_decode($cached, true))->header('X-Cache', 'HIT');
        }
        
        $response = $next($request);
        
        // Only cache successful JSON responses
        if ($response->getStatusCode() === 200 && $response->headers->get('Content-Type') === 'application/json') {
            Cache::put($key, $response->getContent(), $ttl);
        }
        
        return $response->header('X-Cache', 'MISS');
    }
}

