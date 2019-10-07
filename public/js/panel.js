var table = $('#report');

var thisMonthP = $('#monthp');
var todayP = $('#dayp');
var thisWeekP = $('#weekp');
var thisRangeExpectedP = $('#emonthp');
var unregisteredDaysP = $('#udaysp');
var warningDaysP = $('#wdaysp');

var btn_register = $('#btn_register');
var register_modal = $('#registerNewDay');
var register_date = $('#rday');
var register_from_hour = $('#fhour');
var register_to_hour = $('#thour');
var register_break = $('#lhour');
var register_comment = $('#comment');
var register_error_alert = $('#register_error_alert');

var current_edit_id = 0;

var todaySeconds = 0;
var thisWeekSeconds = 0;
var thisMonthSeconds = 0;

var current_search = -2;
var usr_list_select = $('#usr_list');
var btn_export = $('#btn_export');
var btn_export_totals = $('#btn_export_totals');
var adm = usr_list_select.length > 0;

var events = null;
var users = [];

var datefrom = $('#datepickerfrom');
var dateto = $('#datepickerto');

var busy = false;

var warning_days = 0;
var unregistered_days = 0;
var expected_hours = 0;
var current_time_data = null;

var disabledDates = [];

function insideEvent(unix_seconds, uid) {
    for (var i = 0; i < events.length; i++) {
        var event = events[i];
        if ((event.user === uid || event.user === null) && event.approved === 1) { //evento propio o festivo aprobado
            if (unix_seconds >= event.from && unix_seconds <= event.to) {
                return true;
            }
        }
    }
    return false;
}

