@extends('layouts.app')

@section('content')
    <div class="wrapper">
        <form class="form-signin" method="POST" action="{{ route('password.email') }}">
            @csrf
            <h2 class="form-signin-heading">{{ __('Reset Password') }}</h2>
            @if (session('status'))
                <div class="alert alert-success" role="alert">
                    {{ session('status') }}
                </div>
            @endif
            <input id="email" type="email" placeholder="Email" class="form-control @error('email') is-invalid @enderror" name="email" value="{{ old('email') }}" required autocomplete="email" autofocus>
            @error('email')
            <span class="invalid-feedback" role="alert">
            <strong>{{ $message }}</strong>
        </span>
            @enderror
            <p class="text-right">
                <a class="btn btn-link" href="{{ route('login') }}">Return to Login</a>
            </p>
            <button class="btn btn-primary btn-block" type="submit">{{ __('Send Password Reset Link') }}</button>
        </form>
    </div>
@endsection
