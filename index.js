const express = require('express');

const ticketApi = require('./api/ticketApi');
const userApi = require('./api/userApi');
const teamApi = require('./api/teamApi');

const app = express();

app.use(express.json());

app.use('/tickets', ticketApi);
app.use('/users', userApi);
app.use('/teams', teamApi);

app.listen(5000, (error)=>{
    if(error){
        console.log(error);
    }
    console.log('Server running on port 5000');
})