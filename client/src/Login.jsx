import React, { useState, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { UserContext } from "./UserContext";
import "./styles.css";

export const Login = (props) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [userContext, setUserContext] = useContext(UserContext);

    const submitForm = function (e) {
        e.preventDefault();

        fetch(process.env.REACT_APP_API_ENDPOINT + "/user/login", {
            method: "POST",
            withCredentials: true,
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: email, password: password }),
        })
            .then(async (response) => {
                if (!response.ok) {
                    if (response.status === 400) {
                        setMessage("Please fill all the fields correctly!");
                    } else if (response.status === 401) {
                        setMessage("Invalid email and password combination.");
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

        document.getElementById("login_form").reset();
    }

    return (
        <div id="login_div">
            <h1>Přihlášení</h1>
            <p>{message}</p>
            <form id="login_form" className="form-horizontal" onSubmit={submitForm}>
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
                        <button type="submit" className="btn btn-success">Přihlásit se</button>
                    </div>
                </div>
            </form>
            <div className="form-group form-inline">
                <div className="col-sm-offset-2 col-sm-10">
                    <button className="btn btn-primary" onClick={() => props.switchForm("register")}>Vytvořit nový účet</button>
                </div>
            </div>
        </div>
    )
}