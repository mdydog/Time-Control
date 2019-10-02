<?php

namespace App\Http\Controllers;

use App\Event;
use App\Group;
use App\Role;
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
        if ($date>new DateTime()){
            return $this->response(200,array('status'=>'error','msg'=>'Wrong date'));
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
            $rows = Event::all();
        }
        elseif ($user->isInGroup(3)){
            $rows = DB::select("select * from events where user is null or user in (select id from users where supervisor = ?) or user = ?",[Auth::id(),Auth::id()]);
        }
        else{
            $rows = DB::select("select * from events where user is null or user = ?",[Auth::id()]);
        }

        return $this->response(200,array('status'=>'ok','data'=>$rows));
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
            $user->name = $request["name"];
            $user->mins = $request["mins"];
            $user->email = $request["email"];
            $user->supervisor = intval($request["supervisor"])===-1?null:$request["supervisor"];
            $user->active = $request["active"];
            $user->save();
        }
        else{ //add

            if (User::where('email','=',$request["email"])->get()->first()!==null){
                return $this->response(200,array('status'=>'error','msg'=>'Email in use!'));
            }

            try{
                $user = User::create([
                    'name' => $request["name"],
                    'mins' => $request["mins"],
                    'email' => $request["email"],
                    'supervisor' => intval($request["supervisor"])===-1?null:$request["supervisor"],
                    'active' => $request["active"],
                    'password' => Hash::make(Str::random(10))
                ]);
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
        }

        if (intval($request["supervisorrole"])===1){
            Role::create([
                'user' => $user->id,
                'group' => 3
            ]);
        }
        DB::commit();
        return $this->response(200,array('status'=>'ok'));
    }

    public function Edit(Request $request,$id)
    {
        $rows = Time::where('user','=',Auth::id())->where('id','=',$id)->get()->all();
        if (count($rows)<=0){
            return $this->response(200,array('status'=>'error','msg'=>'This report don\'t exists'));
        }

        if ($request['date']!==null &&$request['from_hour']!==null &&$request['to_hour']!==null &&$request['breaktime']!==null){

            $rdate = new DateTime();
            $rdate->setTimestamp($rows[0]->register_date);
            $rdate->setTime(0,0,0);
            $rdate2 = new DateTime();
            $rdate2->setTimestamp(time());
            $rdate2->setTime(0,0,0);

            if ($rdate->getTimestamp()!==$rdate2->getTimestamp()){
                return $this->response(200,array('status'=>'error','msg'=>'This date is too old'));
            }

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

            $rows[0]->date = $date->getTimestamp();
            $rows[0]->start_hour = $from_hour;
            $rows[0]->end_hour = $to_hour;
            $rows[0]->breaktime = $breaktime;
        }

        $comment = $request['comment'];
        if ($comment===null){
            $comment="";
        }

        $rows[0]->comment = $comment;
        $rows[0]->save();

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
                    $rows = DB::select('select * from times where (select count(*) from users where id = times.user and supervisor = ?) > 0 and date >= ? and date <= ? order by user', [Auth::id(),$from,$to]);
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

    public function UserList(Request $request)
    {
        if (!Auth::user()->isInGroup(2)){
            abort(404);
            return;
        }
        $data = DB::table('users')
            ->join('users_groups', 'users.id', '=', 'users_groups.user')
            ->get(array(
                'users.id',
                'name',
                'mins',
                'email',
                'active',
                'group',
                'supervisor'
            ))->all();

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
