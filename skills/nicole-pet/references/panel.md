# Optional Nicole Care panel

Use this workflow only for a user request to install/start the companion panel. It is an additional application, not a Codex pet menu plugin. It displays a care card only; the character on the desktop continues to be the Codex native pet.

1. Inspect the host OS/CPU and latest release at https://github.com/heyuyang04-ui/nicole-desktop-pet/releases/latest. Select `nicole-care-<version>-mac-arm64.zip`, `-mac-x64.zip` or `-win-x64.zip`, and verify the release checksum. Do not substitute a retired v0.1 app.
2. Download/extract the panel to a user-owned applications directory. If updating, quit only Nicole Care, back up the previous application and replace it. Preserve `$CODEX_HOME/pet-state/nicole/` and unrelated application files. Do not quit or modify Codex to install the panel.
3. Start `Nicole Care.app` on macOS or `Nicole Care.exe` on Windows when starting is requested. Unsigned distribution may require the user's normal OS approval; do not disable Gatekeeper or other system protections. Do not enable login startup unless requested.
4. If `CODEX_HOME` is customized, launch the panel with that same environment variable, or it will use the default `~/.codex`. The panel and care script must use the same root to share fullness. The panel does not store its own duplicate hunger state.

Alternative developer launch from a repository checkout: Node.js 24+, pnpm 11, `pnpm install --frozen-lockfile`, then `pnpm start`. This skill ZIP alone contains no panel runtime; fetch the separate release or repository when the panel was requested.

Explain these controls: drag the top bar beside the native pet; the minus/plus button toggles the compact card; right-click the panel for fullness, feeding, pinning and exit. Feeding adds up to 30 and displays the bundled eating GIF. `陪我聊聊` copies a command to paste into Codex, rather than opening an independent chat window.

At ≤30% fullness, the panel shows the hungry portrait and text. Enabling `饿了通知我` permits one local system notification per low-fullness period. Feeding to >30% rearms the next period. The panel needs to be running to send notices, and OS notification settings still apply. Closing it exits the panel; it does not hide or close the Codex pet.

There is no supported automatic attachment to Codex's pet window, no native menu injection, no screen capture, no account/session-log monitoring, no extra model key, and no automatic update or login service in this panel. These are current boundaries, not blanket restrictions on future user-requested work.
