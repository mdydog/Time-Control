var table = $('#report');
var admin_panel_mode = location.href.toLowerCase().indexOf("/admin") >= 0;

//top boxes elements
var thisMonthP = $('#monthp');
var todayP = $('#dayp');
var thisWeekP = $('#weekp');
var thisRangeExpectedP = $('#emonthp');
var unregisteredDaysP = $('#udaysp');
var warningDaysP = $('#wdaysp');

//filter elements
var current_search = -2; //current selected user id in filter (-2 === All)
var usr_list_select = $('#usr_list');
var btn_export = $('#btn_export');
var btn_export_totals = $('#btn_export_totals');
var datefrom = $('#datepickerfrom');
var dateto = $('#datepickerto');
var hide_current = $('#hide_current'); //hide current user checkbox
var show_disabled_users = $('#show_disabled_users');

//modal elements
var btn_register = $('#btn_register');
var register_modal = $('#registerNewDay');
var register_date = $('#rday');
var register_from_hour = $('#fhour');
var register_to_hour = $('#thour');
var register_break = $('#lhour');
var register_comment = $('#comment');
var register_error_alert = $('#register_error_alert');

var current_edit_id = 0; //current editing row in the modal

//Top data
var todaySeconds = 0;
var thisWeekSeconds = 0;
var thisRangeSeconds = 0;
var unregistered_days = 0;
var warning_days = 0;
var expected_hours = 0;

//data from server
var events = null;
var users = [];
var current_time_data = null;
var disabledDates = [];
var summers = null;

var busy = false; //updatePanel busy

function insideSummer(unix_seconds) {
    var date = setTimeZero(new Date(unix_seconds*1000));
    var parsedUnix = parseInt(date.getTime()/1000)
    var year =date.getUTCFullYear();
    for(var i = 0;i<summers.length;i++){
        var summer = summers[i];
        if (summer.year===year && parsedUnix>=summer.date_from && parsedUnix<=summer.date_to){
            return true;
        }
    }
    return false;
}

function insideEvent(unix_seconds, uid) {
    for (var i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.user === uid || event.user === null) { //evento propio o festivo aprobado
            if (unix_seconds >= event.from && unix_seconds <= event.to) {
                return true;
            }
        }
    }
    return false;
}

function clearCurrentData() {
    table.DataTable().clear();
    table.DataTable().destroy();

    todaySeconds = 0;
    thisWeekSeconds = 0;
    thisRangeSeconds = 0;
    warning_days = 0;
    expected_hours = 0;
    unregistered_days = 0;
    current_time_data = [];
    disabledDates = [];
}

function updatePanel() {
    if (busy)
        return;
    busy = true; //only one at same time

    hideReportTable();
    clearCurrentData();

    var aurl=url + "api/report";
    if (admin_panel_mode){
        aurl+=(current_search === -2 ? "/all" : "/" + current_search);
    }
    aurl+="/" + getUnixFromDatepicker(datefrom) + "/" + getUnixFromDatepicker(dateto);

    request('get',aurl,undefined,function(result){
        //calculamos el minimo dia de la semana para calcular el tiempo trabajado esta semana
        var mindateweek = getOnlyDate();
        mindateweek.setUTCDate(mindateweek.getUTCDate() - mindateweek.getUTCDay() + 1);

        if (result.status === "ok") {
            current_time_data = result.data;
            result.data.forEach(function (row) {
                for(var i_user = 0;i_user<users.length;i_user++){//only if user exists in users array
                    var usr = users[i_user];
                    if (row.user === usr.id){
                        if (!(admin_panel_mode && hide_current.is(":checked") && row.user === current_user.id)){ //hide current user
                            insertHistoryRow(row,mindateweek);
                        }
                        break;
                    }
                }
            });
        }

        var date = dateZeroFromDatepicker(datefrom);
        var todate = dateZeroFromDatepicker(dateto);
        users.forEach(function (user) {
            if ((current_search === -2 || user.id === current_search) && !(admin_panel_mode && hide_current.is(":checked") && user.id === current_user.id)){
                var expected = periodExpectedCalculation(date,todate,user);
                expected_hours+=expected.expectedHours;
                unregistered_days+=expected.unregisteredDays;
            }
        });

        table.attr('style', 'width:100%');
        todayP.text(secondsAmount(todaySeconds));
        thisMonthP.text(secondsAmount(thisRangeSeconds));
        thisWeekP.text(secondsAmount(thisWeekSeconds));
        unregisteredDaysP.text(unregistered_days);
        thisRangeExpectedP.text(secondsAmount(expected_hours * 60));
        warningDaysP.text(warning_days);
        var todaydate = getOnlyDate();
        if (todaydate >= date && todaydate <= todate) {
            todayP.parent().parent().parent().show();
        } else {
            todayP.parent().parent().parent().hide();
        }


        var tmp_dateWeek = new Date(mindateweek);
        tmp_dateWeek.setUTCDate(tmp_dateWeek.getUTCDate() + 4);
        if (mindateweek >= date && tmp_dateWeek <= todate) {
            thisWeekP.parent().parent().parent().show();
        } else {
            thisWeekP.parent().parent().parent().hide();
        }

        table.DataTable({
            "order": [[2, "desc"]],
            "scrollX": true,
            responsive: true,
            "columnDefs": [
                {"orderable": false, "targets": [0, 10]}
            ]
        });
        if (!admin_panel_mode) {
            reloadRegisterDatePicker();
        }

        showReportTable();

        table.DataTable().columns.adjust().draw();
        busy = false;
    });
}

