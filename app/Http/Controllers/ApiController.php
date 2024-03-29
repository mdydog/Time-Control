<?php

namespace App\Http\Controllers;

use App\Event;
use App\Group;
use App\Log;
use App\Role;
use App\SummerDate;
use App\Time;
use DateTime;
use App\User;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class ApiController extends Controller
{

    public function __construct()
    {
        $this->middleware('auth');
    }

    public function Register(Request $request)
    {
        Validator::make($request->all(), [
            'date' => 'required|integer',
            'from_hour' => 'required|integer',
            'to_hour' => 'required|integer',
            'breaktime' => 'required|integer'
        ])->validate();

        $date = new DateTime();
        $date->setTimestamp(intval($request['date']));
        $date->setTime(0,0,0);
        $from_hour = intval($request['from_hour']);
        $to_hour = intval($request['to_hour']);
        $breaktime = intval($request['breaktime']);
        $comment = $request['comment'];
        if ($comment===null){
            $comment="";
        }

        $dw = intval(date("w", $date->getTimestamp()));
        if ($dw === 0 || $dw === 6){
            return $this->response(200,array('status'=>'error','msg'=>'You can\'t register a weekend day'));
        }

        if ($date->getTimestamp()>(new DateTime())->getTimestamp()){
            return $this->response(200,array('status'=>'error','msg'=>'This date is in the future, you can\'t register future dates'));
        }

        if ($breaktime<0||$to_hour-$from_hour<$breaktime){
            return $this->response(200,array('status'=>'error','msg'=>'Wrong Break Time'));
        }

        if ($to_hour<0||$from_hour<0){
            return $this->response(200,array('status'=>'error','msg'=>'Wrong Hours'));
        }

        $rows = Time::where('user','=',Auth::id())->where('date',$date->getTimestamp())->get()->all();
        if (count($rows)>0){
            return $this->response(200,array('status'=>'error','msg'=>'You have already registered this date'));
        }

        $register_date = time();
        Time::create([
            'user' => Auth::id(),
            'date' => $date->getTimestamp(),
            'start_hour' => $from_hour,
            'end_hour' => $to_hour,
            'breaktime' => $breaktime,
            'comment' => $comment,
            'sign' => '',
            'register_date' => $register_date
        ]);

        return $this->response(200,array('status'=>'ok'));
    }

    public function Events(Request $request)
    {
        $user = Auth::user();

        if ($user->isInGroup(2)){
            $rows = Event::orderBy('from','asc')->get()->all();
        }
        elseif ($user->isInGroup(3)){
            $rows = DB::select("select * from events where (user is null or user in (select id from users where supervisor = ?) or user = ?) order by events.from asc",[Auth::id(),Auth::id()]);
        }
        else{
            $rows = DB::select("select * from events where (user is null or user = ?) order by events.from asc",[Auth::id()]);
        }

        return $this->response(200,array('status'=>'ok','data'=>$rows));
    }

    public function AddEditSummer(Request $request){
        if (!Auth::user()->isInGroup(2)){
            abort(404);
            return;
        }
        $data = $request["data"];
        if (!is_array($data)){
            return $this->response(200,array('status'=>'error','msg'=>"Wrong format"));
        }

        DB::beginTransaction();
        foreach ($data as $syear) {
            $year=intval($syear["year"]);
            $from=intval($syear["from"]);
            $to=intval($syear["to"]);
            if (!is_int($from)||$from<1546300800||
                !is_int($to)||$to<1546300800||
                !is_int($year)||$year<2019){ // minyear 2019
                DB::rollBack();
                return $this->response(200,array('status'=>'error','msg'=>"Wrong format"));
            }
            $year=$syear["year"];
            $from=$syear["from"];
            $to=$syear["to"];
            if (intval(date("Y",$from)) != $year || intval(date("Y",$to)) != $year){
                DB::rollBack();
                return $this->response(200,array('status'=>'error','msg'=>"Range of ".$year." outside year"));
            }

            if ($from>=$to){
                DB::rollBack();
                return $this->response(200,array('status'=>'error','msg'=>"Wrong Dates"));
            }

            $indb = SummerDate::where("year","=",$year)->get()->first();
            if ($indb===null){
                try{
                    Log::addlog("Summer Range created for year ".$year.", From: ".date("d/m/Y",$from).", To: ".date("d/m/Y",$to));
                    SummerDate::create([
                        'year' => $year,
                        'date_from' => $from,
                        'date_to' => $to,
                    ]);
                }
                catch (\Exception $e){
                    DB::rollBack();
                    return $this->response(200,array('status'=>'error','msg'=>"Error creating ".$year.", process cancelled"));
                }
            }
            else{
                try{
                    Log::editlog("Summer Range edited for year ".$indb->year." new From: ".date("d/m/Y",$from).", new To: ".date("d/m/Y",$to)." old values: ".date("d/m/Y",$indb->date_from).", ".date("d/m/Y",$indb->date_to));
                    $indb->date_from=$from;
                    $indb->date_to=$to;
                    if (!$indb->save()){
                        DB::rollBack();
                        return $this->response(200,array('status'=>'error','msg'=>"Error saving ".$year.", process cancelled"));
                    }
                }
                catch (\Exception $e){
                    DB::rollBack();
                    return $this->response(200,array('status'=>'error','msg'=>"Error saving ".$year.", process cancelled"));
                }
            }
        }

        DB::commit();
        return $this->response(200,array('status'=>'ok'));
    }

    public function SummerRange(Request $request){
        return $this->response(200,array('status'=>'ok','data'=>SummerDate::all()));
    }

    public function ImportUsers(Request $request){
        if (!Auth::user()->isInGroup(2)){
            abort(404);
            return;
        }
        Validator::make($request->all(), [
            'users' => 'required'
        ])->validate();

        $import_users = $request['users'];

        DB::beginTransaction();
        foreach ($import_users as $user){
            if ($user[2]===NULL || !filter_var($user[2], FILTER_VALIDATE_EMAIL)){ //EMAIL CHECK
                DB::rollBack();
                return $this->response(200,array('status'=>'error','msg'=>'Wrong email: '.($user[2]===NULL?"NULL":$user[2])));
            }
            if (count(User::where('email','=',$user[2])->get()->all())>0){ //EMAIL EXISTS CHECK
                DB::rollBack();
                return $this->response(200,array('status'=>'error','msg'=>'User '.$user[2].' already exists'));
            }
            if ($user[0]===NULL || trim($user[0]) === ""){ //NAME CHECK
                DB::rollBack();
                return $this->response(200,array('status'=>'error','msg'=>'Wrong name for user '.$user[2]));
            }
            if ($user[1]===NULL || trim($user[1]) === ""){ //LAST NAME CHECK
                DB::rollBack();
                return $this->response(200,array('status'=>'error','msg'=>'Wrong last name for user '.$user[2]));
            }
            $hours = $user[3];
            if ($user[3]===NULL){ //HOURS CHECK
                $hours = 8*60;
            }
            else{
                try{
                    if (!is_numeric($hours)){
                        $hours = explode(":",$hours);
                        $hours = intval($hours[0])*60 + intval($hours[1]);
                    }
                    else{
                        $hours = intval($hours)*60;
                    }
                }
                catch (\Exception $e){
                    DB::rollBack();
                    return $this->response(200,array('status'=>'error','msg'=>'Error parsing hours '.$user[2]));
                }
            }
            $summer_hours = $user[4];
            if ($user[4]===NULL){ //HOURS CHECK
                $summer_hours = 7*60;
            }
            else{
                try{
                    if (!is_numeric($summer_hours)){
                        $summer_hours = explode(":",$summer_hours);
                        $summer_hours = intval($summer_hours[0])*60 + intval($summer_hours[1]);
                    }
                    else{
                        $summer_hours = intval($summer_hours)*60;
                    }
                }
                catch (\Exception $e){
                    DB::rollBack();
                    return $this->response(200,array('status'=>'error','msg'=>'Error parsing hours '.$user[2]));
                }
            }
            $admin = 0;
            if ($user[5]!=NULL && is_numeric($user[5]) && intval($user[5])===1){ //HOURS CHECK
                $admin = 1;
            }
            $result = User::create([
                'name' => $user[0]." ".$user[1],
                'email' => $user[2],
                'password' => Hash::make(Str::random(10)),
                'supervisor' => null,
                'active' => 1,
                'mins' => $hours,
                'summermins' => $summer_hours,
            ]);
            if ($result===NULL){
                DB::rollBack();
                return $this->response(200,array('status'=>'error','msg'=>'Error creating user '.$user[2]));
            }
            Log::addlog("User created ".$user[2]." by batch import");
            Role::create([
                'user' => $result->id,
                'group' => 1
            ]);
            if ($admin === 1){
                Log::editlog("User now is admin, email: ".$user[2]." by batch import");
                Role::create([
                    'user' => $result->id,
                    'group' => 2
                ]);
            }
        }
        foreach ($import_users as $user){
            if ($user[6]!==NULL && !filter_var($user[6], FILTER_VALIDATE_EMAIL)){ //EMAIL CHECK
                DB::rollBack();
                return $this->response(200,array('status'=>'error','msg'=>'Wrong supervisor email for user: '.$user[2]));
            }
            if ($user[6]!==NULL){
                $supervisor = User::where('email','=',$user[6])->get()->first();
                if ($supervisor===NULL){
                    DB::rollBack();
                    return $this->response(200,array('status'=>'error','msg'=>'Supervisor '.$user[6].' don\'t exists'));
                }
                $user = User::where('email','=',$user[2])->get()->first();
                $user->supervisor = $supervisor->id;
                $user->save();
                $isSuper = Role::where('user','=',$supervisor->id)->where('group','=','3')->get()->first()===NULL?false:true;
                if(!$isSuper){
                    Log::editlog("User now is supervisor email: ".$supervisor->email." by batch import");
                    Role::create([
                        'user' => $supervisor->id,
                        'group' => 3
                    ]);
                }
                Log::addlog("User now is supervised, email: ".$user->email." supervised by ".$supervisor->email." action by batch import");
            }
        }
        DB::commit();
        return $this->response(200,array('status'=>'ok'));
    }

    public function AddEditUser(Request $request)
    {
        if (!Auth::user()->isInGroup(2)){
            abort(404);
            return;
        }

        Validator::make($request->all(), [
            'id' => 'required|integer',
            'name' => 'required|string|max:50|min:1',
            'mins' => 'required|integer',
            'summermins' => 'required|integer',
            'email' => 'required|email|max:100|min:1',
            'supervisor' => 'required|integer',
            'active' => 'required|boolean',
            'adminrole' => 'required|boolean',
            'supervisorrole' => 'required|boolean',
        ])->validate();

        if (Auth::id()===$request["id"]){
            abort(404);
            return;
        }

        $user=null;
        if ($request["id"]!=-1){
            $user = User::find($request["id"]);
        }


        DB::beginTransaction();
        if ($user!=null){ //edit
            $log_msg="User edited email: ".$user->email.", old data: \r\n".$user->loginfo().", new data: \r\n";
            $user->name = $request["name"];
            $user->mins = $request["mins"];
            $user->summermins = $request["summermins"];
            $user->email = $request["email"];
            $user->supervisor = intval($request["supervisor"])===-1?null:$request["supervisor"];
            $user->active = $request["active"];
            $user->save();
            Log::editlog($log_msg.$user->loginfo());
        }
        else{ //add

            if (User::where('email','=',$request["email"])->get()->first()!==null){
                return $this->response(200,array('status'=>'error','msg'=>'Email in use!'));
            }

            try{
                $user = User::create([
                    'name' => $request["name"],
                    'mins' => $request["mins"],
                    'summermins' => $request["summermins"],
                    'email' => $request["email"],
                    'supervisor' => intval($request["supervisor"])===-1?null:$request["supervisor"],
                    'active' => $request["active"],
                    'password' => Hash::make(Str::random(10))
                ]);
                Log::addlog("User added: ".$user->loginfo());
            }
            catch (\Exception $e){
                DB::rollBack();
                return;
            }

            Role::create([
                'user' => $user->id,
                'group' => 1
            ]);
        }

        DB::delete('delete from users_groups where user = ? and users_groups.group <> 1',[$user->id]);

        if (intval($request["adminrole"])===1){
            Role::create([
                'user' => $user->id,
                'group' => 2
            ]);
            Log::editlog("User now is admin email: ".$user->email);
        }

        if (intval($request["supervisorrole"])===1){
            Role::create([
                'user' => $user->id,
                'group' => 3
            ]);
            Log::editlog("User now is supervisor ".$user->email);
        }
        DB::commit();
        return $this->response(200,array('status'=>'ok'));
    }

    public function AddEvent(Request $request)
    {
        Validator::make($request->all(), [
            'datefrom' => 'required|integer',
            'dateto' => 'required|integer',
            'fest' => 'required|integer',
            'title' => 'required'
        ])->validate();

        $user = Auth::user();

        $usr = $user->id;

        $datefrom = new DateTime();
        $datefrom->setTimestamp(intval($request["datefrom"]));
        $datefrom->setTime(0,0,0);
        $datefrom = $datefrom->getTimestamp();

        $dateto = new DateTime();
        $dateto->setTimestamp(intval($request["dateto"]));
        $dateto->setTime(0,0,0);
        $dateto = $dateto->getTimestamp();

        $title = $request["title"];

        if (is_numeric($title)){
            switch (intval($title)){
                case 1:
                    $title = "Vacations";
                    break;
                case 2:
                    $title = "Leave";
                    break;
                default:
                    return $this->response(200,array('status'=>'error','msg'=>'Title not exists!'));
            }
        }
        else if (!$user->isInGroup(2)){
            return $this->response(200,array('status'=>'error','msg'=>'No access to custom title!'));
        }

        $fest = $request["fest"]!=NULL&&is_numeric($request["fest"])?intval($request["fest"]):0;

        if ($user->isInGroup(2) && $fest===1){
            $usr = null;
        }

        if ($datefrom>$dateto){
            return $this->response(200,array('status'=>'error','msg'=>'Dates error!'));
        }

        if (trim($title)===""){
            return $this->response(200,array('status'=>'error','msg'=>'Wrong title'));
        }

        $e = Event::create([
            'user' => $usr,
            'from' => $datefrom,
            'to' => $dateto,
            'comment' => $title.($usr!==null?", ".$user->name:"")
        ]);
        Log::addlog("Event created ".$e->loginfo());
        return $this->response(200,array('status'=>'ok'));
    }

    public function RemoveEvent(Request $request)
    {
        Validator::make($request->all(), [
            'id' => 'required|integer'
        ])->validate();

        $user = Auth::user();
        $event = Event::where('id','=',$request['id'])->get()->first();

        if ($user->isInGroup(2)||
            $user->isInGroup(3) &&
                $event->user !== null &&
                count(User::where('supervisor','=',$user->id)->where('id','=',$event->user)->get()->all())>0){
            Log::deletelog("Event deleted ".$event->loginfo());
            $event->delete();
        }
        else{
            return $this->response(200,array('status'=>'error','msg'=>'No access'));
        }

        return $this->response(200,array('status'=>'ok'));
    }

    public function Edit(Request $request,$id)
    {
        $rows = Time::where('user','=',Auth::id())->where('id','=',$id)->get()->all();
        if (count($rows)<=0){
            return $this->response(200,array('status'=>'error','msg'=>'This report don\'t exists'));
        }

        if ($request['date']!==null &&$request['from_hour']!==null &&$request['to_hour']!==null &&$request['breaktime']!==null){

            Validator::make($request->all(), [
                'date' => 'required|integer',
                'from_hour' => 'required|integer',
                'to_hour' => 'required|integer',
                'breaktime' => 'required|integer'
            ])->validate();

            $date = new DateTime();
            $date->setTimestamp(intval($request['date']));
            $date->setTime(0,0,0);
            $from_hour = intval($request['from_hour']);
            $to_hour = intval($request['to_hour']);
            $breaktime = intval($request['breaktime']);

            if ($date>new DateTime()){
                return $this->response(200,array('status'=>'error','msg'=>'Wrong date'));
            }

            if ($breaktime<0||$to_hour-$from_hour<$breaktime){
                return $this->response(200,array('status'=>'error','msg'=>'Wrong Break Time'));
            }

            if ($to_hour<0||$from_hour<0){
                return $this->response(200,array('status'=>'error','msg'=>'Wrong Hours'));
            }

            $rowsx = Time::where('user','=',Auth::id())->where('date',$date->getTimestamp())->get()->all();
            if ($rows[0]->date != $date->getTimestamp() && count($rowsx)>0){
                return $this->response(200,array('status'=>'error','msg'=>'You have already registered this date'));
            }
            $log_text="Working date edited old data: \r\n".$rows[0]->loginfo().", new data: \r\n";
            $rows[0]->date = $date->getTimestamp();
            $rows[0]->start_hour = $from_hour;
            $rows[0]->end_hour = $to_hour;
            $rows[0]->breaktime = $breaktime;

            $comment = $request['comment'];
            if ($comment===null){
                $comment="";
            }

            $rows[0]->comment = $comment;
            $rows[0]->save();

            Log::editlog($log_text.$rows[0]->loginfo());
        }
        else{
            return $this->response(200,array('status'=>'error','msg'=>'Request error'));
        }

        return $this->response(200,array('status'=>'ok'));
    }

    public function Report(Request $request,$id,$from,$to)
    {

        if ($id !== -1){ // all or especified

            if (!Auth::user()->isInAnyGroup([2,3])){ //unranked user try to access all
                abort(404);
                return null;
            }

            $supervisorLimit=false;
            if ($id!==-2){ // especified
                $user_to_access = User::where('id','=',$id)->get()->all();
                if (count($user_to_access)<=0){ // not exists
                    abort(404);
                    return null;
                }
                if (!Auth::user()->isInGroup(2) && $user_to_access[0]->supervisor !== Auth::id()){ //if not admin and not his supervisor
                    abort(404);
                    return null;
                }
            }
            else{
                if (!Auth::user()->isInGroup(2)){ //if not admin
                    $supervisorLimit=true;
                }
            }
        }
        if ($id !== -1 && !Auth::user()->isInAnyGroup([2,3])){ //unranked user try to access
            abort(404);
            return null;
        }

        $rows = null;
        if ($id === -1){
            $rows = Time::where('user','=',Auth::id())->where('date','>=',$from)->where('date','<=',$to)->get()->all();
        }
        else{
            if ($id>0){
                $rows = Time::where('user','=',$id)->where('date','>=',$from)->where('date','<=',$to)->get()->all();
            }
            else{
                if ($supervisorLimit){
                    $rows = DB::select('select * from times where (select count(*) from users where id = times.user and (supervisor = ? or users.id = ?)) > 0 and times.date >= ? and times.date <= ? order by times.user', [Auth::id(),Auth::id(),$from,$to]);
                }
                else{
                    $rows = Time::where('date','>=',$from)->where('date','<=',$to)->orderBy('user')->get()->all();
                }
            }
        }

        if (count($rows)<=0){
            return $this->response(200,array('status'=>'no data'));
        }
        $lastid=-1;
        $lastname="";
        foreach ($rows as $row){
            if ($row->user !== $lastid){
                $lastid=$row->user;
                $lastname=User::where('id','=',$row->user)->get()->all()[0]->name;
            }
            $row->name = $lastname;
        }
        return $this->response(200,array('status'=>'ok','data'=>$rows));
    }

    public function ReportAll(Request $request,$from,$to)
    {
        return $this->Report($request,-2,$from,$to);
    }
    public function ReportCurrent(Request $request,$from,$to)
    {
        return $this->Report($request,-1,$from,$to);
    }

    public function UserList(Request $request,$all)
    {
        if (!Auth::user()->isInAnyGroup([2,3])){
            abort(404);
            return;
        }
        if (Auth::user()->isInGroup(2)){
            $data = DB::table('users')->join('users_groups', 'users.id', '=', 'users_groups.user');
            if (!$all){
                $data = $data->where('users.active','=',1);
            }
            $data = $data->get(array(
                    'users.id',
                    'name',
                    'mins',
                    'summermins',
                    'email',
                    'active',
                    'group',
                    'supervisor'
                ))->all();
        }
        else{
            $data = DB::table('users')->join('users_groups', 'users.id', '=', 'users_groups.user');
            $data = $data->where('users.supervisor','=',Auth::id());
            if (!$all){
                $data = $data->where('users.active','=',1);
            }
            $data = $data->orWhere('users.id','=',Auth::id());
            if (!$all){
                $data = $data->where('users.active','=',1);
            }
            $data = $data->get(array(
                    'users.id',
                    'name',
                    'mins',
                    'summermins',
                    'email',
                    'active',
                    'group',
                    'supervisor'
                ))->all();
        }


        $users = [];
        foreach ($data as $dbuser){
            $exists=false;
            for ($i = 0;$i<count($users);$i++){
                if ($users[$i]['id'] === $dbuser->id){
                    $users[$i]['groups'][] = $dbuser->group;
                    $exists=true;
                    break;
                }
            }
            if (!$exists){
                $nuser = json_decode(json_encode($dbuser), True);
                $nuser['groups'] = [];
                $nuser['groups'][] = $dbuser->group;
                unset($nuser['group']);
                $users[]=$nuser;
            }
        }
        return $this->response(200,array('status'=>'ok','data'=>$users));
    }

    public function User(Request $request)
    {
        $data = User::where('id','=',Auth::id())->get()->first();


        return $this->response(200,array('status'=>'ok','data'=>$data));
    }

    private function response($status, $data = null)
    {
        if ($data != null) {
            return response(json_encode($data),$status);
        }
        else{
            return response("",$status);
        }
    }
}
