const User = require("../models/user");
const passport = require("passport");
const bcrypt = require("bcrypt");
const xss = require("xss");
const jwt = require("jsonwebtoken")

const { getToken, COOKIE_OPTIONS, getRefreshToken, verifyUser } = require("../authenticate");

/*
exports.postRegister = async function (req, res) {
    User.findOne({ email: xss(req.body.email) }, async function (err, data) {
        if (data) {
            return res.send({ message: "Tento uživatel již existuje." });
        }
        try {
            const hashedPassword = await bcrypt.hash(xss(req.body.password), 10);
            const token = getToken({ _id: user._id })
            const refreshToken = getRefreshToken({ _id: user._id })
            let newUser = {
                username: xss(req.body.name),
                id: Date.now().toString(),
                email: xss(req.body.email),
                password: hashedPassword
            }
            User(newUser).save(function (err, data) {
                if (err) {
                    return res.send({ message: "Chyba databáze." });
                }
                return res.send({ message: "Registrace proběhla úspěšně." });
            });
        } catch {
            res.send({ message: "Chyba." });
        }
    });
};
*/

exports.postRegister = function (req, res, next) {
    User.register(
        new User({ username: req.body.username }),
        xss(req.body.password),
        (err, user) => {
            if (err) {
                console.log(err)
                res.statusCode = 500;
                res.send({ message: err });
            } else {
                console.log(user)
                user.firstName = req.body.firstName;
                user.lastName = req.body.lastName || "";
                const token = getToken({ _id: user._id })
                const refreshToken = getRefreshToken({ _id: user._id })
                user.refreshToken.push({ refreshToken });
                user.save((err, user) => {
                    if (err) {
                        res.statusCode = 500
                        res.send({ message: err });
                    } else {
                        res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
                        res.send({ message: "Registrace proběhla úspěšně.", token });
                    }
                })
            }
        }
    )
}

exports.refreshToken = function (req, res, next) {
    const { signedCookies = {} } = req
    const { refreshToken } = signedCookies

    if (refreshToken) {
        try {
            const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
            const userId = payload._id
            User.findOne({ _id: userId }).then(
                user => {
                    if (user) {
                        // Find the refresh token against the user record in database
                        const tokenIndex = user.refreshToken.findIndex(
                            item => item.refreshToken === refreshToken
                        )

                        if (tokenIndex === -1) {
                            res.statusCode = 401
                            res.send("Unauthorized")
                        } else {
                            const token = getToken({ _id: userId })
                            // If the refresh token exists, then create new one and replace it.
                            const newRefreshToken = getRefreshToken({ _id: userId })
                            user.refreshToken[tokenIndex] = { refreshToken: newRefreshToken }
                            user.save((err, user) => {
                                if (err) {
                                    res.statusCode = 500
                                    res.send(err)
                                } else {
                                    res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS)
                                    res.send({ success: true, token })
                                }
                            })
                        }
                    } else {
                        res.statusCode = 401
                        res.send("Unauthorized")
                    }
                },
                err => next(err)
            )
        } catch (err) {
            res.statusCode = 401
            res.send("Unauthorized")
        }
    } else {
        res.statusCode = 401
        res.send("Unauthorized")
    }
};

exports.me = function (req, res, next) {
    res.send(req.user);
};

exports.logout = function (req, res, next) {
    const { signedCookies = {} } = req
    const { refreshToken } = signedCookies
    User.findById(req.user._id).then(
        user => {
            const tokenIndex = user.refreshToken.findIndex(
                item => item.refreshToken === refreshToken
            )

            if (tokenIndex !== -1) {
                user.refreshToken.id(user.refreshToken[tokenIndex]._id).remove()
            }

            user.save((err, user) => {
                if (err) {
                    res.statusCode = 500
                    res.send(err)
                } else {
                    res.clearCookie("refreshToken", COOKIE_OPTIONS)
                    res.send({ success: true })
                }
            })
        },
        err => next(err)
    )
};

