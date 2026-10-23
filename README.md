# 妮可 Nicole · 动漫桌宠

粉发、蓝眼睛、猫耳和一点点陪伴。提供 **Codex 原生角色包**，以及 **macOS / Windows 独立桌宠**。所有参考图、生成原图、提示词和动画帧均保留，方便 DIY。

![妮可吃饭](assets/pet/eating.gif)

## 两种运行方式

| | Codex 原生妮可 | 独立 Nicole Pet |
| --- | --- | --- |
| 显示位置 | Codex 自带宠物 / Mini | 桌面透明角色 |
| 鼠标视线跟随 | v2 图集 16 个方向 | 平滑眼睛跟随 |
| 饥饿、投喂、吃饭 | 原生菜单不支持自定义 | 支持 |
| 聊天、看屏幕 | 使用 Codex 本身能力，包不修改其菜单 | 自选聊天/视觉模型 |
| 界面 | Codex 自带界面 | 只有角色和贴身气泡，不另开聊天窗口 |
| API Key | 安装皮肤不需要 | 用户自行配置，绝不内置作者 Key |

**skill 不能给 Codex 原生宠物的右键菜单注入功能。** 本项目不修改已签名的 Codex 应用；完整互动由独立程序提供。需要哪一种就安装哪一种，避免同时出现两只妮可。

## 直接让 agent 安装

把这段话发给 Codex 或其他能运行本地命令的 agent：

> 从 https://github.com/heyuyang04-ui/nicole-desktop-pet 安装 skills/nicole-pet 技能，阅读 SKILL.md，帮我安装妮可。我要 Codex 原生皮肤；如果我说完整互动版，再安装独立程序。

Codex 的 skill-installer 可安装 `heyuyang04-ui/nicole-desktop-pet` 中的 `skills/nicole-pet`。技能自带原生资源与安装脚本，不需要重新生图。其他 agent 也可以克隆仓库并遵循同一份 `SKILL.md`。

手动安装原生包（需要 Node.js）：

```sh
git clone https://github.com/heyuyang04-ui/nicole-desktop-pet.git
cd nicole-desktop-pet
node skills/nicole-pet/scripts/install.cjs
```

默认安装到 `~/.codex/pets/nicole`，Windows 对应当前用户目录下的 `.codex\pets\nicole`；设置了 `CODEX_HOME` 时以它为准。已有包会备份到 `.codex/pet-backups/nicole/`。重新打开 Codex，在宠物设置中选择妮可。旧客户端可以加 `--legacy` 安装 9 行旧版。

关于“从内置切到妮可后消失”：新版已统一为 11 行 v2，并保留回退包；**尚不能宣称原生切换 bug 已修复**。详情和回归步骤见 [切换问题记录](docs/native-pet-switch.md)。

## 独立互动版