function updatePanel() {
    if (busy)
        return;
    busy = true; //only one at same time

    if (adm) {
        $('#loading_card').parent().parent().show(); //loading card
    } else {
        $('#loading_card').show(); //loading card
        $('#register_card').hide(); //loading card
    }


    //clear
    table.DataTable().clear();
    table.DataTable().destroy();

    todaySeconds = 0;
    thisWeekSeconds = 0;
    thisMonthSeconds = 0;
    warning_days = 0;
    expected_hours = 0;
    unregistered_days = 0;
    current_time_data = [];

    var aurl=url + "api/report";
    if (adm){
        aurl+=(current_search === -2 ? "/all" : "/" + current_search);
    }
    aurl+="/" + parseInt(moment(datefrom.val() + "Z", "D/M/YYYYZ")._d.getTime() / 1000) + "/" + parseInt(moment(dateto.val() + "Z", "D/M/YYYYZ")._d.getTime() / 1000);

    request('get',aurl,undefined,function(result){
        //calculamos el minimo dia de la semana para calcular el tiempo trabajado esta semana
        var mindateweek = getOnlyDate();
        mindateweek.setUTCDate(mindateweek.getUTCDate() - mindateweek.getUTCDay() + 1);

        disabledDates = [];
        if (result.status === "ok") {
            current_time_data = result.data;
            result.data.forEach(function (row) {
                var sdate = new Date(row.date * 1000);
                disabledDates.push(sdate);
                var diffSeconds = row.end_hour - row.start_hour;
                var totalseconds = diffSeconds - row.breaktime;
                if (sdate.getUTCDate() === new Date().getUTCDate() && sdate.getUTCMonth() === new Date().getUTCMonth() && sdate.getFullYear() === new Date().getFullYear()) {
                    todaySeconds += totalseconds;
                }
                /*if (sdate.getUTCMonth() >= new Date(datefrom.datetimepicker('viewDate')._d).getUTCMonth() &&
                    sdate.getUTCMonth() <= new Date(dateto.datetimepicker('viewDate')._d).getUTCMonth() &&
                    sdate.getFullYear() >= new Date(datefrom.datetimepicker('viewDate')._d).getFullYear() &&
                    sdate.getFullYear() <= new Date(dateto.datetimepicker('viewDate')._d).getFullYear()){
                    thisMonthSeconds+=totalseconds;
                }*/
                thisMonthSeconds += totalseconds;
                if (sdate >= mindateweek) {
                    thisWeekSeconds += totalseconds;
                }

                var date = dateFormat(sdate, false);
                var start = secondsAmount(row.start_hour, false, true);
                var end = secondsAmount(row.end_hour, false, true);
                var comment = row.comment===null?"":row.comment.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                var regisDate = dateFormat(new Date(row.register_date * 1000));
                var final_seconds = totalseconds;


                var buttons = "";
                if (adm) {
                    if (row.editable===0){
                        buttons = "<i class=\"fas fa-highlighter\" onclick=\"enableOneEdit(event,"+row.id+")\" style='cursor:pointer;' title='Enable one time edit mode'></i>";
                    }
                } else {
                    if (dateFormat(new Date(), false) === regisDate || row.editable) {
                        buttons = "<i class=\"fas fa-edit\" style='cursor:pointer;color:greenyellow;text-shadow: 0 0 3px #000;' title='Edit' onclick='editCommentModal(event," + row.id + ",true," + row.start_hour + "," + row.end_hour + "," + row.breaktime + ",\""+date+"\")'></i>";
                    } else {
                        buttons = "<i class=\"fas fa-edit\" style='cursor:pointer;' title='Edit comment' onclick='editCommentModal(event," + row.id + ",false," + row.start_hour + "," + row.end_hour + "," + row.breaktime + ",\""+date+"\")'></i>";
                    }
                }

                var maxfseconds = 0;
                for (var u = 0; u < users.length; u++) {
                    if (users[u].id === row.user) {
                        maxfseconds = users[u].mins * 60;
                        break;
                    }
                }

                var status_icon = "";
                if (final_seconds > maxfseconds) {
                    status_icon = "<i class=\"fas fa-exclamation-triangle\" style='color:yellow;text-shadow: 0 0 3px #000;' title='Too much time in your working day!'></i>";
                    warning_days++;
                } else if (date !== regisDate) {
                    status_icon = "<i class=\"fas fa-exclamation-triangle\" style=\"color:yellow;text-shadow: 0 0 3px #000;\" title=\"Your registration date was after your working date! Don't do that!!\"></i>";
                    warning_days++;
                } else {
                    status_icon = "<i class=\"fas fa-check-circle\" style='color:greenyellow;text-shadow: 0 0 3px #000;' title='Everything ok'></i>";
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

            });
        }


        users.forEach(function (user) {
            if (current_search === -2 || user.id === current_search) {
                var date = setTimeZero(new Date(moment(datefrom.val() + "Z", "D/M/YYYYZ")._d));
                var todate = setTimeZero(new Date(moment(dateto.val() + "Z", "D/M/YYYYZ")._d));
                do {
                    if (date.getUTCDay() !== 0 && date.getUTCDay() !== 6 && !insideEvent(parseInt(date.getTime() / 1000), user.id)) {
                        expected_hours += user.mins;

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
            }
        });

        var date = setTimeZero(new Date(moment(datefrom.val() + "Z", "D/M/YYYYZ")._d));

        var todate = setTimeZero(new Date(moment(dateto.val() + "Z", "D/M/YYYYZ")._d));

        table.attr('style', 'width:100%');
        todayP.text(secondsAmount(todaySeconds));
        thisMonthP.text(secondsAmount(thisMonthSeconds));
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
        if (!adm) {
            var dp = $('#datetimepicker');
            dp.datetimepicker('destroy');
            dp.datetimepicker({
                format: 'L',
                locale: 'es',
                daysOfWeekDisabled: [0, 6],
                disabledDates: disabledDates
            });
            dp.datetimepicker('maxDate', moment());
        }

        $('#report_card').show();

        if (adm) {
            $('#loading_card').parent().parent().hide();
        } else {
            $('#register_card').show();
            $('#loading_card').hide();
        }

        table.DataTable().columns.adjust().draw();
        busy = false;
    });
}

function loadEvents(cb) {
    request('get',url + "api/events",undefined,function (result) {
        events = result.data;
        cb(updatePanel);
    });
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
        date = moment(register_date.val() + "Z", "D/M/YYYYZ")._d;
        if (date === null || date === undefined || isNaN(date)) {
            showRegisterError("Wrong date format");
            return;
        }
        date = Math.floor(date.getTime() / 1000);
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

function loadUsers(cb) {
    request('get',url + "api/user" + (adm ? "s" : ""),undefined,function (result) {
        if (adm) {
            users = result.data;
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
        var from = dateFormat(moment(datefrom.val() + "Z", "D/M/YYYYZ")._d, false);
        var to = dateFormat(moment(dateto.val() + "Z", "D/M/YYYYZ")._d, false);
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            if (current_search === -2 || user.id === current_search) {

                var registeredHours = 0;
                var expectedHours = 0;
                var registeredDays = 0;
                var unregisteredDays = 0;
                var warningDays = 0;

                for (var k = 0; k < current_time_data.length; k++) {
                    var row = current_time_data[k];
                    if (row.user === user.id) {
                        if (row.end_hour - row.start_hour - row.breaktime > user.mins * 60 || setTimeZero(new Date(row.date * 1000)).getTime() !== setTimeZero(new Date(row.register_date * 1000)).getTime()) {
                            warningDays++;
                        }
                        registeredDays++;
                        registeredHours += row.end_hour - row.start_hour - row.breaktime;
                    }
                }
                registeredHours = secondsAmount(registeredHours);

                var date = setTimeZero(new Date(moment(datefrom.val() + "Z", "D/M/YYYYZ")._d));
                var todate = setTimeZero(new Date(moment(dateto.val() + "Z", "D/M/YYYYZ")._d));
                do {
                    if (date.getUTCDay() !== 0 && date.getUTCDay() !== 6 && !insideEvent(parseInt(date.getTime() / 1000), user.id)) {
                        expectedHours += user.mins;

                        var found = false;
                        for (var ux = 0; ux < current_time_data.length; ux++) {
                            var rowd = current_time_data[ux];
                            var rowdate = setTimeZero(new Date(rowd.date * 1000));
                            if (rowd.user === user.id && rowdate.getTime() === date.getTime()) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            unregisteredDays++;
                        }
                    }
                    date.setUTCDate(date.getUTCDate() + 1);
                }
                while (date.getTime() <= todate.getTime());



                expectedHours = secondsAmount(expectedHours*60);

                var sheet_row = [];
                sheet_row.push(user.name);
                sheet_row.push(from);
                sheet_row.push(to);
                sheet_row.push(registeredHours);
                sheet_row.push(expectedHours);
                sheet_row.push(registeredDays);
                sheet_row.push(unregisteredDays);
                sheet_row.push(warningDays);
                sheet_data.push(sheet_row);
            }
        }
        book.Sheets.Sheet=XLSX.utils.aoa_to_sheet(sheet_data);
        var blob_data = XLSX.write(book, {bookType:'xlsx', bookSST:true, type: 'base64'})
        var dt = new Date();
        var fname = "Export_Totals_" + dt.getFullYear() + "_" + (dt.getUTCMonth() + 1) + "_" + dt.getUTCDate() + ".xlsx";
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            var blob = b64toBlob(blob_data,"application/xlsx");
            window.navigator.msSaveOrOpenBlob(blob, fname);
        } else {
            var a = document.createElement("a");
            a.style = "display: none";
            a.href = "data:application/xlsx;base64,"+blob_data;
            a.download = fname;
            document.body.appendChild(a);
            a.click();
            setTimeout(function () {
                document.body.removeChild(a);
            }, 2000);
        }
    });

    btn_export.on('click', function () {
        var book = XLSX.utils.book_new();
        book.SheetNames.push("Sheet");
        var sheet_data = [["Name","Date","Start Hour","End Hour","Comments","Registration Date","Total Time","Total Break Time","Total Spend"]];
        table.DataTable().rows({search: 'applied'}).every(function (rowIdx, tableLoop, rowLoop) {
            var d = this.data();
            var sheet_row = [];
            sheet_row.push(d[1]);
            sheet_row.push(d[2]);
            sheet_row.push(d[3]);
            sheet_row.push(d[4]);
            sheet_row.push($.parseHTML(d[5])[0].innerHTML);
            sheet_row.push(d[6]);
            sheet_row.push(d[7]);
            sheet_row.push(d[8]);
            sheet_row.push(d[9]);
            sheet_data.push(sheet_row);
        });
        book.Sheets.Sheet=XLSX.utils.aoa_to_sheet(sheet_data);
        var blob_data = XLSX.write(book, {bookType:'xlsx', bookSST:true, type: 'base64'})
        var dt = new Date();
        var fname = "Export_" + dt.getFullYear() + "_" + (dt.getUTCMonth() + 1) + "_" + dt.getUTCDate() + ".xlsx";
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            var blob = b64toBlob(blob_data,"application/xlsx");
            window.navigator.msSaveOrOpenBlob(blob, fname);
        } else {
            var a = document.createElement("a");
            a.style = "display: none";
            a.href = "data:application/xlsx;base64,"+blob_data;
            a.download = fname;
            document.body.appendChild(a);
            a.click();
            setTimeout(function () {
                document.body.removeChild(a);
            }, 2000);
        }
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
        //maxDate: new Date().setUTCDate(daysInMonth(new Date().getUTCMonth() + 1, new Date().getFullYear()))
    });
    dateto.datetimepicker({
        useCurrent: false,
        format: 'L',
        defaultDate: new Date().setUTCDate(daysInMonth(new Date().getUTCMonth() + 1, new Date().getFullYear())),
        locale: 'es',
        minDate: new Date().setUTCDate(1)
    });
    datefrom.on("change.datetimepicker", function (e) {
        if (moment(dateto.val() + "Z", "D/M/YYYYZ")._d.getTime()<moment(datefrom.val() + "Z", "D/M/YYYYZ")._d.getTime()){
            dateto.val(dateFormat(moment(datefrom.val() + "Z", "D/M/YYYYZ")._d));
        }
        dateto.datetimepicker('minDate', e.date);
        updatePanel();
    });
    dateto.on("change.datetimepicker", function (e) {
        //datefrom.datetimepicker('maxDate', e.date);
        updatePanel();
    });

    loadEvents(loadUsers);
});


/*
setInterval(function () {
    eval("debugger");
},100);
*/
