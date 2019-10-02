<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class HomeController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index()
    {
        return view('home');
    }

    public function panel()
    {
        return view('panel');
    }

    public function adminpanel()
    {
        if (!Auth::user()->isInAnyGroup([2,3])){
            abort(404);
            return null;
        }
        return view('panel');
    }

    public function userlist()
    {
        if (!Auth::user()->isInGroup(2)){
            abort(404);
            return null;
        }
        return view('userlist');
    }
    public function profile()
    {
        return view('profile');
    }
    public function calendar()
    {
        return view('calendar');
    }
    public function editprofile(Request $r)
    {
        Validator::make($r->all(), [
            'password' => 'nullable|confirmed|string|max:50|min:8',
            'current-password' => 'required|string|max:50|min:8'
        ])->validate();

        $user = Auth::user();

        if (!Hash::check($r['current-password'], $user->password)) {
            return view('profile',['status'=>false,'msg'=>'Error with the current password!']);
        }

        if ($r['password']!==null){
            $user->password=Hash::make($r['password']);
            $user->save();
        }

        return view('profile',['status'=>true]);
    }
}
