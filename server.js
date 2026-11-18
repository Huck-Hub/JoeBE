var express = require("express"); // Requires the Express module
var cors = require("cors");
var path = require("path");

// Calls the express function to start a new Express application
var app = express();

app.use(cors());

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

let lessonsArray = [
    {
        id: 1001,
        subject: "Math",
        location: "Hendon",
        price: 100,
        availability: 5,
        image: "images/math.png",
        alt: "Math lesson icon",
        icon: "fa-calculator"
    },
    {
        id: 1002,
        subject: "English",
        location: "Colindale",
        price: 80,
        availability: 5,
        image: "images/english.png",
        alt: "English lesson icon",
        icon: "fa-book"
    },
    {
        id: 1003,
        subject: "Science",
        location: "Brent Cross",
        price: 90,
        availability: 5,
        image: "images/science.png",
        alt: "Science lesson icon",
        icon: "fa-flask"
    },
    {
        id: 1004,
        subject: "History",
        location: "Golders Green",
        price: 95,
        availability: 5,
        image: "images/history.png",
        alt: "History lesson icon",
        icon: "fa-university"
    },
    {
        id: 1005,
        subject: "Music",
        location: "Hendon",
        price: 110,
        availability: 5,
        image: "images/music.png",
        alt: "Music lesson icon",
        icon: "fa-music"
    },
    {
        id: 1006,
        subject: "Art",
        location: "Camden",
        price: 85,
        availability: 5,
        image: "images/art.png",
        alt: "Art lesson icon",
        icon: "fa-paint-brush"
    },
    {
        id: 1007,
        subject: "Computer Science",
        location: "Hendon",
        price: 120,
        availability: 5,
        image: "images/coding.png",
        alt: "Computer Science lesson icon",
        icon: "fa-laptop"
    },
    {
        id: 1008,
        subject: "French",
        location: "Finchley",
        price: 75,
        availability: 5,
        image: "images/french.png",
        alt: "French lesson icon",
        icon: "fa-globe"
    },
    {
        id: 1009,
        subject: "Drama",
        location: "Barnet",
        price: 70,
        availability: 5,
        image: "images/drama.png",
        alt: "Drama lesson icon",
        icon: "fa-film"
    },
    {
        id: 1010,
        subject: "Sports",
        location: "Wembley",
        price: 65,
        availability: 5,
        image: "images/sports.png",
        alt: "Sports lesson icon",
        icon: "fa-futbol-o"
    }
];

// GET route /lessons returning all lessons as JSON
app.get("/lessons", function(request, response) {
    response.json(lessonsArray);
});

// Final middleware returning 404 error for any unrecognised request
app.use(function(request, response) {
    response.status(404).send("Page not found!");
});

app.listen(3000, function() {
    console.log("App started on port 3000");
});
