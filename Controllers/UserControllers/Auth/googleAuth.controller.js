var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const passport=require('passport');
const {User} = require("../../../Models/User/user.model");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');
passport.use(new GoogleStrategy({
        clientID:     process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/google/callback",
        passReqToCallback   : true
    },
    async function(request, accessToken, refreshToken, profile, done) {
    try{
        let user = await User.findOne({ email: profile.email });
        if (!user) {
            user = await User.create({
                email: profile.email,
                password: uuidv4(),
                firstName: profile.given_name || 'Unknown',
                lastName: profile.family_name || 'User',
                number:profile.number || "98765432",
            });
        }
        const token = jwt.sign({ id: user._id  }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return done(null, user, { token });
    }catch (e){
        console.error('Error in Google Strategy:', e);
        return done(e, null);
    }
    }
));
