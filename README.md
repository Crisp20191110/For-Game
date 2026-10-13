# 一叶问仙

原创青绿山水风格的轻量修仙游戏。借鉴装备收集与放置养成这一玩法类型，未使用《寻道大千》的名称、美术或代码。适配 iPhone Safari，可添加到主屏幕作为 PWA 游玩。

## 下载现成部署包

仓库内已附带 [one-leaf-web.zip](releases/one-leaf-web.zip)。打开该文件页面，选择 **Download raw file** 下载，解压后即可上传到 HTTPS 静态托管站点的根目录。它只包含游戏网页资源，无需安装 Node.js 或执行构建。

修改游戏后运行 `python3 scripts/package.py`，再将生成的 `dist/one-leaf-web.zip` 复制到 `releases/one-leaf-web.zip`，以更新随仓库分发的部署包。

## 当前玩法

- **洞天**：点击灵树祈愿，获得五种品质的武器、仙衣或玉佩；比较属性后装备或分解。
- **修行**：积累修为，突破八个境界；培育灵树提升掉落品质，培养灵狐提升属性。
- **历练**：自动回合战斗，每五关出现山君；通关领取奖励，失败没有资源损失。
- **仙缘**：完成五项成长目标，领取一次性奖励。
- **存档**：自动本地保存，支持 JSON 导入导出；离线恢复灵露，每 30 秒 1 滴，上限 50。
- **离线**：HTTPS 首次成功加载并缓存后可离线游玩，无登录、广告或内购。

这是可玩的单机第一版，没有云端同步、联网对战或原生 iOS 安装包。尚未在实体 iPhone 上测试。

## 本地运行

需要 Node.js 20 或以上。运行游戏没有第三方运行时依赖，不需要先安装 npm 包：

```sh
cd /workspace/For-Game
npm start
```

默认端口为 3000，可用 `PORT=8080 npm start` 修改。开发服务器监听全部网卡，只公开游戏文件，不公开 Git 元数据或测试文件。不要直接双击 HTML 文件，ES Modules 和离线缓存需要 HTTP 服务。

## 在 iPhone 上游玩

### 同一局域网快速体验

在你自己的电脑运行以上命令，让 iPhone 和电脑连接同一 Wi-Fi，然后在 Safari 访问 `http://电脑的局域网IP:3000`。若系统防火墙阻止访问，允许该端口的本地网络访问。**普通局域网 HTTP 可以玩，但不支持 Service Worker 离线缓存。云开发机的本地地址并不能直接在手机打开。**

### 通过 HTTPS 网址游玩（推荐）

把下列文件部署到支持 HTTPS 的静态托管站点根目录即可，例如 Cloudflare Pages 或 Netlify 的静态站点部署；无需后端或构建命令：

```text
index.html
manifest.webmanifest
sw.js
src/app.js
src/game.js
src/style.css
public/*
```

也可以用 `python3 scripts/package.py` 生成 `dist/one-leaf-web.zip`（压缩包内容就是站点根目录）。不包含测试、Node 依赖或 Git 信息。路径以 `/` 开头，因此须部署在域名根目录；若放在 GitHub Pages 项目子路径，需另行适配路径。

1. 用 iPhone Safari 打开部署后的 HTTPS 网址。
2. 等待首次页面加载完成，点击一次祈愿体验游戏。
3. Safari 分享菜单 → **添加到主屏幕**。
4. 从主屏幕启动，体验接近独立 App 的全屏效果。成功完成首次缓存后即可断网游玩。

存档属于当前浏览器/站点，换域名、清理网站数据或更换手机不会自动迁移。添加到主屏幕前建议在右上角菜单中导出备份，再在独立应用中导入。无痕模式或存储限制可能影响进度保存。建议使用 iOS 16.4 或更新版本。

本仓库没有配置托管账号，尚未发布公网网址。要做 TestFlight 原生包，还需要后续封装、Apple Developer 账号和签名流程。

## 验证

核心规则测试（不需要安装依赖）：

```sh
npm test
```

浏览器测试：

```sh
npm ci
npx playwright install chromium
npm run test:browser
```

若系统已有 Chromium，可跳过浏览器下载：

```sh
BROWSER_EXECUTABLE=/usr/bin/chromium npm run test:browser
```

也支持 `npx playwright install webkit` 后使用 `BROWSER=webkit npm run test:browser`。Linux 可能还需要 Playwright 的系统依赖；WebKit 自动化通过也不能替代实体 iPhone 验证。

浏览器检查实际点击祈愿、装备、突破、升级、战斗、领取奖励、存档导入导出、刷新恢复、断网操作与 320–1280px 布局。截图输出到被 Git 忽略的 `test-results/`。

## 开发结构

`src/game.js` 是纯规则层，`src/app.js` 负责界面与存储，`src/style.css` 负责响应式样式。`public/` 是原创矢量场景及图标。`sw.js` 提供离线缓存。发布应用壳更新时同步调整缓存版本，并在重新联网、关闭旧页面后验证新版本和离线回退。
