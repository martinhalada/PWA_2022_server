import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

const ChatChats = (props) => {
    const [chats, setChats] = useState([]);

    useEffect(() => {
        const fetchData = () => {
            fetch(process.env.REACT_APP_API_ENDPOINT + "/chat/allChats/" + props.username, {
                method: "GET",
                withCredentials: true,
                credentials: "include",
                headers: { "Content-Type": "application/json" }
            }).then(async (response) => {
                const data = await response.json();
                setChats(data.allChats);
            }).catch((error) => {
                console.log(error);
            });
        }
        fetchData();
    }, [props]);

    const chatClicked = chat => {
        props.currentChat(chat);
    }

    return (
        <div id="listOfUsersDiv" >
            <h3>Chaty:</h3>
            {chats.length > 0 && (
                <ul id="listOfChats">
                    {chats.map(chat => (
                        <li key={chat.id} onClick={() => chatClicked(chat.id)}>
                            {chat.users.length === 2 && chat.users[0] === props.username && (
                                chat.users[1]
                            )}
                            {chat.users.length === 2 && chat.users[0] !== props.username && (
                                chat.users[0]
                            )}
                            {(function() {
                                if (chat.users.length > 2){
                                    let disp = ""
                                    for (let user of chat.users){
                                        disp += user + ", "
                                    }
                                    disp = disp.substring(0, disp.lastIndexOf(","))
                                    return disp
                                }
                            })()}
                            
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ChatChats;