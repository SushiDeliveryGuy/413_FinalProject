// public/javascripts/account.js
$(function (){
    $('#btnLogOut').click(logout);

    
});

function logout() {
    localStorage.removeItem("token");
    window.location.replace("index.html");
}
