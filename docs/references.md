# 参考项目与边界

## 原生资源结构

[HanaAyane/remielle-codex-pet](https://github.com/HanaAyane/remielle-codex-pet)，本次阅读 main 的 `35be534c1e48fb37e58e71da8d83511eada164af`。

借鉴独立输出目录、原生 v2 两文件资源包、动作预览和清晰安装提示。妮可保留自己的图集、提示词与生成素材。

参考项目中的 `animation-triggers.json` 是动作意图声明，不是 Codex 官方插件 API；其说明也提到需要外部运行器解释。妮可使用 `animation-map.json` 记录槽位，不把配置文件描述为已实现的点击事件。

## 独立桌宠窗口

[Wunsch2048/codex-bailong-desktop-pet](https://github.com/Wunsch2048/codex-bailong-desktop-pet)，于 2026-10-23 阅读其 README、开发文档和依赖清单。

白龙项目是独立桌面程序，不是 Codex 原生宠物菜单扩展。它通过透明置顶窗口承载角色画布和信息卡片，在同一个窗口里切换角色/气泡/面板，因此看起来像角色自带功能。妮可 v0.5.0 采用同样的窗口结构：角色本体和卡片由同一个独立 App 管理，使用自己的事件处理器。

不复制白龙的代码、素材、账户读取或日志联动实现。没有将参考仓库的授权默认为 MIT；本仓库 MIT 仅适用于本项目自行编写的代码与文档，角色权利见素材来源说明。

Codex 原生交互以 [官方宠物文档](https://learn.chatgpt.com/docs/pets) 为准。伴随面板不是官方扩展，不改动 Codex 安装文件。
