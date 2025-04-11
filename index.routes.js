const express = require('express');
const router = express.Router();
const {User} = require("./Models/User/user.model");
const userRouter = require("./Routes/User/user.router");
const adminRouter = require("./Routes/User/admin.router");
const organisateurRouter = require("./Routes/User/organisateur.router");
const authRouter = require("./Routes/User/auth.router");

const passport = require("passport");
const session = require("express-session");
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
router.use(passport.session())
router.get('/auth/google',
    passport.authenticate('google', { scope:
            [ 'email' ] },
    ));
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
    (req, res) => {
        const token = req.authInfo.token;
        res.status(200).json({
            message: 'Authenticated successfully',
            token,
        });
    }
);
router.get('/auth/failure',(req,res)=>{
    res.status(401).send('Not Found');
})
router.get('/protected', (req, res) => {
    res.send('Protected content');
});

module.exports= router;
