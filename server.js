const express = require("express");
var path = require('path');
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.urlencoded({ extended: true }));

//////////////////////////////////////
///// ROUTES /////////////////////////
//////////////////////////////////////

var indexRouter = require('./routes/index');


app.use('/', indexRouter);
require("./routes/data")(app);


// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

