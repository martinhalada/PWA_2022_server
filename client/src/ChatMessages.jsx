import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

const ChatMessages = (props) => {
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState("");
    const [isUserTyping, setIsUserTyping] = useState(false);

    useEffect(() => {
        const fetchData = () => {
            fetch(process.env.REACT_APP_API_ENDPOINT + "/chat/getChat/" + props.chatId, {
                method: "GET",
                withCredentials: true,
                credentials: "include",
                headers: { "Content-Type": "application/json" }
            }).then(async (response) => {
                const data = await response.json();
                setMessages(data);
            }).catch((error) => {
                console.log(error);
            });
        }
        if (props.chatId !== "") {
            fetchData();
        }
    }, [props]);

    const handleSubmit = (event) => {
        event.preventDefault();

        props.socket.emit("chat", {
            message: currentMessage,
            send_user: props.username,
            chatRoom: props.chatId
        });

        document.getElementById("send_form").reset();
    }

    const handleMessageInput = (e) => {
        setCurrentMessage(e.target.value);

        if (isUserTyping == false) {
            props.socket.emit("typing", {
                currentUser: props.username,
                chatRoom: props.chatId
            });
            setIsUserTyping(true);
            clearStatus();
        }
    }

    function clearStatus() {
        setTimeout(function() {
            setIsUserTyping(false);
            props.socket.emit("typing", {
                currentUser: "",
                chatRoom: props.chatId
            });
        }, 5000);
    }

    // listen for events
    useEffect(() => {
        props.socket.on("chat", function (data) {
            const messages_list = document.getElementById("listOfMessages");
            if (data.send_user == props.username) {
                messages_list.innerHTML += "<li class=\"right\"><label>" + data.send_user + ": " + data.message + "</label></li>";
            } else {
                messages_list.innerHTML += "<li class=\left\"><label>" + data.send_user + ": " + data.message + "</label></li>";
            }
        });
    }, [props.socket]);

    useEffect(() => {
        if (messages.messages == null) return;
        const messages_list = document.getElementById("listOfMessages");
        messages_list.innerHTML = "";
        for (let m of messages.messages) {
            if (m.sender == props.username) {
                messages_list.innerHTML += "<li class=\"right\"><label>" + m.sender + ": " + m.message + "</label></li>";
            } else {
                messages_list.innerHTML += "<li class=\left\"><label>" + m.sender + ": " + m.message + "</label></li>";
            }
        }
    }, [messages]);

    useEffect(() => {
        if (isUserTyping) {
            const status_text = document.getElementById("statusDiv");
            props.socket.on("typing", function(data) {
                if (data.currentUser != "") {
                    status_text.innerHTML = "<p>" + data.currentUser + " píše zprávu...</p>";
                } else{
                    status_text.innerHTML = "";
                }
            });
        }
    }, [isUserTyping]);

    if (props.chatId !== ""){
        return (
            <div id="listOfMessagesDiv">
                <h3>Chat id: {props.chatId}</h3>
                <ul id="listOfMessages">
                </ul>
                <div id="statusDiv"></div>
                <div id="sendDiv">
                    <form id="send_form" onSubmit={handleSubmit}>
                        <input id="message-input" onChange={handleMessageInput} type="text" placeholder="Sem napiš zprávu" required />
                        <button id="send_btn" className="btn btn-success">Odeslat</button>
                    </form>
                </div>
            </div>
        );
    } else {
        return (
            <div id="listOfMessagesDiv" />
        );
    }
}

export default ChatMessages;