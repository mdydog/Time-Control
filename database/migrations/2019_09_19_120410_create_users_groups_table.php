<?php


use App\Role;
use App\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Str;

class CreateUsersGroupsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users_groups', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user');
            $table->unsignedBigInteger('group');
            $table->timestamps();

            $table->foreign('user')->references('id')->on('users');
            $table->foreign('group')->references('id')->on('groups');
            $table->index('user');
        });
        $pw = Str::random(10);
        $user = User::create([
            'name' => "Master",
            'email' => "master.networks@imdea.org",
            'password' => Hash::make($pw),
            'supervisor' => null,
            'active' => true
        ]);
        Role::create([
            'user' => $user->id,
            'group' => 1
        ]);
        Role::create([
            'user' => $user->id,
            'group' => 2
        ]);
        echo("WARNING: Master administrator email: master.networks@imdea.org\n");
        echo("WARNING: Master administrator password: ".$pw."\n");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('users_groups');
    }
}
