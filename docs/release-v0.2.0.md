妮可 v0.2.0 仅提供 Codex 原生宠物和安装技能，不包含独立桌宠程序。

- 原生 v2 图集：11 行、16 个视线方向；安装技能同时包含旧版 v1 回退资源。
- macOS / Windows 共用角色资源，由支持宠物的 Codex 客户端显示。
- 移除 Electron 源码、依赖、独立应用打包流程及旧版独立程序的公开发行下载。
- 保留原始角色图、提示词、动画帧和吃饭素材供 DIY；吃饭素材不等于原生喂食功能。

最简单的安装方式：将以下内容发给能够操作本机文件的 Codex：

> 请从 https://github.com/heyuyang04-ui/nicole-desktop-pet 安装 skills/nicole-pet 技能，阅读 SKILL.md 并运行自带脚本，安装 Codex 原生妮可。已有角色先备份，完成后告诉我如何选择妮可。

下载 `nicole-pet-skill.zip` 可获取完整技能与安装脚本；`nicole-codex-v2.zip` 仅包含角色包，将解压后的 `nicole` 文件夹放入 `$CODEX_HOME/pets`（默认用户目录下的 `.codex/pets`）。校验值见 `SHA256SUMS.txt`。

安装无需 API Key、npm 依赖或额外桌宠程序。安装后完全退出并重新打开 Codex，在宠物设置中选择「妮可」。

目前没有可用的原生自定义菜单/气泡扩展接口；本版不提供双击饱腹度、点击喂食或自动看屏幕。v2 格式升级也不代表切换消失问题已经修复，仍需客户端回归验证。
