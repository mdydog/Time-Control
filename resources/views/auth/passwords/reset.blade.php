@extends('layouts.app')

@section('content')
    <div class="wrapper">
        <form class="form-signin" method="POST" action="{{ route('password.update') }}">
            @csrf
            <h2 class="form-signin-heading">{{ __('Reset Password') }}</h2>
            <input type="hidden" name="token" value="{{ $token }}">
            <input type="hidden" name="email" value="{{ $email }}">
            @error('email')
                <span class="invalid-feedback" role="alert">
                    <strong>{{ $message }}</strong>
                </span>
            @enderror
            @if (session('status'))
                <div class="alert alert-success" role="alert">
                    {{ session('status') }}
                </div>
            @endif
            <input id="password" type="password" placeholder="Password*" class="form-control @error('password') is-invalid @enderror" name="password" required autocomplete="current-password" autofocus>
            @error('password')
            <span class="invalid-feedback" role="alert">
                    <strong>{{ $message }}</strong>
                </span>
            @enderror
            <input id="password-confirm" type="password" placeholder="Repeat password*" class="form-control" name="password_confirmation" required autocomplete="new-password">
            <br>
            <button class="btn btn-primary btn-block" type="submit">{{ __('Reset Password') }}</button>
        </form>
    </div>
@endsection
