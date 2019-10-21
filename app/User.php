<?php

namespace App;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Auth;
use phpDocumentor\Reflection\Types\Integer;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'email', 'password','supervisor','active','mins','summermins'
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];


    public function isInGroup($group)
    {
        return $this->isInAnyGroup(array($group));
    }

    public function isInAnyGroup($group_array){
        return count(Role::where('user', $this->id)->whereIn('group',$group_array)->get()->all())>0;
    }

    public function groups(){
        $result=[];
        $rows = Role::where('user', $this->id)->get()->all();
        foreach ($rows as $row){
            $result[]=$row['group'];
        }
        return $result;
    }

    function loginfo(){
        return "[Name: ".$this->name.
            ", Email: ".$this->email.
            ", Supervisor: ".($this->supervisor===NULL?"None":User::where('id',$this->supervisor)->get()->first()->name).
            ", Login Enable: ".$this->active.
            ", Working Hours: ".Log::hourparse($this->mins,'m').
            ", Summer Hours: ".Log::hourparse($this->summermins,'m');
    }
}
