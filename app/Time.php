<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Time extends Model
{
    protected $table = 'times';
    protected $fillable = [
        'user','date', 'start_hour', 'end_hour', 'breaktime', 'comment','register_date'
    ];
    public $timestamps = false;

    function loginfo(){
        return "[User: ".User::where('id',$this->user)->get()->first()->email.
            ", Date: ".date("d/m/Y",$this->date).
            ", Start Hour: ".Log::hourparse($this->start_hour,'s').
            ", End Hour: ".Log::hourparse($this->end_hour,'s').
            ", Break time: ".Log::hourparse($this->breaktime,'s').
            ", Registration Date: ".date("d/m/Y",$this->register_date)."]";
    }
}
