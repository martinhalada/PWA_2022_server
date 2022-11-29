import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { Select } from "antd";

const ChatGroupChats = (props) => {
    const [users, setUsers] = useState([]);
    const [selected, setSelected] = useState(null);

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

    const handleChange = (value) => {
        let selected = JSON.stringify(value);
        selected = selected.replace("[","").replace("]","");
        selected = selected.replaceAll("\"","");
        selected = selected.split(",");
        selected.push(props.username);
        setSelected(selected);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selected.length < 2){
            return;
        }

        fetch(process.env.REACT_APP_API_ENDPOINT + "/groupChat", {
            method: "POST",
            withCredentials: true,
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ users: selected }),
        })
    };

    return (
        <div id="GroupChat">
            <h3>Nastavení skupinového chatu</h3>
            <p></p>
            <h4>Vytvoření nového skupinového chatu</h4>
            {users.length > 0 && (
                <div id="selectUsers">
                    <form id="groupChatForm" onSubmit={handleSubmit}>
                        <Select mode="multiple" onChange={(value) => handleChange(value)} placeholder="Vyber alespoň tři uživatele" style={{ width: 320 }}>
                            {users.map(user => (
                                <Select.Option key={user.username} value={user.username}>{user.username}</Select.Option>
                            ))}
                        </Select>
                        <button type="submit" className="btn btn-success">Založit chat</button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default ChatGroupChats;