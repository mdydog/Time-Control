<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->unsignedBigInteger('supervisor')->nullable();
            $table->integer('mins')->default(8*60);
            $table->integer('summermins')->default(8*60);
            $table->boolean('active')->default(true);
            $table->rememberToken();
            $table->timestamps();

            $table->foreign('supervisor')->references('id')->on('users');
            $table->index('supervisor');
            $table->index('active');
        });

    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('users');
    }
}
