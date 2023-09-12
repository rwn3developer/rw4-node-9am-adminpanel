const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1/passportlogin");

const db = mongoose.connection;

db.on('connected',(err)=>{
    if(err){
        console.log("DB not connect");
    }
    console.log("DB is connected");
})


module.exports = db;