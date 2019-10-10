<?php

namespace App;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Auth;
use phpDocumentor\Reflection\Types\Integer;

class SummerDate extends Model
{
    protected $table = 'summerdates';
    protected $fillable = [
        'year','date_from', 'date_to'
    ];
    public $timestamps = false;
}
