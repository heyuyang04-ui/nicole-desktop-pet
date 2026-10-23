# 妮可 Nicole · Codex 原生宠物

粉发、蓝眼睛、猫耳。**v0.4.0：原生角色包 + 对话技能 + 可选照料面板。**

妮可由 Codex 原生宠物显示；只想换角色，安装两份资源就够。想点击喂食、查看实时饱腹度，可以另外启动「Nicole Care」伴随面板，拖到妮可旁边。面板是独立进程，不会修改 Codex，也不会再生成一只桌面宠物。

![妮可](previews/idle.gif)

## 让 Codex 安装或更新

复制给能够操作本机的 Codex：

```text
请从 https://github.com/heyuyang04-ui/nicole-desktop-pet
安装或更新最新版 skills/nicole-pet，阅读 SKILL.md，运行原生宠物安装脚本。
已有版本请备份并保留我的饱腹度和自定义文件。
```

如果也需要可点击的照料面板，在后面加：

```text
同时安装适合我系统的 Nicole Care 伴随面板并启动。
妮可仍使用 Codex 原生宠物，面板放在角色旁边即可。
```

安装不需要 API Key，不需要重新生成图片。原生安装器只用 Node.js 18+ 内置模块。安装后，在 **Codex 设置 → 宠物 → Refresh / 刷新** 中选择「妮可」；未刷新出来时完全退出并重开 Codex。默认显示快捷键：macOS `Option + Space`，Windows `Win + Alt + P`，以自己的快捷键设置为准。[官方说明](https://learn.chatgpt.com/docs/pets)

## 下载与手动安装

[最新版本下载](https://github.com/heyuyang04-ui/nicole-desktop-pet/releases/latest)

| 文件 | 用途 |
| --- | --- |
| `nicole-codex-v2.zip` | 纯角色包：仅 `nicole/pet.json` 与 `nicole/spritesheet.webp` |
| `nicole-pet-skill.zip` | 原生安装/更新、诊断、饱腹度、喂食和陪聊技能 |
| `nicole-care-0.4.0-mac-arm64.zip` | 可选面板，Apple Silicon Mac |
| `nicole-care-0.4.0-mac-x64.zip` | 可选面板，Intel Mac |
| `nicole-care-0.4.0-win-x64.zip` | 可选面板，Windows x64 |

纯角色包解压到 macOS `~/.codex/pets/` 或 Windows `%USERPROFILE%\.codex\pets\`。自定义 `CODEX_HOME` 时使用其下的 `pets/`。面板解压后运行 `Nicole Care.app` 或 `Nicole Care.exe`；它不包含自动开机启动。Mac 包未做 Apple 公证，系统可能拦截；请按系统安全设置核验并允许，不需要关闭 Gatekeeper。详细说明见 [面板安装与使用](docs/companion-panel.md)。

从源码安装原生角色：

```sh
git clone https://github.com/heyuyang04-ui/nicole-desktop-pet.git
cd nicole-desktop-pet
node skills/nicole-pet/scripts/install.cjs
```

已有源码安装更新：

```sh
git pull --ff-only
node skills/nicole-pet/scripts/install.cjs
```

上述命令更新角色资源；安装过技能的用户还需让 Codex 更新 `~/.codex/skills/nicole-pet`，不能只更新源码副本。相同图集重复安装不改文件；资源变化先备份，再用完整文件替换，格式升级时保留旧图集。饱腹度不会重置。`--dry-run` 只检查；`--legacy` 仅供明确需要旧 v1 格式的客户端，不是消失问题的通用修复。

## 饱腹度与互动

![饥饿面板预览](previews/panel-hungry.png)

首次安装或首次使用为 100%；每满 5 分钟减 1%，最低 0%；每次喂食 +30%，最高 100%。关闭程序的时间也计算在内。状态保存在 `$CODEX_HOME/pet-state/nicole/state.json`，技能与面板共用，重装角色或升级都保留。

| 入口 | 可以做什么 |
| --- | --- |
| Codex 对话：`$nicole-pet 妮可状态` | 查看百分比和进度条 |
| Codex 对话：`$nicole-pet 喂妮可` | 喂食 +30%，显示吃饭动图 |
| Codex 对话：`$nicole-pet 妮可陪我聊天` | 在当前对话陪聊；看图也在此处理 |
| 照料面板：开饭啦 | 点击喂食、播放已有吃饭动图 |
| 照料面板：右键 / 顶部减号 | 饱腹度、喂食、精简胶囊、置顶、退出 |
| 照料面板：饿了通知我 | 勾选后，在饱腹度 ≤30% 时发送一次系统通知；喂到 >30% 后重新启用下一轮提醒 |

面板运行时每 15 秒核对状态，低饱腹度自动显示饥饿表情和文字；退出面板后不会继续发送通知。其「陪我聊聊」按钮复制 Codex 指令，需粘贴进 Codex；没有额外模型 API 或独立聊天窗口。

原生宠物旁的 Quick Chat 可通过悬停后的铅笔按钮打开，并使用 `$nicole-pet`。**目前没有已确认的公开接口让角色包自定义 Codex 原生右键菜单、双击事件或气泡内容。** 面板可以拖到旁边，但不会自动跟随 Codex 宠物位置，也不接管其点击。[官方交互说明](https://learn.chatgpt.com/docs/pets)

## 原生动作图鉴

以下 GIF 从当前发布的图集导出，播放速度仅供预览，实际触发与时序由 Codex 控制。

| 待机 | 向右移动 | 向左移动 |
| --- | --- | --- |
| ![](previews/idle.gif) | ![](previews/running-right.gif) | ![](previews/running-left.gif) |
| 挥手 | 跳跃 | 失败 |
| ![](previews/waving.gif) | ![](previews/jumping.gif) | ![](previews/failed.gif) |
| 等待 | 运行 | 检查 |
| ![](previews/waiting.gif) | ![](previews/running.gif) | ![](previews/review.gif) |

原生 v2 图集为 1536×2288、8 列 11 行，最后两行提供 16 个视线方向。`output/nicole/animation-map.json` 只记录布局，**不是可执行事件配置**。饥饿图与吃饭动画用于面板/对话，不会改写原生动作槽位。

## 妮可消失时

运行只读诊断：

```sh
node skills/nicole-pet/scripts/doctor.cjs
```

已收到的复现是「角色和下方控件一起消失，Option + Space 能恢复」。资源检查通过，但尚未确认 Codex 窗口隐藏/切换异常的根因。v0.4.0 修正了安装器重复覆盖和部分写入风险，**不宣称修复了客户端的切换消失问题**。恢复方法及回归步骤见 [问题记录](docs/native-pet-switch.md)。

## 结构、DIY 与验证

- `output/nicole/`：原生角色包、布局与几何验证记录。
- `skills/nicole-pet/`：可单独下载安装的技能，无面板运行依赖。
- `panel/`：可选伴随面板源码；原生宠物不依赖它运行。
- `previews/`：动作与面板图鉴。
- `妮可桌宠/`：原始角色参考、生成图、提示词和动作帧。
- `assets/source/`、`assets/pet/`、`assets/panel/`：吃饭与饥饿素材、加工图和制作记录。

素材使用用户指定的火山 Seedream API。`scripts/generate-seedream.py` 从 `ARK_API_KEY` 或 `--ask-key` 的隐藏输入读取密钥，不写入仓库。日常安装、显示、喂食不调用生图 API。新面板饥饿素材提示词为 `assets/source/hungry-prompt.md`。[素材来源](assets/PROVENANCE.md)

```sh
node --test test/*.test.cjs
# 开发面板需要 Node.js 24+、pnpm 11
pnpm install --frozen-lockfile
pnpm start
pnpm test:panel
```

macOS、Windows、Linux 跑核心数据/安装测试；macOS、Windows 构建面板。原生 Codex 的实际切换仍需人工回归。[验证范围](docs/validation.md)

结构参考 [remielle-codex-pet](https://github.com/HanaAyane/remielle-codex-pet)，面板交互参考 [白龙桌宠](https://github.com/Wunsch2048/codex-bailong-desktop-pet)。没有复制这两个项目的代码、角色或动画，详见 [参考说明](docs/references.md)。

v0.2.0 移除了旧独立桌宠；v0.4.0 的 Nicole Care 是用户明确选择后新增的可选照料面板，不会恢复旧程序的桌面角色或聊天服务。
