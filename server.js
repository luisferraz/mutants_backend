//importing modules
const express = require("express");
const cors = require("cors");
const sequelize = require("sequelize");
const dotenv = require("dotenv").config();
const cookieParser = require("cookie-parser");
const db = require("./models");
const userRoutes = require("./routes/user_routes");
const errorHandler = require("./utils/error_handler");

//setting up your port
const PORT = process.env.PORT || 8080;
const corsOptions = { credentials: true, origin: process.env.URL || "*" };
//assigning the variable app to express
const app = express();

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(errorHandler);

//routes for the user API
app.use("/users", userRoutes);

//listening to server connection
app.listen(PORT, () => console.log(`Server is connected on ${PORT}`));
