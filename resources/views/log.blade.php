@extends('layouts.app')

@section('content')
    <div class="row no-gutters">
        <div class="col-md-12">
            <div id="log_card" class="card m-4 p-4">
                <h2>Logs</h2>
                <table id="log_table" class="table table-striped table-hover">
                    <thead class="thead-light">
                        <tr>
                            <td>Type</td>
                            <td>Date(UTC)</td>
                            <td>Creator</td>
                            <td>Info</td>
                        </tr>
                    </thead>
                    <tbody>
                    @foreach($logs as $log)
                        <tr>
                            <td>
                                @if($log->type===0)
                                    <i class="fas fa-plus-circle add"></i>
                                @endif
                                @if($log->type===1)
                                        <i class="fas fa-edit edit"></i>
                                @endif
                                @if($log->type===2)
                                        <i class="fas fa-minus-circle delete"></i>
                                @endif
                            </td>
                            <td>
                                {{$log->created_at}}
                            </td>
                            <td>
                                {{$log->creator_name}}
                            </td>
                            <td>
                                <pre>{{$log->text}}</pre>
                            </td>
                        </tr>
                    @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    @include('layouts/scripts')
    <script src="{{ url('/') }}/js/logs.js?val={{time()}}"></script>
@endsection
