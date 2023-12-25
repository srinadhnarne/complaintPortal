const express = require('express')
const app = express();
const cors = require('cors');
const User = require("./models/userLogin.js")
const Complaint = require("./models/complaintData.js")
const Resources = require("./models/Resources.js")
require("dotenv").config
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken')

//Database Integration
require("./mongodb.js")

app.use(express.json())
app.use(cors())

function authenticateToken(req,res,next){
    const token = req.headers.authorization.split(' ')[1];
    if(!token) return res.status(401).json({message: 'Auth Error'});
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY);
        if(req.body.id && decoded.id!==req.body.id) {
            return res.status(401).json({message: 'Auth Error'});
        }
        next();
    }
    catch(err){
        console.log(err);
        return res.json(err);
    }
};

app.get('/userData',authenticateToken,async (req,res)=>{
    const id = req.body.id;
    const data = User.findOne({id});
    res.json(data);
})

app.get('/resources',async (req,res)=>{
    const query = req.body.queryType;
    const data = await Resources.find({query});
    res.json(data);
    // console.log(req.body);
    // console.log(data);
})

app.get('/complaints',authenticateToken,async (req,res)=>{
    // console.log(req.query);
    // const id = req.body.id;
    const email = req.query.email;
    const userType = req.query.userType;
    const ComplaintJurisdiction = req.query.Jurisdiction;
    const complaintStatus = req.query.complaintStatus;
    // console.log(ComplaintJurisdiction);
    if(userType==='Student'){
        const data = await Complaint.find({email,complaintStatus});
        res.json(data);
    } else {
        const data = await Complaint.find({complaintStatus,ComplaintJurisdiction});
        res.json(data);
    }
})

app.post("/login",async (req,res)=>{
    const email = req.body.email;
    const password = req.body.password;
    const operator = req.body.operator;
    const existingUser = await User.findOne({email,operator});
    // console.log(existingUser);
    if(existingUser){
        const isPasswordCorrect = await bcrypt.compare(password,existingUser.password);
        existingUser.password = undefined;
        if(isPasswordCorrect) {
            const token = jwt.sign({id: existingUser._id},process.env.JWT_SECRET_KEY,{expiresIn: '1h'});
            res.status(201).json({existingUser,token,message:"User Login Successful"});
        }
        else{
            res.status(401).json({message : "Invalid Password"});
        }
    }
    else {
        res.status(409).json({message : "User doesn't exist"})
    }
})

app.post("/signup",async (req,res)=>{
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    let operator = req.body.operator;
    const existingUser = await User.findOne({email});
    if(existingUser){
        res.status(409).json({message : "User already exist"})
    }
    else {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password,salt);
        // console.log(hashedPass);
        let newUser = new User({
            name,
            email,
            password:hashedPass,
            operator
        });
        if(operator!=='Student'){
            const temp = operator;
            operator = operator.split(",")[0];
            const jurisdiction = temp.split(", ")[1];
            newUser = new User({
                name,
                email,
                password:hashedPass,
                operator,
                jurisdiction
            });
        }
        await newUser.save();
        res.status(201).json({message: "New User Registered"});
    }
})

app.post("/newComplaint",async (req,res)=>{
    const email=req.body.email;
    const userName=req.body.userName;
    const complaintId=req.body.complaintId;
    const complaintStatus='Active';
    const ComplaintType=req.body.ComplaintType;
    const  ComplaintDescription=req.body.ComplaintDescription;
    const  ComplaintJurisdiction=req.body.ComplaintJurisdiction;
    const existingComplaint = await Complaint.findOne({userName:userName,ComplaintJurisdiction:ComplaintJurisdiction,ComplaintType:ComplaintType,complaintStatus:'Active'});
    console.log(existingComplaint);
    if(!existingComplaint){
        const newComplaint = new Complaint({
            email:email,
            userName:userName,
            complaintId:complaintId,
            ComplaintType:ComplaintType,
            complaintStatus:complaintStatus,
            complaintId:complaintId,
            ComplaintDescription:ComplaintDescription,
            ComplaintJurisdiction:ComplaintJurisdiction,
        })
        await newComplaint.save();
        res.status(201).json({message: "New Complaint Registered"});
    } else {
        res.json({message: 'Active Complaints of same kind. Please contact your Respective Administration'});
    }
})

app.post("/closeComplaint",async (req,res)=>{
    // console.log(req.body);
    const complaintId=req.body.id;
    const complaintStatus = req.body.complaintStatus;
    const closingRemarks = req.body.closingRemarks;
    // console.log(Date.now());
    await Complaint.findOneAndUpdate({complaintId:complaintId},
        {"$set":{
            complaintStatus:complaintStatus,
            closingRemarks:closingRemarks,
        }},{}
        )
    const complaintUser=await Complaint.findOne({complaintId:complaintId});
    console.log(complaintUser);
    // console.log();
})

app.listen(5000,()=>{
    console.log("Port Connected");

})


// // Registering new User
// const existingUser = await User.findOne({email});
//     if(existingUser){
//         return res.status(409).json({message: "User already Exists!!"})
//     }
//     const salt = await bcrypt.genSalt(10);
//     const hashedPass = await bcrypt.hash(password,salt);
//     // console.log(hashedPass);
//     const newUser = new User({
//         email,
//         password:hashedPass,
//         operator
//     });
//     await newUser.save();
//     res.status(201).json({message: "New User Registered"});  