function insertHistoryRow(row,minimun_date_week){
    var sdate = new Date(row.date * 1000);
    disabledDates.push(sdate);
    var diffSeconds = row.end_hour - row.start_hour;
    var totalseconds = diffSeconds - row.breaktime;
    if (sameDate(sdate,new Date())) {
        todaySeconds += totalseconds;
    }

    thisRangeSeconds += totalseconds;
    if (sdate >= minimun_date_week) {
        thisWeekSeconds += totalseconds;
    }

    var summer = insideSummer(row.date);

    var date = dateFormat(sdate, false);
    var start = secondsAmount(row.start_hour, false, true);
    var end = secondsAmount(row.end_hour, false, true);
    var comment = row.comment===null?"":fixXSS(row.comment);
    var regisDate = dateFormat(new Date(row.register_date * 1000));
    var final_seconds = totalseconds;


    var buttons = "";
    if (admin_panel_mode) {

    } else {
        buttons = "<i class=\"fas fa-edit click\" title='Edit' onclick='editCommentModal(event," + row.id + ",true," + row.start_hour + "," + row.end_hour + "," + row.breaktime + ",\""+date+"\")'></i>";
    }

    var maxfseconds = 0;
    for (var u = 0; u < users.length; u++) {
        if (users[u].id === row.user) {
            if (summer) {
                maxfseconds = users[u].summermins * 60;
            }
            else{
                maxfseconds = users[u].mins * 60;
            }

            break;
        }
    }

    var status_icon = "";
    if (final_seconds > maxfseconds+(30*60)) {
        status_icon = "<i class=\"fas fa-exclamation-circle fa-error\" title='Working hours(" + secondsAmount(maxfseconds) + ") exceeded!'></i>";
        warning_days++;
    }
    else if (final_seconds < maxfseconds-(30*60)) {
        status_icon = "<i class=\"fas fa-exclamation-circle fa-error\" title='Working hours(" + secondsAmount(maxfseconds) + ") not reached!'></i>";
        warning_days++;
    } else if (date !== regisDate) {
        status_icon = "<i class=\"fas fa-exclamation-triangle fa-warning\" title=\"Registration date is different of working date! Please register the time on same day!\"></i>";
        warning_days++;
    } else {
        status_icon = "<i class=\"fas fa-check-circle fa-ok\" title='Everything ok'></i>";
    }


    table.append("<tr>" +
        "<td>" + status_icon + "</td>" +
        "<td>" + row.name + "</td>" +
        "<td>" + date + "</td>" +
        "<td>" + start + "</td>" +
        "<td>" + end + "</td>" +
        "<td><pre style='max-width: 250px;max-height: 150px;' id='comment" + row.id + "'>" + comment + "</pre></td>" +
        "<td>" + regisDate + "</td>" +
        "<td>" + secondsAmount(diffSeconds) + "</td>" +
        "<td>" + secondsAmount(row.breaktime) + "</td>" +
        "<td>" + secondsAmount(final_seconds) + "</td>" +
        "<td>" + buttons + "</td>" +
        "</tr>");
}

