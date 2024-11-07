const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3001;

function getRandomNumber() {
  return Math.floor(Math.random() * 10) + 1; // Número aleatorio entre 1 y 10
}

// Lee el archivo JSON y devuelve n películas aleatorias
app.get("/api/movies", async (req, res) => {
  const n = getRandomNumber();

  try {
    // Consumimos el microservicio GET /api/random/{n}
    const response = await axios.get(`http://movies:3000/api/random/${n}`);
    res.json(response.data);
  } catch (error) {
    console.log(`[RANDOM-MOVIES] Error:`);
    console.log(error);
    res.status(500).json({ error: "Error fetching movies." });
  }
});

app.listen(PORT, () => {
  console.log(`Microservicio [RANDOM-MOVIES] escuchando en http://localhost:${PORT}`);
});
