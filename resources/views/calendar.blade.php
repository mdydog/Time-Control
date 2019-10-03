@extends('layouts.app')

@section('content')
    @if(Auth::user()->isInAnyGroup([2,3]))
        <div style="display:none" id="admdiv"></div>
    @endif
    <div class="modal fade" id="addEvent" tabindex="-1" role="dialog" aria-labelledby="addEventLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="addEventLabel">Add new event</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-danger" role="alert" style="display: none" id="error_alert"></div>
                    <div class="form-group">
                        <label for="datefrom" class="col-form-label">Date Start*:</label>
                        <div class="input-group date" id="datefrom1" data-target-input="nearest">
                            <input id="datefrom" autocomplete="off" type="text" class="form-control datetimepicker-input" data-toggle="datetimepicker" data-target="#datefrom" required/>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="dateto" class="col-form-label">Date End*:</label>
                        <div class="input-group date" id="dateto1" data-target-input="nearest">
                            <input id="dateto" autocomplete="off" type="text" class="form-control datetimepicker-input" data-toggle="datetimepicker" data-target="#dateto" required/>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="comment">Title*:</label>
                        <input type="text" class="form-control" id="title" title="Vacations/Reason/Event name" required/>
                    </div>
                    @if (Auth::user()->isInGroup(2))
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="ufest"><label for="ufest" class="form-check-label">Holiday</label>
                        </div>
                    @endif
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" onclick="addEvent(event)">Submit</button>
                </div>
            </div>
        </div>
    </div>
    <div class="container">
        <div class="row">
            <div class="col-md-12">
                <div class="card p-4 mt-4">
                    <div class="row">
                        <div class="col-md-4">
                            <button class="btn btn-primary mt-4 mb-4" id="btn_add_event">Add event</button>
                            <h3>Next events:</h3>
                            <ul class="cevent-list" id="event_list">
                            </ul>
                        </div>
                        <div class="col-md-8">
                            <div id="calendar"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    @include('layouts/scripts')
    <script src="{{ url('/') }}/js/calendar.js?val={{time()}}"></script>
@endsection
