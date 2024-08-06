# Todo List API

这是一个简单的 Todo List API，使用 Node.js、Express 和 PostgreSQL 构建。API 提供了创建、读取、更新和删除（CRUD）待办事项的功能。

## 功能

- 获取所有待办事项
- 获取特定待办事项
- 创建新的待办事项
- 删除待办事项
- Swagger UI 文档

## 技术栈

- Node.js
- Express.js
- PostgreSQL
- Swagger (用于API文档)

## 安装

1. 克隆仓库：git clone https://github.com/yourusername/todo-list-api.git cd todo-list-api
2. 安装依赖：npm install
3. 设置 PostgreSQL 数据库
   - 创建一个名为 `todo_db` 的数据库
   - 创建一个用户 `chen`，密码为 `chen`
   - 授予 `chen` 用户对 `todo_db` 的所有权限
4. 启动服务器：node server.js 



## 使用

服务器启动后，API 将在 `http://localhost:8989` 上运行。

你可以通过以下 URL 访问 Swagger UI 文档：http://localhost:8989/api-docs



## API 端点

- GET `/api/todos`: 获取所有待办事项
- GET `/api/todos/:id`: 获取特定待办事项
- POST `/api/todos`: 创建新的待办事项
- DELETE `/api/todos/:id`: 删除待办事项

详细的 API 文档可以在 Swagger UI 中查看。

## 配置

你可以在 `server.js` 文件中修改以下配置：

- 数据库连接信息
- 服务器端口

## 贡献

欢迎提交 pull requests。对于重大更改，请先开issue讨论您想要更改的内容。

## 许可

[MIT](https://choosealicense.com/licenses/mit/)



