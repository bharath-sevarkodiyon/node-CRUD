const express = require('express');
const fs = require('node:fs')

const teamApi = express.Router();

const dataFileName = 'data.json';

// Read function
const readData = () => {
    if (!fs.existsSync(dataFileName)) {
        return { teams: [], users: [], tickets: [] };
    }
    const data = fs.readFileSync(dataFileName, { encoding: 'utf-8' });
    return JSON.parse(data);
};

// Write function
const writeData = (data) => {
    fs.writeFileSync(dataFileName, JSON.stringify(data, null, 2), { encoding: 'utf-8' });
};

// GET
teamApi.get('/', (req, res) => {
    let data = readData();
    let teams = data.teams;

    if (teams.length === 0) {
        return res.status(404).json({
            "From": "teamApi",
            "Method": "GET",
            "Status": "No Data Present",
            "StatusCode": 404
        });
    }

    res.status(200).json({
        "From": "teamApi",
        "Method": "GET",
        "Status": "Data Received",
        "StatusCode": 200,
        "ReceivedData": teams
    });
});


// POST
teamApi.post('/', (req, res) => {
    const requiredFields = ['teamName', 'members'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
        return res.status(400).json({
            "From": "teamApi",
            "Method": "POST",
            "Status": "Data Not Created",
            "StatusCode": 400,
            "Message": `Missing fields: ${missingFields.join(', ')}`
        });
    }

    // Check for unexpected fields
    const extraFields = Object.keys(req.body).filter(field => !requiredFields.includes(field));
    if (extraFields.length > 0) {
        return res.status(400).json({
            "From": "teamApi",
            "Method": "POST",
            "Status": "Data Not Created",
            "StatusCode": 400,
            "Message": `Unexpected fields: ${extraFields.join(', ')}`
        });
    }

    const { teamName, members } = req.body;
    let data = readData();
    let teams = data.teams;

    // Validate teamName and members to be unique
    const teamNameExists = teams.some(team => team.teamName === teamName);

    if (teamNameExists) {
        return res.status(400).json({
            "From": "teamApi",
            "Method": "POST",
            "Status": "Data Not Created",
            "StatusCode": 400,
            "Message": 'Team name already exists.'
        });
    }

    // const existingMembers = new Set();
    // teams.forEach(team => {
    //     team.members.forEach(member => existingMembers.add(member.toLowerCase()));
    // });

    // const newMembers = new Set(members.map(member => member.toLowerCase()));
    // const duplicateMembers = [...newMembers].filter(member => existingMembers.has(member));

    // if (duplicateMembers.length > 0) {
    //     return res.status(400).json({
    //         "From": "teamApi",
    //         "Method": "POST",
    //         "Status": "Data Not Created",
    //         "StatusCode": 400,
    //         "Message": `Members is already exist in another team: ${duplicateMembers.join(', ')}`
    //     });
    // }

    // Validate teamName is not empty
    if (teamName !== undefined && ((!teamName) || teamName.trim() === '')) {
        return res.status(400).json({
            "From": "teamApi",
            "Method": "POST",
            "Status": "Data Not Updated",
            "StatusCode": 400,
            "Message": 'Team name cannot be empty.'
        });
    }

    // Validate members is not empty
    if (members !== undefined && (!Array.isArray(members) || members.length === 0)) {
        return res.status(400).json({
            "From": "teamApi",
            "Method": "POST",
            "Status": "Data Not Updated",
            "StatusCode": 400,
            "Message": 'Members cannot be empty.'
        });
    }

    // unique ID creation
    const teamId = teams.length ? Math.max(...teams.map(team => team.teamId)) + 1 : 1;

    // Create new team object
    const newTeam = {
        teamId,
        teamName,
        members
    };

    // Add the new team to the array and write to the file
    teams.push(newTeam);
    writeData(data);

    res.status(201).json({
        "From": "teamApi",
        "Method": "POST",
        "Status": "Data Created",
        "StatusCode": 201,
        "ReceivedData": newTeam
    });
});


