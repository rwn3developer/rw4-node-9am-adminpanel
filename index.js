const express = require('express');

const port = 9000;

const app = express();

const path = require('path');

app.set('view engine','ejs');

const db = require('./config/database')

app.use(express.static(path.join(__dirname,'public')));

const passport = require('passport');
const passportLocal = require('./config/passport-local-strategy');
const session = require('express-session');

app.use(session({
    name : 'milansir',
    secret : 'rnw4',
    saveUninitialized : true,
    resave : true,
    cookie : {
        maxAge : 1000*60*60
    }
}))

app.use(express.urlencoded());

app.use(passport.initialize());
app.use(passport.session()); 
app.use(passport.setAuthentication);

app.use('/uploads',express.static(path.join(__dirname,'/uploads')));

app.use('/',require('./routes'));

app.listen(port,(err)=>{
    if(err){
        console.log(err);
        return false;
    }
    console.log("server is start :- "+port);
})