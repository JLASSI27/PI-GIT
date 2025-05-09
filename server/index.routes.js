const express = require('express');
const router = express.Router();
const { User } = require("./Models/User/user.model");
const userRouter = require("./Routes/User/user.router");
const adminRouter = require("./Routes/User/admin.router");
const organisateurRouter = require("./Routes/User/organisateur.router");
const authRouter = require("./Routes/User/auth.router");
const passport = require("passport");
const session = require("express-session");
const jwt = require('jsonwebtoken');

router.use('/user', userRouter);
router.use('/admin', adminRouter);
router.use('/organisateur', organisateurRouter);
router.use('/', authRouter);

router.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false },
    })
);
router.use(passport.initialize());
router.use(passport.session());

router.get('/auth/google',
    passport.authenticate('google', { scope: ['email'] })
);

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

router.get(
    '/google/callback',
    passport.authenticate('google', { session: true, failureRedirect: '/auth/failure' }),
    async (req, res) => {
        const user = req.user;
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        res.redirect(`http://localhost:4200/auth/callback?token=${encodeURIComponent(token)}&role=${encodeURIComponent(user.role)}`);
    }
);

router.get('/auth/failure', (req, res) => {
    res.redirect('http://localhost:4200/login?error=Échec de l\'authentification Google');
});

router.get('/protected', (req, res) => {
    res.send('Protected content');
});

module.exports = router;