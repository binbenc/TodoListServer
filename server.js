const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

// 创建一个 Express 应用
const app = express();
// 定义服务器要监听的端口
const port = 8989;

// 使用 body-parser 中间件解析 JSON 请求体
app.use(bodyParser.json());

// 创建数据库连接池
const pool = new Pool({
    user: 'chen',
    host: 'localhost',
    database: 'todo_db',
    password: 'chen',
    port: 5432,
});

// 初始化数据库表
async function initDb() {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS todos (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                completed BOOLEAN DEFAULT FALSE
            )
        `);
    } finally {
        client.release();
    }
}

initDb().catch(console.error);

// 路由：获取所有 TODO
app.get('/todos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM todos');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// 路由：获取特定 TODO
app.get('/todos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ message: "Todo not found" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// 路由：创建一个新的 TODO
app.post('/todos', async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }
        const result = await pool.query(
            'INSERT INTO todos (title, description) VALUES ($1, $2) RETURNING *',
            [title, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// 路由：删除 TODO
app.delete('/todos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: "Todo not found" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// 启动服务器
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});