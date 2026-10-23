---
name: nicole-pet
description: Install Nicole (妮可), a pink-haired anime catgirl, as a Codex native pet or as a macOS/Windows desktop companion with mouse-following eyes, chat, feeding, and opt-in screen understanding. Use when the user asks to install, launch, customize, or repair this character.
---

# Nicole pet

This skill bundles the native Codex pet assets. The standalone application lives at https://github.com/heyuyang04-ui/nicole-desktop-pet.

Choose the mode matching the request:

- **Codex pet / install character:** run `node <skill-directory>/scripts/install.cjs`. No API key, npm install, or network is required. It installs to `$CODEX_HOME/pets/nicole`, defaulting to `~/.codex/pets/nicole`, and backs up an existing Nicole package outside the pets directory. Select 妮可 in Codex pet settings after installation.
- **Interactive desktop companion / chat / hunger / screen:** clone the repository into the user's chosen location. Read its README, install the locked dependencies with `npx pnpm@11.25.0 install --frozen-lockfile` (Node.js 24+), then run `npx pnpm@11.25.0 start`, or use the platform build in Releases when available. Interactions expand in a bubble attached to the pet, with no second application window. Do not imply the native asset package adds menus or chat to Codex itself.
- **Older Codex:** the default package is sprite version 2, 1536×2288, including 16 gaze frames. `install.cjs --legacy` installs the bundled version 1, 1536×1872, without native eye tracking. Do not claim that changing atlas versions fixes every client-side switching issue. If switching makes a native pet invisible, report the actual client/version and test result; see the repository's `docs/native-pet-switch.md`.

The installer accepts `--dest <absolute-pet-directory>` for an explicitly requested custom destination and `--dry-run` for inspection. It never edits Codex settings or the signed application. Use the included installer rather than hand-editing user configuration.

For model setup, let the user enter API base URL, model ID, and key in the application. Chat and vision are separately configured. Never commit a key, set up a shared author key, or promise that a text-only model can interpret screenshots. The image-generation key is not automatically a chat-model credential.

Screen capture is user-triggered, previews locally, and sends only after confirmation in the application. Do not turn on continuous capture. If the user wants DIY art, preserve the original sources; use their chosen image service and credentials only for the authorized generation. Reusable scripts and prompts are in `scripts/` and `assets/source/` in the repository.

After installing, report the destination, chosen mode and version, and any required client restart/selection. On other agents, this same instruction file can guide installation; standalone features come from running the app, not from the agent loading this skill.
