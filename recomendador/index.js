const express = require("express");
const axios = require("axios");

const { ObjectId } = require("mongodb");  // Asegúrate de importar ObjectId si lo necesitas

const app = express();
const PORT = 3002;

app.use(express.json());

// Función para obtener géneros desde el microservicio de géneros
async function getMovies() {
  try {
    const response = await axios.get("http://movies:3000/api/allmovies");
    return response.data;
  } catch (error) {
    console.error("Error fetching genres:", error);
    throw new Error("Error fetching genres.");
  }
}

app.get("/api/recommend", async (req, res) => {
  // Lista de películas hardcodeada con ObjectId simulados
  const userMovies = [
    { _id: ObjectId("573a1390f29313caabcd4803")},
    { _id: ObjectId("573a1390f29313caabcd42e8")}
  ];

  try {
    const allMovies = await getMovies();

    // Filtra los géneros solo de las películas en la lista proporcionada por el usuario
    const userGenres = allMovies.filter(movie =>
      userMovies.some(userMovie => userMovie.id.toString() === movie.id.toString())
    );

    // Cuenta la frecuencia de cada género
    const genreCounts = userGenres.reduce((acc, movie) => {
      movie.genres.forEach(genre => {
        acc[genre] = (acc[genre] || 0) + 1;
      });
      return acc;
    }, {});

    // Encuentra el género más frecuente
    const predominantGenre = Object.keys(genreCounts).reduce((a, b) =>
      genreCounts[a] > genreCounts[b] ? a : b
    );

    // Encuentra una película recomendada en el género predominante
    const recommendations = allMovies.filter(
      movie => movie.genres.includes(predominantGenre) && !userMovies.some(userMovie => userMovie.id.toString() === movie.id.toString())
    );

    if (recommendations.length > 0) {
      const recommendedMovie = recommendations[Math.floor(Math.random() * recommendations.length)];
      res.json({ recommendedMovie });
    } else {
      // Si no hay recomendaciones para el género predominante, selecciona una película aleatoria
      const remainingMovies = allMovies.filter(
        movie => !userMovies.some(userMovie => userMovie.id.toString() === movie.id.toString())
      );

      if (remainingMovies.length > 0) {
        const randomMovie = remainingMovies[Math.floor(Math.random() * remainingMovies.length)];
        res.json({ recommendedMovie: randomMovie });
      } else {
        res.status(404).json({ message: "No se encontraron películas disponibles para recomendar." });
      }
    }
  } catch (error) {
    res.status(500).json({ error: "Error processing recommendation." });
  }
});

app.listen(PORT, () => {
  console.log(`Recommender service running at http://localhost:${PORT}`);
});

