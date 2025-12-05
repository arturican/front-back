// main.js

// Адрес твоего бэкенда
const API_URL = 'http://localhost:3000/api/todos';

const todoListEl = document.getElementById('todo-list');
const formEl = document.getElementById('todo-form');
const inputEl = document.getElementById('todo-input');
const statusEl = document.getElementById('status');

let todos = [];

// ==== вспомогательные функции ====

function setStatus(message) {
    statusEl.textContent = message || '';
}

// Рендер списка задач
function renderTodos() {
    todoListEl.innerHTML = '';

    if (!todos.length) {
        todoListEl.innerHTML = '<li>Пока нет задач</li>';
        return;
    }

    todos.forEach((todo) => {
        const li = document.createElement('li');
        li.className = 'todo-item';

        const left = document.createElement('div');
        left.className = 'todo-left';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => {
            toggleTodo(todo.id, checkbox.checked);
        });

        const title = document.createElement('span');
        title.className = 'todo-title';
        if (todo.completed) {
            title.classList.add('completed');
        }
        title.textContent = todo.title;

        left.appendChild(checkbox);
        left.appendChild(title);

        const delBtn = document.createElement('button');
        delBtn.className = 'todo-delete';
        delBtn.textContent = '✕';
        delBtn.title = 'Удалить';
        delBtn.addEventListener('click', () => {
            deleteTodo(todo.id);
        });

        li.appendChild(left);
        li.appendChild(delBtn);

        todoListEl.appendChild(li);
    });
}

// ==== запросы к API ====

async function loadTodos() {
    try {
        setStatus('Загружаю задачи...');
        const res = await fetch(API_URL);
        if (!res.ok) {
            throw new Error(`Ошибка загрузки: ${res.status}`);
        }
        const data = await res.json();
        console.log(data);
        todos = data;
        renderTodos();
        setStatus('Готово');
    } catch (err) {
        console.error(err);
        setStatus('Не получилось загрузить задачи (смотри консоль)');
    }
}

async function addTodo(title) {
    try {
        setStatus('Добавляю задачу...');
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title }),
        });
        if (!res.ok) {
            const errorBody = await res.json().catch(() => ({}));
            throw new Error(errorBody.error || `Ошибка: ${res.status}`);
        }
        const newTodo = await res.json();
        todos.push(newTodo);
        renderTodos();
        setStatus('Задача добавлена');
    } catch (err) {
        console.error(err);
        setStatus('Не получилось добавить (смотри консоль)');
    }
}

async function toggleTodo(id, completed) {
    try {
        setStatus('Обновляю задачу...');
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed }),
        });
        if (!res.ok) {
            const errorBody = await res.json().catch(() => ({}));
            throw new Error(errorBody.error || `Ошибка: ${res.status}`);
        }
        const updated = await res.json();

        todos = todos.map((t) => (t.id === id ? updated : t));
        renderTodos();
        setStatus('Обновлено');
    } catch (err) {
        console.error(err);
        setStatus('Не получилось обновить (смотри консоль)');
    }
}

async function deleteTodo(id) {
    try {
        setStatus('Удаляю задачу...');
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok && res.status !== 204) {
            const errorBody = await res.json().catch(() => ({}));
            throw new Error(errorBody.error || `Ошибка: ${res.status}`);
        }
        todos = todos.filter((t) => t.id !== id);
        renderTodos();
        setStatus('Удалено');
    } catch (err) {
        console.error(err);
        setStatus('Не получилось удалить (смотри консоль)');
    }
}

// ==== обработчик формы ====

formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = inputEl.value.trim();
    if (!title) return;

    addTodo(title);
    inputEl.value = '';
});

// ==== старт ====
loadTodos();