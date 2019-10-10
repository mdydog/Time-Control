var btn_add_event = $('#btn_add_event');
var addEvent_modal = $('#addEvent');
var event_list = $('#event_list');
var calendarEl = $('#calendar');

var summerdiv = $('#summerdiv');

var datefrom = $('#datefrom');
var dateto = $('#dateto');
var modal_title = $('#title');
var modal_error = $('#error_alert');

var calendar=null;

if (current_user.admin){
    var ufest = $('#ufest');
}

function saveSummerDates(e){
    e.preventDefault();
    var forms = summerdiv.find("form");

    var data={data:[]};
    for(var i = 0;i<forms.length;i++){
        var form = $(forms[i]);
        var year = form.attr('data-year');
        var inputs = form.find("input");
        if ($(inputs[0]).val().trim()!=="" && $(inputs[1]).val().trim()!==""){
            var fromval=getUnixFromDatepicker($(inputs[0]));
            var toval=getUnixFromDatepicker($(inputs[1]));
            var fdata={
                'year':year,
                'from':fromval,
                'to':toval,
            };
            data.data.push(fdata);
        }
    }

    if (data.data.length>0){
        request('post',url+"api/savesummer",data,function (result) {
            if (result.status==="ok"){
                location.reload();
            }
            else{
                notify(result.msg,"error");
            }
        });

    }
}

function updateCalendar(){
    request('get',url+"api/events",undefined,function (result) {
        if (result.status === "ok"){
            result.data.forEach(function(row){
                var now =parseInt((setTimeZero(new Date())).getTime()/1000);
                if (parseInt(row.from) >= now || parseInt(row.to) >= now){
                    insertEvent(row);
                }
            });
        }
    });
}

function go(miliseconds) {
    calendar.gotoDate(new Date(miliseconds));
}

function insertEvent(event){
    var cs = "";
    if (event.user===null){
        cs = "fest";
    }
    else if (event.approved===1){
        cs = "approved";
    }
    else if (event.approved===2){
        cs = "rejected";
    }

    var date_ranges=" <span>"+dateFormat(new Date(event.from*1000))+(event.from!==event.to?"-"+dateFormat(new Date(event.to*1000)):"")+"</span>";
    var approved_label=(event.approved===1||event.approved===2?"<span class=\"status\">("+cs.replace(cs.charAt(0),cs.charAt(0).toUpperCase())+")</span>":"");
    var adm_btn="";
    if (current_user.admin && event.approved===0){
        adm_btn="<div class=\"text-right\"><button class=\"btn btn-primary btn-sm\" onclick=\"setEventStatus(event,1,"+event.id+")\">Accept</button> <button class=\"btn btn-danger btn-sm\" onclick=\"setEventStatus(event,2,"+event.id+")\">Reject</button></div>"
    }
    var html = "<li"+(cs!==""?" onclick=\"go("+(event.from*1000)+")\" class=\""+cs+"\"":"")+">"+fixXSS(event.comment)+approved_label+adm_btn+date_ranges+"</li>";
    if (event.approved!==2){
        var edate=new Date(event.to*1000);
        edate.setUTCDate(edate.getUTCDate()+1);
        calendar.addEvent({
            title: fixXSS(event.comment),
            start: new Date(event.from*1000),
            end: edate,
            allDay: true,
            color: event.user===null?"#90EE90":(event.approved===1?"#87CEFA":"#bfbfbf")
        });
    }

    event_list.append(html);
}

function setEventStatus(e,status,id) {
    e.preventDefault();
    if (status !== 1 && status !== 2){
        return;
    }
    var b =  $(e.currentTarget);
    request('post',url+"/api/seteventstatus",{status: status,id: id},function (result) {
        if (result.status === "ok"){
            notify("Success","success");
            b.parent().hide();
            b.parent().parent().attr('class',(status===1?"approved":"rejected"));
        }
        else{
            notify("Error!","error");
        }
    });
}

function addEvent(e){
    e.preventDefault();
    var date_from = getUnixFromDatepicker(datefrom);
    if (date_from === null || date_from === undefined || isNaN(date_from)){
        modal_error.text("Wrong date from format");
        modal_error.show();
        return;
    }


    var date_to = getUnixFromDatepicker(dateto);
    if (date_to === null || date_to === undefined || isNaN(date_to)){
        modal_error.text("Wrong date to format");
        modal_error.show();
        return;
    }

    var comment = modal_title.val();
    if (comment === null || comment === undefined || comment==="" ||  comment===" "){
        modal_error.text("Wrong event title");
        modal_error.show();
        return;
    }

    modal_error.hide();
    request('post',url+"/api/addevent",{fest: (current_user.admin?(ufest.prop("checked") === true?1:0):0),datefrom: date_from,dateto: date_to,comment: comment},function (result) {
        if (result.status==="ok"){
            location.reload();
        }
        else{
            modal_error.text(result.msg);
            modal_error.show();
        }
    });
}


$(document).ready(function(){
    calendar = new FullCalendar.Calendar(calendarEl[0], {
        plugins: [ 'interaction', 'dayGrid' ],
        header: {
            left: 'today',
            center: 'title',
            right: 'prev,next'
        },
        navLinks: false, // can click day/week names to navigate views
        selectable: false,
        firstDay: 1,
        selectMirror: false,
        editable: false,
        eventLimit: true, // allow "more" link when too many events
    });

    calendar.render();

    var d = getOnlyDate();
    var d2 = getOnlyDate();
    d2.setUTCDate(d.getUTCDate()+1);
    var dmin = getOnlyDate();
    dmin.setUTCDate(d.getUTCDate()-1);

    datefrom.off('keypress').keypress(function (e) {
        return false;
    });
    dateto.off('keypress').keypress(function (e) {
        return false;
    });

    datefrom.datetimepicker({
        format: 'L',
        defaultDate: d,
        locale: 'es',
        //maxDate: d2
    });
    dateto.datetimepicker({
        useCurrent: false,
        format: 'L',
        defaultDate: d2,
        locale: 'es',
        minDate: dmin
    });
    datefrom.on("change.datetimepicker", function (e) {
        if (getUnixFromDatepicker(dateto)<getUnixFromDatepicker(datefrom)){
            dateto.val(dateFormat(dateFromDatepicker(datefrom)));
        }
        dateto.datetimepicker('minDate', e.date);
    });

    btn_add_event.click(function (e) {
        e.preventDefault();
        addEvent_modal.modal();
    });

    updateCalendar();
});





/*setInterval(function () {
    eval("debugger");
},100);*/

