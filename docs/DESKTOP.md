# Dutchly on your computer

Dutchly's Electron wrapper displays the same production web app as the browser version. It includes the web assets, import parser, and templates, so normal use works offline. A development server and Codex are not required for an installed build.

Electron was chosen because the existing Expo export runs in its bundled Chromium browser and the project already uses Node.js. Tauri would produce a smaller application but adds Rust and operating-system webview/toolchain differences. Electron therefore keeps this first wrapper small in implementation, although the installer is larger. See the [Electron security guide](https://www.electronjs.org/docs/latest/tutorial/security/), [custom protocol documentation](https://www.electronjs.org/docs/latest/api/protocol), and [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/).

## Open from source on Windows

1. Open PowerShell or Windows Terminal.
2. Go to your existing project folder:

   ```powershell
   Set-Location -LiteralPath 'D:\Codex\Project\Dutch Learning APP'
   ```

3. On the first run, or after pulling dependency changes, run:

   ```powershell
   npm.cmd ci
   ```

4. Build the current interface and open the desktop app:

   ```powershell
   npm.cmd run desktop
   ```

Leave the terminal open while running from source. After the web build already exists, `npm.cmd run desktop:open` reopens that build faster. Run `npm.cmd run desktop` again after changing the interface or import worker. The application window can be closed normally.

Use `npm` instead of `npm.cmd` in a macOS terminal. Change into the project's actual folder first.

## Build a Windows installer

From the same project folder:

```powershell
npm.cmd run build:desktop
```

On Windows this produces `release\Dutchly-0.3.1-Setup.exe` and an unpacked application at `release\win-unpacked\Dutchly.exe`. Close the old app, run the setup file, choose an installation location, and then open **Dutchly** from the Start menu or desktop shortcut. Updates retain the same `%APPDATA%\Dutchly` profile. The installed app can be reopened without a terminal, Node.js, or Codex. `npm.cmd run build:desktop:dir` produces only the unpacked application for local checks. Version 0.3.1 bundles a Dutch pronunciation fallback, so **Listen** also works offline without installing a Dutch Windows voice; see [pronunciation troubleshooting](LOCAL_PRONUNCIATION.md).

The build is currently unsigned. Windows may display an unknown-publisher/SmartScreen prompt. Signing and a trusted release channel are future distribution tasks. Installing an unverified download is not necessary for development; the source-run command is available above. The Windows configuration targets x64. Windows ARM64 and other targets need their own build and testing.

## Build on macOS

On a Mac with Node.js 24 installed, open a terminal in the project folder and run:

```sh
npm ci
npm run desktop
npm run build:desktop
```

The supplied macOS configuration targets DMG and ZIP output for the current Mac's architecture. Build and test on a Mac; this Windows workspace cannot validate macOS packaging or native dialogs. Apple signing, hardened runtime, and notarization are deliberately not implemented in this first local wrapper. Gatekeeper can prevent unsigned apps from opening. Prepare signed and notarized builds before distributing to other Mac users.

## Files and progress

Use **Import** to pick a local CSV or XLSX file. Chromium supplies the native file picker; only a file you choose is read. Template/example downloads open a normal **Save As** dialog, initially pointing to your Downloads folder. Choose the destination and save the file. The importer and all eight downloadable files are packaged inside the application.

Desktop data is local to the application's profile: `%APPDATA%\Dutchly` on Windows and `~/Library/Application Support/Dutchly` on macOS. Reopening and rebuilding preserve the profile. The installer does not request deletion of it during uninstall. Do not manually delete this folder unless you intend to remove your local data.

Browser and desktop data are separate. Browser data also belongs to a specific origin: switching between `localhost` and `127.0.0.1`, using a different port, or opening a hosted site produces a different local store. There is no account synchronization or backup/export feature yet. Import the same source files separately if you want the same curriculum in each environment.

## Production web preview and hosting

```powershell
npm.cmd run export:web
npm.cmd run preview:web
```

Open **http://127.0.0.1:4173** in Chrome or Edge and keep the terminal open. Stop it with **Ctrl+C**. If the port is occupied, use `npm.cmd run preview:web -- --port 4174`, then open **http://127.0.0.1:4174**. That different port has a separate browser data store. The preview binds only to this computer.

The generated website lives in `dist`. Deploy the complete contents of `dist`, including `assets`, `_expo`, `import-worker.js`, route HTML files, and `templates`. Opening `dist/index.html` directly as a file is not a supported way to run it. Use the preview server or a static HTTPS host.

`netlify.toml` prepares a Netlify site with build command `npm run export:web` and publish directory `dist`; no account, deployment, or paid service is created by this configuration. When configuring another host, preserve the generated route HTML files and support extensionless routes such as `/grammar` mapping to `grammar.html`. Use HTTPS so browser storage locking and other secure-context APIs work. A browser's **Reload** and opening a route URL directly should both succeed.

## Wrapper boundaries

The renderer is sandboxed, has context isolation, and has no Node.js access or preload/IPC bridge. Only files inside the bundled web export are served at `dutchly://app`. External navigation, extra windows, webviews, network requests, and unneeded permissions are denied. Local storage, workers, file selection, and the eight template downloads use normal Chromium APIs. No updater, signing, store publishing, payments, or separate desktop interface is included.

Desktop verification results are recorded in the project's verification document after running the build and UI checks. macOS validation remains a follow-up on actual Mac hardware.
