<?php

namespace App;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Auth;
use phpDocumentor\Reflection\Types\Integer;

class Event extends Model
{
    protected $table = 'events';
    protected $fillable = [
        'user', 'from', 'to','approved','comment'
    ];
}
