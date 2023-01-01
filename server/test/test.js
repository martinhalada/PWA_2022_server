const { expect } = require('chai');
const request = require('supertest');
const app = require("../app");
const mongoose = require("mongoose")

beforeAll(done => {
    done()
})
  
afterAll(done => {
    // Closing the DB connection allows Jest to exit successfully.
    mongoose.connection.close()
    done()
})

describe("Registration", () => {
    it("try to create a new user", async () => {
        const res = await request(app)
            .post("/user/register")
            .send({
                username: "martin",
                email: "a@a",
                password: "aaaaaaaaaaaa"
            });
        expect(res.body).to.have.property("message","Tento uživatel již existuje.")
    });
});

describe("Login with wrong password", () => {
    it("login existing user", async () => {
        const res = await request(app)
            .post("/user/login")
            .send({
                username: "martin",
                email: "a@a",
                password: "aa"
            });
        expect(res.body).to.have.property("message","Heslo musí mít alespoň 12 znaků.")
    });
});

describe("Login with wrong password 2", () => {
    it("login existing user", async () => {
        const res = await request(app)
            .post("/user/login")
            .send({
                username: "a@a",
                password: "randomheslo123456"
            });
        expect(res.statusCode).equals(401)
    });
});

describe("Login success", () => {
    it("login existing user", async () => {
        const res = await request(app)
            .post("/user/login")
            .send({
                username: "a@a",
                password: "aaaaaaaaaaaa"
            });
        expect(res.statusCode).equals(200)
    });
});

describe("Get all chats", () => {
    it("Get all chats for current user", async () => {
        const res = await request(app)
            .get("/chat/allChats/a@a")
        expect(res.statusCode).equals(200)
    });
});

describe("Get all messages for current chat room", () => {
    it("Get all messages for current chat room", async () => {
        const res = await request(app)
            .get("/chat/getChat/123")
        expect(res.statusCode).equals(200)
    });
});

describe("Get all users", () => {
    it("get list of all users except current", async () => {
        const res = await request(app)
            .get("/user/allUsers/martin")
        expect(res.statusCode).equals(200)
    });
});

describe("Get new token", () => {
    it("get new refresh token", async () => {
        const res = await request(app)
            .post("/user/refreshToken")
        expect(res.statusCode).equals(401)
    });
});

describe("get user info", () => {
    it("get user info", async () => {
        const res = await request(app)
            .get("/user/me")
        expect(res.statusCode).equals(401)
    });
});

describe("Logout", () => {
    it("logout current user", async () => {
        const res = await request(app)
            .get("/user/logout")
        expect(res.statusCode).equals(401)
    });
});