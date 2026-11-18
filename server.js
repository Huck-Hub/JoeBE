var express = require("express"); // Requires the Express module
var cors = require("cors");
var path = require("path");
require("dotenv").config({ path: "./config.env" });

// MongoDB connection setup (using native MongoDB Node.js driver only)
const { MongoClient, ObjectId } = require("mongodb");
const uri = process.env.MONGODB_PREFIX +
    process.env.MONGODB_USERNAME + ":" +
    process.env.MONGODB_PASSWORD +
    process.env.MONGODB_URL;
const client = new MongoClient(uri);
const db = client.db(process.env.MONGODB_DB || "AfterSchool");

// Calls the express function to start a new Express application
var app = express();

app.use(cors());
app.use(express.json()); // Allows Express to parse incoming JSON request bodies

// Logger middleware: logs every incoming request's HTTP method, URL, and timestamp
app.use(function(request, response, next) {
    console.log("Incoming " + request.method + " request to " + request.url + " [" + new Date().toISOString() + "]");
    next();
});

// Static file middleware: serves lesson images from the staticFiles directory
var publicPath = path.resolve(__dirname, "staticFiles");
app.use("/images", express.static(publicPath));

// If an image file does not exist in staticFiles, return a 404 error message
app.use("/images", function(request, response) {
    response.status(404).send("Image not found!");
});

// GET route /lessons returning all lessons from the MongoDB "lessons" collection
app.get("/lessons", async function(request, response) {
    let collection = await db.collection("lessons");
    let results = await collection.find({}).toArray();
    response.send(results);
});

// POST route /orders saving a new order to the MongoDB "orders" collection
app.post("/orders", async function(request, response) {
    var body = request.body;
    let collection = await db.collection("orders");
    let result = await collection.insertOne(body);
    response.send(result);
});

// Final middleware returning 404 error for any unrecognised request
app.use(function(request, response) {
    response.status(404).send("Page not found!");
});

app.listen(3000, function() {
    console.log("App started on port 3000");
});
