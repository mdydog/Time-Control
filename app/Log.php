<?php

namespace App;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Auth;
use phpDocumentor\Reflection\Types\Integer;

class Log extends Model
{
    protected $table = 'logs';

    const TYPE = [
        'ADD' => 0,
        'EDIT' => 1,
        'DELETE' => 2,
    ];

    protected $fillable = [
        'creator', 'text', 'type'
    ];

    public static function addlog($text){
        Log::create([
            'creator' => Auth::id(),
            'type' => self::TYPE['ADD'],
            'text' => $text
        ]);
    }
    public static function editlog($text){
        Log::create([
            'creator' => Auth::id(),
            'type' => self::TYPE['EDIT'],
            'text' => $text
        ]);
    }
    public static function deletelog($text){
        Log::create([
            'creator' => Auth::id(),
            'type' => self::TYPE['DELETE'],
            'text' => $text
        ]);
    }
    public static function hourparse($data, $mode){
        if ($mode==='s'){
            $h = intval($data/60/60);
            $mins = "00".($data-$h*60*60)/60;
            $h = "00".$h;
            return substr($h,strlen($h)-2).":".substr($mins,strlen($mins)-2);
        }
        else{
            $h = intval($data/60);
            $mins = "00".($data-$h*60);
            $h = "00".$h;
            return substr($h,strlen($h)-2).":".substr($mins,strlen($mins)-2);
        }
    }
}
