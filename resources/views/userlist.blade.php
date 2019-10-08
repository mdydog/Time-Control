@extends('layouts.app')

@section('content')
    <div class="modal fade" id="addEditUser" tabindex="-1" role="dialog" aria-labelledby="addEditUserLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="addEditUserLabel">Add or Edit User</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-danger" role="alert" style="display: none" id="add_user_error_alert"></div>
                    <input type="hidden" id="uid">
                    <div class="form-group">
                        <label for="uname">Name*:</label>
                        <input type="text" class="form-control" id="uname" placeholder="Juan Example Example" required/>
                    </div>
                    <div class="form-group">
                        <label for="uemail">Email*:</label>
                        <input type="text" class="form-control" id="uemail" placeholder="email@imdea.org" required/>
                    </div>
                    <div class="form-group">
                        <label for="whours">Working hours*:</label>
                        <input type="hour" class="form-control" id="whours" placeholder="Example: 08:00" required/>
                    </div>
                    <div class="form-group">
                        <label for="usupervisor">Supervisor:</label>
                        <select id="usupervisor" class="custom-select">
                            <option value="-1" selected>None</option>
                            @php
                                $users = User::all();
                                foreach ($users as $user){
                                    if ($user->isInAnyGroup([2,3])){
                                        echo '<option value="'.$user->id.'">'.$user->name.'</option>';
                                    }
                                }
                            @endphp
                        </select>
                    </div>
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input" id="uactive" checked="true"><label for="uactive" class="form-check-label">Login Enabled</label>
                    </div>
                    <label>User Roles:</label>
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input" id="uroleuser" readonly="true" checked="true" disabled="true"><label class="form-check-label">User</label>
                    </div>
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input" id="uroleadmin"><label class="form-check-label" for="uroleadmin">Admin</label>
                    </div>
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input" id="urolesupervisor"><label class="form-check-label" for="urolesupervisor">Supervisor</label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="addUser(event)">Add/Edit</button>
                </div>
            </div>
        </div>
    </div>
    <div class="row no-gutters">
        <div class="col-md-12">
            <div id="loading_card" class="card m-4 p-4">
                <div class="text-center">
                    <h3>Loading...</h3>
                </div>
            </div>
            <div id="user_card" class="card m-4 p-4" style="display: none">
                <h2>Users</h2>
                <div class="row">
                    <div class="col-md-12">
                        <button class="btn btn-primary" id="btn_add_user">Add User</button>
                    </div>
                </div>
                <hr>
                <table id="report" class="table table-striped table-hover">
                    <thead class="thead-light">
                        <tr>
                            <td>Name</td>
                            <td>Email</td>
                            <td>Working Hours</td>
                            <td>Supervisor</td>
                            <td>Login Enabled</td>
                            <td>Roles</td>
                            <td></td>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    @include('layouts/scripts')
    <script src="{{ url('/') }}/js/users.js?val={{time()}}"></script>
@endsection
