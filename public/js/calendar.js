var btn_add_event = $('#btn_add_event');
var event_list = $('#event_list');
var calendarEl = $('#calendar');
var calendar=null;

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

    var html = "<li"+(cs!==""?" class=\""+cs+"\"":"")+">"+event.comment+(event.approved===1||event.approved===2?"<span class=\"status\">("+cs.replace(cs.charAt(0),cs.charAt(0).toUpperCase())+")</span>":"")+" <span>"+dateFormat(new Date(event.from*1000))+(event.from!==event.to?"-"+dateFormat(new Date(event.to*1000)):"")+"</span></li>";


    calendar.addEvent({
        title: event.comment,
        start: new Date(event.from*1000),
        end: new Date(event.to*1000),
        allDay: true
    });

    event_list.append(html);
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
        selectable: true,
        firstDay: 1,
        selectMirror: false,
        select: function(arg) {
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
        },
        editable: false,
        eventLimit: true, // allow "more" link when too many events
    });

    calendar.render();

    updateCalendar();
});





/*setInterval(function () {
    eval("debugger");
},100);*/

