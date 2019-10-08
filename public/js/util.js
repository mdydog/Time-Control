var url = location.protocol+"//"+location.host+"/"
var csrf = $('meta[name="csrf-token"]').attr('content');
var rqcsrf = "_token="+csrf;
var modal_result=false;

if ($('#user-data').length>0){
    var current_user = JSON.parse($('#user-data')[0].innerHTML);
    current_user.groups = JSON.parse($('#user-groups')[0].innerHTML);
    current_user.admin=$.inArray(2,current_user.groups)||$.inArray(3,current_user.groups);
}

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

function getOnlyDate(){
    var result=new Date();
    return setTimeZero(result);
}

function setTimeZero(date) {
    date.setUTCHours(0,0,0,0);
    return date;
}
$.notify.getStyle('bootstrap').html="<div><i class=\"fas fa-exclamation-circle\"></i> <span data-notify-text></span></div>"
function notify(msg,type){
    $.notify(msg,type);
}
function b64toBlob(b64Data, contentType, sliceSize) {
    if (contentType===undefined){
        contentType='';
    }
    if (sliceSize===undefined){
        sliceSize=512;
    }
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, {type: contentType});
}
function request(type, url,data, cb) {
    if (data!==undefined){
        data._token=csrf;
    }

    $[type](url,data, function (response) {
        if (response.length > 0) {
            var result = null;
            try {
                result = JSON.parse(response);
            } catch (e) {
                notify("Error connecting to the server!", "error");
                return;
            }
            cb(result);
        } else {
            notify("Error connecting to the server!", "error");
        }
    }).fail(function (e) {
        notify("Error connecting to the server!", "error");
    });
}
