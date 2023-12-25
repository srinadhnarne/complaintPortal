const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true,
    },
    email: {
        type:String,
        match: /^\S+@+nitjsr+\.+ac+\.+in/,
        unique: true,
    },
    password: {
        type:String,
        required: true,
    },
    operator: {
        type:String,
    },
    jurisdiction:{
        type:String,
    },
})

const User = mongoose.model("User",UserSchema,'users')
module.exports = User