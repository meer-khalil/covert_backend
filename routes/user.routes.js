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


//  Input : email via body;
//  HTTP Success : 200 and message.
//  HTTP Errors : 400,500.
router.route('/password/forgot').post(UserController.forgotPassword);

//  Input : email, password via body;
//  HTTP Success : 200 and message.
//  HTTP Errors : 400,500.
router.route('/password/reset/:token').put(UserController.resetPassword);

module.exports = router;