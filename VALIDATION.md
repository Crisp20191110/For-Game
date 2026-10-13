# 第一版验证记录

2026-10-13，Linux 云开发环境。

- Node.js 核心规则测试：9 项通过，0 失败。
- 系统 Chromium 浏览器：实际操作流程通过；祈愿与装备、境界突破、灵树培养、自动战斗及奖励、任务领取、JSON 存档导出/导入、刷新恢复、未领取装备恢复、Service Worker 断网重载后继续操作均已执行。
- 390px 初始手机视口及 320、375、430、768、1280px 响应式检查：四个页面均无横向溢出。
- 浏览器未捕获到 JavaScript 页面异常。
- 开发服务器对 Git 元数据、package.json 和测试目录返回 404。
- `npm ci` 干净安装通过；游戏本身不依赖第三方运行时包。
- `dist/one-leaf-web.zip` 为静态站点部署包，不包含开发依赖。

**尚未验证**：实体 iPhone、Safari/WebKit 浏览器、公开 HTTPS 部署。WebKit 下载被环境网络策略以 `403 Domain forbidden` 拒绝，涉及 `cdn.playwright.dev` 和 `playwright.download.prss.microsoft.com`，因此不能把 Chromium 测试等同于 Safari 测试。

后续发布前应在实体 iPhone 上检查添加到主屏幕、断网重启以及“文件”App 中的存档导入导出。当前没有已发布的公网试玩网址。
