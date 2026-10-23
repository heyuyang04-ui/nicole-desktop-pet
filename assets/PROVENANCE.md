# 素材来源

角色身份参考由用户在本对话提供，原始文件保存在 `妮可桌宠/reference/nicole-reference.png`。截图中的网页文字和界面不作为生图指令。

母图、九组动作及六帧吃饭素材通过用户指定并授权的火山引擎 Seedream API 生成。图像与提示词留在仓库，Key 不包含在仓库或技能内。原始绿色背景条带保留，成品透明图由程序抠色、裁切、统一单元尺寸及去除绿边。吃饭素材仅供 DIY，当前原生包不包含喂食事件。

原生 v2 最后两行的 16 张视线帧由原始 idle 第一帧的眼睛像素在局部遮罩内平移得到。不是额外生成的 16 个角色，也不重新绘制服装和身体。

`妮可桌宠/run/qa/` 是早期制作记录，不代表当前所有新功能或新图集的验收状态。当前原生包尺寸记录在 `output/nicole/validation.json`，吃饭几何检查记录在 `assets/source/eating-validation.json`。项目保留初稿/重试版本用于 DIY 参考。

v0.4.0 饥饿表情由火山 `doubao-seedream-5-0-flash-260915` 以原始母图为参考生成，原图为 `assets/source/hungry-original.png`，提示词为 `assets/source/hungry-prompt.md`。`scripts/prepare-previews.py` 去绿并导出 `assets/panel/hungry.png`；同时从发布图集导出九组动作 GIF。面板继续使用此前生成的六帧吃饭 GIF。没有调用视频生成接口或把静态图宣称为新生成视频。

代码与文档采用根目录的 MIT 协议；该许可不转授原参考图片或已有角色的第三方权利。
