@extends('layouts.app')

@section('content')
    <div class="container">
        <div class="row">
            <div class="col-md-12">
                <div class="card p-4 mt-4">
                    <div class="row">
                        <div class="col-md-4">
                            <!--<div class="text-right"><i class="fas fa-info fa-2x" style="cursor:help;" title="Click or drag to add new events to the calendar"></i></div>-->
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
