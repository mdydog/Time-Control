<?php

namespace App\Http\Middleware;

use Closure;

class CheckActive
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        if (auth()->check() && !auth()->user()->active) {
            auth()->logout();
            return redirect()->route('login')->withMessage('Your account has been suspended. Please contact administrator.');
        }
        return $next($request);
    }
}
