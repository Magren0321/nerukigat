# Nerukigat

Magren 的个人博客。公开站点继续使用原有样式与 Markdown 展示，并在同一个 Next.js 应用中增加单站主管理后台。

## 当前内容模式

默认 `CONTENT_SOURCE=contentlayer`，因此不配置数据库或 R2 也能继续构建和浏览原静态博客。完成数据库迁移并核对内容后，再切换为 `CONTENT_SOURCE=database`。

## 启动静态博客

要求 Node.js 20.9 或更高版本，项目统一使用 npm。

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 启动管理后台

1. 复制 [`.env.example`](.env.example) 为 `.env.local`，填写认证变量；使用 R2 时再填写其中的 S3 变量。
2. 本地开发可启动 PostgreSQL 与 MinIO：

   ```bash
   docker compose up -d
   npm run db:migrate
   ```

   Compose 会幂等创建 `nerukigat-public` 与 `nerukigat-private` 两个本地桶，并给私有桶设置浏览器上传 CORS。

3. 设置临时 `ADMIN_BOOTSTRAP_PASSWORD` 后初始化站主账号：

   ```bash
   npm run auth:create-owner
   ```

   登录成功后从环境变量中删除这项临时密码。

4. 运行 `npm run dev`，打开 [http://localhost:3000/admin](http://localhost:3000/admin)。

现有文章迁移先执行只读审计：

```bash
npm run content:audit
```

确认报告无错误并已执行数据库迁移后，显式执行一次性写入：

```bash
npm run content:audit -- --write --confirm-write
```

导入在单个事务中完成；目标库只要存在相同文章路径就会整体回滚，不会覆盖已有内容。

## 常用检查

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

## 文档

- [管理后台改造方案](docs/blog-admin-refactor.md)
- [Cloudflare R2 / 本地 MinIO 配置](docs/r2-setup.md)
