const mongoose = require("mongoose")

const ComplaintSchema = new mongoose.Schema({
    email: {
        type:String,
    },
    userName:{
        type:String,
    },
    complaintId:{
        type:String,
    },
    complaintStatus: {
        type:String,
        default: "Active"
    },
    ComplaintType:{
        type: String,
    },
    ComplaintDescription:{
        type:String,
    },
    ComplaintJurisdiction:{
        type:String,
    },
    closingRemarks:{
        type:String,
    }
})

const Complaint = mongoose.model('Complaint',ComplaintSchema,'complaints');
module.exports = Complaint