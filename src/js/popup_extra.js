var log_in_navigation = document.getElementById("reg");
var log_in_popup = document.getElementById("button__log");
var user_login = document.getElementById("user_login");
var user_pw = document.getElementById("user_pw");
var log_out = document.getElementById("out");

log_in_navigation.addEventListener('click', function(){
    document.querySelector(".pop__up").style.display = "flex";
});

document.querySelector(".close").addEventListener("click", function(){
    document.querySelector(".pop__up").style.display = "none";
});


/* Anmelden in mit JWT */
log_in_popup.addEventListener('click', function(){
     /* console.log(user_login.value);
     console.log(user_pw.value); */
     var payload = 'http://localhost:8082' + '/token/auth?username=' + user_login.value + '&password=' + user_pw.value;
     /* console.log(payload); */

     fetch(payload)
     .then(response => response.json())
     .then(data => {
        /* console.log(data);
        console.log(data.login);
        console.log(typeof data.login);  */
        
        /* Bei erfolgreichem Login wird die infobar-Stadtrad angezeigt */
        if (data.login === true) {
            document.querySelector('#rad__rad').style.display = "inline";
            document.querySelector(".pop__up").style.display = "none";
            document.querySelector(".button__out").style.display = "flex";
            document.querySelector('#reg').style.width = "210px";
            document.querySelector('#reg').innerHTML = 'Angemeldet als: ' + user_login.value;
        }
    }); 
});

/* log out mit JWT */
log_out.addEventListener('click', function(){
    
    var payload = 'http://localhost:8082' + '/token/remove';
     /* console.log(payload); */
     fetch(payload, 
        {method: 'POST'})
     .then(response => response.json())
     .then(data => {
        /* console.log(data);
        console.log(data.logout);
        console.log(typeof data.logout); */

        /* token wieder entfernen */
        if (data.logout === true) {
            document.querySelector('#reg').innerHTML = 'Anmelden';
            document.querySelector('#rad__rad').style.display = "none";
            document.querySelector(".button__out").style.display = "none";
        }
    }); 
});

