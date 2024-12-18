const express = require("express");
const axios = require("axios");
const cors = require("cors");
const amqp = require("amqplib/callback_api");
const { ObjectId } = require("mongodb");

const app = express();
const PORT = 3002;

const RABBITMQ_URI = process.env.RABBITMQ_URI || "amqp://localhost";
const QUEUE_NAME = "peliculas-q";

app.use(express.json());

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

let allMovies = [];
let userMovies = [];

/*
  userMovies:
    {
      id: ObjectID,
      title: string,
      genres: string[],
      poster: string
    }[]
*/

// Función para obtener todas las películas desde el microservicio
async function getMovies() {
  try {
    const response = await axios.get("http://movies:3000/api/allmovies");
    return response.data;
  } catch (error) {
    console.error("Error fetching movies:", error);
    throw new Error("Error fetching movies.");
  }
}

// Inicializar la lista de películas al arrancar el servicio
async function initializeMovies() {
  try {
    allMovies = await getMovies();
  } catch (error) {
    console.error("Error initializing movies:", error);
  }
}

initializeMovies();

// Función para procesar mensajes recibidos desde RabbitMQ
function connectToRabbitMQ() {
  amqp.connect(RABBITMQ_URI, (error0, connection) => {
    if (error0) {
      throw error0;
    }
    connection.createChannel((error1, channel) => {
      if (error1) {
        throw error1;
      }
      channel.assertQueue(QUEUE_NAME, { durable: false });

      console.log("[RECOMMENDER SERVICE] Connected to RabbitMQ and waiting for messages...");

      // Escuchar mensajes de la cola
      channel.consume(
        QUEUE_NAME,
        (msg) => {
          console.log("[RECOMMENDER SERVICE] Recibí algo.");
          if (msg !== null) {
            const pelicula = JSON.parse(msg.content.toString());
            console.log("[RECOMMENDER SERVICE] Película recibida:", pelicula);

            // Agregar la película recibida a la lista userMovies
            if (pelicula.id) {
              userMovies.push(pelicula);
              console.log("[RECOMMENDER SERVICE] Película agregada a userMovies:", pelicula.id);
            }
          }
        },
        { noAck: true }
      );
    });
  });
}

connectToRabbitMQ();

// Endpoint para recomendar películas
app.get("/api/recommend", async (req, res) => {

  if (userMovies.length === 0) {
    console.log(userMovies);
    return res.status(400).json({ error: "El historial esta vacío.", error });
  }
  try {
    /*Recorrer userMovies y guardar los generos*/

    // Contar la frecuencia de cada género
    /*const genreCounts = userMovies.reduce((acc, movie) => {
      movie.genres.forEach(genre => {
        acc[genre] = (acc[genre] || 0) + 1;
      });
      return acc;
    }, {});*/
    
     // Contar la frecuencia de cada género
     const genreCounts = userMovies.reduce((acc, movie) => {
      // Convertir genres a un array si no lo es
      const genresArray = Array.isArray(movie.genres) ? movie.genres : [movie.genres];

      // Contar la frecuencia de los géneros
      genresArray.forEach(genre => {
        acc[genre] = (acc[genre] || 0) + 1;
      });
      return acc;
    }, {});

    // Encontrar el género más frecuente
    const predominantGenre = Object.keys(genreCounts).reduce((a, b) =>
      genreCounts[a] > genreCounts[b] ? a : b
    );

    // Encontrar una película recomendada en el género predominante
    const recommendations = allMovies.filter(
      movie =>
        movie.genres &&
        movie.genres.includes(predominantGenre) &&
        !userMovies.some(userMovie => userMovie.id.toString() === movie._id.toString()) /*zona de error posible!*/
    );

    if (recommendations.length > 0) {
      const recommendedMovie = recommendations[Math.floor(Math.random() * recommendations.length)];
      res.json({ recommendedMovie });
    } else {
      // Si no hay recomendaciones para el género predominante, seleccionar una película aleatoria
      const remainingMovies = allMovies.filter(
        movie => !userMovies.some(userMovie => userMovie.id.toString() === movie._id.toString())
      );

      if (remainingMovies.length > 0) {
        const randomMovie = remainingMovies[Math.floor(Math.random() * remainingMovies.length)];
        res.json({ recommendedMovie: randomMovie });
      } else {
        res.status(404).json({ message: "No se encontraron películas disponibles para recomendar." });
      }
    }
  } catch (error) {
    res.status(500).json({ error: "Error processing recommendation.", message: error.message });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Recommender service running at http://localhost:${PORT}`);
});



