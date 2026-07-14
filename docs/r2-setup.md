# Cloudflare R2 / MinIO 图片存储配置

媒体库已经按 S3 兼容接口实现。浏览器把原图直接上传到私有桶；服务端确认真实类型、大小和像素，旋转并重新编码以移除 EXIF/GPS 后，才把新对象写入公开桶。文章正文只保存稳定地址：

```md
![图片说明](/media/<asset-id>)
```

## 为什么需要两个桶

一个 R2 账号下请创建两个 bucket：

- `S3_PRIVATE_BUCKET`：临时原图，不绑定自定义域名，不允许匿名读取。
- `S3_PUBLIC_BUCKET`：只保存处理后的公开图，可绑定图片域名。

两个变量不能填写同一个桶。R2 自定义域名公开的是整个 bucket，不会把 `private/` 前缀当作权限边界；共用桶会让尚未移除 EXIF/GPS 的原图存在被直接访问的风险。

## 需要填写的环境变量

完整模板在项目根目录的 [`.env.example`](../.env.example)。R2 部分如下，所有值都只能放在服务端环境变量中，不能增加 `NEXT_PUBLIC_` 前缀：

```dotenv
S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
S3_REGION=auto
S3_ACCESS_KEY_ID=<R2_ACCESS_KEY_ID>
S3_SECRET_ACCESS_KEY=<R2_SECRET_ACCESS_KEY>

S3_PUBLIC_BUCKET=<PUBLIC_BUCKET_NAME>
S3_PRIVATE_BUCKET=<PRIVATE_BUCKET_NAME>
S3_PUBLIC_BASE_URL=https://img.example.com

S3_FORCE_PATH_STYLE=false
S3_KEY_PREFIX=uploads
S3_PRESIGN_TTL_SECONDS=300
S3_MAX_UPLOAD_BYTES=20971520
S3_ALLOWED_MIME_TYPES=image/jpeg,image/png,image/webp,image/gif,image/avif
```

`S3_PUBLIC_BASE_URL` 应填写公开桶的自定义域名，不是 R2 S3 API endpoint。预签名 PUT 始终使用 `S3_ENDPOINT`。

应用对图片另有不可突破的 25 MiB 输入与输出硬上限；默认环境变量保持 20 MiB，足够覆盖当前仓库中接近 15 MiB 的历史图片。

## R2 控制台配置

1. 创建公开桶和私有桶。
2. 只给公开桶绑定自定义域名；私有桶保持关闭公开访问。
3. 创建仅限这两个桶的 Object Read & Write API token，把 key/secret 写入部署平台的服务端 Secret。
4. 给私有桶配置精确来源的 CORS，例如：

   ```json
   [
     {
       "AllowedOrigins": [
         "https://example.com",
         "https://staging.example.com",
         "http://localhost:3000"
       ],
       "AllowedMethods": ["PUT"],
       "AllowedHeaders": ["Content-Type", "Content-Length"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

5. 给私有桶的 `uploads/private/` 配置短期生命周期清理规则，建议删除超过 1 天的对象，兜底清理中断上传。
6. 正式、预览和本地环境使用不同 token；如果密钥曾进入 Git、日志或浏览器变量，立即轮换。

CORS 只控制浏览器跨域行为，不是鉴权。上传 URL 由已登录站主申请，有效期默认 5 分钟，并同时签入 `Content-Length` 与 `Content-Type`；最终仍会用数据库中的可信值执行 HEAD 和真实图片解码校验。

## 本地 MinIO

根目录的 `compose.yaml` 会启动 PostgreSQL、MinIO，并通过一次性 `minio-init` 服务创建两个桶、公开处理后图片、保持原图桶私有及设置 CORS。将 `.env.local` 的 S3 部分改为：

```dotenv
S3_ENDPOINT=http://127.0.0.1:9000
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=nerukigat
S3_SECRET_ACCESS_KEY=nerukigat-local-secret
S3_PUBLIC_BUCKET=nerukigat-public
S3_PRIVATE_BUCKET=nerukigat-private
S3_PUBLIC_BASE_URL=http://127.0.0.1:9000/nerukigat-public
S3_FORCE_PATH_STYLE=true
```

MinIO Console 位于 [http://127.0.0.1:9001](http://127.0.0.1:9001)。示例密码仅用于绑定在本机回环地址的开发环境，不能用于线上。

## 上传链路

1. `/api/admin/media/presign` 验证站主 Session、请求 Origin、MIME 和大小，并先建立 pending 记录。
2. 浏览器通过短期签名 URL 直接 PUT 到私有桶，不接触 S3 密钥。
3. `/api/admin/media/:id/finalize` 只读取数据库中的 key/MIME/大小，HEAD 后下载原图。
4. Sharp 核对文件签名、像素和动画，应用方向并重新编码；动画图片当前拒绝，静态 GIF 可用。
5. 处理后的不可变对象写入公开桶，数据库原子切换为 `active + public`，随后尽力删除私有原图。
6. `/media/:id` 只解析 active/public 记录并跳转到公开域名。

浏览器会串行上传，服务端也会在单个实例内串行执行 Sharp，避免一次多选造成内存峰值；未来扩展到多实例高并发时应改为独立任务队列。上线前仍应使用真实 R2 凭据完成一次非空图片上传 smoke test，并在部署入口为管理 API 设置基础限流。

官方参考：

- [Cloudflare R2 presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/)
- [Cloudflare R2 API tokens](https://developers.cloudflare.com/r2/api/tokens/)
- [Cloudflare R2 public buckets and custom domains](https://developers.cloudflare.com/r2/buckets/public-buckets/)
- [Cloudflare R2 object lifecycle rules](https://developers.cloudflare.com/r2/buckets/object-lifecycles/)
- [MinIO container documentation](https://min.io/docs/minio/container/index.html)
