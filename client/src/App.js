import { useCallback, useContext, useEffect, useState } from "react"
import { UserContext } from "./UserContext"
import { Login } from "./Login";
import { Register } from "./Register";
import { Chat } from "./Chat";
import "./styles.css";

function App() {
    const [activeForm, setActiveForm] = useState("login");
    const [userContext, setUserContext] = useContext(UserContext);

    const toggle_login_register = (formName) => {
        setActiveForm(formName);
    }

    const verifyUser = useCallback(() => {
        fetch(process.env.REACT_APP_API_ENDPOINT +"/user/refreshToken", {
            method: "POST",
            withCredentials: true,
            credentials: "include",
            headers: { "Content-Type": "application/json" },
        }).then(async response => {
            if (response.ok) {
                const data = await response.json()
                setUserContext(oldValues => {
                    return { ...oldValues, token: data.token }
                })
            } else {
                setUserContext(oldValues => {
                    return { ...oldValues, token: null }
                })
            }
            // call refreshToken every 5 minutes to renew the authentication token.
            setTimeout(verifyUser, 5 * 60 * 1000)
        })
    }, [setUserContext])

    useEffect(() => {
        verifyUser()
    }, [verifyUser])

    // Sync logout across tabs
    const syncLogout = useCallback(event => {
        if (event.key === "logout") {
            window.location.reload()
        }
    }, [])

    useEffect(() => {
        window.addEventListener("storage", syncLogout)
        return () => {
            window.removeEventListener("storage", syncLogout)
        }
    }, [syncLogout])

    return userContext.token === null ? (
        <div id="login_register_div">
            {
                activeForm === "login" ? <Login switchForm={toggle_login_register} /> : <Register switchForm={toggle_login_register} />
            }
        </div>
    ) : userContext.token ? (
        <Chat />
    ) : (
        <div id="login_register_div">
            {
                activeForm === "login" ? <Login switchForm={toggle_login_register} /> : <Register switchForm={toggle_login_register} />
            }
        </div>
    )
}

export default App;