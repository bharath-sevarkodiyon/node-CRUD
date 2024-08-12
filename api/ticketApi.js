const express = require('express');
const fs = require("node:fs");

const ticketApi = express.Router();

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
ticketApi.get('/', (req, res) => {
    let data = readData();
    let tickets = data.tickets;

    if (tickets.length === 0) {
        return res.status(404).json({
            "From": "ticketApi",
            "Method": "GET",
            "Status": "No Data Present",
            "StatusCode": 404
        });
    }

    res.status(200).json({
        "From": "ticketApi",
        "Method": "GET",
        "Status": "Data Received",
        "StatusCode": 200,
        "Received Data": tickets
    });
});


// POST
ticketApi.post('/', (req, res) => {
    const requiredFields = ['title', 'description', 'team', 'status', 'assignee', 'reporter'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
        return res.status(400).json({
            "From": "ticketApi",
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
            "From": "ticketApi",
            "Method": "POST",
            "Status": "Data Not Created",
            "StatusCode": 400,
            "Message": `Unexpected fields: ${extraFields.join(', ')}`
        });
    }

    const { title, description, team, status, assignee, reporter } = req.body;
    let data = readData();
    let tickets = data.tickets;

    // Validate ticket title to be unique
    const titleExists = tickets.some(ticket => ticket.title === title);

    if (titleExists) {
        return res.status(400).json({
            "From": "ticketApi",
            "Method": "POST",
            "Status": "Data Not Created",
            "StatusCode": 400,
            "Message": 'Title already exists.'
        });
    }

    const isEmpty = (field) => !field || typeof field !== 'string' || field.trim() === '';

    let validationErrors = [];

    if (isEmpty(title)) validationErrors.push('title cannot be empty.');
    if (isEmpty(description)) validationErrors.push('description cannot be empty.');
    if (isEmpty(team)) validationErrors.push('team cannot be empty.');
    if (isEmpty(status)) validationErrors.push('status cannot be empty.');
    if (isEmpty(assignee)) validationErrors.push('assignee cannot be empty.');
    if (isEmpty(reporter)) validationErrors.push('reporter cannot be empty.');

    if (validationErrors.length > 0) {
        return res.status(400).json({
            "From": "userApi",
            "Method": "POST",
            "Status": "Data Not Created",
            "StatusCode": 400,
            "Message": validationErrors.join(' ')
        });
    }

    // Unique ID creation
    const ticketId = tickets.length ? Math.max(...tickets.map(ticket => ticket.ticketId)) + 1 : 1;

    // Create new ticket object
    const newTicket = {
        ticketId,
        title,
        description,
        team,
        status,
        assignee,
        reporter
    };

    // Add the new ticket to the array and write to the file
    tickets.push(newTicket);
    writeData(data);

    res.status(201).json({
        "From": "ticketApi",
        "Method": "POST",
        "Status": "Data Created",
        "StatusCode": 201,
        "Received Data": newTicket
    });
});


