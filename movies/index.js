const { MongoClient } = require('mongodb')
const express = require('express');
const app = express();

const uri = 'mongodb://172.18.0.2:27017/'
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

app.get('/api/recommend/:criterio', (req, res) => {
    const criterio = req.params.criterio;
    // TEMP
    res.status(200).send(`[MOVIES] Recommendation endpoint accessed with criterio: ${criterio}`);
});

app.listen(3000, async () => { 
    await init();
    console.log("[MOVIES] Listening on port 3000")});