var btn_add_event = $('#btn_add_event');
var addEvent_modal = $('#addEvent');
var event_list = $('#event_list');
var calendarEl = $('#calendar');

var datefrom = $('#datefrom');
var dateto = $('#dateto');
var modal_title = $('#title');
var modal_error = $('#error_alert');

var calendar=null;

var adm = $('#admdiv').length>0;
if (adm){
    var ufest = $('#ufest');
}

function updateCalendar(){

    $.get(url+"api/events",function (data) {
        if (data.length>0){
            var result=null;
            try{
                result = JSON.parse(data);
            }
            catch (e) {
                $.notify("Error connecting to the server!","error");
                return;
            }
            if (result.status === "ok"){
                result.data.forEach(function(row){
                    insertEvent(row)
                });
            }
        }
        else{
            $.notify("Error connecting to the server!","error");
        }
    }).fail(function() {
        $.notify("Error connecting to the server!","error");
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
    //.fullCalendar( ‘gotoDate’, date )
    //calendar.gotoDate( date )
    var date_ranges=" <span>"+dateFormat(new Date(event.from*1000))+(event.from!==event.to?"-"+dateFormat(new Date(event.to*1000)):"")+"</span>";
    var approved_label=(event.approved===1||event.approved===2?"<span class=\"status\">("+cs.replace(cs.charAt(0),cs.charAt(0).toUpperCase())+")</span>":"");
    var adm_btn="";
    if (adm && event.approved===0){
        adm_btn="<div class=\"text-right\"><button class=\"btn btn-primary btn-sm\" onclick=\"setEventStatus(event,1,"+event.id+")\">Accept</button> <button class=\"btn btn-danger btn-sm\" onclick=\"setEventStatus(event,2,"+event.id+")\">Reject</button></div>"
    }
    var html = "<li"+(cs!==""?" onclick=\"go("+(event.from*1000)+")\" class=\""+cs+"\"":"")+">"+event.comment+approved_label+adm_btn+date_ranges+"</li>";
    if (event.approved!==2){
        var edate=new Date(event.to*1000);
        edate.setDate(edate.getDate()+1);
        calendar.addEvent({
            title: event.comment,
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
    $.post(url+"/api/seteventstatus", {status: status,id: id,_token: csrf},function (response) {
        if (response.length>0){
            var result=null;
            try{
                result = JSON.parse(response);
            }
            catch (e) {
                $.notify("Error connecting to the server!","error");
                return;
            }
            if (result.status === "ok"){
                $.notify("Success","success");
                b.parent().hide();
                b.parent().parent().attr('class',(status===1?"approved":"rejected"));
            }
            else{
                $.notify("Error!","error");
            }
        }
        else{
            $.notify("Error connecting to the server!","error");
        }
    }).fail(function (e) {
        $.notify("Error connecting to the server!","error");
    });
    var b =  $(e.currentTarget);
}

function addEvent(e){
    e.preventDefault();

    var date_from = parseInt(datefrom.datetimepicker('viewDate')._d.getTime()/1000);
    if (date_from === null || date_from === undefined || isNaN(date_from)){
        modal_error.text("Wrong date from format");
        modal_error.show();
        return;
    }


    var date_to = new Date(dateto.datetimepicker('viewDate')._d)
    //date_to.setDate(date_to.getDate()+1);
    date_to = parseInt(date_to.getTime()/1000);
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

    $.post(url+"/api/addevent", {fest: (adm?(ufest.prop("checked") === true?1:0):0),datefrom: date_from,dateto: date_to,comment: comment,_token: csrf},function (response) {
        if (response.length>0){
            var result=null;
            try{
                result = JSON.parse(response);
            }
            catch (e) {
                $.notify("Error connecting to the server!","error");
                return;
            }
            if (result.status==="ok"){
                location.reload();
            }
            else{
                modal_error.text(result.msg);
                modal_error.show();
            }
        }
        else{
            $.notify("Error connecting to the server!","error");
        }
    }).fail(function (e) {
        $.notify("Error connecting to the server!","error");
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
        /*select: function(arg) {
            var title = prompt('Event Title:');
            if (title) {
                calendar.addEvent({
                    title: title,
                    start: arg.start,
                    end: arg.end,
                    allDay: arg.allDay
                })
            }
            console.log(arg.start.getTime());
            console.log(arg.end.getTime());
            calendar.unselect()
        },*/
        editable: false,
        eventLimit: true, // allow "more" link when too many events
    });

    calendar.render();

    var d = getOnlyDate();
    var d2 = getOnlyDate();
    d2.setDate(d.getDate()+1);
    datefrom.datetimepicker({
        format: 'L',
        defaultDate: d,
        locale: 'es',
        maxDate: d2
    });
    dateto.datetimepicker({
        useCurrent: false,
        format: 'L',
        defaultDate: d2,
        locale: 'es',
        minDate: d
    });
    datefrom.on("change.datetimepicker", function (e) {
        dateto.datetimepicker('minDate', e.date);
    });
    dateto.on("change.datetimepicker", function (e) {
        datefrom.datetimepicker('maxDate', e.date);
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

