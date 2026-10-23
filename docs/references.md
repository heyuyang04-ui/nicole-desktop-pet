# 参考项目与边界

## 原生资源结构

[HanaAyane/remielle-codex-pet](https://github.com/HanaAyane/remielle-codex-pet)，本次阅读 main 的 `35be534c1e48fb37e58e71da8d83511eada164af`。

借鉴独立输出目录、原生 v2 两文件资源包、动作预览和清晰安装提示。妮可保留自己的图集、提示词与生成素材。

参考项目中的 `animation-triggers.json` 是动作意图声明，不是 Codex 官方插件 API；其说明也提到需要外部运行器解释。妮可使用 `animation-map.json` 记录槽位，不把配置文件描述为已实现的点击事件。

## 可选照料面板

[Wunsch2048/codex-bailong-desktop-pet](https://github.com/Wunsch2048/codex-bailong-desktop-pet)，于 2026-10-23 阅读其 README、开发文档和依赖清单。

白龙项目是 Python/PySide6 的独立 Windows 程序，不是 Codex 原生宠物菜单扩展。借鉴其胶囊展开、卡片交互与人物/信息分离的产品思路。用户随后明确允许增加伴随面板，妮可因此新增独立实现的、面向 macOS/Windows 的照料卡片。

不复制白龙的代码、素材、账户读取或日志联动实现。没有将两个参考仓库的授权默认为 MIT；本仓库 MIT 仅适用于本项目自行编写的代码与文档，角色权利见素材来源说明。

Codex 原生交互以 [官方宠物文档](https://learn.chatgpt.com/docs/pets) 为准。伴随面板不是官方扩展，不改动 Codex 安装文件。
