// public/javascripts/account.js
$(function (){
    // TODO: registering the device and saving the name into "ID"
    // $('#registerDevice').on('click', function() {
    //
    //     deviceOptions(ID);
    // });

    //$('deviceID').onChange(/*TODO: function to update Weekly and Daily View for device*/);
    //$('calendar').onChange(/*TODO: function to update Weekly and Daily view for date change*/);




    $('#logout').click(logout);
    
});

function logout() {
    localStorage.removeItem("token");
    window.location.replace("index.html");
}

function deviceOptions(deviceName) {
    let list = $('#deviceID');
    list.innerHTML += "<option>" + deviceName + "</option>";
}