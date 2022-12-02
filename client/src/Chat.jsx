import React, { useCallback, useContext, useEffect, useState } from "react"
import { UserContext } from "./UserContext"
import ChatUsers from "./ChatUsers"
import ChatChats from "./ChatChats"
import { FaUsers, FaComments } from 'react-icons/fa';
import ChatMessages from "./ChatMessages"
import socketIO from "socket.io-client"
import ChatGroupChats from "./ChatGroupChats"

const socket = socketIO.connect("http://localhost:3001");
export const Chat = () => {
    const [userContext, setUserContext] = useContext(UserContext)
    const [usersOrChats, setUsersOrChats] = useState("users");
    const [messagesOrGroup, setMessagesOrGroup] = useState("messages");
    const [currentChat, setCurrentChat] = useState("");
    const [usersOnline, setUsersOnline] = useState(null);

    useEffect(() => {
        if (userContext.details) {
            socket.emit("isOnline", {
                currentUser: userContext.details.username
            });
        }
    }, [userContext.details]);

    const fetchUserDetails = useCallback(() => {
        fetch(process.env.REACT_APP_API_ENDPOINT + "/user/me", {
            method: "GET",
            withCredentials: true,
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userContext.token}`,
            },
        }).then(async response => {
            if (response.ok) {
                const data = await response.json()
                setUserContext(oldValues => {
                    return { ...oldValues, details: data }
                })
            } else {
                if (response.status === 401) {
                    // Edge case: when the token has expired.
                    // This could happen if the refreshToken calls have failed due to network error or
                    // User has had the tab open from previous day and tries to click on the Fetch button
                    window.location.reload()
                } else {
                    setUserContext(oldValues => {
                        return { ...oldValues, details: null }
                    })
                }
            }

        })
    }, [setUserContext, userContext.token])

    useEffect(() => {
        if (!userContext.details) {
            fetchUserDetails()
        }
    }, [userContext.details, fetchUserDetails])

    const logoutHandler = () => {
        fetch(process.env.REACT_APP_API_ENDPOINT + "/user/logout", {
            withCredentials: true,
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userContext.token}`,
            },
        }).then(async response => {
            setUserContext(oldValues => {
                return { ...oldValues, details: undefined, token: null }
            })
            window.localStorage.setItem("logout", Date.now())
        })
    }

    const toggleUsersChats = () => {
        if (usersOrChats === "users") {
            setUsersOrChats("chats")
        } else {
            setUsersOrChats("users");
        }
    }

    const toggleGroupChat = () => {
        if (messagesOrGroup === "messages") {
            setMessagesOrGroup("group")
        } else {
            setMessagesOrGroup("messages");
        }
    }

    const handleCurrentChat = (currentChatId) => {
        setCurrentChat(currentChatId);
        socket.emit("joinRoom", {
            chatRoom: currentChatId
        });
    }

    const handleUsersOnline = (onlineUsers) => {
        setUsersOnline(onlineUsers);
    }

    return userContext.details === null ? (
        "Error Loading User details"
    ) : !userContext.details ? (
        <div></div>
    ) : (
        <div id="main_div">
            <div id="main_options">
                <h1>Chat</h1>
                <h3>Přihlášený uživatel: {userContext.details.username}</h3>
                <button id="logout_btn" onClick={logoutHandler} className="btn btn-primary">Odhlásit se</button>
            </div>
            <div id="options">
                <button id="chatBtn" onClick={toggleUsersChats} title="Přepnout zobrazení uživatelé/chaty" type="button" className="btn btn-default btn-sm">
                    <FaComments size={40} />
                </button>
                <button id="usersBtn" onClick={toggleGroupChat} type="button" title="Nastavení skupinového chatu" className="btn btn-default btn-sm">
                    <FaUsers size={45} />
                </button>
            </div>
            <div id="chat">
                {usersOrChats === "users" && (
                    <ChatUsers socket={socket} username={userContext.details.username} usersOnline={handleUsersOnline} isOnline={usersOnline} />
                )}
                {usersOrChats === "chats" && (
                    <ChatChats username={userContext.details.username} currentChat={handleCurrentChat} />
                )}
                {messagesOrGroup === "messages" && (
                    <ChatMessages socket={socket} username={userContext.details.username} chatId={currentChat} />
                )}
                {messagesOrGroup === "group" && (
                    <ChatGroupChats username={userContext.details.username} />
                )}
            </div>
        </div>
    )
}
