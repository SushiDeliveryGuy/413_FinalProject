// public/javasciprts/signup.js

function signup() {
    // data validation
    if ($('#username').val() === "") {
        window.alert("invalid username!");
        return;
    } else {
        let errorMsg = document.getElementById("formErrors");
        errorMsg.innerHTML = "<ul>";
        let regC = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
        if (!regC.test($('#username').val())) {
            errorMsg.style.display = "block";
            errorMsg.innerHTML += "<li>Invalid or missing email address.</li>";
            return;
        } else {
            $('#username').style.borderColor = "#aaa";
            $('#username').style.borderWidth = "1px";
            $('#username').style.borderStyle = "solid";
            errorMsg.style.display = "none";
        }
        errorMsg.innerHTML += "</ul>";
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

    $('#password').keyup(function() {
        let errorMsg = document.getElementById("pwStrong");
        errorMsg.innerHTML = "<ul>";
        let regP = /^(?=.*[A-Za-z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        let regCase = /^(?=.*[A-Za-z])/;
        let regChar = /(?=.*[@$!%*?&])/;
        if (!regP.test($('#password').val())) {
            errorMsg.style.display = "block";
            errorMsg.innerHTML = "Weak Password";
            //errorMsg.innerHTML += "<br><li>Password must be at least 8 characters<li>Contain at least one upper and one lower case letter<li>Contain at least one special character";
            if (!regChar.test($('#password').val()))
                errorMsg.style.color = "yellow";
            if ($('#password').val().length < 8) {
                errorMsg.style.color = "orange";
            }
            return;
        } else {
            errorMsg.style.display = "none";
        }
    });
    
});

