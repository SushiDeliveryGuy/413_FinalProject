// public/javasciprts/login.js
function login() {
    let txdata = {
        username: $('#username').val(),
        password: $('#password').val()
    };

    $.ajax({
        url: 'http://ec2-3-137-163-56.us-east-2.compute.amazonaws.com:3000/users/logIn',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(txdata),
        dataType: 'json'
    })
    .done(function (data, textStatus, jqXHR) {
        localStorage.setItem("token", data.token);
	localStorage.setItem("username", data.username);
	localStorage.setItem("devices", data.devices);
        window.location.replace("account.html");
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        //$('#rxData').html(JSON.stringify(jqXHR, null, 2));
	if (jqXHR.status == 401) {
		window.alert("Username or Password are incorrect");
	}
    });
}

$(function () {
    $('#submit').click(login);
});