var btn_add_event = $('#btn_add_event');
var addEvent_modal = $('#addEvent');
var event_list = $('#event_list');
var past_event_list = $('#past_event_list');

var calendarEl = $('#calendar');

var summerdiv = $('#summerdiv');

var datefrom = $('#datefrom');
var dateto = $('#dateto');
var modal_title = $('#title');
var modal_error = $('#error_alert');

var calendar=null;
var events=null;

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
            events = result.data;
            events.forEach(function(row){
                insertEvent(row,true);
            });
            calendar.render();
        }
    });
}
function updateLists(){
    event_list[0].innerHTML="";
    past_event_list[0].innerHTML="";
    events.forEach(function(row){
        insertEvent(row,false);
    });
}

function go(miliseconds) {
    calendar.gotoDate(new Date(miliseconds));
}

function insertEvent(event,mode_calendar){
    if (mode_calendar){
        var edate=new Date(event.to*1000);
        edate.setUTCDate(edate.getUTCDate()+1);//fix, date don't reach to date in fullcalendar
        calendar.addEvent({
            title: fixXSS(event.comment),
            start: new Date(event.from*1000),
            end: edate,
            allDay: true,
            color: event.user===null?"#90EE90":"#87CEFA"
        });
        return;
    }

    var now =parseInt((setTimeZero(new Date())).getTime()/1000);
    var passed=!(parseInt(event.from) >= now || parseInt(event.to) >= now);

    var liclass = "approved";
    var cs = "";
    if (event.user===null){
        cs = "Fest";
        liclass="fest";
    }
    else{
        liclass="approved";
    }

    if (passed){
        liclass="";
    }
    var date_ranges=" <span>"+dateFormat(new Date(event.from*1000))+(event.from!==event.to?"-"+dateFormat(new Date(event.to*1000)):"")+"</span>";
    var approved_label=(cs!==""?"<span class=\"status\">("+cs+")</span>":"");
    var adm_btn="";
    if (current_user.groups.includes(2) || event.user!==null && event.user!=current_user.id){
        adm_btn="<div class=\"text-right\" style='display: inline'> <i class=\"fas fa-minus-circle fa-error\" style='background-color: white;border-radius: 100px;' onclick=\"removeEvent(event,"+event.id+")\"></i></div>"
    }
    var html = "<li onclick=\"go("+(event.from*1000)+")\" class=\""+liclass+"\">"+fixXSS(event.comment)+approved_label+adm_btn+date_ranges+"</li>";


    if (!passed) {
        event_list.append(html);
    }
    else{
        var cm=calendar.getDate();
        var ef=new Date(event.from*1000);
        var et=new Date(event.to*1000);
        if (cm.getUTCFullYear()===ef.getUTCFullYear() && cm.getUTCMonth()===ef.getUTCMonth()|| cm.getUTCFullYear()===et.getUTCFullYear() && cm.getUTCMonth()===et.getUTCMonth()){
            past_event_list.append(html);
        }
    }
}

function removeEvent(e,id) {
    e.preventDefault();
    var modal=$("#confirm-modal");
    $("#confirm-modal-btn-yes").off('click').on("click", function(){
        request('post',url+"/api/removeevent",{id: id},function (result) {
            if (result.status === "ok"){
                notify("Success","success");
                location.reload();
            }
            else{
                notify("Error!","error");
            }
        });
        modal.modal('hide');
    });

    $("#confirm-modal-btn-no").off('click').on("click", function(){
        modal.modal('hide');
    });
    modal.modal("show");
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



    var fest = (current_user.admin?(ufest.is(":checked")?1:0):0);


    if (fest===1){
        var title = $('#title2').val();
        if (title === null || title === undefined || title==="" || title.trim()===""){
            modal_error.text("Wrong title");
            modal_error.show();
            return;
        }
    }
    else{
        var title = parseInt(modal_title.find(":selected").val());
        if (title === null || title === undefined || title===0){
            modal_error.text("Please select the title");
            modal_error.show();
            return;
        }
    }

    modal_error.hide();
    request('post',url+"/api/addevent",{fest: fest,datefrom: date_from,dateto: date_to,title: title},function (result) {
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
        timeZone: 'UTC',
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
        datesRender: function (info) {
            updateLists();
        }
    });
    //var datefix=new Date();
    //datefix.setUTCDate(1);
    //datefix=setTimeZero(datefix);
   //datefix.setHours(0);
    //calendar.gotoDate(datefix);


    var d = getOnlyDate();
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
        ignoreReadonly:true
        //maxDate: d2
    });
    dateto.datetimepicker({
        useCurrent: false,
        format: 'L',
        defaultDate: d,
        locale: 'es',
        minDate: datefrom.datetimepicker('viewDate')._d,//dateFromDatepicker(datefrom),
        ignoreReadonly:true
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

    datefrom.val(dateFormat(dateFromDatepicker(datefrom)));
    dateto.val(dateFormat(dateFromDatepicker(dateto)));


    updateCalendar();
});





/*setInterval(function () {
    eval("debugger");
},100);*/

