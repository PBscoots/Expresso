// initialize the express app
const express = require('express');
const app = express();

// initialize sqlite and the database
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// set up initial middleware libraries
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(cors());

// import routes
const apiRouter = require('./server/api/api');
app.use('/api', apiRouter);

// set port and listen
const PORT = process.env.PORT || 4000;
app.listen(PORT);

// export the module
module.exports = app;