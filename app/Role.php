<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $table = 'users_groups';
    protected $fillable = [
        'user', 'group',
    ];
}
