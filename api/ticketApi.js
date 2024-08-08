const express = require('express');
const fs = require("node:fs");

const ticketApi = express.Router();

// Get
ticketApi.get('/:fileName', (req, res)=>{
    let fileName = req.params.fileName;
    
    let data = fs.readFileSync(`${fileName}.txt`, {encoding: "utf8", flag: "r"});
    // console.log("Before update",data);
    res.status(200).json({"From": "ticketApi", "Method": "GET", "Status":"Data Received", "Received Data": data})
}) 


// Post
ticketApi.post('/:fileName', (req, res)=>{
    let fileName = req.params.fileName;
    const {data} = req.body;
    // console.log(data);
    
    fs.writeFileSync(`${fileName}.txt`, data);

    res.status(200).json({"From": "ticketApi", "Method": "POST", "Status": "Data Created", "Received Data": data})
})


// Put
ticketApi.put('/:fileName', (req, res)=>{
    const fileName = req.params.fileName;
    const {data} = req.body;

    fs.writeFileSync(`${fileName}.txt`, data)

    res.status(200).json({"From": "ticketApi", "Method": "PUT", "Status": "Data Updated", "File Name": fileName, "Updated Data": data})
})


// Delete
ticketApi.delete('/:fileName', (req, res)=>{
    let fileName = req.params.fileName;
    fs.writeFileSync(`${fileName}.txt`, '')
    res.status(200).json({"From": "ticketApi", "Method": "DELETE", "Status": "Data Removed", "File Name": fileName, "Data": `Data deleted in ${userFileName} file.`})
})


module.exports = ticketApi;