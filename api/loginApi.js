const express = require('express')
const fs = require('node:fs')

const loginApi = express.Router();

const fileName = 'auth.json'

const readData = ()=>{
    if(!fs.existsSync(fileName)){
        return [];
    }
    let data = fs.readFileSync(fileName, {encoding: 'utf8'})
        return JSON.parse(data);
    }

// const writeData = (data)=>{
//     fs.writeFileSync(fileName, JSON.stringify(data, null, 2), { encoding: 'utf-8' })
// }

loginApi.post('/', (req, res)=>{
    const {emailId, password} = req.body;
    let users = readData();
    // console.log("Users",users);
    // console.log("emailId",emailId);

    let user = users.find(user => user.emailId === emailId);

    if (!user) {
        return res.status(400).json({
            "From": "loginApi",
            "Method": "POST",
            "Status": "Login Failed",
            "StatusCode": 400,
            "Message": 'Invalid email.'
        });
    }

    // Validate the password
    if (user.password !== password) {
        return res.status(400).json({
            "From": "loginApi",
            "Method": "POST",
            "Status": "Login Failed",
            "StatusCode": 400,
            "Message": 'Invalid password.'
        });
    }

    // If email and password match, return success response
    return res.status(200).json({
        "From": "loginApi",
        "Method": "POST",
        "Status": "Login Successful",
        "StatusCode": 200,
        "Message": 'Login successfully.'
    });
    
})

module.exports = loginApi