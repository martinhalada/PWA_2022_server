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
            body: JSON.stringify({currentUser: props.username, secondUser: username})
        })
    }

    return (
        <div id="listOfUsersDiv" >
            <h3>Uživatelé:</h3>
            {users.length > 0 && (
                <ul id="listOfUsers">
                    {users.map(user => (
                        <li key={user.username} onClick={() => userClicked(user.username)}>
                            {user.firstName} {user.lastName}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ChatUsers;