// server.js
const express = require('express');


const app = express();

const PORT = 3000;

// чтобы уметь читать JSON в body (пригодится позже)
app.use(express.json());

// маршрут для главной страницы: GET /
app.get('/', (req, res) => {
    res.send('Hello from Node + Express + pnpm 🚀');
});

// тестовый маршрут: GET /status
app.get('/status', (req, res) => {
    res.json({
        status: 'ok',
        time: new Date().toISOString(),
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
