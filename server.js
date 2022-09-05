//importing modules
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/user_routes");
const mutantRoutes = require("./routes/mutant_routes");
const errorHandler = require("./utils/error_handler");

//setting up your port
const PORT = process.env.PORT || 8080;
const corsOptions = { credentials: true, origin: process.env.URL || "*" };

global.appRoot = __dirname;

//assigning the variable app to express
const app = express();

//middleware
// app.use(express.json());
app.use(bodyParser.json());
// app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(errorHandler);

//routes for the user API
app.use("/users", userRoutes);
app.use("/mutants", mutantRoutes);

//listening to server connection
app.listen(PORT, () => console.log(`Server is connected on ${PORT}`));
