# Nicole Care 伴随照料面板

v0.4.0 起提供可选面板，配合 Codex 原生妮可使用。它是单独的 Electron 进程，没有第二个桌面角色、独立聊天服务或常驻安装服务。

## 安装

在 [Release](https://github.com/heyuyang04-ui/nicole-desktop-pet/releases/latest) 选择系统对应的 `nicole-care-<版本>-<系统>-<架构>.zip`，按 `SHA256SUMS.txt` 校验。

- Apple Silicon Mac：`mac-arm64`；Intel Mac：`mac-x64`。解压，将 `Nicole Care.app` 放到用户的 `Applications` 目录，双击启动。
- Windows x64：`win-x64`。完整解压到用户目录，启动 `Nicole Care.exe`；不能只取出 exe 丢掉同目录的运行文件。

这是未做 Apple 公证/Windows 商业签名的个人项目。系统拦截时，先核验来源，再通过操作系统正常的安全设置处理；不要关闭系统保护。安装不写入开机启动。

默认读取用户目录 `.codex/pet-state/nicole/state.json`，与技能共用。使用自定义 `CODEX_HOME` 时，请在启动面板前设置同一个值；Finder 双击通常不会继承终端设置的环境变量。例如：

```sh
CODEX_HOME=/absolute/codex-home "$HOME/Applications/Nicole Care.app/Contents/MacOS/Nicole Care"
```

PowerShell：

```powershell
$env:CODEX_HOME = 'D:\my-codex-home'
& '.\Nicole Care.exe'
```

## 使用

拖动顶部把面板放到妮可附近。原生宠物位置没有可用的附着接口，因此面板不会自动跟随她移动。顶部减号收成胶囊，加号展开；右键面板可查看饱腹度、喂食、置顶和退出。右上角 × 只退出面板，不关闭 Codex 原生宠物。

饱腹度每 5 分钟减 1%，每次喂食加 30%，范围 0—100%。首次为 100%；以后读取原数据，不因重启而恢复满值。离线时间会结算，面板每 15 秒读取一次，因此数字更新可能有最多约 15 秒延迟。快速连续点击有短暂保护，动画期间按钮禁用。

≤30% 时显示饥饿表情与提示。勾选「饿了通知我」后发送本地系统通知，每轮饥饿只提醒一次，喂到 >30% 后开启下一轮。刚勾选且已经饥饿时也会提醒；是否展示还受系统通知设置影响。面板必须运行才能提醒。

「陪我聊聊」复制 `$nicole-pet 妮可陪我聊天`，粘贴到 Codex 即可。不另配模型 API，不自动读取屏幕或聊天记录。面板设置在 `pet-state/nicole/panel.json`；运行缓存位于 `panel-runtime/`。这些文件不上传。

## 更新与开发

退出 Nicole Care，备份旧程序，再用新版解压包替换。保留 `.codex/pet-state/nicole/`，即可保留饱腹度和面板设置。原生角色和技能可独立更新，互不要求同时运行。

源码启动需要 Node.js 24+ 与 pnpm 11：

```sh
pnpm install --frozen-lockfile
pnpm start
```

`pnpm test` 检查安装与状态逻辑，`pnpm test:panel` 使用隔离数据启动真实窗口，`pnpm dist` 构建当前平台的 ZIP。不打包密钥、用户状态、Codex 会话或生成原图。
