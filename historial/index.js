const express = require('express');
const cors = require("cors");
const amqp = require('amqplib/callback_api');

const app = express();
app.use(express.json());

app.use(cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
}));

const RABBITMQ_URI = process.env.RABBITMQ_URI;
const QUEUE_NAME = 'peliculas-q';
const PORT = process.env.PORT || 3003;

let channel;

function procesarPelicula(pelicula) {
    /*
        Crear un obj. nuevo, que tenga
        los campos relevantes. Por ejemplo,
        que tenga solo id, nombre, genero y
        retornarlo. (TO-DO)
    */

    let nuevaPeli = pelicula;

    return nuevaPeli;
}

function connectToRabbitMQ() {
    // Conectarse a RabbitMQ
    amqp.connect(RABBITMQ_URI, function (error0, connection) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function (error1, ch) {
            if (error1) {
                throw error1;
            }
            channel = ch;
            channel.assertQueue(QUEUE_NAME, { durable: false });
            console.log("[MOVIES API] Connected to RabbitMQ and queue initialized.");
        });
    });
}

connectToRabbitMQ();

// Endpoint para recibir y enviar películas a la cola
app.post('/api/historial', (req, res) => {
    const pelicula = req.body;

    if (!pelicula) {
        return res.status(400).json({ error: "No se envió ninguna pelicula al historial" });
    }

    const nuevaPeli = procesarPelicula(pelicula);
    
    const msg = JSON.stringify(nuevaPeli);

    // Enviar el mensaje a la cola
    channel.sendToQueue(QUEUE_NAME, Buffer.from(msg));
    console.log(" [HISTORIAL] Enviada película a la cola:", pelicula);

    res.status(200).json({ message: "Película enviada a la cola", pelicula });
});

// Iniciar el servidor en el puerto 3000
app.listen(PORT, () => {
    console.log(`[HISTORIAL] Servidor escuchando en el puerto ${PORT}`);
});
