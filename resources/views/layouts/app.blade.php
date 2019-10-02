<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ config('app.name', 'Laravel') }}</title>

    <!-- Styles -->
    <link href="{{ url('/') }}/css/bootstrap.min.css" rel="stylesheet">
    <link href="{{ url('/') }}/css/custom.css" rel="stylesheet">
    <link href="{{ url('/') }}/css/fontawesome5.all.min.css" rel="stylesheet">
    <link rel="stylesheet" type="text/css" href="{{ url('/') }}/css/datatables.min.css"/>

@if (!Request::is('profile'))
    <!--date picker-->
    <link rel="stylesheet" href="{{ url('/') }}/css/tempusdominus-bootstrap-4.min.css" />
@endif

@if (Request::is('calendar'))
    <!--Calendar-->
    <link href='{{url('/')}}/calendarplugin/core/main.css' rel='stylesheet' />
    <link href='{{url('/')}}/calendarplugin/daygrid/main.css' rel='stylesheet' />
    <link href='{{url('/')}}/calendarplugin/timegrid/main.css' rel='stylesheet' />

    <script src='{{url('/')}}/calendarplugin/core/main.js'></script>
    <script src='{{url('/')}}/calendarplugin/interaction/main.js'></script>
    <script src='{{url('/')}}/calendarplugin/daygrid/main.js'></script>
    <script src='{{url('/')}}/calendarplugin/timegrid/main.js'></script>
@endif


</head>
<body>
    @if(Auth::user())
        @include('layouts/nav')
    @endif
    @yield('content')
    @include('layouts/footer')
</body>
</html>
