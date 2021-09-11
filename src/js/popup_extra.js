var log_in_navigation = document.getElementById("reg");
var log_in_popup = document.getElementById("button__log");
var user_login = document.getElementById("user_login");
var user_pw = document.getElementById("user_pw");

log_in_navigation.addEventListener('click', function(){
    document.querySelector(".pop__up").style.display = "flex";
});

document.querySelector(".close").addEventListener("click", function(){
    document.querySelector(".pop__up").style.display = "none";
});

log_in_popup.addEventListener('click', function(){
     console.log(user_login.value);
     console.log(user_pw.value);
     var payload = 'http://localhost:8082' + '/token/auth?username=' + user_login.value + '&password=' + user_pw.value;
     console.log(payload);

     fetch(payload)
     .then(response => response.json())
     .then(data => {
        console.log(data);
        console.log(data.login);
        console.log(typeof data.login); 
        
        /* Bei erfolgreichem Login wird die infobar angezeigt */
        if (data.login === true) {
            document.querySelector(".sidebar").style.display = "inline";
            document.querySelector(".pop__up").style.display = "none";
            document.querySelector('#reg').innerHTML = 'Logged-in';
        }
    }); 
});

