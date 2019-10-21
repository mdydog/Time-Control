<?php

Auth::routes([
    'register' => false, // Registration Routes...
    'reset' => true, // Password Reset Routes...
    'verify' => false, // Email Verification Routes...
]);

Route::get('/', 'HomeController@panel');
Route::get('/admin', 'HomeController@adminpanel');
Route::get('/admin/users', 'HomeController@userlist');
Route::get('/profile', 'HomeController@profile');
Route::get('/calendar', 'HomeController@calendar');
Route::get('/logs', 'HomeController@LogPanel');

Route::post('/profile', 'HomeController@editprofile');

//API------------------------------------------------------------

Route::get('/api/report/{from}/{to}', 'ApiController@ReportCurrent')->where('from', '[1-9][0-9]*')->where('to', '[1-9][0-9]*');
Route::get('/api/report/{id}/{from}/{to}', 'ApiController@Report')->where('id', '[1-9][0-9]*')->where('from', '[1-9][0-9]*')->where('to', '[1-9][0-9]*');
Route::get('/api/report/all/{from}/{to}', 'ApiController@ReportAll')->where('from', '[1-9][0-9]*')->where('to', '[1-9][0-9]*');
Route::get('/api/events', 'ApiController@Events');
Route::get('/api/user', 'ApiController@User');
Route::get('/api/users', 'ApiController@UserList')->defaults('all', false);
Route::get('/api/users/all', 'ApiController@UserList')->defaults('all', true);
Route::get('/api/summer', 'ApiController@SummerRange');

Route::post('/api/import/users', 'ApiController@ImportUsers');
Route::post('/api/addedituser', 'ApiController@AddEditUser');
Route::post('/api/addevent', 'ApiController@AddEvent');
Route::post('/api/removeevent', 'ApiController@RemoveEvent');
Route::post('/api/register', 'ApiController@Register');
Route::post('/api/edit/{id}', 'ApiController@Edit')->where('id', '[1-9][0-9]*');
Route::post('/api/savesummer', 'ApiController@AddEditSummer');






