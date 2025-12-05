// server/server.js
import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';

const PORT = 3000;

// === настройки Mongo ===
const MONGO_URL = 'mongodb://127.0.0.1:27017'; // если локальная Mongo
const DB_NAME = 'todos_app';

// создаём клиента и подключаемся (top-level await, Node 22 умеет)
const client = new MongoClient(MONGO_URL);
await client.connect();
console.log('✅ Подключился к MongoDB');

const db = client.db(DB_NAME);
const todosCollection = db.collection('todos');

// === Express-приложение ===
const app = express();

// CORS на время разработки – можно вообще так
app.use(cors());
app.use(express.json());

// ====== Вспомогалки для приведения данных ======

function mapTodo(doc) {
    return {
        id: doc._id.toString(),
        title: doc.title,
        completed: !!doc.completed,
    };
}

// ====== РОУТЫ ======

// GET /api/todos – получить все задачи
app.get('/api/todos', async (req, res) => {
    try {
        const docs = await todosCollection.find({}).toArray();
        const todos = docs.map(mapTodo);
        res.json(todos);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Ошибка чтения из базы' });
    }
});

// POST /api/todos – создать задачу
app.post('/api/todos', async (req, res) => {
    try {
        const { title } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'title обязателен' });
        }

        const doc = {
            title,
            completed: false,
        };

        const result = await todosCollection.insertOne(doc);

        const newTodo = {
            id: result.insertedId.toString(),
            title: doc.title,
            completed: doc.completed,
        };

        res.status(201).json(newTodo);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Ошибка записи в базу' });
    }
});

// PUT /api/todos/:id – изменить completed
app.put('/api/todos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { completed } = req.body;

        if (typeof completed !== 'boolean') {
            return res.status(400).json({ error: 'completed должен быть boolean' });
        }

        let objectId;
        try {
            objectId = new ObjectId(id);
        } catch {
            return res.status(400).json({ error: 'Неверный формат id' });
        }

        const result = await todosCollection.findOneAndUpdate(
            { _id: objectId },
            { $set: { completed } },
            { returnDocument: 'after' } // вернуть обновлённый документ
        );

        if (!result || !result.value) {
            return res.status(404).json({ error: 'Тудушка не найдена' });
        }

        const updated = mapTodo(result.value);
        res.json(updated);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Ошибка обновления базы' });
    }
});

// DELETE /api/todos/:id – удалить задачу
app.delete('/api/todos/:id', async (req, res) => {
    try {
        const { id } = req.params;

        let objectId;
        try {
            objectId = new ObjectId(id);
        } catch {
            return res.status(400).json({ error: 'Неверный формат id' });
        }

        const result = await todosCollection.deleteOne({ _id: objectId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Тудушка не найдена' });
        }

        res.status(204).send();
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Ошибка удаления из базы' });
    }
});

// проверочный маршрут
app.get('/api/ping', (req, res) => {
    res.json({ message: 'pong' });
});

// запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Backend слушает на http://localhost:${PORT}`);
});
