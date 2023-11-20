// public/javasciprts/signup.js

function signup() {
    // data validation
    if ($('#username').val() === "") {
        window.alert("invalid username!");
        return;
    }
    if ($('#password').val() === "") {
        window.alert("invalid password");
        return;
    }

    let txdata = {
        username: $('#username').val(),
        password: $('#password').val()
    };

    $.ajax({
        url: 'http://ec2-3-144-2-15.us-east-2.compute.amazonaws.com:3000/users/signUp',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(txdata),
        dataType: 'json'
    })
    .done(function (data, textStatus, jqXHR) {
        $('#rxData').html(JSON.stringify(data, null, 2));
        if (data.success) {
            // after 1 second, move to "login.html"
            setTimeout(function(){
                window.location = "login.html";
            }, 1000);
        }
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        if (jqXHR.status == 404) {
            $('#rxData').html("Server could not be reached!!!");    
        }
        else $('#rxData').html(JSON.stringify(jqXHR, null, 2));
    });
}



$(function () {
    $('#btnSignUp').click(signup);
});