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
        $this->createEvent(null,"01/01/2019","01/01/2019","Año Nuevo");
        $this->createEvent(null,"07/01/2019","07/01/2019","Traslado de la Epifanía del Señor");
        $this->createEvent(null,"18/04/2019","18/04/2019","Jueves Santo");
        $this->createEvent(null,"19/04/2019","19/04/2019","Viernes Santo");
        $this->createEvent(null,"01/05/2019","01/05/2019","Fiesta del Trabajo");
        $this->createEvent(null,"02/05/2019","02/05/2019","Fiesta de la Comunidad de Madrid");
        $this->createEvent(null,"15/08/2019","15/08/2019","Asunción de la Virgen");
        $this->createEvent(null,"12/10/2019","12/10/2019","Fiesta de la Hispanidad");
        $this->createEvent(null,"01/11/2019","01/11/2019","Todos los Santos");
        $this->createEvent(null,"06/12/2019","06/12/2019","Constitución Española");
        $this->createEvent(null,"09/12/2019","09/12/2019","Traslado de la Inmaculada Concepción");
        $this->createEvent(null,"25/12/2019","25/12/2019","Natividad del Señor");
        $times=3;
        while($times>0){
            $times--;
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
        }
        echo "Done";
        return;
    }

    function createEvent($user, $from, $to, $comment){
        $pfrom=DateTime::createFromFormat("d/m/Y", $from,null)->setTime ( 0 , 0 ,0 );
        $pto=DateTime::createFromFormat("d/m/Y", $to,null)->setTime ( 0 , 0 ,0 );
        Event::create([
            'user' => $user,
            'from' => $pfrom->getTimestamp(),
            'to' => $pto->getTimestamp(),
            'comment' => $comment,
            'approved' => 1,
        ]);
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
