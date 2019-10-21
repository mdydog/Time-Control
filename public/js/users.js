var table = $('#report');

var btn_add_user = $('#btn_add_user');
var btn_import = $('#btn_import');
var add_user_modal = $('#addEditUser');
var add_user_error_alert = $('#add_user_error_alert');

var modal_user_id = $('#uid');
var modal_user_name = $('#uname');
var modal_user_whours = $('#whours');
var modal_user_swhours = $('#swhours');
var modal_user_email = $('#uemail');
var modal_user_supervisor = $('#usupervisor');
var modal_user_active = $('#uactive');
var modal_user_adminrole = $('#uroleadmin');
var modal_user_supervisorrole = $('#urolesupervisor');

function updatePanel(){
    table.DataTable().clear();
    table.DataTable().destroy();

    request('get',url+"api/users/all",undefined,function (result) {
        if (result.status === "ok"){
            result.data.forEach(function(row){
                var groups_data = "";
                for(var i = 0;i<row.groups.length;i++){
                    var name = "User";
                    switch (row.groups[i]) {
                        case 2:
                            name="Admin";
                            break;
                        case 3:
                            name="Supervisor";
                            break;
                    }
                    groups_data+="<span rolid='"+row.groups[i]+"'>"+name+"</span>"+(i+1<row.groups.length?", ":"");
                }

                table.append("<tr><td>"+row.name+"</td><td>"+row.email+"</td><td>"+parseHour(row.mins)+"</td><td>"+parseHour(row.summermins)+"</td><td>"+(row.supervisor===null?"None":($('option[value=\"'+row.supervisor+'\"]').text()===""?"None":$('option[value=\"'+row.supervisor+'\"]').text()))+"</td><td><i class=\"fas "+(row.active===1?"fa-check\" style='font-size: 1.5em;color:mediumseagreen;'":"fa-times\" style='font-size: 1.5em;color:red;'")+"></i></td><td>"+groups_data+"</td><td>"+(parseInt(current_user.id)!==parseInt(row.id)?"<i class=\"fas fa-user-edit\" style=\"font-size:1.5em;cursor:pointer;\" onclick=\"userModal(event,"+row.id+",'"+row.name+"','"+row.email+"',"+row.supervisor+","+row.active+",'"+row.groups+"','"+parseHour(row.mins)+"','"+parseHour(row.summermins)+"')\"></i>":"")+"</td></tr>");
            });
        }

        table.attr('style','width:100%');
        table.DataTable({
            "order": [[ 0, "desc" ]],
            "scrollX": true,
            responsive: true,
            "columnDefs": [
                { "orderable": false, "targets": [5,3] }
            ]
        });
        $('#user_card').show();
        $('#loading_card').hide();
        table.DataTable().columns.adjust().draw()
    });
}

