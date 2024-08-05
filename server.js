const express = require('express');
const bodyParser = require('body-parser');

// 创建一个 Express 应用
const app = express();
// 定义服务器要监听的端口
const port = 8989;

// 使用 body-parser 中间件解析 JSON 请求体
app.use(bodyParser.json());

// 用于存储 todo 项的本地变量
let todos = [];
let nextId = 1;

// 路由：获取所有 TODO
app.get('/todos', async (req, res) => {
    res.json(todos);
});

// 路由：获取特定 TODO
app.get('/todos/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const todo = todos.find(t => t.id === id);
    if (todo) {
        res.json(todo);
    } else {
        res.status(404).json({ message: "Todo not found" });
    }
});

// 路由：创建一个新的 TODO
app.post('/todos', async (req, res) => {
    const { title, description } = req.body;
    if (!title) {
        return res.status(400).json({ message: "Title is required" });
    }
    const newTodo = {
        id: nextId++,
        title,
        description,
        completed: false
    };
    todos.push(newTodo);
    res.status(201).json(newTodo);
});

// 路由：删除 TODO
app.delete('/todos/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const index = todos.findIndex(t => t.id === id);
    if (index !== -1) {
        todos.splice(index, 1);
        res.status(204).send();
    } else {
        res.status(404).json({ message: "Todo not found" });
    }
});

// 启动服务器
// 监听指定的端口,并在成功启动后在控制台打印消息
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});