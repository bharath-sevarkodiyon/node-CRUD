const express = require('express');
const fs = require('node:fs')
const signUp = express.Router();

const fileName = 'auth.json'

const readData = ()=>{
    if(!fs.existsSync(fileName)){
        return [];
    }
    let data = fs.readFileSync(fileName, {encoding: 'utf8'})
        return JSON.parse(data);
}

const writeData = (data)=>{
    fs.writeFileSync(fileName, JSON.stringify(data, null, 2), { encoding: 'utf-8' })
}


signUp.post('/', (req, res)=>{
    const emailId = req.body.emailId.toLowerCase();
    const password = req.body.password;
    
    // to find the user file length to create a unique id
    let users = readData();

    const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    // Validate emailId is not empty
    if (!emailId || emailId.trim() === '' || !emailFormat.test(emailId)) {
        return res.status(400).json({
            "From": "signUpApi",
            "Method": "POST",
            "Status": "Data Not Updated",
            "StatusCode": 400,
            "Message": 'Invalid or empty email. Please provide a valid email address.'
        });
    }

    // Validate password is not empty
    if (!password || password.trim() === '' || !passwordFormat.test(password)) {
        return res.status(400).json({
            "From": "signUpApi",
            "Method": "POST",
            "Status": "Data Not Updated",
            "StatusCode": 400,
            "Message": 'Invalid or empty password. Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, one number, and one special character.'
        });
    }

    // Check if emailId is unique
    const emailExists = users.some(user => user.emailId === emailId);
    if (emailExists) {
        return res.status(400).json({
            "From": "signUpApi",
            "Method": "POST",
            "Status": "Data Not Created",
            "StatusCode": 400,
            "Message": 'Email already exists. Please use a different email address.'
        });
    }

    // unique ID creation
    const userId = users.length ? Math.max(...users.map(user => user.userId)) + 1 : 1;

    // Create new team object
    const newUser = {
        userId,
        emailId,
        password
    };

    users.push(newUser);
    writeData(users);

    res.status(200).json({
        "From": "signUpApi",
        "Method": "POST",
        "Status": "Data Created",
        "StatusCode": 201,
        "Message": 'User created successfully.',
        "Created User": { userId, emailId }
    })
})

module.exports = signUp;