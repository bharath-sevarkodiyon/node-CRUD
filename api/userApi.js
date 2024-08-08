const express = require('express');
const fs = require('node:fs')
// const path = require('path')
const userApi = express.Router();

// Get
userApi.get('/:userFileName', (req, res) => {
    let userFileName = req.params.userFileName;
    let data = fs.readFileSync(`${userFileName}.txt`, { encoding: "utf-8", flag: "r" });
    console.log(data);
    let finalData = data.replace(/\r?\n|\r/g, "");
    res.status(200).json({ "From": "userApi", "Method": "GET", "Status": "Data Received", "Received Data": finalData })
})


// Post
userApi.post('/:userFileName', (req, res) => {
    let userFileName = req.params.userFileName;
    const { firstName,
        lastName,
        emailId,
        phoneNumber,
        employeeId,
        designation,
        teamId } = req.body;

    fs.writeFileSync(`${userFileName}.txt`, `firstName: ${firstName},
    lastName: ${lastName},
    emailId: ${emailId},
    phoneNumber: ${phoneNumber},
    employeeId: ${employeeId},
    designation: ${designation},
    teamId: ${teamId}`);

    res.status(200).json({ "From": "userApi", "Method": "POST", "Status": "Data Created", "Received Data": req.body })
})


// Put
userApi.put('/:userId', (req, res)=>{
    let userId = req.params.userId;
    const { firstName,
        lastName,
        emailId,
        phoneNumber,
        employeeId,
        designation,
        teamId } = req.body;

    fs.writeFileSync(userFileName, `id: ${userId}, 
    firstName: ${firstName},
    lastName: ${lastName},
    emailId: ${emailId},
    phoneNumber: ${phoneNumber},
    employeeId: ${employeeId},
    designation: ${designation},
    teamId: ${teamId}`);

    res.status(200).json({"From": "userApi", "Method": "PUT", "Status": "Data Updated", "StatusCode": 202, "Updated Data": req.body})
})


// Patch
userApi.patch('/:userId', (req, res)=>{
    let userFileName = req.params.userFileName;
    const { firstName,
        lastName,
        emailId,
        phoneNumber,
        employeeId,
        designation,
        teamId } = req.body;

    fs.writeFileSync(`${userFileName}.txt`, `firstName: ${firstName},
    lastName: ${lastName},
    emailId: ${emailId},
    phoneNumber: ${phoneNumber},
    employeeId: ${employeeId},
    designation: ${designation},
    teamId: ${teamId}`);

    res.status(200).json({"From": "userApi", "Method": "PATCH", "Status": "Data Modified", "File Name": userFileName, "Modified Data": req.body})
})


// Delete
userApi.delete('/:userId', (req, res)=>{
    let userFileName = req.params.userFileName;
    fs.writeFileSync(`${userFileName}.txt`, '')
    res.status(200).json({"From": "userApi", "Method": "DELETE", "Status": "Data Removed", "File Name": userFileName, "Data": `Data deleted in ${userFileName} file.`})
})


module.exports = userApi



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