// PUT
teamApi.put('/:teamId', (req, res) => {
    let teamId = req.params.teamId;

    // Check if teamId is number or string
    if (isNaN(teamId)) {
        return res.status(400).json({
            "From": "teamApi",
            "Method": "PUT",
            "Status": "Data Not Updated",
            "StatusCode": 400,
            "Message": "Enter a valid teamId"
        });
    }

    const requiredFields = ['teamName', 'members'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
        return res.status(400).json({
            "From": "teamApi",
            "Method": "PUT",
            "Status": "Data Not Created",
            "StatusCode": 400,
            "Message": `Missing fields: ${missingFields.join(', ')}`
        });
    }

    // Check for unexpected fields
    const extraFields = Object.keys(req.body).filter(field => !requiredFields.includes(field));
    if (extraFields.length > 0) {
        return res.status(400).json({
            "From": "teamApi",
            "Method": "PUT",
            "Status": "Data Not Created",
            "StatusCode": 400,
            "Message": `Unexpected fields: ${extraFields.join(', ')}`
        });
    }

    teamId = parseInt(teamId);
    const { teamName, members } = req.body;
    let data = readData();
    let teams = data.teams;

    let team = teams.find(team => team.teamId === teamId);
    if (team === undefined) {
        return res.status(404).json({
            "From": "teamApi",
            "Method": "PUT",
            "Status": "TeamId Not Found",
            "StatusCode": 404
        });
    }

    // Find the team by ID
    let teamIndex = teams.findIndex(team => team.teamId === teamId);

    if (teamIndex === -1) {
        return res.status(404).json({
            "From": "teamApi",
            "Method": "PUT",
            "Status": "Data Not Found",
            "StatusCode": 404
        });
    }

    // Validate members to be unique
    // const existingMembers = new Set();
    // teams.forEach(team => {
    //     if (team.teamId !== teamId) { 
    //         team.members.forEach(member => existingMembers.add(member.toLowerCase()));
    //     }
    // });

    // const newMembers = new Set(members.map(member => member.toLowerCase()));
    // const duplicateMembers = [...newMembers].filter(member => existingMembers.has(member));

    // if (duplicateMembers.length > 0) {
    //     return res.status(400).json({
    //         "From": "teamApi",
    //         "Method": "PUT",
    //         "Status": "Data Not Updated",
    //         "StatusCode": 400,
    //         "Message": `Members already exist in another team: ${duplicateMembers.join(', ')}`
    //     });
    // }

    // Validate teamName is not empty
    if (teamName !== undefined && ((!teamName) || teamName.trim() === '')) {
        return res.status(400).json({
            "From": "teamApi",
            "Method": "PUT",
            "Status": "Data Not Updated",
            "StatusCode": 400,
            "Message": 'Team name cannot be empty.'
        });
    }

    // Validate members is not empty
    if (members !== undefined && (!Array.isArray(members) || members.length === 0)) {
        return res.status(400).json({
            "From": "teamApi",
            "Method": "PUT",
            "Status": "Data Not Updated",
            "StatusCode": 400,
            "Message": 'Members cannot be empty.'
        });
    }

    // Update team data
    teams[teamIndex] = {
        ...teams[teamIndex],
        teamName,
        members
    };

    writeData(data);

    res.status(200).json({
        "From": "teamApi",
        "Method": "PUT",
        "Status": "Data Updated",
        "StatusCode": 200,
        "Updated Data": teams[teamIndex]
    });
});


// PATCH
teamApi.patch('/:teamId', (req, res) => {
    let teamId = req.params.teamId;

    // Check if teamId is number or string
    if (isNaN(teamId)) {
        return res.status(400).json({
            "From": "teamApi",
            "Method": "PATCH",
            "Status": "Data Not Updated",
            "StatusCode": 400,
            "Message": "Enter a valid teamId"
        });
    }
    teamId = parseInt(teamId);
    const { teamName, members } = req.body;
    let data = readData();
    let teams = data.teams;

    // find the team object
    let team = teams.find(team => team.teamId === teamId);
    if (team === undefined) {
        return res.status(404).json({
            "From": "teamApi",
            "Method": "PATCH",
            "Status": "TicketId Not Found",
            "StatusCode": 404
        });
    }

    // Extract keys from the existing team
    const validFields = Object.keys(team);

    // Check for unexpected fields in the request body
    const unexpectedFields = Object.keys(req.body).filter(field => !validFields.includes(field));
    if (unexpectedFields.length > 0) {
        return res.status(400).json({
            "From": "teamApi",
            "Method": "PATCH",
            "Status": "Data Not Updated",
            "StatusCode": 400,
            "Message": `Unexpected fields: ${unexpectedFields.join(', ')}`
        });
    }

    // Validate members to be unique
    // const existingMembers = new Set();
    // teams.forEach(team => {
    //     if (team.teamId !== teamId) { 
    //         team.members.forEach(member => existingMembers.add(member.toLowerCase()));
    //     }
    // });

    // const newMembers = new Set(members.map(member => member.toLowerCase())); // Normalize new members to lowercase
    // const duplicateMembers = [...newMembers].filter(member => existingMembers.has(member));

    // if (duplicateMembers.length > 0) {
    //     return res.status(400).json({
    //         "From": "teamApi",
    //         "Method": "PUT",
    //         "Status": "Data Not Updated",
    //         "StatusCode": 400,
    //         "Message": `Members already exist in another team: ${duplicateMembers.join(', ')}`
    //     });
    // }

    // Validate teamName is not empty
    if (teamName !== undefined && ((!teamName) || teamName.trim() === '')) {
        return res.status(400).json({
            "From": "teamApi",
            "Method": "PATCH",
            "Status": "Data Not Updated",
            "StatusCode": 400,
            "Message": 'Team name cannot be empty.'
        });
    }

    // Validate members is not empty
    if (members !== undefined && (!Array.isArray(members) || members.length === 0)) {
        return res.status(400).json({
            "From": "teamApi",
            "Method": "PATCH",
            "Status": "Data Not Updated",
            "StatusCode": 400,
            "Message": 'Members cannot be empty.'
        });
    }

    // Find the team by ID
    let teamIndex = teams.findIndex(team => team.teamId === teamId);

    if (teamIndex === -1) {
        return res.status(404).json({
            "From": "teamApi",
            "Method": "PATCH",
            "Status": "Data Not Found",
            "StatusCode": 404
        });
    }

    // Update team data partially
    teams[teamIndex] = {
        ...teams[teamIndex],
        ...req.body
    };

    writeData(data);

    res.status(200).json({
        "From": "teamApi",
        "Method": "PATCH",
        "Status": "Data Updated",
        "StatusCode": 200,
        "UpdatedData": teams[teamIndex]
    });
});


