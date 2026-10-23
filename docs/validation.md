# 原生版本验证范围

v0.2.0 仅保留 Codex 原生包与安装技能，已移除独立程序及其测试、依赖和打包流程。

`node --test test/native-install.test.cjs` 在隔离临时目录验证：

- 仓库原生包与技能内置 v2 资源一致。
- 默认 v2 安装的清单、图集和尺寸正确。
- `--dry-run` 不写入角色目录。
- 切换至旧版 v1 时备份旧包，保留用户额外文件；之后可重新安装 v2。
- 不覆盖其他角色的已有目录。

CI 分别运行 macOS、Windows、Linux 的安装测试。文件安装通过不代表相应平台的 Codex 提供宠物功能，也不代表完成了原生界面回归。

现有图像检查记录：`assets/codex/validation.json` 记录 11 行布局、各行帧数、16 个视线方向与透明空余单元。`assets/source/eating-visual-qa.json` 是保留素材的历史视觉复查，不表示原生宠物已支持喂食事件。

尚未确认修复「内置切换到妮可消失」的问题，仍需用户重启 Codex 后按 `native-pet-switch.md` 的步骤实际验证。
