const express = require('express');
const cors = require('cors');

const ticketApi = require('./api/ticketApi');
const userApi = require('./api/userApi');
const teamApi = require('./api/teamApi');
const signUp = require('./api/signUpApi');
const login = require('./api/loginApi');

const app = express();

app.use(express.json());
app.use(cors());

app.use('/tickets', ticketApi);
app.use('/users', userApi);
app.use('/teams', teamApi);
app.use('/signUp', signUp);
app.use('/login', login);


app.listen(5000, (error)=>{
    if(error){
        console.log(error);
    }
    console.log('Server running on port 5000');
})