function addUser(e){
    e.preventDefault();

    var id = modal_user_id.val();
    if (id === null || id === undefined){
        add_user_error_alert.text("Web page error, reload!");
        add_user_error_alert.show();
        return;
    }
    if (id===""){
        id=-1;
    }

    var name = modal_user_name.val();
    if (name === null || name === undefined || name.length>50 || name.length<=0){
        add_user_error_alert.text("Wrong name");
        add_user_error_alert.show();
        return;
    }

    var email = modal_user_email.val();
    if (email === null || email === undefined || !isEmail(email)){
        add_user_error_alert.text("Wrong email");
        add_user_error_alert.show();
        return;
    }

    var mins = modal_user_whours.val();
    if (mins === null || mins === undefined || mins === ""){
        add_user_error_alert.text("Wrong working hours");
        add_user_error_alert.show();
        return;
    }
    mins = parseInt(mins.split(":")[0])*60+parseInt(mins.split(":")[1]);

    var summermins = modal_user_swhours.val();
    if (summermins === null || summermins === undefined || summermins === ""){
        add_user_error_alert.text("Wrong summer working hours");
        add_user_error_alert.show();
        return;
    }
    summermins = parseInt(summermins.split(":")[0])*60+parseInt(summermins.split(":")[1]);

    var supervisor = parseInt(modal_user_supervisor.val());
    if (supervisor === null || supervisor === undefined){
        add_user_error_alert.text("Error with supervisor");
        add_user_error_alert.show();
        return;
    }

    var active = modal_user_active.is(":checked")?1:0;
    if (active === null || active === undefined){
        add_user_error_alert.text("Error active check");
        add_user_error_alert.show();
        return;
    }

    var adminrole = modal_user_adminrole.is(":checked")?1:0;
    if (adminrole === null || adminrole === undefined){
        add_user_error_alert.text("Error admin role");
        add_user_error_alert.show();
        return;
    }

    var supervisorrole = modal_user_supervisorrole.is(":checked")?1:0;
    if (supervisorrole === null || supervisorrole === undefined){
        add_user_error_alert.text("Error supervisor role");
        add_user_error_alert.show();
        return;
    }
    add_user_error_alert.hide();

    request('post',url+"api/addedituser",{id: id,name: name,mins:mins,summermins:summermins,email: email, supervisor: supervisor, active: active, adminrole: adminrole, supervisorrole: supervisorrole},function (result) {
        if (result.status==="ok"){
            add_user_modal.modal('hide');
            updatePanel();
            if (id==-1){
                notify("User registered","success");
            }
            else{
                notify("User edited","success");
            }
        }
        else{
            add_user_error_alert.text(result.msg);
            add_user_error_alert.show();
        }
    });
}

function userModal(e,id,name,email,supervisor,active,groups,hours,shours){
    e.preventDefault();
    add_user_error_alert.hide();

    if (id===undefined){
        modal_user_id.val("");
        modal_user_name.val("");
        modal_user_email.val("");
        modal_user_whours.val("");
        modal_user_swhours.val("");
        modal_user_supervisor.val(-1);
        modal_user_active.attr('checked',true);
        modal_user_adminrole.removeAttr('checked');
        modal_user_supervisorrole.removeAttr('checked');
    }
    else{
        modal_user_id.val(id);
        modal_user_name.val(name);
        modal_user_email.val(email);
        modal_user_whours.val(hours);
        modal_user_swhours.val(shours);
        modal_user_supervisor.val(supervisor===null?-1:supervisor);
        modal_user_active.attr('checked',parseInt(active)===1)
        modal_user_adminrole.removeAttr('checked');
        modal_user_supervisorrole.removeAttr('checked');
        var gr = groups.split(",");
        for(var i = 0;i<gr.length;i++){
            if (parseInt(gr[i]) === 2){
                modal_user_adminrole.attr('checked',true);
            }
            else if (parseInt(gr[i]) === 3){
                modal_user_supervisorrole.attr('checked',true);
            }
        }
    }
    add_user_modal.modal();
}


$(document).ready(function(){
    btn_add_user.click(function (e) {
        userModal(e);
    });
    btn_import.click(function (e) {
        $("#import_input").val(null);
       $('#import_input').click();
    });
    $("#import_input").change(function(){
        var file = document.getElementById("import_input").files[0];
        if (file) {
            var reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = function (evt) {
                try{
                    var rows = $.csv.toArrays(evt.target.result);
                }
                catch (e) {
                    notify("Error reading file",'error');
                    return;
                }

                rows.splice(0,1); //remove first row
                notify("Processing...",'success');
                request('post',url+"api/import/users",{users:rows},function (result) {
                    if (result.status === "ok"){
                        notify(rows.length+" users was added",'success');
                        setTimeout(function () {
                            location.reload();
                        },1000);

                    }
                    else{
                        notify("Process canceled","error");
                        notify(result.msg,"error");
                    }
                });
            };
            reader.onerror = function (evt) {
                notify("Error reading file",'error');
            };
        }
    });
    updatePanel();
});



/*setInterval(function () {
    eval("debugger");
},100);*/

