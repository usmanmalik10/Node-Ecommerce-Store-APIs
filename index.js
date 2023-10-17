const express = require('express');
const app = express();

const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/ECOM');

const userRoute = require('./routes/userRoute');
app.use('/api', userRoute);

//store Route

const storeRoute = require('./routes/storeRoute');
app.use('/api', storeRoute);

//category routes

const categoryRoute = require('./routes/categoryRoute');
app.use('/api', categoryRoute);

app.listen(3000, function () {
  console.log('Server is ready');
});
