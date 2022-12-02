import React, { useState, useEffect, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { UserContext } from "./UserContext";

export const Register = (props) => {
    const [username, setUsername] = useState();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [message, setMessage] = useState("");
    const [userContext, setUserContext] = useContext(UserContext);

    const submitForm = function (e) {
        e.preventDefault();

        fetch(process.env.REACT_APP_API_ENDPOINT + "/user/register", {
            method: "POST",
            withCredentials: true,
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: username, email: email, password: password }),
        })
            .then(async (response) => {
                if (!response.ok) {
                    if (response.status === 400) {
                        setMessage("Please fill all the fields correctly!");
                    } else if (response.status === 401) {
                        setMessage("Invalid email and password combination.");
                    } else if (response.status === 500) {
                        const data = await response.json();
                        if (data.message) setMessage(data.message);
                    } else {
                        setMessage("error");
                    }
                } else {
                    const data = await response.json();
                    setMessage(data.message);
                    setUserContext((oldValues) => {
                        return { ...oldValues, token: data.token };
                    });
                }
            })
            .catch((error) => {
                setMessage("error");
            });

        document.getElementById("register_form").reset();
    }

    useEffect(() => {
        setMessage(message);
    }, [message])

    return (
        <div id="register_div">
            <h1>Vytvořit nový účet</h1>
            <p>{message}</p>
            <form id="register_form" className="form-horizontal" onSubmit={submitForm}>
                <div className="form-group form-inline">
                    <label htmlFor="username" className="col-sm-1 control-label">Uživatelské jméno</label>
                    <div className="col-sm-5">
                        <input onChange={(e) => setUsername(e.target.value)} type="username" className="form-control" id="username" name="username" required placeholder="Uživatelské jméno" />
                    </div>
                </div>
                <div className="form-group form-inline">
                    <label htmlFor="email" className="col-sm-1 control-label">Email</label>
                    <div className="col-sm-5">
                        <input onChange={(e) => setEmail(e.target.value)} type="email" className="form-control" id="email" name="email" required placeholder="Email" />
                    </div>
                </div>
                <div className="form-group form-inline">
                    <label htmlFor="password" className="col-sm-1 control-label">Heslo</label>
                    <div className="col-sm-5">
                        <input onChange={(e) => setPassword(e.target.value)} type="password" className="form-control" id="password" name="password" required placeholder="Heslo" />
                    </div>
                </div>
                <div className="form-group form-inline">
                    <div className="col-sm-offset-2 col-sm-10">
                        <button type="submit" className="btn btn-success">Zaregistrovat</button>
                    </div>
                </div>
            </form>
            <div className="form-group form-inline">
                <div className="col-sm-offset-2 col-sm-10">
                    <button className="btn btn-primary" onClick={() => props.switchForm("login")}>Přihlášení</button>
                </div>
            </div>
        </div>
    );
}
