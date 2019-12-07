@extends('layouts.app')

@section('content')
    <div class="wrapper">
        <form class="form-signin" method="POST" action="{{ route('login') }}">
            @csrf
            <h2 class="form-signin-heading">Time Control</h2>
            @if (session('message'))
                <div class="alert alert-danger">{{ session('message') }}</div>
            @endif
            <input id="email" type="email" placeholder="Email" class="form-control @error('email') is-invalid @enderror" name="email" value="{{ old('email') }}" required autocomplete="email" autofocus>
            @error('email')
            <span class="invalid-feedback" role="alert">
                <strong>{{ $message }}</strong>
            </span>
            @enderror
            <input id="password" type="password" placeholder="{{ __('Password') }}" class="form-control @error('password') is-invalid @enderror" name="password" required autocomplete="current-password">
            @error('password')
                <span class="invalid-feedback" role="alert">
                    <strong>{{ $message }}</strong>
                </span>
            @enderror
            @if (Route::has('password.request'))
                <p class="text-right">
                    <a class="btn btn-link" href="{{ route('password.request') }}">
                        {{ __('Forgot Your Password?') }}
                    </a>
                </p>
            @endif
            <button class="btn btn-primary btn-block" type="submit">{{ __('Login') }}</button>
        </form>
    </div>
@endsection