// PUT
ticketApi.put('/:ticketId', (req, res) => {
    let ticketId = req.params.ticketId;

    // Check if userId is provided and is a valid number
    if (isNaN(ticketId)) {
        return res.status(400).json({
            "From": "ticketApi",
            "Method": "PUT",
            "Status": "Data Not Updated",
            "StatusCode": 400,
            "Message": "Enter a valid ticketId"
        });
    }

    const requiredFields = ['title', 'description', 'team', 'status', 'assignee', 'reporter'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
        return res.status(400).json({
            "From": "ticketApi",
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
            "From": "ticketApi",
            "Method": "PUT",
            "Status": "Data Not Created",
            "StatusCode": 400,
            "Message": `Unexpected fields: ${extraFields.join(', ')}`
        });
    }

    ticketId = parseInt(ticketId);
    const { title, description, team, status, assignee, reporter } = req.body;
    let data = readData();
    let tickets = data.tickets;

    let ticket = tickets.find(ticket => ticket.ticketId === ticketId);
    if (ticket === undefined) {
        return res.status(404).json({
            "From": "ticketApi",
            "Method": "PUT",
            "Status": "TicketId Not Found",
            "StatusCode": 404
        });
    }

    // Check for empty data
    const isEmpty = (field) => !field || typeof field !== 'string' || field.trim() === '';

    let validationErrors = [];

    if (isEmpty(title)) validationErrors.push('title cannot be empty.');
    if (isEmpty(description)) validationErrors.push('description cannot be empty.');
    if (isEmpty(team)) validationErrors.push('team cannot be empty.');
    if (isEmpty(status)) validationErrors.push('status cannot be empty.');
    if (isEmpty(assignee)) validationErrors.push('assignee cannot be empty.');
    if (isEmpty(reporter)) validationErrors.push('reporter cannot be empty.');

    if (validationErrors.length > 0) {
        return res.status(400).json({
            "From": "ticketApi",
            "Method": "PUT",
            "Status": "Data Not Created",
            "StatusCode": 400,
            "Message": validationErrors.join(' ')
        });
    }

    // Finding the user by ID, to update on the same object
    let ticketIndex = tickets.findIndex(ticket => ticket.ticketId === ticketId);

    if (ticketIndex === -1) {
        return res.status(404).json({
            "From": "ticketApi",
            "Method": "PUT",
            "Status": "Data Not Found",
            "StatusCode": 404
        });
    }

    // Update user data
    tickets[ticketIndex] = {
        ticketId,
        title,
        description,
        team,
        status,
        assignee,
        reporter
    };

    writeData(data);

    res.status(200).json({
        "From": "ticketApi",
        "Method": "PUT",
        "Status": "Data Updated",
        "StatusCode": 200,
        "Updated Data": tickets[ticketIndex]
    });
});


// PATCH
ticketApi.patch('/:ticketId', (req, res) => {
    let ticketId = req.params.ticketId;

    // Check if userId is number or string
    if (isNaN(ticketId)) {
        return res.status(400).json({
            "From": "ticketApi",
            "Method": "PATCH",
            "Status": "Data Not Updated",
            "StatusCode": 400,
            "Message": "Enter a valid ticketId"
        });
    }
    ticketId = parseInt(ticketId);
    const { title, description, team, status, assignee, reporter } = req.body;
    let data = readData();
    let tickets = data.tickets;

    // find the user object
    let ticket = tickets.find(ticket => ticket.ticketId === ticketId);
    if (ticket === undefined) {
        return res.status(404).json({
            "From": "ticketApi",
            "Method": "PATCH",
            "Status": "TicketId Not Found",
            "StatusCode": 404
        });
    }
    
    // Extract keys from the existing ticket
    const validFields = Object.keys(ticket);

    // Check for unexpected fields in the request body
    const unexpectedFields = Object.keys(req.body).filter(field => !validFields.includes(field));
    if (unexpectedFields.length > 0) {
        return res.status(400).json({
            "From": "ticketApi",
            "Method": "PATCH",
            "Status": "Data Not Updated",
            "StatusCode": 400,
            "Message": `Unexpected fields: ${unexpectedFields.join(', ')}`
        });
    }

    let validationErrors = [];

    // Validate if the fields are empty
    if (title !== undefined && ((!title) || title.trim() === '')) {
        validationErrors.push('title cannot be empty.');
    }
    if (description !== undefined && ((!description) || description.trim() === '')) {
        validationErrors.push('description cannot be empty.');
    }
    if (team !== undefined && ((!team) || team.trim() === '')) {
        validationErrors.push('team cannot be empty.');
    }
    if (status !== undefined && ((!status) || status.trim() ==='')) {
        validationErrors.push('status cannot be empty.');
    }
    if (assignee !== undefined && ((!assignee) || assignee.trim() === '')) {
        validationErrors.push('assignee connot be empty.');
    }
    if (reporter !== undefined && ((!reporter) || reporter.trim() === '')) {
        validationErrors.push('reporter cannot be empty.');
    }

    if (validationErrors.length > 0) {
        return res.status(400).json({
            "From": "ticketApi",
            "Method": "PATCH",
            "Status": "Data Not Updated",
            "StatusCode": 400,
            "Message": validationErrors.join(' ')
        });
    }

    // Finding the user by ID, to update on the same object
    let ticketIndex = tickets.findIndex(ticket => ticket.ticketId === ticketId);
    
    if (ticketIndex === -1) {
        return res.status(404).json({
            "From": "ticketApi",
            "Method": "PATCH",
            "Status": "Data Not Found",
            "StatusCode": 404
        });
    }

    // Update user data partially
    tickets[ticketIndex] = {
        ...tickets[ticketIndex],
        ...req.body
    };

    writeData(data);

    res.status(200).json({
        "From": "ticketApi",
        "Method": "PATCH",
        "Status": "Data Updated",
        "StatusCode": 200,
        "Updated Data": tickets[ticketIndex]
    });
});


