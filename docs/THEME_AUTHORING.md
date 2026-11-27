# Gemineko Hive 主题创作与上架指南

**Gemineko Hive（基米窝）** 不只是一套皮肤，更是面向 **Google Antigravity** 的开源主题引擎。任何创作者都可以打包自己的 `.gemineko-theme.json`，通过本机文件、GitHub 链接分享，或投稿收录进官方商店目录 [`themes/registry.json`](../themes/registry.json)。

## 1. 最快制作方式（零手写）

1. 打开侧边栏 **🏪 主题商店 → 🎨 精细工坊**，调整基底配色、角色强调色、光效浓度与圆角。
2. 切回 **🏪 主题商店**，在底部 **「打包导出与投稿社区」** 填写你的主题 ID、名称与作者名，点击 **导出 `.gemineko-theme.json`**。
3. 导出后的 JSON 文件自带 `schemaVersion: 1` 及完整 `tokens` / `aurora` / `accent` 结构，可直接微调 `customCss` 并分享给朋友导入。

## 2. 主题包标准 Schema (`schemaVersion: 1`)

```json
{
  "schemaVersion": 1,
  "id": "kyoto-sakura-glass",
  "name": "京都樱吹雪 · 光学玻璃",
  "version": "1.0.0",
  "scheme": "light",
  "author": {
    "name": "AEmbers",
    "url": "https://github.com/AEmbers"
  },
  "license": "MIT",
  "description": "纯白画布衬托樱粉霓虹流光与轻雾玻璃层次。",
  "tags": ["浅色", "樱粉", "光学玻璃"],
  "swatches": ["#FFFFFF", "#F472B6", "#FB7185", "#A855F7"],
  "basePreset": "nebula-day",
  "themeIntensity": "optical-neko",
  "tokens": {
    "--gk-role-primary": "#EC4899",
    "--gk-role-accent2": "#A855F7",
    "--gk-role-accent3": "#38BDF8"
  },
  "aurora": [
    "rgba(244, 114, 182, 0.28)",
    "rgba(168, 85, 247, 0.22)",
    "rgba(56, 189, 248, 0.16)"
  ],
  "accent": {
    "primary": "#EC4899",
    "accent2": "#A855F7",
    "accent3": "#38BDF8",
    "glow": "rgba(236, 72, 153, 0.34)",
    "gradient": "linear-gradient(120deg, #f472b6, #ec4899, #a855f7, #38bdf8)"
  },
  "customCss": "html[data-gk-pack=\"kyoto-sakura-glass\"] .surface-composer-card { box-shadow: 0 12px 32px -12px rgba(236,72,153,0.22); }",
  "watermarkText": "Kyoto Sakura · by AEmbers",
  "homepage": "https://github.com/AEmbers/gemineko-hive"
}
```

### 安全校验边界

- `id` 仅允许 `a-z`、`0-9` 和 `-`（长度 `2~48`，保留 `official-gemineko` 给官方旗舰包）。
- `tokens` 的键名必须以 `--` 开头，值禁止包含 `;`、`{`、`}`、`</style`、`javascript:`、`expression(` 或 `@import`。
- `customCss` 上限 `12 KB`，引擎会自动剥离 `@import`、`javascript:`、`expression(`、`behavior:`、`-moz-binding`、`</style`、`data-has-browser-hole` 以及非 `https://` 的 `url(...)`。
- 从网络 URL 安装时仅放行 `https://raw.githubusercontent.com`、`https://gist.githubusercontent.com` 及 `https://github.com/.../blob/...`（自动转换为 Raw 地址）。

## 3. 提交收录到官方社区商店

- **方式 A（Issue 投稿）**：使用 [主题商店投稿模板](https://github.com/AEmbers/gemineko-hive/issues/new?template=theme-submission.yml&labels=theme-submission) 贴出 JSON 与预览截图。
- **方式 B（Pull Request）**：Fork `AEmbers/gemineko-hive`，将你的主题对象追加到 `themes/registry.json` 的 `themes` 数组后发起 PR。

## 4. 版权说明

- 主题引擎源码与主题 JSON 规范采用 **MIT License**；
- 仓库 `assets/` 下内置原创哈基米立绘、3D 晶体图标与角色视觉素材采用 **CC BY-NC-SA 4.0**（署名非商用禁止倒卖）。
