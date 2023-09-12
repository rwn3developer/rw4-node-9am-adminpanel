const passport = require('passport');

const passportLocal = require('passport-local').Strategy;

const registerTbl = require('../models/registerTbl');

passport.use(new passportLocal({
    usernameField : 'email'
},async(email,password,done)=>{
    try{
        let user = await registerTbl.findOne({email : email});
       
        if(!user || user.password != password){
            console.log("Email and Password not valid");
            return done(null,false);
        }
        return done(null,user);

    }catch(err){
        console.log(err);
        return false;
    }
}))

passport.serializeUser((user,done)=>{
    return done(null,user.id);
})

passport.deserializeUser((id,done)=>{
    registerTbl.findById(id).then((user)=>{
        return done(null,user);
    }).catch((err)=>{
        console.log(err);
        return false;
    })
})

passport.checkAuthentication = (req,res,next) => {
    if(req.isAuthenticated()){
        return next();
    }
    return res.redirect('/');   
}

passport.setAuthentication = (req,res,next) => {
    if(req.isAuthenticated()){
        res.locals.users = req.user;  
    }
    return next();
}

module.exports = passport;