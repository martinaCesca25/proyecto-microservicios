/*const { MongoClient } = require('mongodb')
const express = require('express');
const app = express();

const uri = 'mongodb://mongodb:27017/'
const dbName = 'peliculas'

let db

async function init() {
    const client = new MongoClient(uri);
    await client.connect();

    console.log("[MOVIES] Connected to MongoDB");

    db = client.db(dbName)

    console.log("[MOVIES] Connected to Database: " + dbName);
}

app.get('/api/random/:n', async (req, res) => {
    const n = parseInt(req.params.n);

    try {
        const peliculasCollection = db.collection('movies');
        const peliculas = await peliculasCollection.aggregate([{ $sample: { size: n } }]).toArray();
        res.json(peliculas);
    } catch (error) {
        console.error("[MOVIES] Error retrieving random movies:", error);
        res.status(500).json({ error: "An error occurred while fetching random movies" });
    }
});

app.get("/api/allmovies", async (req, res) => {
    try {
        const peliculasCollection = db.collection('movies');
        const peliculas = await peliculasCollection.find().toArray(); 
        res.json(peliculas);
    } catch (error) {
        console.error("[MOVIES] Error retrieving all movies:", error);
        res.status(500).json({ error: "An error occurred while fetching random movies" });
    }
  });

app.get('/api/recommend/:criterio', (req, res) => {
    const criterio = req.params.criterio;
    // TEMP
    res.status(200).send(`[MOVIES] Recommendation endpoint accessed with criterio: ${criterio}`);
});

app.listen(3000, async () => { 
    await init();
    console.log("[MOVIES] Listening on port 3000")});*/


    
const { MongoClient, ObjectId } = require('mongodb');
const express = require('express');
const cors = require("cors");
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
}));

const uri = process.env.MONGO_URI || 'mongodb://mongodb:27017/';
const dbName = process.env.DB_NAME || 'peliculas';
const collectionName = process.env.COLLECTION_NAME || 'movies';
const jsonFilePath = process.env.JSON_FILE_PATH || './movies.json';

let db;

async function init() {
    try {
        const client = new MongoClient(uri);
        await client.connect();

        console.log("[MOVIES] Connected to MongoDB");
        db = client.db(dbName);

        // Check if the collection exists
        const collections = await db.listCollections({ name: collectionName }).toArray();
        if (collections.length === 0) {
            console.log(`[MOVIES] Collection '${collectionName}' not found. Creating it...`);
            const peliculasCollection = db.collection(collectionName);

            // Load data from JSON file
            if (fs.existsSync(jsonFilePath)) {
                const data = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

                data.forEach(doc => {
                    // Check if _id is an object with $oid field
                    if (doc._id && doc._id.$oid) {
                        // Convert $oid to a valid ObjectId
                        doc._id = new ObjectId(doc._id.$oid);  
                    } else if (doc._id && typeof doc._id !== 'object') {
                        // If _id is not an object and not an ObjectId, generate a new ObjectId
                        doc._id = new ObjectId();  
                    }
                });

                // Insert the documents into the collection
                await peliculasCollection.insertMany(data);
                console.log("[MOVIES] Data imported from JSON file");
            } else {
                console.warn("[MOVIES] JSON file not found");
            }
        } else {
            console.log(`[MOVIES] Collection '${collectionName}' already exists`);
        }
    } catch (error) {
        console.error("[MOVIES] Error initializing database:", error);
    }
}

app.get('/api/random/:n', async (req, res) => {
    const n = parseInt(req.params.n);
    try {
        const peliculasCollection = db.collection(collectionName);
        const peliculas = await peliculasCollection.aggregate([{ $sample: { size: n } }]).toArray();
        res.json(peliculas);
    } catch (error) {
        console.error("[MOVIES] Error retrieving random movies:", error);
        res.status(500).json({ error: "An error occurred while fetching random movies" });
    }
});

app.get('/api/allmovies', async (req, res) => {
    try {
        const peliculasCollection = db.collection(collectionName);
        const peliculas = await peliculasCollection.find().toArray();
        res.json(peliculas);
    } catch (error) {
        console.error("[MOVIES] Error retrieving all movies:", error);
        res.status(500).json({ error: "An error occurred while fetching movies" });
    }
});

app.listen(3000, async () => {
    await init();
    console.log("[MOVIES] Listening on port 3000");
});
    