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

// [Challenge 1] GET route /search returning lessons matching query across subject, location, price, or availability
app.get("/search", async function(request, response) {
    let searchText = (request.query.q || "").toLowerCase();
    let collection = await db.collection("lessons");
    let allLessons = await collection.find({}).toArray();

    let results = allLessons.filter(function(lesson) {
        return String(lesson.subject).toLowerCase().includes(searchText) ||
               String(lesson.location).toLowerCase().includes(searchText) ||
               String(lesson.price).toLowerCase().includes(searchText) ||
               String(lesson.availability).toLowerCase().includes(searchText);
    });
    response.send(results);
});

// [Challenge 2] GET route /teachers returning all teachers and the lessons they teach from the "teachers" collection
app.get("/teachers", async function(request, response) {
    let collection = await db.collection("teachers");
    let results = await collection.find({}).toArray();
    response.send(results);
});

// [Challenge 3] GET route /enrolment/:lessonid returning the total number of slots purchased for that lesson
app.get("/enrolment/:lessonid", async function(request, response) {
    let lessonIdParam = request.params.lessonid;
    let targetNumericId = parseInt(lessonIdParam, 10);

    // If a MongoDB 24-character ObjectId was passed, also resolve its numeric lesson id
    if (ObjectId.isValid(lessonIdParam) && String(targetNumericId) !== lessonIdParam) {
        let lessonsCollection = await db.collection("lessons");
        let foundLesson = await lessonsCollection.findOne({ _id: new ObjectId(lessonIdParam) });
        if (foundLesson && foundLesson.id) {
            targetNumericId = foundLesson.id;
        }
    }

    let ordersCollection = await db.collection("orders");
    let allOrders = await ordersCollection.find({}).toArray();

    let enrolmentCount = 0;
    for (let i = 0; i < allOrders.length; i++) {
        let order = allOrders[i];
        if (Array.isArray(order.lessonIDs)) {
            for (let j = 0; j < order.lessonIDs.length; j++) {
                if (order.lessonIDs[j] === targetNumericId || String(order.lessonIDs[j]) === lessonIdParam) {
                    enrolmentCount++;
                }
            }
        }
    }

    response.json({
        lessonId: lessonIdParam,
        enrolment: enrolmentCount
    });
});

// POST route /orders saving a new order to the MongoDB "orders" collection
app.post("/orders", async function(request, response) {
    var body = request.body;
    let collection = await db.collection("orders");
    let result = await collection.insertOne(body);
    response.send(result);
});

// PUT route /lessons/:_id updating any attribute of a lesson in the "lessons" collection
app.put("/lessons/:_id", async function(request, response) {
    var body = request.body;
    let collection = await db.collection("lessons");
    let tempid = request.params._id;

    const query = { _id: new ObjectId(tempid) };
    const updates = {
        $set: request.body
    };
    let result = await collection.updateOne(query, updates);
    response.send(result);
    console.log(result);
});

// Final middleware returning 404 error for any unrecognised request
app.use(function(request, response) {
    response.status(404).send("Page not found!");
});

const port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log("App started on port " + port);
});
