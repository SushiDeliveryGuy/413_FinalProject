// public/javascripts/signup.js

function signup() {
    // data validation
    if ($('#username').val() === "") {
    	window.alert("Invalid username! (Must be email)");
    	return;
    } else {
    	let errorMsg = document.getElementById("formErrors");
    	errorMsg.innerHTML = "<ul>";
    	let regC = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
    	if (!regC.test($('#username').val())) {
        	errorMsg.style.display = "block";
        	errorMsg.innerHTML += "<li>Invalid email address.</li>";
        	return;
    	} else {
        	$('#username').css({
            	borderColor: "#aaa",
            	borderWidth: "1px",
            	borderStyle: "solid"
        	});
        	errorMsg.style.display = "none";
    	}
    	errorMsg.innerHTML += "</ul>";
    }
    if ($('#password').val() === "") {
        window.alert("invalid password");
        return;
    }
    if ($('#pwStrong').className == 'password-weak') {
	return;
    }
    

    let txdata = {
        username: $('#username').val(),
        password: $('#password').val()
    };

    $.ajax({
        url: 'http://ec2-3-137-163-56.us-east-2.compute.amazonaws.com:3000/users/signUp',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(txdata),
        dataType: 'json'
    })
    .done(function (data, textStatus, jqXHR) {
        //$('#rxData').html(JSON.stringify(data, null, 2));
        if (data.success) {
            // after 1/2 second, move to "login.html"
            setTimeout(function(){
                window.location = "index.html";
            }, 500);
        }
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        if (jqXHR.status == 404) {
            window.alert("Server could not be reached");    
        }
        else if (jqXHR.status == 401) {
	    window.alert("Username already exists");
	}
    });
}



$(function () {
    $('#btnSignUp').click(signup);

    $('#password').keyup(function() {
        let strengthIndicator = document.getElementById("pwStrong");
	let password = $('#password').val();
        strengthIndicator.innerHTML = '';

        // Minimum length requirement
        if (password.length < 8) {
        strengthIndicator.innerHTML = 'Password should be at least 8 characters long.';
        strengthIndicator.className = 'password-weak';
        return;
    }

    // Check for special characters
    var specialCharacterRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (!specialCharacterRegex.test(password)) {
        strengthIndicator.innerHTML = 'Password should contain at least one special character.';
        strengthIndicator.className = 'password-weak';
        return;
    }

    // If all checks passed, the password is strong
    strengthIndicator.innerHTML = 'Strong password!';
    strengthIndicator.className = 'password-strength';
    });
});