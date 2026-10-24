# 妮可 Nicole · 独立动漫桌宠

v0.5.0 起提供真正的独立桌宠程序：妮可角色本体、透明置顶窗口、视线跟随、动作、气泡、聊天、截图分析、饱腹度、喂食和右键菜单都在同一个 App 里完成。

Codex 原生宠物版本仍保留在技能和原生资源包中，但它与独立 App 是两种运行方式。想要白龙项目那种“角色带着面板一起出现”的体验，请下载 **Nicole Pet**，不要只下载原生技能或旧的 Nicole Care 面板。

## 直接下载

[下载最新 v0.5.0](https://github.com/heyuyang04-ui/nicole-desktop-pet/releases/latest)

| 文件 | 用途 |
| --- | --- |
| `nicole-pet-0.5.0-mac-arm64.zip` | Apple Silicon Mac 独立妮可 |
| `nicole-pet-0.5.0-mac-x64.zip` | Intel Mac 独立妮可 |
| `nicole-pet-0.5.0-win-x64.zip` | Windows x64 独立妮可 |
| `nicole-codex-v2.zip` | 只安装到 Codex 原生宠物的角色资源 |
| `nicole-pet-skill.zip` | Codex 对话中的饱腹度、喂食和陪聊技能 |

Mac：解压后把 `Nicole Pet.app` 放入“应用程序”，双击启动。Windows：完整解压 ZIP 后运行 `Nicole Pet.exe`。程序没有自动安装服务；未签名/未公证的个人构建可能被系统拦截，请核验来源后按系统提示允许，不要关闭系统保护。

## 独立角色怎么互动

- 单击妮可：打开同一个透明窗口里的聊天气泡。
- 双击妮可：打开饱腹度卡片。
- 右键妮可：查看饱腹度、喂食、聊天、看屏幕、打招呼、跳跃、设置和退出。
- 拖动妮可：移动角色；透明区域不会挡住桌面。
- `×` 或 `Esc`：收起卡片，只留下角色。
- 角色眼睛：跟随鼠标平滑移动。

窗口结构和白龙项目相似：程序创建一个透明、置顶、可拖动的桌面窗口，在同一窗口中切换角色画布、气泡和功能卡片；不是“原生 Codex 宠物旁边再放一个面板”。参考白龙的卡片/胶囊思路，但没有复制它的代码、素材或账户读取逻辑。[参考说明](docs/references.md)

## 饱腹度和吃东西

独立 App 与 Codex 技能共用 `$CODEX_HOME/pet-state/nicole/state.json`：首次为 100%，每经过 5 分钟减少 1%，喂食增加 30%，最高 100%，关闭程序的时间也会计算。喂食播放仓库已有的六帧吃饭动画，不会每次调用生图 API。

独立 App 的聊天和看屏幕需要你在“模型与设置”里配置自己的兼容 Chat Completions 服务。DeepSeek 可用于聊天；视觉模型单独配置。火山视觉接口地址可填 `https://ark.cn-beijing.volces.com/api/v3`，模型 ID 按你的控制台权限填写。Seedream 是生图模型，不能直接当聊天/视觉模型使用。Key 通过系统安全存储保存；不会把作者的 Key 放进程序。

看屏幕必须由你主动打开、选择显示器、预览并点击发送；截图只在内存中短暂存在，不自动监视桌面。macOS 首次使用需要“屏幕录制”权限。

## 两种版本的区别

| | 独立 Nicole Pet | Codex 原生妮可 |
| --- | --- | --- |
| 角色位置 | 系统桌面透明窗口 | Codex 自带宠物层 |
| 双击/右键/拖动 | 独立 App 自己处理 | 没有公开自定义扩展接口 |
| 饥饿和喂食 | 同一窗口中可用 | 通过 Codex 对话技能 |
| 聊天和看屏幕 | App 内配置模型后使用 | 当前 Codex 对话处理 |
| 与 Codex 的关系 | 可共用饱腹度文件，不注入 Codex | 由 Codex 原生显示 |

不要同时启动两只妮可。若你只想在 Codex 宠物间选择角色，安装 `nicole-pet-skill.zip` 或运行原生安装命令；若你想要角色和面板一起独立显示，安装 `nicole-pet-*.zip`。

## 给 Codex / agent 的安装指令

独立桌宠：

```text
从 https://github.com/heyuyang04-ui/nicole-desktop-pet/releases/latest
下载并安装适合当前系统的 Nicole Pet 独立桌宠。
我要角色本体和同一窗口中的聊天、双击饱腹度、右键喂食、鼠标视线跟随。
不要只安装 Codex 原生技能，也不要再启动旧的 Nicole Care 面板。
```

Codex 原生宠物：

```text
从 https://github.com/heyuyang04-ui/nicole-desktop-pet
安装最新版 skills/nicole-pet，并运行原生宠物安装脚本。
我要 Codex 原生妮可，不要安装独立桌宠程序。
```

## 从源码构建独立 App

需要 Node.js 24+、pnpm 11：

```sh
pnpm install --frozen-lockfile
pnpm start
pnpm test
pnpm test:smoke
pnpm exec electron-builder --mac --arm64 --publish never
pnpm exec electron-builder --win --x64 --publish never
```

`app/main.cjs` 创建独立透明窗口并处理菜单、拖动、截图和模型请求；`app/pet.js` 播放动作和视线跟随；`app/panel.js` 在同一窗口内切换聊天/状态/屏幕/设置卡片；`skills/nicole-pet/scripts/care.cjs` 提供共享饱腹度规则。

## DIY 素材

- `assets/pet/`：独立 App 的透明角色、动作图集和吃饭动画。
- `output/nicole/`：Codex 原生 v2 角色包与动作映射。
- `skills/nicole-pet/`：原生技能、饱腹度脚本和对话说明。
- `妮可桌宠/`：原始参考图、提示词、动作和制作过程。
- `scripts/generate-seedream.py`：使用你自己的 `ARK_API_KEY` 调用火山 Seedream；密钥不会写入仓库。

角色和饥饿素材来源见 [assets/PROVENANCE.md](assets/PROVENANCE.md)。

## 已知边界

独立 App 与 Codex 原生宠物是两套窗口，不能把独立 App 的右键菜单注入 Codex。Codex 原生宠物从内置角色切换后消失的问题仍由 Codex 客户端负责，`Option + Space` 可以恢复原生浮层；独立 App 不受该切换问题影响。
