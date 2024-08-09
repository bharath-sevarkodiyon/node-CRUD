const express = require('express');
const fs = require('node:fs')
// const path = require('path')
const userApi = express.Router();

const userFileName = 'data.json';

// Read function
const readUsers = () => {
    if (!fs.existsSync(userFileName)) {
        return [];
    }
    const data = fs.readFileSync(userFileName, { encoding: 'utf-8' });
    return JSON.parse(data);
};

// Write function
const writeUsers = (users) => {
    fs.writeFileSync(userFileName, JSON.stringify(users, null, 2), { encoding: 'utf-8' });
};


// GET
userApi.get('/', (req, res) => {
    let users = readUsers();

    if (users.length === 0) {
        return res.status(404).json({ "From": "userApi", "Method": "GET", "Status": "No Data Present", "StatusCode": 404  });
    }

    res.status(200).json({ "From": "userApi", "Method": "GET", "Status": "Data Received", "StatusCode": 200, "Received Data": users });
});


// POST
userApi.post('/', (req, res) => {

    const requiredFields = ['firstName', 'lastName', 'emailId', 'phoneNumber', 'employeeId', 'designation', 'teamId'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
        return res.status(400).json({
            "From": "userApi",
            "Method": "POST",
            "Status": "Data Not Created",
            "StatusCode": 400,
            "Message": `Missing fields: ${missingFields.join(', ')}`
        });
    }

    const { firstName, lastName, emailId, phoneNumber, employeeId, designation, teamId } = req.body;
    let users = readUsers();
    
    const isEmpty = (field) => !field || typeof field !== 'string' || field.trim() === '';
    const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
    const phoneFormat = /^\d{10}$/; 

    let validationErrors = [];

    if (isEmpty(firstName)) validationErrors.push('First name cannot be empty.');
    if (isEmpty(lastName)) validationErrors.push('Last name cannot be empty.');
    if (isEmpty(emailId)) validationErrors.push('Email ID cannot be empty.');
    if (!emailFormat.test(emailId)) validationErrors.push('Invalid email format.');
    if (isEmpty(phoneNumber)) validationErrors.push('Phone number cannot be empty.');
    if (!phoneFormat.test(phoneNumber)) validationErrors.push('Phone number must be exactly 10 digits.');
    if (isEmpty(employeeId)) validationErrors.push('Employee ID cannot be empty.');
    if (isEmpty(designation)) validationErrors.push('Designation cannot be empty.');
    if (isEmpty(teamId)) validationErrors.push('Team ID cannot be empty.');

    if (validationErrors.length > 0) {
        return res.status(400).json({
            "From": "userApi",
            "Method": "POST",
            "Status": "Data Not Created",
            "StatusCode": 400,
            "Message": validationErrors.join(' ')
        });
    }

    // Validate email, phone number and EmployeeID
    const emailExists = users.some(user => user.emailId === emailId);
    const phoneExists = users.some(user => user.phoneNumber === phoneNumber);
    const employeeIdExists = users.some(user => user.employeeId === employeeId);

    if (emailExists || phoneExists || employeeIdExists) {
        let message = '';
        if (emailExists) message += 'Email already exists. ';
        if (phoneExists) message += 'Phone number already exists. ';
        if (employeeIdExists) message += 'Employee ID already exists.';

        return res.status(400).json({
            "From": "userApi",
            "Method": "POST",
            "Status": "Data Not Created",
            "StatusCode": 400,
            "Message": message
        });
    }

    // unique ID creation
    const uniqueId = users.length ? Math.max(...users.map(user => user.id)) + 1 : 1;

    // Create new user object
    const newUser = {
        id: uniqueId,
        firstName,
        lastName,
        emailId,
        phoneNumber,
        employeeId,
        designation,
        teamId
    };

    // updating the user with new data
    users.push(newUser);
    writeUsers(users);

    res.status(201).json({ "From": "userApi", "Method": "POST", "Status": "Data Created", "StatusCode": 201, "Received Data": newUser });
});


