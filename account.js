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

function changePassword() {
    var username = document.getElementById("username").value;
    var currentPassword = document.getElementById("currentPassword").value;
    var newPassword = document.getElementById("newPassword").value;
    var confirmPassword = document.getElementById("confirmPassword").value;

    // Client-side validation
    if (newPassword !== confirmPassword) {
        alert("New password and confirm password do not match.");
        return;
    }

    // AJAX request to the server for password change
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/users/changePassword", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                alert("Password changed successfully");
            } else {
                alert("Error changing password. Please try again.");
            }
        }
    };

    // Sending the request with the username, current password, and new password
    var data = JSON.stringify({
        username: username,
        currentPassword: currentPassword,
        newPassword: newPassword
    });

    xhr.send(data);
}

$(document).ready(function() {
    $('a[href^="#"]').on('click', function(e) {
        e.preventDefault();
        var target = this.hash;
        $('html, body').animate({
            scrollTop: $(target).offset().top
        }, 800, 'swing');
    });
});