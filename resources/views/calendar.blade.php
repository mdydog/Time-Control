@extends('layouts.app')

@section('content')
    <div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true" id="confirm-modal">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Do you want to remove that event?</h5>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-danger" id="confirm-modal-btn-yes">Yes</button>
                    <button type="button" class="btn btn-primary" id="confirm-modal-btn-no">Cancel</button>
                </div>
            </div>
        </div>
    </div>
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
                            <input id="datefrom" autocomplete="off" type="text" class="form-control datetimepicker-input white-readonly" data-toggle="datetimepicker" data-target="#datefrom" required readonly/>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="dateto" class="col-form-label">Date End*:</label>
                        <div class="input-group date" id="dateto1" data-target-input="nearest">
                            <input id="dateto" autocomplete="off" type="text" class="form-control datetimepicker-input white-readonly" data-toggle="datetimepicker" data-target="#dateto" required readonly/>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="title">Title*:</label>
                        <select class="custom-select" id="title">
                            <option value="0" selected>Select one</option>
                            <option value="1">Vacations</option>
                            <option value="2">Leave (Sick, Maternity, Paternity etc...)</option>
                        </select>
                    </div>
                    @if (Auth::user()->isInGroup(2))
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="ufest"><label for="ufest" class="form-check-label">Holiday</label>
                        </div>
                        <div class="form-group">
                            <label for="title2">Holiday Title (This ignore selected title)*:</label>
                            <input type="text" class="form-control" id="title2" title="Event name"/>
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
                            <hr class="mt-5">
                            <h3>Past events(Month):</h3>
                            <ul class="cevent-list" id="past_event_list">
                            </ul>
                        </div>
                        <div class="col-md-8">
                            <div id="calendar"></div>
                        </div>
                    </div>
                    @if(Auth::user()->isInGroup(2))
                        <div class="row">
                            <div class="col-md-12 mt-4">
                                <div class="alert alert-warning" id="summerdiv">
                                    <h3>Admin Menu</h3>
                                    <h4>Summer ranges:</h4>

                                    @php
                                    $summer_dates=App\SummerDate::all();
                                    $year = 2019;
                                    $nextY = intval(date("Y", (new DateTime())->getTimestamp()))+1;
                                    while ($year <= $nextY){
                                        $data=null;
                                        foreach($summer_dates as $summer){
                                            if ($summer["year"]===$year){
                                                $data=$summer;
                                            }
                                        }
                                        echo "<h5>".$year.":</h5>";
                                        echo "<form data-year=\"".$year."\" class=\"form-inline\">";
                                        echo "<p>From: <input type=\"text\" class=\"form-control\" placeholder=\"DD/MM/YYYY\"".($data!==null?"value=\"".date("d/m/Y", $data["date_from"])."\"":"")."/></p>";
                                        echo "<p class=\"ml-2\">To: <input type=\"text\" class=\"form-control\" placeholder=\"DD/MM/YYYY\"".($data!==null?"value=\"".date("d/m/Y", $data["date_to"]):"")."\""."/></p>";
                                        echo "</form>";
                                        $year++;
                                    }

                                    @endphp
                                    <button class="btn btn-primary btn-sm" onclick="saveSummerDates(event)">Submit</button>
                                </div>
                            </div>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
    @include('layouts/scripts')
    <script src="{{ url('/') }}/js/calendar.js?val={{time()}}"></script>
@endsection
