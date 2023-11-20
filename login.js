// public/javasciprts/login.js
function login() {
    let txdata = {
        username: $('#username').val(),
        password: $('#password').val()
    };

    $.ajax({
        url: 'http://ec2-3-144-2-15.us-east-2.compute.amazonaws.com:3000/users/logIn',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(txdata),
        dataType: 'json'
    })
    .done(function (data, textStatus, jqXHR) {
        localStorage.setItem("token", data.token);
        window.location.replace("account.html");
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        
    });
}

$(function () {
    $('#submit').click(login);
});