function periodExpectedCalculation(rdate,rtodate,user){
    var date = setTimeZero(new Date(rdate));
    var todate = setTimeZero(new Date(rtodate));
    var expected_hours=0;
    var unregistered_days=0;
    do {
        if (date.getUTCDay() !== 0 && date.getUTCDay() !== 6 && !insideEvent(parseInt(date.getTime() / 1000), user.id)) {
            if (insideSummer(parseInt(date.getTime() / 1000))){
                expected_hours += user.summermins;
            }
            else{
                expected_hours += user.mins;
            }


            var found = false;
            for (var k = 0; k < current_time_data.length; k++) {
                var row = current_time_data[k];
                var rowdate = setTimeZero(new Date(row.date * 1000));
                if (row.user === user.id && rowdate.getTime() === date.getTime()) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                unregistered_days++;
            }
        }
        date.setUTCDate(date.getUTCDate() + 1);
    }
    while (date.getTime() <= todate.getTime());
    return {'expectedHours':expected_hours,'unregisteredDays':unregistered_days}
}

function showReportTable() {
    $('#report_card').show();
    if (admin_panel_mode) {
        $('#loading_card').hide();
    } else {
        $('#register_card').show();
        $('#loading_card').hide();
    }
}

function hideReportTable(){
    $('#report_card').hide();
    if (admin_panel_mode) {
        $('#loading_card').show(); //loading card
    } else {
        $('#loading_card').show(); //loading card
        $('#register_card').hide(); //loading card
    }
}

function reloadRegisterDatePicker(){
    var dp = $('#datetimepicker');
    dp.datetimepicker('destroy');
    dp.datetimepicker({
        format: 'L',
        locale: 'es',
        daysOfWeekDisabled: [0, 6],
        disabledDates: disabledDates,
        ignoreReadonly: true
    });
    dp.datetimepicker('maxDate', moment());
}

function showRegisterError(msg) {
    if (msg === null) {
        register_error_alert.hide();
        return;
    }
    register_error_alert.text(msg);
    register_error_alert.show();
}

function registerDay(e, full) {
    e.preventDefault();
    var date = null;
    var from_hour = null;
    var to_hour = null;
    var breaktime = null;
    if (full) {
        date = getUnixFromDatepicker(register_date);
        if (date === null || date === undefined || isNaN(date)) {
            showRegisterError("Wrong date format");
            return;
        }
        from_hour = register_from_hour.val();
        if (from_hour === null || from_hour === undefined || from_hour.indexOf(':') < 0) {
            showRegisterError("Wrong 'From Hour' Format");
            return;
        } else {
            var fdata = from_hour.split(":");
            if (fdata[0] > 23 || fdata[1] > 59) {
                showRegisterError("Wrong 'From Hour' Format");
                return;
            }
            from_hour = fdata[0] * 60 * 60 + fdata[1] * 60;
            if (isNaN(from_hour)){
                showRegisterError("Wrong 'From Hour' Format");
                return;
            }
        }
        to_hour = register_to_hour.val();
        if (to_hour === null || to_hour === undefined || to_hour.indexOf(':') < 0) {
            showRegisterError("Wrong 'To Hour' Format");
            return;
        } else {
            var tdata = to_hour.split(":");
            if (tdata[0] > 23 || tdata[1] > 59) {
                showRegisterError("Wrong 'To Hour' Format");
                return;
            }
            to_hour = tdata[0] * 60 * 60 + tdata[1] * 60;
            if (isNaN(to_hour)){
                showRegisterError("Wrong 'To Hour' Format");
                return;
            }
        }
        breaktime = register_break.val();
        if (breaktime === null || breaktime === undefined || breaktime === "") {
            breaktime = 0;
        } else {
            var tbt = parseInt(breaktime);
            if (tbt < 0 || tbt === null || isNaN(tbt)) {
                showRegisterError("Wrong 'Break Time' Format");
                return;
            }
            breaktime = tbt * 60;
        }
        if (from_hour > to_hour) {
            showRegisterError("From Hour can't be bigger than To Hour");
            return;
        }
        if (breaktime > to_hour - from_hour) {
            showRegisterError("Break Time can't be bigger than all your working day");
            return;
        }
    }

    var comment = register_comment.val();
    if (comment === null || comment === undefined || comment === "") {
        comment = "";
    }

    showRegisterError(null);

    var path = "";
    if (parseInt(current_edit_id) === 0) {
        path = "api/register";
    } else {
        path = "api/edit/" + current_edit_id;
    }
    request('post',url + path,full ? {
            date: date,
            from_hour: from_hour,
            to_hour: to_hour,
            breaktime: breaktime,
            comment: comment
        }:{comment: comment},function (result) {
        if (result.status === "ok") {
            register_modal.modal('hide');
            updatePanel();
            if (current_edit_id === 0) {
                notify("Report registered", "success");
            } else {
                notify("Success", "success");
            }
        } else {
            showRegisterError(result.msg);
        }
    });
}

