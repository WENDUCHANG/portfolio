# Yujie Zheng — Portfolio

作品集网站，纯静态页面，没有构建步骤。线上地址：https://wenduchang.github.io/portfolio/

推送到 `main` 分支后，GitHub Pages 大约 1 分钟自动更新，不需要手动发布。

## 日常改内容

### 改文字

打开 `projects.js`，所有项目文案都在这个文件里。每个项目是一段 `{ ... }`，常用的几项：

| 字段 | 作用 |
|---|---|
| `title` | 英文项目名，卡片大标题 |
| `cn` | 中文副标题，详情页标题下面那行 |
| `short` | 卡片上的一句话简介 |
| `description` | 详情页右侧的项目介绍 |
| `outcome` | 成品图下面那行说明 |
| `process` | 过程图的说明，按顺序对应 `项目名-1/2/3.webp` |
| `label` | 卡片上的分类标签，如 `TYPEFACE · PUBLICATION · PACKAGING` |
| `primary` | 归属分区：`software` / `poster` / `type` / `object` |
| `also` | 同时归到其他分区，填分区名数组，没有就留 `[]` |
| `tools` | 使用的软件，例如 `['Illustrator', 'InDesign']`，留空则不显示 |
| `video` | 视频链接（YouTube embed 地址），没有就写 `null` |

改完在页面下方填写提交说明（比如 "update Resonance copy"），点 **Commit changes** 即可。

### 换图片

图片都在 `assets/` 里，命名规则是 `项目名-cover.webp`（封面/成品）和 `项目名-1.webp`、`-2`、`-3`（过程图）。

在 `assets/` 页面点 **Add file → Upload files**，把新图拖进去，文件名保持不变就会自动替换。建议导出成 WebP，宽度 1600–1900px 即可。

### 加一个新项目

1. 在 `assets/` 上传 4 张图，例如 `my-project-cover.webp`、`my-project-1.webp` 等
2. 打开 `projects.js`，复制文件末尾注释里的模板，粘贴到数组里面（最后一个项目后面）
3. 把 `id` 改成 `my-project`（和图片文件名前缀一致），填好文字和 `primary`
4. 提交

### 预览

不想改线上，可以先看效果：在仓库页面按 `.` 键会打开网页版编辑器（github.dev），改完在终端里运行 `node preview.mjs`，浏览器打开 http://127.0.0.1:4173 就能看到。

本地改的话，先 `git pull` 拿到最新版本，改完 `git add -A && git commit -m "update copy" && git push`。

## 容易改坏的地方

`projects.js` 是 JavaScript 文件，改文字时要保持格式：

- 每个项目的 `{ }` 之间要有英文逗号
- 文字必须用英文引号 `'` 或 `"` 包起来，用中文引号会报错
- 数组最后一项后面不要加逗号
- 不要删掉 `window.PORTFOLIO_PROJECTS = [` 和最后的 `];`

如果改坏了，页面会显示一条提示而不会整页空白。最稳妥的恢复方式：在仓库的 **Commits** 里找到上一个正常版本，打开改坏的文件，点 **History** 旁边的 **Revert**。

## 文件说明

- `index.html` — 页面结构、首页文案、About、meta 标签
- `projects.js` — 所有项目数据（最常改）
- `styles.css` — 颜色、字体、排版、手机端布局
- `app.js` — 分区渲染、详情弹窗、图片放大、粒子动画
- `assets/` — 7 个项目封面 + 20 张过程图 + 社交分享图

一般只改 `projects.js` 和 `assets/` 就够了，`index.html`、`styles.css`、`app.js` 属于版式和交互，改动前最好先沟通。