// PUT
userApi.put('/:userId', (req, res) => {
    let userId = req.params.userId;

    // Check if userId is provided and is a valid number
    if (isNaN(userId)) {
        return res.status(400).json({
            "From": "userApi",
            "Method": "PUT",
            "Status": "Data Not Updated",
            "StatusCode": 400,
            "Message": "Enter a valid numeric userId"
        });
    }

    userId = parseInt(userId);
    const { firstName, lastName, emailId, phoneNumber, employeeId, designation, teamId } = req.body;
    let users = readUsers();

    const isEmpty = (field) => !field || typeof field !== 'string' || field.trim() === '';

    const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneFormat = /^\d{10}$/;
    let validationErrors = [];

    if (isEmpty(firstName)) validationErrors.push('First name cannot be empty.');
    if (isEmpty(lastName)) validationErrors.push('Last name cannot be empty.');
    if (isEmpty(emailId)) validationErrors.push('Email ID cannot be empty.');
    if (!emailFormat.test(emailId)) validationErrors.push('Invalid email format.');
    if (isEmpty(phoneNumber)) validationErrors.push('Phone number cannot be empty.');
    if (!phoneFormat.test(phoneNumber)) validationErrors.push('Phone number must be exactly 10 digits.');
    if (isEmpty(employeeId)) validationErrors.push('Employee ID cannot be empty.');
    if (isEmpty(designation)) validationErrors.push('Designation cannot be empty.');
    if (isEmpty(teamId)) validationErrors.push('Team ID cannot be empty.');

    if (validationErrors.length > 0) {
        return res.status(400).json({
            "From": "userApi",
            "Method": "POST",
            "Status": "Data Not Created",
            "StatusCode": 400,
            "Message": validationErrors.join(' ')
        });
    }

    // Finding the user by ID, to update on the same object
    let userIndex = users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
        return res.status(404).json({
            "From": "userApi",
            "Method": "PUT",
            "Status": "Data Not Found",
            "StatusCode": 404
        });
    }

    // // Check for unique email, phone number, and employee ID among other users
    const emailExists = users.some(user => user.emailId === emailId);
    const phoneExists = users.some(user => user.phoneNumber === phoneNumber);
    const employeeIdExists = users.some(user => user.employeeId === employeeId);

    if (emailExists || phoneExists || employeeIdExists) {
        let message = '';
        if (emailExists) message += 'Email already exists. ';
        if (phoneExists) message += 'Phone number already exists. ';
        if (employeeIdExists) message += 'Employee ID already exists.';

        return res.status(400).json({
            "From": "userApi",
            "Method": "PUT",
            "Status": "Data Not Updated",
            "StatusCode": 400,
            "Message": message.trim()
        });
    }

    // Update user data
    users[userIndex] = {
        ...users[userIndex],
        firstName,
        lastName,
        emailId,
        phoneNumber,
        employeeId,
        designation,
        teamId
    };

    writeUsers(users);

    res.status(200).json({
        "From": "userApi",
        "Method": "PUT",
        "Status": "Data Updated",
        "StatusCode": 200,
        "Updated Data": users[userIndex]
    });
});


// PATCH
userApi.patch('/:userId', (req, res) => {
    let userId = req.params.userId;

    // Check if userId is number or string
    if (isNaN(userId)) {
        return res.status(400).json({
            "From": "userApi",
            "Method": "PATCH",
            "Status": "Data Not Updated",
            "StatusCode": 400,
            "Message": "Enter a valid numeric userId"
        });
    }

    userId = parseInt(userId);
    const { firstName, lastName, emailId, phoneNumber, employeeId, designation, teamId } = req.body;
    let users = readUsers();

    // Check unique email, phone number and EmployeeID along with check for null entries and email and mobile format validation.
    const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneFormat = /^\d{10}$/; 
    let validationErrors = [];

    // Validate only if the fields
    if (firstName !== undefined && (!firstName)) {
        validationErrors.push('First name cannot be empty.');
    }
    if (lastName !== undefined && (!lastName)) {
        validationErrors.push('Last name cannot be empty.');
    }
    if (emailId !== undefined) {
        if (!emailId || !emailFormat.test(emailId)) {
            validationErrors.push('Invalid email format.');
        } else if (users.some(user => user.emailId === emailId)) {
            validationErrors.push('Email already exists.');
        }
    }
    if (phoneNumber !== undefined) {
        if (!phoneNumber || !phoneFormat.test(phoneNumber)) {
            validationErrors.push('Phone number must be exactly 10 digits.');
        } else if (users.some(user => user.phoneNumber === phoneNumber)) {
            validationErrors.push('Phone number already exists.');
        }
    }
    if (employeeId !== undefined) {
        if (!employeeId) {
            validationErrors.push('Employee ID cannot be empty.');
        } else if (users.some(user => user.employeeId === employeeId)) {
            validationErrors.push('Employee ID already exists.');
        }
    }
    if (designation !== undefined && (!designation)) {
        validationErrors.push('Designation cannot be empty.');
    }
    if (teamId !== undefined && (isNaN(teamId) || teamId === null || teamId === '')) {
        validationErrors.push('Team ID cannot be empty.');
    }

    if (validationErrors.length > 0) {
        return res.status(400).json({
            "From": "userApi",
            "Method": "PATCH",
            "Status": "Data Not Updated",
            "StatusCode": 400,
            "Message": validationErrors.join(' ')
        });
    }

    // Finding the user by ID, to update on the same object
    let userIndex = users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
        return res.status(404).json({
            "From": "userApi",
            "Method": "PATCH",
            "Status": "Data Not Found",
            "StatusCode": 404
        });
    }

    // Update user data partially
    users[userIndex] = {
        ...users[userIndex],
        ...req.body
    };

    writeUsers(users);

    res.status(200).json({
        "From": "userApi",
        "Method": "PATCH",
        "Status": "Data Updated",
        "StatusCode": 200,
        "Updated Data": users[userIndex]
    });
});


