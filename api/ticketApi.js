const express = require('express');
const fs = require("node:fs");

const ticketApi = express.Router();

const ticketFileName = 'ticket.json';

// Read function
const readTickets = () => {
    if (!fs.existsSync(ticketFileName)) {
        return [];
    }
    const data = fs.readFileSync(ticketFileName, { encoding: 'utf-8' });
    return JSON.parse(data);
};

// Write function
const writeTickets = (tickets) => {
    fs.writeFileSync(ticketFileName, JSON.stringify(tickets, null, 2), { encoding: 'utf-8' });
};


// GET
ticketApi.get('/', (req, res) => {
    let tickets = readTickets();

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

    const { title, description, team, status, assignee, reporter } = req.body;
    let tickets = readTickets();

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

    if ([title, description, team, status, assignee, reporter].some(field => field === null || field === '')) {
        return res.status(400).json({
            "From": "ticketApi",
            "Method": "POST",
            "Status": "Data Not Created",
            "StatusCode": 400,
            "Message": 'Fields cannot be null or empty.'
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
    writeTickets(tickets);

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

    ticketId = parseInt(ticketId);
    const { title, description, team, status, assignee, reporter } = req.body;
    let tickets = readTickets();

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

    if ([title, description, team, status, assignee, reporter].some(field => field === null || field === '')) {
        return res.status(400).json({
            "From": "ticketApi",
            "Method": "PUT",
            "Status": "Data Not Updated",
            "StatusCode": 400,
            "Message": 'Fields cannot be null or empty.'
        });
    }

    // Update user data
    tickets[ticketIndex] = {
        ...tickets[ticketIndex],
        title,
        description,
        team,
        status,
        assignee,
        reporter
    };

    writeTickets(tickets);

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
    let tickets = readTickets();

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

    if (title !== undefined && title !== tickets[ticketIndex].title) {
        const titleExists = tickets.some(ticket => ticket.title === title && ticket.ticketId !== ticketId);

        if (titleExists) {
            return res.status(400).json({
                "From": "ticketApi",
                "Method": "PATCH",
                "Status": "Data Not Updated",
                "StatusCode": 400,
                "Message": 'Title already exists.'
            });
        }
    }

    if ([title, description, team, status, assignee, reporter].some(field => field !== undefined && (field === null || field === ''))) {
        return res.status(400).json({
            "From": "ticketApi",
            "Method": "PATCH",
            "Status": "Data Not Updated",
            "StatusCode": 400,
            "Message": 'Fields cannot be null or empty if provided.'
        });
    }

    // Update user data partially
    tickets[ticketIndex] = {
        ...tickets[ticketIndex],
        ...req.body
    };

    writeTickets(tickets);

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
    let tickets = readTickets();

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

    writeTickets(tickets);

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