function enableOneEdit(e,id) {
    e.preventDefault();
    var btn = e.currentTarget;
    request('post',url + "api/editable/"+id,{},function (result) {
        if (result.status === "ok") {
            $(btn).hide();
            notify("Success", "success");
        } else {
            notify(result.msg, "error");
        }
    });
}

function editCommentModal(e, id, full, f, t, b,date) {
    e.preventDefault();

    showRegisterError(null);
    register_comment.text($('#comment' + id).text());

    if (full) {
        register_date.parent().parent().show();

        register_to_hour.parent().show();
        register_from_hour.parent().show();
        register_break.parent().show();
        var fh = parseInt(f / 60 / 60);
        var fs = f / 60 - fh * 60;
        var th = parseInt(t / 60 / 60);
        var ts = t / 60 - th * 60;
        register_from_hour.val(format2digits(fh) + ":" + format2digits(fs));
        register_to_hour.val(format2digits(th) + ":" + format2digits(ts));
        register_break.val(b / 60);
        register_modal.find(".modal-title").text("Edit working day");
        register_modal.find("button[class*='btn-primary']").attr('onclick', "registerDay(event,true)");
        register_date.val(date);
    } else {
        register_date.parent().parent().hide();
        register_to_hour.parent().hide();
        register_from_hour.parent().hide();
        register_break.parent().hide();
        register_modal.find(".modal-title").text("Edit comment");
        register_modal.find("button[class*='btn-primary']").attr('onclick', "registerDay(event,false)");
    }
    current_edit_id = id;

    register_modal.modal();
}

function loadEvents(cb) {
    request('get',url + "api/events",undefined,function (result) {
        events = result.data;
        cb();
    });
}

function loadSummer(cb) {
    request('get',url + "api/summer",undefined,function (result) {
        summers = result.data;
        cb();
    });
}

function loadFinishedCheck() {
    if (events!=null && users!=null && summers!=null){
        updatePanel();
    }
}

function loadUsers(cb) {
    var lnk = url + "api/user";
    if (admin_panel_mode){
        lnk+="s";
        if (show_disabled_users.is(":checked")){
            lnk+="/all";
        }
    }
    request('get',lnk,undefined,function (result) {
        if (admin_panel_mode) {
            users = result.data;
            usr_list_select[0].innerHTML="<option value=\"-2\">All</option>";
            for(var i = 0;i<users.length;i++){
                var usr=users[i];
                usr_list_select.append('<option value="'+usr.id+'">'+usr.name+'</option>');
            }
        } else {
            users.push(result.data);
        }
        cb();
    });
}

