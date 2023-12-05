// public/javascripts/account.js
$(function (){
    $('#logout').on('click', function() {
	console.log("InSignup");
	window.localStorage.removeItem("token");
        window.location.replace("index.html");
	
    });
    
});