@extends('layouts.app')

@section('content')
    @if(!Request::is('admin'))
    <div class="modal fade" id="registerNewDay" tabindex="-1" role="dialog" aria-labelledby="registerNewDayLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="registerNewDayLabel">Register working day</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-danger" role="alert" style="display: none" id="register_error_alert"></div>
                    <div class="form-group">
                        <label for="rday" class="col-form-label">Date*:</label>
                        <div class="input-group date" id="datetimepicker" data-target-input="nearest">
                            <input id="rday" autocomplete="off" type="text" class="form-control datetimepicker-input white-readonly"  data-toggle="datetimepicker" data-target="#datetimepicker" required readonly/>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="fhour">From Hour*:</label>
                        <input type="hour" class="form-control" name="fhour" id="fhour" placeholder="Example: 9:00" required/>
                    </div>
                    <div class="form-group">
                        <label for="thour">To Hour*:</label>
                        <input type="hour" class="form-control" name="thour" id="thour" placeholder="Example: 18:00" required/>
                    </div>
                    <div class="form-group">
                        <label for="lhour">Break time (Lunch/Breakfast/Other):</label>
                        <input type="number" class="form-control" name="lhour" id="lhour" placeholder="Example: 60" value="60" title="60 mins by default for the lunchtime"/>
                    </div>
                    <div class="form-group">
                        <label for="comment">Comments:</label>
                        <textarea class="form-control" rows="5" id="comment"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" onclick="registerDay(event,true)">Submit</button>
                </div>
            </div>
        </div>
    </div>
    @endif
    <div class="container-fluid">
        @if(!Request::is('admin'))
        <div class="row mt-3">
            <div class="col-md-12">
                <div id="register_card" class="card p-4" style="display: none">
                    <div class="row">
                        <div class="col-md-12 text-center">
                            <h2>Time Control</h2>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-12 text-center">
                            <p>Employee: {{ Auth::user()->name }}</p>
                        </div>
                    </div>
                    <div class="row">
                        <div class="offset-md-5 col-md-2">
                            <p><button id="btn_register" class="col-md-12 btn btn-primary">Register working day</button></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        @endif
        <div class="row mt-3 d-none d-md-flex">
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Today</h5>
                        <p id="dayp" class="card-text">...</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">This Week</h5>
                        <p id="weekp" class="card-text">...</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">This Range</h5>
                        <p id="monthp" class="card-text">...</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mt-3 d-none d-md-flex">
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Expected Range Hours</h5>
                        <p id="emonthp" class="card-text">...</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Unregistered Days</h5>
                        <p id="udaysp" class="card-text">...</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Warning Days</h5>
                        <p id="wdaysp" class="card-text">...</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mt-3" id="loading_card">
            <div class="col-md-12">
                <div class="card p-4">
                    <div class="text-center">
                        <h3>Loading... <i class="fas fa-circle-notch fa-spin"></i></h3>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mt-3 mb-3">
            <div class="col-md-12">
                <div id="report_card" class="card p-4" style="display: none">

                    <div class="row">
                        <div class="col-md-12 disable-select">
                            <span class="fa-2x">History</span>
                            @if(Auth::user()->isInAnyGroup([2,3]) && Request::is('admin'))
                                <button class="btn btn-primary btn-sm float-right ml-2" id="btn_export">Export Excel</button>
                                <button class="btn btn-primary btn-sm float-right ml-2" id="btn_export_totals">Export Totals</button>
                                <i class="fas fa-filter" title="Hide/Show Filters" style="border: 1px solid lightgray;padding:4px;border-radius: 4px;cursor:pointer" onclick="event.preventDefault();$('#filters').toggle()"></i>
                            @endif
                            <div id="filters">
                                @if(Auth::user()->isInAnyGroup([2,3]) && Request::is('admin'))
                                    <hr>
                                    <label>Select User: </label>
                                    <select id="usr_list" class="custom-select" style="width: auto;">
                                        <option value="-2">All</option>
                                    </select><br><br>
                                @endif
                                <span>Range from: <input id="datepickerfrom" autocomplete="off" type="text" class="form-control datetimepicker-input white-readonly" style="display:inline;width:auto;"  data-toggle="datetimepicker" data-target="#datepickerfrom" readonly/> To: <input id="datepickerto" autocomplete="off" type="text" class="form-control datetimepicker-input white-readonly" style="display:inline;width:auto;"  data-toggle="datetimepicker" data-target="#datepickerto" readonly/></span>
                                @if(Auth::user()->isInAnyGroup([2,3]) && Request::is('admin'))
                                    <br><br><input type="checkbox" id="hide_current"/> <label for="hide_current">Hide my user from history</label>
                                @endif
                                @if(Auth::user()->isInAnyGroup([2,3]) && Request::is('admin'))
                                    <br><br><input type="checkbox" id="show_disabled_users"/> <label for="show_disabled_users">Show Disabled Users</label>
                                @endif
                            </div>
                        </div>
                    </div>

                    <hr>
                    <table id="report" class="table table-striped table-hover">
                        <thead class="thead-light">
                        <tr>
                            <td></td>
                            <td>Name</td>
                            <td>Day</td>
                            <td>Start</td>
                            <td>End</td>
                            <td>Comments</td>
                            <td>Register Date</td>
                            <td>Total time</td>
                            <td>Total break time</td>
                            <td>Total spend</td>
                            <td></td>
                        </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    @include('layouts/scripts')
    <script src="{{ url('/') }}/js/panel.js?val={{time()}}"></script>
@endsection
