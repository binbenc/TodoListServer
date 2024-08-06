const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// 创建一个 Express 应用
const app = express();
// 定义服务器要监听的端口
const port = 8989;



// 使用 body-parser 中间件解析 JSON 请求体
app.use(bodyParser.json());

// 创建数据库连接池
const pool = new Pool({
    user: 'chen',
    host: '0.0.0.0', // localhost 本地运行 0.0.0.0 服务器运行
    database: 'todo_db',
    password: 'chen',
    port: 5432,
    max: 50, // 设置连接池的最大连接数
    idleTimeoutMillis: 30000, // 空闲连接回收时间
    connectionTimeoutMillis: 2000, // 连接超时设置
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
        console.log('Database connection successful');
    } catch (err) {
        console.error('Database connection error:', err);
    } finally {
        client.release();
    }
}

initDb().catch(console.error);

// Swagger 配置
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Todo List API',
            version: '1.0.0',
            description: 'A simple Todo List API',
        },
    },
    apis: ['./server.js'], // 修改为 server.js
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /api/todos:
 *   get:
 *     summary: 获取所有 TODO
 *     description: 返回所有存储在数据库中的 TODO 项
 *     responses:
 *       200:
 *         description: 成功返回 TODO 列表
 *       500:
 *         description: 服务器错误
 */
app.get('/api/todos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM todos');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
});

/**
 * @swagger
 * /api/todos/{id}:
 *   get:
 *     summary: 获取特定 TODO
 *     description: 根据ID返回特定的 TODO 项
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: TODO 项的ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 成功返回 TODO 项
 *       404:
 *         description: TODO 项未找到
 *       500:
 *         description: 服务器错误
 */
app.get('/api/todos/:id', async (req, res) => {
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

/**
 * @swagger
 * /api/todos:
 *   post:
 *     summary: 创建一个新的 TODO
 *     description: 创建并存储一个新的 TODO 项
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: 成功创建 TODO 项
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 服务器错误
 */
app.post('/api/todos', async (req, res) => {
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

/**
 * @swagger
 * /api/todos/{id}:
 *   delete:
 *     summary: 删除 TODO
 *     description: 根据ID删除特定的 TODO 项
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 要删除的 TODO 项的ID
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: 成功删除 TODO 项
 *       404:
 *         description: TODO 项未找到
 *       500:
 *         description: 服务器错误
 */
app.delete('/api/todos/:id', async (req, res) => {
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


/**
 * @swagger
 * /api/todos:
 *   delete:
 *     summary: 清除所有 TODO
 *     description: 删除所有 TODO 项
 *     responses:
 *       204:
 *         description: 成功清除所有 TODO 项
 *       500:
 *         description: 服务器错误
 */
app.delete('/api/todos', async (req, res) => {
    try {
        await pool.query('DELETE FROM todos');
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// 启动服务器
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port} 入口 `);
    console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
});