const mongoose = require("mongoose")

const ResourcesSchema = new mongoose.Schema({
    userCategory:{
        type:String,
    },
    complaintType:{
        type:String,
    },

})

const Resources = mongoose.model('Resources',ResourcesSchema,'resources');
module.exports = Resources