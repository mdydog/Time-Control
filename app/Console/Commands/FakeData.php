<?php

namespace App\Console\Commands;

use App\Event;
use App\Role;
use App\Time;
use App\User;
use DateTime;
use Illuminate\Console\Command;
use Faker;
use Illuminate\Support\Facades\Hash;

class FakeData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fake:data';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Creates a example app fake data';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }


    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $mins = array(480,240,450);
        $faker = Faker\Factory::create("es_ES");
        $sm=$faker->numberBetween(0,2);
        $u1 = User::create([
            'name' => $faker->name,
            'email' => $faker->email,
            'password' => Hash::make("12345678"),
            'supervisor' => null,
            'mins' => $mins[$sm],
            'active' => 1
        ]);
        Role::create([
            'user' => $u1->id,
            'group' => 1
        ]);
        Role::create([
            'user' => $u1->id,
            'group' => 3
        ]);

        $this->generateTimes($faker,$u1->id,$mins[$sm]);


        $nusers=$faker->numberBetween(8,22);
        for ($i = 0;$i < $nusers;$i++){
            $sm=$faker->numberBetween(0,2);
            $c_user = User::create([
                'name' => $faker->name,
                'email' => $faker->email,
                'password' => Hash::make("12345678"),
                'supervisor' => $u1->id,
                'mins' => $mins[$sm],
                'active' => 1
            ]);
            Role::create([
                'user' => $c_user->id,
                'group' => 1
            ]);

            $this->generateTimes($faker,$c_user->id,$mins[$sm]);
        }
        echo "Done";
        return;
    }

    function generateTimes($faker,$id,$mins){
        $start_hours=DateTime::createFromFormat("d/m/Y", "01/01/2019",null)->setTime ( 0 , 0 ,0 );
        $today=DateTime::createFromFormat("d/m/Y", "04/10/2019",null)->setTime ( 0 , 0 ,0 );
        while($start_hours<$today){
            $dw = intval(date("w", $start_hours->getTimestamp()));
            if ($dw !== 0 && $dw !== 6){
                $bt=$faker->numberBetween(30,60)*60;
                $sh=32400+($faker->numberBetween(-180,180));
                $comment=null;
                $eh=($mins*60)+$sh+$bt;
                if($faker->numberBetween(0,5)===5){
                    $eh+=$faker->numberBetween(-180,180);
                    $comment="Example comment";
                }

                Time::create([
                    'user' => $id,
                    'date' => $start_hours->getTimestamp(),
                    'start_hour' => $sh,
                    'end_hour' => $eh,
                    'breaktime' => $bt,
                    'comment' => $comment,
                    'register_date' => ($faker->numberBetween(0,20)===20?$start_hours->getTimestamp()+24*60*60:$start_hours->getTimestamp()),
                    'editable' => 0
                ]);
            }
            $start_hours->modify('+1 day');
        }
    }
}
