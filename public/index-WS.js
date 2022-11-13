// make connection
let socket = io();

// query DOM
let status_text = document.getElementById("statusDiv");
let send_form = document.getElementById("send_form");
let message_input = document.getElementById("message-input");
let messages_list = document.getElementById("listOfMessages");
let users_list = document.getElementById("listOfUsers");
let users_btn = document.getElementById("usersBtn");
let chat_btn = document.getElementById("chatBtn");
let listOfUsersDiv = document.getElementById("listOfUsersDiv");
let listOfChatsDiv = document.getElementById("listOfChatsDiv");

let currentUser = main_options.getAttribute("data-currentUser");
let url = window.location.href.split("/");

chat_btn.addEventListener("click", function(e) {
    toggleUsersChat();
});

users_btn.addEventListener("click", function(e) {
    toggleUsersChat();
});

function toggleUsersChat(){
    if (listOfChatsDiv.style.display === "none"){
        listOfChatsDiv.style.display = "block";
        listOfUsersDiv.style.display = "none";
    } else {
        listOfChatsDiv.style.display = "none";
        listOfUsersDiv.style.display = "block";
    }
}

socket.emit("isOnline", currentUser);
socket.on()

// emit events
send_form && send_form.addEventListener("submit", function(e) {
    socket.emit("chat", {
        message: message_input.value,
        send_user: currentUser
    });
    e.preventDefault();
    message_input.value = "";
});

is_user_typing = false;
message_input && message_input.addEventListener("keypress", function(){
    if (is_user_typing == false) {
        socket.emit("typing", currentUser);
        is_user_typing = true;
        clearStatus();
    }
});

function clearStatus() {
    setTimeout(function() {
        is_user_typing = false;
        socket.emit("typing", "");
    }, 10000);
}

// listen for events
socket.on("chat", function(data) {
    if (data.send_user == currentUser){
        messages_list.innerHTML += "<li class=\"right\"><label>" + data.send_user + ": " + data.message + "</label></li>";
    } else {
        messages_list.innerHTML += "<li class=\left\"><label>" + data.send_user + ": " + data.message + "</label></li>";
    }
});

socket.on("typing", function(data) {
    if (data != "") {
        status_text.innerHTML = "<p>" + data + " píše zprávu...</p>";
    } else{
        status_text.innerHTML = "";
    }
});

socket.on("isOnline", function(data) {
    console.log(data);

    const elems = users_list.getElementsByTagName("li");
    for (let elem of elems){
        uName = elem.getElementsByTagName("a")[0].innerHTML;
        found = false;
        for (const [key, value] of Object.entries(data)) {
            if (uName == value) {
                elem.setAttribute("class", "online");
                found = true;
                break;
            } 
        }
        if(!found){
            elem.setAttribute("class", "offline");
        }
    }
});    