// DELETE
userApi.delete('/:userId', (req, res) => {
    let userId = req.params.userId;

    // Check if userId is number or string
    if (isNaN(userId)) {
        return res.status(400).json({
            "From": "userApi",
            "Method": "DELETE",
            "Status": "Data Not Updated",
            "StatusCode": 400,
            "Message": "Enter a valid numeric userId"
        });
    }

    userId = parseInt(userId);
    let users = readUsers();

    // Finding the user by ID
    let userIndex = users.findIndex(user => user.id === userId);

    if (userIndex === -1) {
        return res.status(404).json({
            "From": "userApi",
            "Method": "DELETE",
            "Status": "Data Not Found",
            "StatusCode": 404
        });
    }

    // Remove the user using index value
    users.splice(userIndex, 1);

    writeUsers(users);

    res.status(200).json({
        "From": "userApi",
        "Method": "DELETE",
        "Status": "Data Deleted",
        "StatusCode": 200,
        "Deleted UserId": userId
    });
});


module.exports = userApi






// // Get
// userApi.get('/:userFileName', (req, res) => {
//     let userFileName = req.params.userFileName;
//     let data = fs.readFileSync(`${userFileName}.txt`, { encoding: "utf-8", flag: "r" });
//     console.log(data);
//     let finalData = data.replace(/\r?\n|\r/g, "");
//     res.status(200).json({ "From": "userApi", "Method": "GET", "Status": "Data Received", "Received Data": finalData })
// })


// // Post
// userApi.post('/:userFileName', (req, res) => {
//     let userFileName = req.params.userFileName;
//     const { firstName,
//         lastName,
//         emailId,
//         phoneNumber,
//         employeeId,
//         designation,
//         teamId } = req.body;

//     fs.writeFileSync(`${userFileName}.txt`, `firstName: ${firstName},
//     lastName: ${lastName},
//     emailId: ${emailId},
//     phoneNumber: ${phoneNumber},
//     employeeId: ${employeeId},
//     designation: ${designation},
//     teamId: ${teamId}`);

//     res.status(200).json({ "From": "userApi", "Method": "POST", "Status": "Data Created", "Received Data": req.body })
// })


// // Put
// userApi.put('/:userId', (req, res)=>{
//     let userId = req.params.userId;
//     const { firstName,
//         lastName,
//         emailId,
//         phoneNumber,
//         employeeId,
//         designation,
//         teamId } = req.body;

//     fs.writeFileSync(userFileName, `id: ${userId}, 
//     firstName: ${firstName},
//     lastName: ${lastName},
//     emailId: ${emailId},
//     phoneNumber: ${phoneNumber},
//     employeeId: ${employeeId},
//     designation: ${designation},
//     teamId: ${teamId}`);

//     res.status(200).json({"From": "userApi", "Method": "PUT", "Status": "Data Updated", "StatusCode": 202, "Updated Data": req.body})
// })


// // Patch
// userApi.patch('/:userId', (req, res)=>{
//     let userFileName = req.params.userFileName;
//     const { firstName,
//         lastName,
//         emailId,
//         phoneNumber,
//         employeeId,
//         designation,
//         teamId } = req.body;

//     fs.writeFileSync(`${userFileName}.txt`, `firstName: ${firstName},
//     lastName: ${lastName},
//     emailId: ${emailId},
//     phoneNumber: ${phoneNumber},
//     employeeId: ${employeeId},
//     designation: ${designation},
//     teamId: ${teamId}`);

//     res.status(200).json({"From": "userApi", "Method": "PATCH", "Status": "Data Modified", "File Name": userFileName, "Modified Data": req.body})
// })


// // Delete
// userApi.delete('/:userId', (req, res)=>{
//     let userFileName = req.params.userFileName;
//     fs.writeFileSync(`${userFileName}.txt`, '')
//     res.status(200).json({"From": "userApi", "Method": "DELETE", "Status": "Data Removed", "File Name": userFileName, "Data": `Data deleted in ${userFileName} file.`})
// })


// userApi.post('/:userFileName', (req, res)=>{
//     let userFileName = req.params.userFileName;
//     let data = req.body;
//     // Convert the object to a JSON string
// const jsonString = JSON.stringify(data, null, 1); // value, replacer(), spacer

// // Define the file path (custom directory)
// const filePath = path.join(__dirname,'myObject.txt');//directory name

// // Ensure the directory exists
// if (!fs.existsSync(path.dirname(filePath))) {
//   fs.mkdirSync(path.dirname(filePath), { recursive: true });//check the directory
// }

// // Write the JSON string to the file
// fs.writeFile(filePath, jsonString, (err) => {
//   if (err) {
//     console.error('Error writing file', err);
//   } else {
//     console.log('File written successfully');
//   }
// });
//     res.status(200).json({"From": "userApi", "Method": "POST", "Status":"Data Created", "Received Data": data})
// })