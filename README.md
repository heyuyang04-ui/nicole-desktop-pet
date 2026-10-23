# 妮可 Nicole · Codex 原生宠物

粉发、蓝眼睛、猫耳。当前版本 **v0.3.0：Codex 原生角色 + 对话互动技能**。角色通过 Codex 的宠物设置显示，饱腹度、喂食和陪聊通过 Codex 对话操作，不需要运行额外的桌宠程序。

![妮可动作预览](妮可桌宠/run/qa/previews/idle.gif)

## 让 Codex 安装

复制这段话，发到能够操作本机文件的 Codex 对话中：

```text
请从 https://github.com/heyuyang04-ui/nicole-desktop-pet
安装最新版 skills/nicole-pet 技能，阅读 SKILL.md，并运行它自带的安装脚本。
我要 Codex 原生妮可和对话互动技能，不要独立程序。
已有安装请备份后更新，保留饱腹度数据。完成后告诉我如何选择妮可和使用互动指令。
```

安装不需要 API Key，也不需要重新生图。技能自带资源；脚本需要 Node.js 18+，只使用内置模块，无需 npm 或 pnpm 安装依赖。其他支持本地命令的 agent 也可遵循同一份 `SKILL.md`。对话使用当前 Codex 的模型与额度，不需要另配聊天 API。

安装后完全退出并重新打开 Codex，在宠物设置中选择「妮可」，开启显示宠物。技能在后续对话中可用。

## 手动下载或安装

[下载原生包与安装技能](https://github.com/heyuyang04-ui/nicole-desktop-pet/releases/latest)：

- `nicole-pet-skill.zip`：推荐，完整技能，包含原生 v2 / 旧版 v1 资源、安装与饱腹度脚本、吃饭动图。
- `nicole-codex-v2.zip`：仅角色资源，不含对话互动技能；解压后将 `nicole` 文件夹放入 Codex 的 `pets` 目录。
- `SHA256SUMS.txt`：下载校验值。

macOS 与 Windows 使用相同的资源包；需要该平台的 Codex 客户端提供原生宠物功能。

也可以从源码安装：

```sh
git clone https://github.com/heyuyang04-ui/nicole-desktop-pet.git
cd nicole-desktop-pet
node skills/nicole-pet/scripts/install.cjs
```

默认目标为 macOS `~/.codex/pets/nicole`，Windows 为用户目录下的 `.codex\pets\nicole`；设置了 `CODEX_HOME` 时使用该目录下的 `pets/nicole`。脚本会将已有妮可备份到 `pet-backups/nicole/`，保留角色目录内的其他用户文件。

旧版客户端可运行 `node skills/nicole-pet/scripts/install.cjs --legacy`，安装不包含原生视线帧的 v1 图集。使用 `--dry-run` 可先检查目标及资源。

## 能增加哪些功能？

直接在 Codex 对话输入以下指令；若没有自动识别技能，在前面加 `$nicole-pet`：

| 对话指令 | v0.3.0 的行为 |
| --- | --- |
| 妮可状态 / 查看饱腹度 | 读取本地状态，显示当前百分比和文字进度条 |
| 喂妮可 / 妮可吃饭 | 饱腹度 +30%，最高 100%；在对话中显示吃饭动图 |
| 妮可陪我聊天 | Codex 以妮可的语气陪聊，不另开窗口 |
| 妮可看看这张图 / 看看屏幕 | 分析提供的图片；截图需当前会话有相应工具和权限，不可用时请用户提供截图 |

首次安装或首次运行状态指令时为 100%，之后每满 5 分钟减 1%，最低 0%。关闭 Codex 的时间也计入，查看/喂食时按时钟结算；没有后台定时器或持续刷新气泡。喂食不会清空不足五分钟的累计时间。

状态独立保存在 `$CODEX_HOME/pet-state/nicole/state.json`（默认用户目录下的 `.codex/pet-state/nicole/state.json`），升级技能或重装皮肤不会重置。当前无原生加载回调，因此初始化时机是安装/首次指令，不是点击「显示宠物」。

对话回复与动图显示在 Codex 聊天内容中，不会改变原生宠物旁的气泡或点击菜单。具体边界如下：

| 想要的功能 | 当前原生版本的边界 |
| --- | --- |
| 自定义角色、服装、表情、动作 | 可修改现有动画槽位的素材，播放时机由 Codex 决定 |
| 眼睛跟随鼠标 | 已提供 v2 的 16 个视线方向，由支持 v2 的 Codex 客户端驱动 |
| 点击角色聊天、自定义右键菜单 | 目前没有找到可供角色包/技能使用的原生扩展接口 |
| 双击显示饱腹度、角色旁动态数值气泡 | 不能仅通过 `pet.json` 和图集实现 |
| 每 5 分钟掉 1%、喂食 +30% | 已由对话技能实现，以本地时间和状态文件计算 |
| 喂食时播放吃饭动画 | 吃饭素材已保留，但没有独立的原生喂食事件；替换现有动画不等于实现喂食交互 |
| 妮可陪聊、看图/看屏幕 | 技能在 Codex 对话中处理；截图取决于当前会话可用工具和系统权限，不由宠物点击触发 |

这是对当前已检查客户端及可用接口的判断，不代表未来 Codex 不会支持扩展。技能可以增加对话工作流，但无法自行改造 Codex 原生宠物界面。本仓库不会修改已签名的 Codex 应用或注入代码。

关于「从内置宠物切到妮可后消失」：v2 升级用于统一格式并支持视线，**尚不能宣称该切换问题已修复**。请重启后实际切换验证，见 [问题记录](docs/native-pet-switch.md)。

## DIY 素材

原始角色图、生成图、提示词和动画帧继续保留，便于修改外观：

- `妮可桌宠/reference/`、`妮可桌宠/run/`：原始参考、母图、九组动作、历史预览与制作记录。
- `assets/codex/`：当前 v2 角色包，1536×2288，11 行。
- `skills/nicole-pet/assets/`：安装器使用的新旧两版资源。
- `assets/source/`：吃饭原图、提示词、视线帧预览和素材检查记录。
- `assets/pet/`：透明帧、吃饭 GIF 与早期图集，作为 DIY 素材；不会由安装脚本安装成额外功能。

`scripts/build-native-pet.py` 用 Pillow 加工原生视线帧；`scripts/process-eating.py` 用已安装 hatch-pet 的提取脚本处理吃饭素材。`scripts/generate-seedream.py` 可使用用户自己的 `ARK_API_KEY` 调用生图服务；安装及日常显示宠物不调用此服务。素材来源见 [说明](assets/PROVENANCE.md)。

## 校验

```sh
node --test test/native-install.test.cjs test/care.test.cjs
```

CI 在 macOS、Windows、Linux 检查原生包安装、备份回退、资源一致性和饱腹度规则，不构建桌面应用。测试不会修改用户真实的 Codex 配置；客户端显示效果仍需实际验证。见 [验证范围](docs/validation.md)。

v0.2.0 起移除独立 Electron 程序及其公开安装包。旧源码仍可从 Git 历史找回；当前分支和发行下载仅维护原生版本。
