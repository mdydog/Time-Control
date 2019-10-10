<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSummerDatesTable extends Migration
{

    public function up()
    {
        Schema::create('summerdates', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->bigInteger('year');
            $table->bigInteger('date_from');
            $table->bigInteger('date_to');
            $table->unique('year');
        });
    }

    public function down()
    {
        Schema::dropIfExists('summerdates');
    }
}
