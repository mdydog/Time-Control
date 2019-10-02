var table = $('#report');
var cur_user_id = $('#cuid').val();

var btn_add_user = $('#btn_add_user');
var add_user_modal = $('#addEditUser');
var add_user_error_alert = $('#add_user_error_alert');

var modal_user_id = $('#uid');
var modal_user_name = $('#uname');
var modal_user_whours = $('#whours');
var modal_user_email = $('#uemail');
var modal_user_supervisor = $('#usupervisor');
var modal_user_active = $('#uactive');
var modal_user_adminrole = $('#uroleadmin');
var modal_user_supervisorrole = $('#urolesupervisor');




function actualizaPanel(){
    table.DataTable().clear();
    table.DataTable().destroy();

    $.get(url+"api/users",function (data) {
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

                    table.append("<tr><td>"+row.name+"</td><td>"+row.email+"</td><td>"+parseHour(row.mins)+"</td><td>"+(row.supervisor===null?"None":$('option[value=\"'+row.supervisor+'\"]').text())+"</td><td><i class=\"fas "+(row.active===1?"fa-check\" style='font-size: 1.5em;color:mediumseagreen;'":"fa-times\" style='font-size: 1.5em;color:red;'")+"></i></td><td>"+groups_data+"</td><td>"+(parseInt(cur_user_id)!==parseInt(row.id)?"<i class=\"fas fa-user-edit\" style=\"font-size:1.5em;cursor:pointer;\" onclick=\"userModal(event,"+row.id+",'"+row.name+"','"+row.email+"',"+row.supervisor+","+row.active+",'"+row.groups+"')\"></i>":"")+"</td></tr>");
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
        }
        else{
            $.notify("Error connecting to the server!","error");
        }
    }).fail(function() {
        $.notify("Error connecting to the server!","error");
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
    if (mins === null || mins === undefined){
        add_user_error_alert.text("Wrong working hours");
        add_user_error_alert.show();
        return;
    }
    mins = parseInt(mins.split(":")[0])*60+parseInt(mins.split(":")[1]);

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


    $.post(url+"api/addedituser",{id: id,name: name,mins:mins,email: email, supervisor: supervisor, active: active, adminrole: adminrole, supervisorrole: supervisorrole,_token: csrf},function (response) {
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
                add_user_modal.modal('hide');
                actualizaPanel();
                if (id==-1){
                    $.notify("User registered","success");
                }
                else{
                    $.notify("User edited","success");
                }
            }
            else{
                add_user_error_alert.text(result.msg);
                add_user_error_alert.show();
            }
        }
        else{
            $.notify("Error connecting to the server!","error");
        }
    }).fail(function (e) {
        $.notify("Error connecting to the server!","error");
    });
}

function userModal(e,id,name,email,supervisor,active,groups){
    e.preventDefault();
    add_user_error_alert.hide();

    if (id===undefined){
        modal_user_id.val("");
        modal_user_name.val("");
        modal_user_email.val("");
        modal_user_supervisor.val(-1);
        modal_user_active.attr('checked',true);
        modal_user_adminrole.attr('checked',false);
        modal_user_supervisorrole.attr('checked',false);
    }
    else{
        modal_user_id.val(id);
        modal_user_name.val(name);
        modal_user_email.val(email);
        modal_user_supervisor.val(supervisor===null?-1:supervisor);
        modal_user_active.attr('checked',parseInt(active)===1)
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

    actualizaPanel();
});



/*setInterval(function () {
    eval("debugger");
},100);*/

