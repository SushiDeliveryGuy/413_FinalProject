// public/javascripts/account.js
$(function (){
    $('#logout').on('click', function() {
        window.location.replace("index.html");
    });
    
});

function logout() {
    localStorage.removeItem("token");
    window.location.replace("index.html");
}