//CARGA INICIAL
$(document).ready(function () {
    btn_register.click(function (e) {
        e.preventDefault();
        register_modal.find("button[class*='btn-primary']").attr('onclick', "registerDay(event,true)");
        //registerDay(event,true)
        register_modal.find(".modal-title").text("Register working day");
        current_edit_id = 0;
        register_error_alert.hide();

        register_from_hour.val("");
        register_to_hour.val("");

        var from = "";
        var to = "";
        var d = table.DataTable().row().data();
        if (d!==undefined){
            from = d[3];
            to = d[4];
        }
        register_from_hour.val(from);
        register_to_hour.val(to);
        register_break.val("60");
        register_comment.val("");
        register_date.parent().parent().show();
        register_to_hour.parent().show();
        register_from_hour.parent().show();
        register_break.parent().show();
        register_modal.modal();
    });

    usr_list_select.on('change', function () {
        current_search = parseInt(this.value);
        updatePanel();
    });

    btn_export_totals.click(function () {
        var book = XLSX.utils.book_new();
        book.SheetNames.push("Sheet");
        var sheet_data = [["Name","From","To","Registered Hours","Expected Hours","Registered Days","Unregistered Days","Warning Days"]];
        var from = dateFormat(dateFromDatepicker(datefrom), false);
        var to = dateFormat(dateFromDatepicker(dateto), false);
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            if ((current_search === -2 || user.id === current_search) && !(admin_panel_mode && hide_current.is(":checked") && user.id === current_user.id)) {

                var registeredHours = 0;
                var expectedHours = 0;
                var registeredDays = 0;
                var unregisteredDays = 0;
                var warningDays = 0;

                for (var k = 0; k < current_time_data.length; k++) {
                    var row = current_time_data[k];
                    if (row.user === user.id) {
                        var wmin=0;
                        if(insideSummer(row.date)){
                            wmin=user.summermins;
                        }
                        else{
                            wmin=user.mins;
                        }
                        //if (final_seconds > maxfseconds+(30*60) || final_seconds < maxfseconds-(30*60)) {
                        if (row.end_hour - row.start_hour - row.breaktime > wmin * 60+(30*60) ||
                            row.end_hour - row.start_hour - row.breaktime < wmin * 60-(30*60) ||
                            setTimeZero(new Date(row.date * 1000)).getTime() !== setTimeZero(new Date(row.register_date * 1000)).getTime()) {
                            warningDays++;
                        }
                        registeredDays++;
                        registeredHours += row.end_hour - row.start_hour - row.breaktime;
                    }
                }
                registeredHours = secondsAmount(registeredHours);

                var date = dateZeroFromDatepicker(datefrom);
                var todate = dateZeroFromDatepicker(dateto);
                var expected = periodExpectedCalculation(date,todate,user);
                unregisteredDays+=expected.unregisteredDays;
                expectedHours = secondsAmount(expected.expectedHours*60);

                var sheet_row = [];
                sheet_row.push(user.name,from,to,registeredHours,expectedHours,registeredDays,unregisteredDays,warningDays);
                sheet_data.push(sheet_row);
            }
        }
        book.Sheets.Sheet=XLSX.utils.aoa_to_sheet(sheet_data);
        var blob_data = XLSX.write(book, {bookType:'xlsx', bookSST:true, type: 'base64'})
        var dt = new Date();
        var fname = "Export_Totals_" + dt.getFullYear() + "_" + (dt.getUTCMonth() + 1) + "_" + dt.getUTCDate() + ".xlsx";
        saveBase64File(fname,"application/xlsx",blob_data);
    });

    btn_export.on('click', function () {
        var book = XLSX.utils.book_new();
        book.SheetNames.push("Sheet");
        var sheet_data = [["Name","Date","Start Hour","End Hour","Comments","Registration Date","Total Time","Total Break Time","Total Spend"]];
        table.DataTable().rows({search: 'applied'}).every(function (rowIdx, tableLoop, rowLoop) {
            var d = this.data();
            var sheet_row = [];
            sheet_row.push(d[1],d[2],d[3],d[4],$.parseHTML(d[5])[0].innerHTML,d[6],d[7],d[8],d[9]);
            sheet_data.push(sheet_row);
        });
        book.Sheets.Sheet=XLSX.utils.aoa_to_sheet(sheet_data);
        var blob_data = XLSX.write(book, {bookType:'xlsx', bookSST:true, type: 'base64'})
        var dt = new Date();
        var fname = "Export_" + dt.getFullYear() + "_" + (dt.getUTCMonth() + 1) + "_" + dt.getUTCDate() + ".xlsx";
        saveBase64File(fname,"application/xlsx",blob_data);
    });

    register_date.off('keypress').keypress(function (e) {
        return false;
    });
    datefrom.off('keypress').keypress(function (e) {
        return false;
    });
    dateto.off('keypress').keypress(function (e) {
        return false;
    });

    datefrom.datetimepicker({
        format: 'L',
        defaultDate: new Date().setUTCDate(1),
        locale: 'es',
        ignoreReadonly: true
        //maxDate: new Date().setUTCDate(daysInMonth(new Date().getUTCMonth() + 1, new Date().getFullYear()))
    });
    dateto.datetimepicker({
        useCurrent: false,
        format: 'L',
        defaultDate: new Date().setUTCDate(daysInMonth(new Date().getUTCMonth() + 1, new Date().getFullYear())),
        locale: 'es',
        minDate: new Date().setUTCDate(0),
        ignoreReadonly: true
    });
    datefrom.on("change.datetimepicker", function (e) {
        if (getUnixFromDatepicker(dateto)<getUnixFromDatepicker(datefrom)){
            dateto.val(dateFormat(dateFromDatepicker(datefrom)));
        }
        dateto.datetimepicker('minDate', e.date);
        updatePanel();
    });
    dateto.on("change.datetimepicker", function (e) {
        updatePanel();
    });
    hide_current.change(function (e) {
       updatePanel();
    });
    show_disabled_users.change(function (e) {
        loadUsers(loadFinishedCheck);
    });

    //Start to load all event/users/history resources from webserver
    loadEvents(loadFinishedCheck);
    loadUsers(loadFinishedCheck);
    loadSummer(loadFinishedCheck)
});


/*
setInterval(function () {
    eval("debugger");
},100);
*/
