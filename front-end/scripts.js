const MAX_MOVIES = 8;
const RANDOM_MOVIES_URL = 'http://localhost:3001/api/random/movies';
const HISTORIAL_URL = 'http://localhost:3003/api/historial';

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

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("http://localhost:3001/api/random/movies");
        
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
        next_poster_index = movies.length;
        ponerNextPosterIndexInBounds();

        /*
        if (movies.length > 0) {
            document.getElementById("recommended-poster").innerHTML = `<img src="${movies[0].poster}" alt="Poster recomendado" style="width: 100%; height: 100%; border-radius: 8px;">`;
            document.getElementById("recommended-title").textContent = movies[0].title || "Título no disponible";
        }
        */
    } catch (error) {
        console.error("Error al cargar las películas:", error);
    }
});

function ponerNextPosterIndexInBounds() {
    next_poster_index++
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

function hacerRecomendacion() {
    console.log("Le mando mensaje al recomendador...");
}