// DELETE
ticketApi.delete('/:ticketId', (req, res) => {
    let ticketId = req.params.ticketId;

    // Check if userId is number or string
    if (isNaN(ticketId)) {
        return res.status(400).json({
            "From": "ticketApi",
            "Method": "DELETE",
            "Status": "Data Not Deleted",
            "StatusCode": 400,
            "Message": "Enter a valid ticketId" 
        });
    }

    ticketId = parseInt(ticketId);
    let data = readData();
    let tickets = data.tickets;

    let ticket = tickets.find(ticket => ticket.ticketId === ticketId);
    if (ticket === undefined) {
        return res.status(404).json({
            "From": "ticketApi",
            "Method": "DELETE",
            "Status": "TicketId Not Found",
            "StatusCode": 404
        });
    }

    // Finding the user by ID
    let ticketIndex = tickets.findIndex(ticket => ticket.ticketId === ticketId);

    if (ticketIndex === -1) {
        return res.status(404).json({
            "From": "ticketApi",
            "Method": "DELETE",
            "Status": "Data Not Found",
            "StatusCode": 404
        });
    }

    // Remove the user using index value
    tickets.splice(ticketIndex, 1);

    writeData(data);

    res.status(200).json({
        "From": "ticketApi",
        "Method": "DELETE",
        "Status": "Data Deleted",
        "StatusCode": 200,
        "Deleted TicketId": ticketId
    });
});

module.exports = ticketApi;





// // Get
// ticketApi.get('/:fileName', (req, res)=>{
//     let fileName = req.params.fileName;
    
//     let data = fs.readFileSync(`${fileName}.txt`, {encoding: "utf8", flag: "r"});
//     // console.log("Before update",data);
//     res.status(200).json({"From": "ticketApi", "Method": "GET", "Status":"Data Received", "Received Data": data})
// }) 


// // Post
// ticketApi.post('/:fileName', (req, res)=>{
//     let fileName = req.params.fileName;
//     const {data} = req.body;
//     // console.log(data);
    
//     fs.writeFileSync(`${fileName}.txt`, data);

//     res.status(200).json({"From": "ticketApi", "Method": "POST", "Status": "Data Created", "Received Data": data})
// })


// // Put
// ticketApi.put('/:fileName', (req, res)=>{
//     const fileName = req.params.fileName;
//     const {data} = req.body;

//     fs.writeFileSync(`${fileName}.txt`, data)

//     res.status(200).json({"From": "ticketApi", "Method": "PUT", "Status": "Data Updated", "File Name": fileName, "Updated Data": data})
// })


// // Delete
// ticketApi.delete('/:fileName', (req, res)=>{
//     let fileName = req.params.fileName;
//     fs.writeFileSync(`${fileName}.txt`, '')
//     res.status(200).json({"From": "ticketApi", "Method": "DELETE", "Status": "Data Removed", "File Name": fileName, "Data": `Data deleted in ${userFileName} file.`})
// })

