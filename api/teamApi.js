const express = require('express');
const fs = require('node:fs')
// const path = require('path')

const teamApi = express.Router();

// Get
teamApi.get('/:teamFileName', (req, res) => {
    let teamFileName = req.params.teamFileName;
    let data = fs.readFileSync(`${teamFileName}.txt`, { encoding: "utf-8", flag: "r" });
    // console.log(data);
    res.status(200).json({ "From": "teamApi", "Method": "GET", "Status": "Data Received", "Received Data": data })
})

// Post
teamApi.post('/:teamFileName', (req, res) => {
    let teamFileName = req.params.teamFileName;
    const { teamName, members} = req.body;

    fs.writeFileSync(`${teamFileName}.txt`, `Team Name: ${teamName}, Members: ${members}`);

    res.status(200).json({ "From": "teamApi", "Method": "POST", "Status": "Data Created", "Received Data": req.body })
})

// Put
teamApi.put('/:teamFileName', (req, res) => {
    let teamFileName = req.params.teamFileName;
    const { teamName, members} = req.body;

    fs.writeFileSync(`${teamFileName}.txt`, `Team Name: ${teamName}, Members: ${members}`);

    res.status(200).json({ "From": "teamApi", "Method": "PUT", "Status": "Data Updated", "File Name": `${teamFileName}`, "Updated Data": req.body })
})

// Patch
teamApi.patch('/:teamFileName', (req, res) => {
    let teamFileName = req.params.teamFileName;
    const { teamName, members} = req.body;

    fs.writeFileSync(`${teamFileName}.txt`, `Team Name: ${teamName}, Members: ${members}`);

    res.status(200).json({ "From": "teamApi", "Method": "PATCH", "Status": "Data Modified", "File Name": `${teamFileName}`, "Modified Data": req.body })
})

// Delete
teamApi.delete('/:teamFileName', (req, res)=>{
    let teamFileName = req.params.teamFileName;
    fs.writeFileSync(`${teamFileName}.txt`, '')
    res.status(200).json({"From": "teamApi", "Method": "DELETE", "Status": "Data Removed", "File Name": `${teamFileName}`, "Data": `Data deleted in ${teamFileName} file.`})
})

module.exports = teamApi