// DELETE
teamApi.delete('/:teamId', (req, res) => {
    let teamId = req.params.teamId;

    // Check if teamId is number or string
    if (isNaN(teamId)) {
        return res.status(400).json({
            "From": "teamApi",
            "Method": "DELETE",
            "Status": "Data Not Deleted",
            "StatusCode": 400,
            "Message": "Enter a valid teamId" 
        });
    }

    teamId = parseInt(teamId);
    let data = readData();
    let teams = data.teams;

    let team = teams.find(team => team.teamId === teamId);
    if (team === undefined) {
        return res.status(404).json({
            "From": "teamApi",
            "Method": "DELETE",
            "Status": "TeamId Not Found",
            "StatusCode": 404
        });
    }

    // Find the team by ID
    let teamIndex = teams.findIndex(team => team.teamId === teamId);

    if (teamIndex === -1) {
        return res.status(404).json({
            "From": "teamApi",
            "Method": "DELETE",
            "Status": "Data Not Found",
            "StatusCode": 404
        });
    }

    // Remove the team using index value
    teams.splice(teamIndex, 1);

    writeData(data);

    res.status(200).json({
        "From": "teamApi",
        "Method": "DELETE",
        "Status": "Data Deleted",
        "StatusCode": 200,
        "DeletedTeamId": teamId
    });
});

module.exports = teamApi









// // Get
// teamApi.get('/:teamFileName', (req, res) => {
//     let teamFileName = req.params.teamFileName;
//     let data = fs.readFileSync(`${teamFileName}.txt`, { encoding: "utf-8", flag: "r" });
//     // console.log(data);
//     res.status(200).json({ "From": "teamApi", "Method": "GET", "Status": "Data Received", "Received Data": data })
// })

// // Post
// teamApi.post('/:teamFileName', (req, res) => {
//     let teamFileName = req.params.teamFileName;
//     const { teamName, members} = req.body;

//     fs.writeFileSync(`${teamFileName}.txt`, `Team Name: ${teamName}, Members: ${members}`);

//     res.status(200).json({ "From": "teamApi", "Method": "POST", "Status": "Data Created", "Received Data": req.body })
// })

// // Put
// teamApi.put('/:teamFileName', (req, res) => {
//     let teamFileName = req.params.teamFileName;
//     const { teamName, members} = req.body;

//     fs.writeFileSync(`${teamFileName}.txt`, `Team Name: ${teamName}, Members: ${members}`);

//     res.status(200).json({ "From": "teamApi", "Method": "PUT", "Status": "Data Updated", "File Name": `${teamFileName}`, "Updated Data": req.body })
// })

// // Patch
// teamApi.patch('/:teamFileName', (req, res) => {
//     let teamFileName = req.params.teamFileName;
//     const { teamName, members} = req.body;

//     fs.writeFileSync(`${teamFileName}.txt`, `Team Name: ${teamName}, Members: ${members}`);

//     res.status(200).json({ "From": "teamApi", "Method": "PATCH", "Status": "Data Modified", "File Name": `${teamFileName}`, "Modified Data": req.body })
// })

// // Delete
// teamApi.delete('/:teamFileName', (req, res)=>{
//     let teamFileName = req.params.teamFileName;
//     fs.writeFileSync(`${teamFileName}.txt`, '')
//     res.status(200).json({"From": "teamApi", "Method": "DELETE", "Status": "Data Removed", "File Name": `${teamFileName}`, "Data": `Data deleted in ${teamFileName} file.`})
// })
