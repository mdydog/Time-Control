var url = location.protocol+"//"+location.host+"/"
var csrf = $('meta[name="csrf-token"]').attr('content');
var rqcsrf = "_token="+csrf;
var modal_result=false;

function format2digits(num) {
    return ("0" + num).slice(-2);
}

function secondsAmount(seconds,show_seconds,only_time_format) {
    if (show_seconds===undefined){
        show_seconds=true;
    }
    if (only_time_format===undefined){
        only_time_format=false;
    }
    var ts = seconds;
    var hours = Math.floor(ts/60/60);
    var min = Math.floor((ts-hours*60*60)/60);
    var sec = Math.floor(ts - (hours*60*60)-(min*60));
    if (only_time_format){
        if (show_seconds){
            return format2digits(hours)+":"+format2digits(min)+":"+format2digits(sec);
        }
        else{
            return format2digits(hours)+":"+format2digits(min);
        }
    }
    else{
        if (show_seconds){
            if (seconds<60){
                return Math.floor(seconds)+" seconds";
            }
            return (hours>0?hours+" hour"+(hours>1?"s":"")+(sec>0?", ":(min>0?" and ":"")):"")+(min>0?min+" minute"+(min>1?"s":"")+(sec>0?" and ":""):"")+(sec>0?sec+" second"+(sec>1?"s":""):"");
        }
        else{
            if (seconds<60){
                return "0 minutes";
            }
            return (hours>0?hours+" hour"+(hours>1?"s":"")+(min>0?" and ":""):"")+(min>0?min+" minute"+(min>1?"s":""):"");
        }
    }
}

function dateFormat(date,show_time) {
    if (show_time){
        return format2digits(date.getUTCDate())+"/"+ format2digits(date.getUTCMonth()+1)+"/"+ date.getFullYear()+" "+format2digits(date.getUTCHours())+":"+format2digits(date.getUTCMinutes());
    }
    else{
        return format2digits(date.getUTCDate())+"/"+ format2digits(date.getUTCMonth()+1)+"/"+ date.getFullYear();
    }

}

function isEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}

function parseHour(mins){
    var n1 = Math.floor(mins/60);
    var n2 = mins-n1*60;
    return format2digits(n1)+":"+format2digits(n2);
}

function daysInMonth (month, year) {
    return moment(year+"-"+format2digits(month), "YYYY-MM").daysInMonth();
}

//pasa a columna de csv
function _c(val,c){
    if (c===undefined){
        c=1;
    }
    return "\""+val.replace(/"/g,"\"\"").replace(/&lt;/g,"<").replace(/&gt;/g,">")+"\""+(c===1?",":"");
}

function getOnlyDate(){
    var result=new Date();
    return setTimeZero(result);
}

function setTimeZero(date) {
    date.setUTCHours(0,0,0,0);
    return date;
}
