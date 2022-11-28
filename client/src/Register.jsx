import React, { useState, useEffect, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { UserContext } from "./UserContext";

export const Register = (props) => {
    const [firstName, setFirstName] = useState();
    const [lastName, setLastName] = useState();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [response] = useState("");
    const [message, setMessage] = useState("");
    const [setUserContext] = useContext(UserContext);
    const [setError] = useState("");

    const submitForm = function (e) {
        e.preventDefault();

        fetch(process.env.REACT_APP_API_ENDPOINT + "/register", {
            method: "POST",
            withCredentials: true,
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ firstName, lastName, username: email, password }),
        })
            .then(async (response) => {
                if (!response.ok) {
                    if (response.status === 400) {
                        setError("Please fill all the fields correctly!");
                    } else if (response.status === 401) {
                        setError("Invalid email and password combination.");
                    } else if (response.status === 500) {
                        console.log(response);
                        const data = await response.json();
                        if (data.message) setError(data.message);
                    } else {
                        setError("error");
                    }
                } else {
                    const data = await response.json();
                    setUserContext((oldValues) => {
                        return { ...oldValues, token: data.token };
                    });
                }
            })
            .catch((error) => {
                setError("error");
            });


        document.getElementById("register_form").reset();
    }

    useEffect(() => {
        setMessage(response);
    }, [response]);


    return (
        <div id="register_div">
            <h1>Vytvořit nový účet</h1>
            <p>{message}</p>
            <form id="register_form" className="form-horizontal" onSubmit={submitForm}>
                <div className="form-group form-inline">
                    <label htmlFor="firstname" className="col-sm-1 control-label">Jméno</label>
                    <div className="col-sm-5">
                        <input onChange={(e) => setFirstName(e.target.value)} type="text" className="form-control" id="firstname" name="firstname" required placeholder="Jméno" />
                    </div>
                </div>
                <div className="form-group form-inline">
                    <label htmlFor="lastname" className="col-sm-1 control-label">Příjmení</label>
                    <div className="col-sm-5">
                        <input onChange={(e) => setLastName(e.target.value)} type="text" className="form-control" id="lastname" name="lastname" required placeholder="Příjmení" />
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
