const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/minproject');

const userSchema = mongoose.Schema({
    username : String,
    email : String,
    password : String,  
    post : [
        {type : mongoose.Schema.Types.ObjectId , ref : "post"}
    ],
    profilepic : { type : String , default : "default_img.webp"}
})

module.exports = mongoose.model("user",userSchema);