import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

const ChatUsers = (props) => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchData = () => {
            fetch(process.env.REACT_APP_API_ENDPOINT + "/allUsers/" + props.username, {
                method: "GET",
                withCredentials: true,
                credentials: "include",
                headers: { "Content-Type": "application/json" }
            }).then(async (response) => {
                const data = await response.json();
                setUsers(data.allUsers);
            }).catch((error) => {
                console.log(error);
            });
        }
        fetchData();
    }, [props]);

    const userClicked = username => {
        fetch(process.env.REACT_APP_API_ENDPOINT + "/createChatRoom", {
            method: "POST",
            withCredentials: true,
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentUser: props.username, secondUser: username })
        })
    }

    function setClass(data) {
        if (!document.getElementById("listOfUsers")) return;
        let users_list = document.getElementById("listOfUsers");
        if (users_list.childNodes.length == 0) return;
        const elems = users_list.getElementsByTagName("li");
        for (let elem of elems) {
            let uName = elem.id;
            let found = false;
            for (const [key, value] of Object.entries(data)) {
                if (uName == value) {
                    elem.setAttribute("class", "online");
                    found = true;
                    break;
                }
            }
            if (!found) {
                elem.setAttribute("class", "offline");
            }
        }
    }

    // listen for events
    useEffect(() => {
        props.socket.on("isOnline", function (data) {
            props.usersOnline(data);
            setClass(data);
        });
    }, [props.socket]);


    useEffect(() => {
        setClass(props.isOnline);       
    }, [users])


    return (
        <div id="listOfUsersDiv" >
            <h3>Uživatelé:</h3>
            {users.length > 0 && (
                <ul id="listOfUsers">
                    {users.map(user => (
                        <li id={user.username} key={user.username} onClick={() => userClicked(user.username)}>
                            {user.firstName} {user.lastName}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ChatUsers;