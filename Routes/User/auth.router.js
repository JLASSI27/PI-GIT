const express = require('express');
const router = express.Router();
const loginController = require('../../Controllers/UserControllers/Auth/login.controller');
const userRegisterController = require('../../Controllers/UserControllers/user/userRegister.controller');
const organisateurRegisterController = require('../../Controllers/UserControllers/organisateur/organisateurRegister.controller');
const {verifyEmail} = require("../../Controllers/UserControllers/Auth/mailVerification.controller");
const codeVerification = require('../../Controllers/UserControllers/Auth/verificationCode.controller');
const {forgotPassword,changePassword} = require('../../Controllers/UserControllers/Auth/forgotPassword.controller');
router.post('/login', loginController);
router.get('/verify',verifyEmail)
router.post('/userRegister', userRegisterController);
router.post('/organisateurRegister', organisateurRegisterController);
router.post('/verifyCode', codeVerification);
router.post('/resetPassword', forgotPassword);
router.get('/reset-password/:token', changePassword);

module.exports = router;