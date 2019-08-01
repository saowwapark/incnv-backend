
/** Third Party Packages **/
const path = require("path");
const bodyParser = require("body-parser");
const express = require('express');

/** My Own Imports **/
const sequelize = require('./util/database');
const userRoutes = require("./routes/user");
const User = require('./models/user');



const app = express();



sequelize
  .sync({ force: true })
  .catch(err => {
    console.log(err);
  });
  

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use("/images", express.static(path.join("backend/images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

app.use("/api/user", userRoutes);

module.exports = app;