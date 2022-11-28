import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { Select } from "antd";

const ChatGroupChats = (props) => {
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

    return (
        <div id="GroupChat">
            <h3>Nastavení skupinového chatu</h3>
            {users.length > 0 && (
                <div id="selectUsers">
                    <Select mode="multiple" style={{ width: 120 }}>
                        {users.map(user => (
                            <Select.Option key={user.username} value={user.username}>{user.username}</Select.Option>
                        ))}
                    </Select>
                </div>
            )}
        </div>
    );
}

export default ChatGroupChats;