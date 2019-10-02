<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTimesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('times', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user');
            $table->unsignedBigInteger('date');
            $table->unsignedBigInteger('start_hour')->nullable();
            $table->unsignedBigInteger('end_hour')->nullable();
            $table->unsignedBigInteger('breaktime')->nullable();
            $table->text('comment')->nullable();
            $table->unsignedBigInteger('register_date');
            $table->boolean('editable')->default(0);

            $table->foreign('user')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('times');
    }
}
