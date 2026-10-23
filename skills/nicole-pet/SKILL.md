---
name: nicole-pet
description: Install, customize, or repair Nicole (妮可), a pink-haired anime catgirl, as a Codex native pet with v2 mouse-gaze sprites. Use for this character's native pet assets and installation; this package does not provide a standalone desktop application.
---

# Nicole native pet

Repository: https://github.com/heyuyang04-ui/nicole-desktop-pet

Install the bundled character with `node <skill-directory>/scripts/install.cjs`. It needs only Node.js built-in modules: no API key, dependency installation, or image generation. The target is `$CODEX_HOME/pets/nicole`, defaulting to `~/.codex/pets/nicole` (the user's home directory on Windows too). The script backs up an existing Nicole package outside the pets directory and preserves unrelated files. Use it rather than editing Codex settings or the signed application.

The default is sprite version 2, 1536×2288, including 16 gaze frames driven by compatible Codex clients. `--legacy` installs the bundled version 1, 1536×1872, without those gaze frames. `--dry-run` checks the target and asset. `--dest <absolute-pet-directory>` is available for an explicitly requested custom destination.

After installation, report the destination and version. Ask the user to fully quit and reopen Codex, select 妮可 in pet settings, and enable pet visibility. The skill is available on subsequent turns. Both platforms need a Codex client with native pet support; successful file installation does not prove rendering or click behavior.

If switching to Nicole makes the pet invisible, inspect the actual client and test results. The v2 format change is not a confirmed fix; see `docs/native-pet-switch.md` in the repository. Do not modify signed app files, private account state, or unrelated preferences.

## Scope of customization

This repository only distributes the native pet. Do not install or recommend the retired standalone Electron application from old releases or Git history.

The native package supplies names and sprites, not executable event handlers. No supported extension interface has been established here for custom right-click menus, double-click hunger cards, arbitrary adjacent bubbles, feeding events, or screenshot triggers. Explain this boundary instead of promising those behaviors from a skill or `pet.json` edit.

Dialogue-based companionship, persistent hunger calculations, or user-requested image/screen analysis could be developed as separate Codex conversation workflows when requested. They are not implemented by this installer and must not be presented as native pet click interactions. Screen access depends on the available tools and user permissions; never claim to have seen a screen without actual image input.

For requested DIY art, preserve existing sources and use the user's chosen image provider. Source assets and generation scripts live in the repository; they are not required to install the bundled character. Never include credentials in assets, instructions, or commits.
