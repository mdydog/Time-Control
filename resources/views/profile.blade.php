@extends('layouts.app')

@section('content')
    <div class="wrapper">
        <form class="form-signin" method="POST" action="{{url("/")}}/profile">
            @csrf
            <h2 class="form-signin-heading">User Profile</h2>
            @if (isset ($status))
                @if($status)
                    <div class="alert alert-success" role="alert">
                        Profile updated!
                    </div>
                @else
                    <div class="alert alert-danger" role="alert">
                        {{$msg}}
                    </div>
                @endif
            @endif
            @if ($errors->any())
                <div class="alert alert-danger">
                    <ul>
                        @foreach ($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <input id="name" type="text" placeholder="Name*" class="form-control" name="name" value="{{ Auth::user()->name }}" disabled autofocus>
            <input id="email" type="email" placeholder="Email*" class="form-control" name="email" value="{{ Auth::user()->email }}" disabled>
            <br>
            <input id="npassword1" type="password" placeholder="New Password" class="form-control" name="password">
            <input id="npassword2" type="password" placeholder="Repeat New Password" class="form-control" name="password_confirmation">
            <br>
            <input id="password" type="password" placeholder="Current Password*" class="form-control" name="current-password" required>
            <br>
            <button class="btn btn-primary btn-block" type="submit">Save profile</button>
        </form>
    </div>
    @include('layouts/scripts')
@endsection
