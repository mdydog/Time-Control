<nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <a class="navbar-brand" href="{{url("/")}}/">Time Control</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
            <li class="nav-item{{(Request::is('admin','admin/users','profile','calendar','logs')?"":" active")}}">
                <a class="nav-link" href="{{url("/")}}/">Home</a>
            </li>
            @if(Auth::user()->isInAnyGroup([2,3]))
                <li class="nav-item dropdown{{(Request::is('admin','admin/users')?" active":"")}}">
                    <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        Admin
                    </a>
                    <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                        <a class="dropdown-item" href="{{url("/")}}/admin">History</a>
                        @if(Auth::user()->isInGroup(2))
                            <a class="dropdown-item" href="{{url("/")}}/admin/users">User List</a>
                        @endif
                    </div>
                </li>
            @endif
            <li class="nav-item{{(Request::is('profile')?" active":"")}}">
                <a class="nav-link" href="{{url("/")}}/profile">Profile</a>
            </li>
            <li class="nav-item{{(Request::is('calendar')?" active":"")}}">
                <a class="nav-link" href="{{url("/")}}/calendar">Calendar</a>
            </li>
            @if(Auth::user()->isInGroup(2))
                <li class="nav-item{{(Request::is('logs')?" active":"")}}">
                    <a class="nav-link" href="{{url("/")}}/logs">Logs</a>
                </li>
            @endif
        </ul>
        @if(Auth::user()->isInGroup(2))
            <span style="font-size: 0.6em;font-style: italic;color:white;margin-right: 10px">Server time: {{date("d/m/Y H:i")." UTC"}}</span>
        @endif
        <i class="fas fa-sign-out-alt fa-2x click text-white" onclick="event.preventDefault(); document.getElementById('logout-form').submit();" title="Logout"></i>
        <form id="logout-form" action="{{ route('logout') }}" method="POST" style="display: none;">@csrf</form>
    </div>
</nav>
