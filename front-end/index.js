const express = require('express');
const path = require('path');

const app = express();
const PORT = 8000;

// Configurar la carpeta "front-end" para servir archivos estáticos
app.use(express.static(__dirname));

// Endpoint para servir el archivo index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