在 [Releases](https://github.com/heyuyang04-ui/nicole-desktop-pet/releases) 查看可用构建。macOS 解压后将 `Nicole Pet.app` 放到应用程序目录；Windows 运行对应安装器。未签名/未公证的预览构建可能出现系统确认提示；项目没有内置自动更新。

从源码运行（Node.js 24+，macOS/Windows 通用）：

```sh
npx pnpm@11.25.0 install --frozen-lockfile
npx pnpm@11.25.0 start
```

- **单击**：展开贴在角色上方的聊天气泡。
- **双击**：查看饱腹度卡片，数字与进度条同步更新。
- **右键**：查看状态、喂食、看屏幕、打招呼、跳跃、声音和设置。
- **拖动**：移动角色。透明空白区域不会挡住桌面操作。
- **× / Esc**：收起气泡，只留下角色。整个程序只创建一个透明窗口。

饱腹度首次启动为 100%，每经过 5 分钟减少 1%，最低 0%；喂食增加 30%，上限 100%。按系统时钟计算，休眠和关闭期间也会消耗，喂食不会抹掉未满五分钟的累计时间。吃饭是六帧生成动画，运行时直接播放，不会每次喂食调用付费生图 API。

### 配置聊天和看屏幕

右键 → 模型与设置。填写 API **基础地址**（不要带 `/chat/completions`）、控制台中可用的模型 ID 和对应 Key。支持兼容 Chat Completions 的服务和本机模型；远程地址要求 HTTPS，本机 `localhost`/`127.0.0.1` 可用 HTTP。

DeepSeek 等文本模型可用于聊天；看屏幕需要单独配置支持图片输入的模型。火山引擎可填写 `https://ark.cn-beijing.volces.com/api/v3`，模型 ID 以你的控制台权限为准。**Seedream 是生图模型，不能填到聊天/视觉理解栏。** 使用 OpenAI 兼容服务时也应选支持该聊天端点和图片输入的模型。

“看屏幕”先选显示器、截图预览，再点击“发送给视觉模型”。发送目标在预览页显示。截图只存在内存、两分钟后不可发送、一次发送后失效；应用不自动监视屏幕、不保存截图。macOS 首次使用需在系统设置中允许屏幕录制，权限变更后可能需要重启。Windows 同样通过 Electron 的桌面采集接口获取所选显示器。

回复会显示在贴身气泡；可选本机中文语音朗读，没有可用本地中文语音时保持文字显示。聊天记录只保留在当前进程内，可随时清空。Key 通过系统加密存到本机应用数据目录；加密不可用时只保留在内存。

## DIY 角色和动画

- `妮可桌宠/reference/`：用户提供的原始身份参考。
- `妮可桌宠/run/`：母图、九组动作原图、提示词、抠图帧、预览与历史校验。
- `assets/source/`：吃饭原图、提示词、接触表和视线帧预览。
- `assets/pet/`：独立程序使用的透明资源。
- `assets/codex/`：原生 v2 图集与清单。
- `skills/nicole-pet/assets/`：技能内置的新旧两版原生包。

用火山 API 重新生图时，在终端环境中设置自己的 `ARK_API_KEY`，再运行：

```sh
python3 scripts/generate-seedream.py --prompt assets/source/eating-retry-prompt.md --output assets/source/eating-v2.png --reference 妮可桌宠/run/references/canonical-base.png --reference 妮可桌宠/run/references/layout-guides/idle.png
```

脚本默认使用本项目已验证的 `doubao-seedream-5-0-flash-260915`，可用 `--model` 指定自己有权限的型号；这是付费服务调用。不会覆盖已有输出。角色身份参考、母图与帧数布局应一起提供，才能减少画风漂移。加工需要 Pillow，`process-eating.py --extractor <hatch-pet/scripts/extract_strip_frames.py>` 使用已安装的 hatch-pet 抠色与提取方法；`build-native-pet.py` 从已有图集生成 v2 视线帧，不调用模型。

原图是用户提供的角色参考，第三方角色/原图权利不因代码 MIT 协议而转移。生成资产的来源说明见 [素材说明](assets/PROVENANCE.md)。

## 开发与构建

```sh
npx pnpm@11.25.0 test
npx pnpm@11.25.0 test:smoke
npx pnpm@11.25.0 exec electron-builder --mac --arm64 --publish never
npx pnpm@11.25.0 exec electron-builder --win --x64 --publish never
```

CI 为 macOS arm64/x64 与 Windows x64/arm64 分别打包。构建成功不等于所有平台实际交互已验证；本机执行的是 macOS 集成测试。自动化集成测试使用独立临时目录、本地模拟模型和测试图片，**不采集真实屏幕，也不调用真实模型**。真实 API 需要用户填好自己可用的模型后验证；原生切换回归需要在 Codex 中实际操作。

核心实现：`app/core.cjs` 负责饥饿规则和模型请求，`app/main.cjs` 负责系统窗口/加密/截图，`app/pet.js` 负责动画和眼睛，`app/panel.js` 负责同一个窗口中的气泡内容。
