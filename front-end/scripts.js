const MAX_MOVIES = 8;
const RANDOM_MOVIES_URL = 'http://localhost:3001/api/random/movies';
const HISTORIAL_URL = 'http://localhost:3003/api/historial';
const RECOMMENDATION_URL = 'http://localhost:3002/api/recommend';

let shown_movies = 0;           // Cantidad de "huecos" de posters llenos
let watched_movies = 0;         // Cantidad de posters en los que el usuario hizo click.
let next_poster_index = 0;      // A donde va el próximo poster
let movies_shown = [];          // Info de las peliculas de las cuales mostramos los posters.

for(let i = 0; i < MAX_MOVIES; i++) {
    movies_shown.concat({
        id: 0,
        title: '',
        genre: '',
        poster: ''
    });
}

let last_recommendation = {
    id: 0,
    title: '',
    genre: '',
    poster: ''
}

let recommendation_watched = false;

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch(RANDOM_MOVIES_URL);
        
        if (!response.ok) 
            throw new Error("Error en la solicitud");

        const movies = await response.json();

        const posters = document.querySelectorAll(".poster");

        posters.forEach((poster) => (poster.innerHTML = "Esperando a que veas una película..."));

        // Iterar sobre las películas recibidas y asignarlas a los posters
        movies.forEach((movie, index) => {
            if (index < posters.length) {
                posters[index].innerHTML = `<img src="${movie.poster}" alt="Poster de ${movie.title}" style="width: 100%; height: 100%; border-radius: 8px;">`;
                movies_shown[index] = {
                    id: movie._id,
                    title: movie.title,
                    genres: movie.genres[0],
                    poster: movie.poster
                }
            }
        });

        shown_movies = movies.length;
        next_poster_index = movies.length - 1;
        ponerNextPosterIndexInBounds();
    } catch (error) {
        console.error("Error al cargar las películas:", error);
    }
});

function ponerNextPosterIndexInBounds() {
    //next_poster_index++
    if(next_poster_index >= MAX_MOVIES)
        next_poster_index = 0; // Asi si nos pasamos de 7, volvemos al principio.
}

async function onPosterClick(index) {
    console.log(`El poster ${index}-ésimo fue clickeado`);

    if (!posterTieneContenido(index)) 
        return;

    console.log(`Tiene película.`);

    try {
        await enviarAlHistorial(index);
    } catch (error) {
        console.error("Error al agregar la película al historial:", error);
        return;
    }

    watched_movies++;

    if (watched_movies >= shown_movies / 2) {
        hacerRecomendacion();
        watched_movies = 0;
    }
}

async function enviarAlHistorial(index) {
    if (index < 0 || index >= movies_shown.length) {
        throw new Error("Índice fuera de rango");
    }

    const pelicula = movies_shown[index];

    const response = await fetch(HISTORIAL_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(pelicula)
    });

    if (!response.ok) {
        throw new Error("Error al enviar la película al historial");
    }

    const data = await response.json();
    
    console.log("Película enviada al historial con éxito:", data);
}


function posterTieneContenido(index) {
    return index < movies_shown.length;
}

async function hacerRecomendacion() {
    console.log("Le mando mensaje al recomendador...");

    try {
        const response = await fetch(RECOMMENDATION_URL);

        if (!response.ok) {
            throw new Error("Error al obtener la recomendación");
        }

        const content = await response.json();
        const recomendacion = content.recommendedMovie;

        // Actualizamos el poster de recomendación
        const recommendedPoster = document.getElementById("recommended-poster");
        const recommendedTitle = document.getElementById("recommended-title");

        recommendedPoster.innerHTML = `<img src="${recomendacion.poster}" alt="Poster de ${recomendacion.title}" style="width: 100%; height: 100%; border-radius: 8px;">`;
        recommendedTitle.textContent = recomendacion.title || "Título no disponible";

        last_recommendation = recomendacion;
        recommendation_watched = false;

        console.log("Película recomendada recibida:", recomendacion);
    } catch (error) {
        console.error("Error al obtener la recomendación:", error);

        // En caso de error, dejamos un mensaje en la sección de recomendación
        const recommendedTitle = document.getElementById("recommended-title");
        recommendedTitle.textContent = "No se pudo cargar la recomendación.";
    }
}

async function onRecommendedPosterClick() {
    console.log("El póster recomendado fue clickeado");

    const recommendedTitle = document.getElementById("recommended-title").textContent;

    // Evitar acción si no hay recomendación cargada
    if (recommendedTitle === "Cargando..." || recommendedTitle === "No se pudo cargar la recomendación.") {
        console.log("No hay recomendación válida para procesar.");
        return;
    }

    if(recommendation_watched) {
        console.log("Ya se miró la recomendación, no se la agrega de nuevo.");
        return;
    }

    const recommendedPoster = document.getElementById("recommended-poster").querySelector("img");
    const recommendedMovie = {
        id: last_recommendation.id,
        title: recommendedTitle,
        genres: last_recommendation.genre,
        poster: recommendedPoster.src
    };

    // Añadir la película al primer espacio vacío o reemplazar cíclicamente
    next_poster_index++;
    ponerNextPosterIndexInBounds();
    const indexToReplace = next_poster_index;

    const posters = document.querySelectorAll(".poster");
    posters[indexToReplace].innerHTML = `<img src="${recommendedMovie.poster}" alt="Poster de ${recommendedMovie.title}" style="width: 100%; height: 100%; border-radius: 8px;">`;

    movies_shown[indexToReplace] = recommendedMovie;
    recommendation_watched = true;

    try {
        await enviarAlHistorial(indexToReplace);
    } catch (error) {
        console.error("Error al agregar la recomendación al historial:", error);
    }
}