<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Time extends Model
{
    protected $table = 'times';
    protected $fillable = [
        'user','date', 'start_hour', 'end_hour', 'breaktime', 'comment','register_date','editable'
    ];
    public $timestamps = false;
}
