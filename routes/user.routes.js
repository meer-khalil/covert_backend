const { Router } = require("express");
const UserController = require("../controllers/user.controllers");

const router = Router();

router.get("/", UserController.getUser);

//  Input : firstName, lastName, email, password via body;
//  HTTP Success : 200 and message.
//  HTTP Errors : 400,500.
router.post("/register", UserController.createUser);


//  Input : email, password via body;
//  HTTP Success : 200 and message.
//  HTTP Errors : 400,500.
router.post("/login", UserController.loginUser);
module.exports = router;