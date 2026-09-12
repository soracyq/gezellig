/* global __dirname */
const {
  app,
  BrowserWindow,
  dialog,
  Menu,
  protocol,
  session,
  shell,
} = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");
const { isGoogleTranslateURL } = require("./external-links.cjs");
const {
  resolveStaticFile,
  responseHeaders,
  isTemplatePath,
  securityHeaders,
} = require("./static-files.cjs");

const APP_URL = "dutchly://app/";
app.setName("Gezellig");
app.setAppUserModelId("com.dutchly.learning");
// Keep the original origin and profile for existing saved learning data.
// A stable profile persists across reopening and new application builds.
// Chromium's explicit user-data-dir switch supports isolated local testing.
const profile = app.commandLine.getSwitchValue("user-data-dir");
app.setPath(
  "userData",
  profile
    ? path.resolve(profile)
    : path.join(app.getPath("appData"), "Dutchly"),
);

protocol.registerSchemesAsPrivileged([
  {
    scheme: "dutchly",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      allowServiceWorkers: true,
    },
  },
]);

function isAppURL(value) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "dutchly:" &&
      url.host === "app" &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

let mainWindow;
let savingTemplate = false;
function getExportRoot() {
  return app.isPackaged
    ? path.join(process.resourcesPath, "web")
    : path.resolve(__dirname, "..", "dist");
}
async function saveTemplate(pathname) {
  if (savingTemplate || !mainWindow || !isTemplatePath(pathname)) return;
  savingTemplate = true;
  try {
    const file = await resolveStaticFile(getExportRoot(), pathname);
    if (!file)
      throw new Error("This template is missing from the application build.");
    const filename = path.posix.basename(pathname);
    const result = await dialog.showSaveDialog(mainWindow, {
      title: "Save Gezellig template or example",
      defaultPath: path.join(app.getPath("downloads"), filename),
      filters: [
        {
          name: filename.endsWith(".xlsx") ? "Excel workbook" : "CSV file",
          extensions: [filename.split(".").pop()],
        },
      ],
    });
    if (!result.canceled && result.filePath)
      await fs.copyFile(file.path, result.filePath);
  } catch (error) {
    if (mainWindow && !mainWindow.isDestroyed())
      await dialog.showMessageBox(mainWindow, {
        type: "error",
        title: "Template could not be saved",
        message: error.message,
      });
  } finally {
    savingTemplate = false;
  }
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    title: "Gezellig · Your learning space",
    icon: path.join(getExportRoot(), "brand", "icon-512.png"),
    width: 1360,
    height: 920,
    minWidth: 360,
    minHeight: 480,
    backgroundColor: "#F8F9F7",
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      spellcheck: false,
    },
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isGoogleTranslateURL(url)) {
      void shell.openExternal(url).catch(() => {
        if (mainWindow && !mainWindow.isDestroyed())
          void dialog.showMessageBox(mainWindow, {
            type: "error",
            title: "Could not open Google Translate",
            message:
              "Check your default browser and try again. Built-in Listen is still available.",
          });
      });
    }
    return { action: "deny" };
  });
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!isAppURL(url)) {
      event.preventDefault();
      return;
    }
    const pathname = new URL(url).pathname;
    // Chromium does not reliably download custom-scheme attachments. Intercept
    // only our eight fixed links and use Save As without exposing a renderer API.
    if (isTemplatePath(pathname)) {
      event.preventDefault();
      void saveTemplate(pathname);
    }
  });
  mainWindow.webContents.on("will-redirect", (event, url) => {
    if (!isAppURL(url)) event.preventDefault();
  });
  mainWindow.webContents.on("will-attach-webview", (event) =>
    event.preventDefault(),
  );
  mainWindow.once("ready-to-show", () => {
    if (!app.commandLine.hasSwitch("hidden")) mainWindow.show();
  });
  mainWindow.on("closed", () => {
    mainWindow = undefined;
  });
  await mainWindow.loadURL(APP_URL);
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  });

  app
    .whenReady()
    .then(async () => {
      const exportRoot = getExportRoot();
      if (!(await resolveStaticFile(exportRoot, "/"))) {
        dialog.showErrorBox(
          "Gezellig needs a web build",
          "Run npm run export:web in the project folder, then npm run desktop:open.",
        );
        app.quit();
        return;
      }
      session.defaultSession.setPermissionRequestHandler(
        (_contents, _permission, callback) => callback(false),
      );
      session.defaultSession.setPermissionCheckHandler(() => false);
      session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
        const allowed =
          isAppURL(details.url) ||
          details.url.startsWith("blob:dutchly://app/") ||
          details.url.startsWith("data:");
        callback({ cancel: !allowed });
      });
      protocol.handle("dutchly", async (request) => {
        if (!isAppURL(request.url))
          return new Response("Not found", { status: 404 });
        if (!["GET", "HEAD"].includes(request.method))
          return new Response("Method not allowed", { status: 405 });
        try {
          const pathname = new URL(request.url).pathname;
          const file = await resolveStaticFile(exportRoot, pathname);
          if (!file)
            return new Response("Not found", {
              status: 404,
              headers: securityHeaders,
            });
          const body =
            request.method === "HEAD" ? null : await fs.readFile(file.path);
          return new Response(body, {
            headers: responseHeaders(file, pathname),
          });
        } catch (error) {
          console.error("Local application resource failed:", error.message);
          return new Response("Could not load this application resource", {
            status: 500,
          });
        }
      });
      session.defaultSession.on("will-download", (event, item, contents) => {
        const url = item.getURL();
        if (
          !contents ||
          !isAppURL(contents.getURL()) ||
          !isAppURL(url) ||
          !isTemplatePath(new URL(url).pathname)
        ) {
          event.preventDefault();
          return;
        }
        const filename = path.posix.basename(new URL(url).pathname);
        // Electron supplies the ordinary Save As dialog. No automatic overwrite,
        // arbitrary renderer filesystem API, or broad IPC bridge is needed.
        item.setSaveDialogOptions({
          title: "Save Gezellig template or example",
          defaultPath: path.join(app.getPath("downloads"), filename),
          filters: [
            {
              name: filename.endsWith(".xlsx") ? "Excel workbook" : "CSV file",
              extensions: [filename.split(".").pop()],
            },
          ],
        });
        item.once("done", (_event, state) => {
          if (
            state === "interrupted" &&
            mainWindow &&
            !mainWindow.isDestroyed()
          ) {
            void dialog.showMessageBox(mainWindow, {
              type: "error",
              title: "Download interrupted",
              message:
                "The file could not be saved. Try the download again and choose a writable folder.",
            });
          }
        });
      });
      Menu.setApplicationMenu(
        Menu.buildFromTemplate([
          ...(process.platform === "darwin"
            ? [
                {
                  label: "Gezellig",
                  submenu: [
                    { role: "about" },
                    { type: "separator" },
                    { role: "quit" },
                  ],
                },
              ]
            : []),
          {
            label: "File",
            submenu: [
              process.platform === "darwin"
                ? { role: "close" }
                : { role: "quit" },
            ],
          },
          {
            label: "Edit",
            submenu: [
              { role: "undo" },
              { role: "redo" },
              { type: "separator" },
              { role: "cut" },
              { role: "copy" },
              { role: "paste" },
              { role: "selectAll" },
            ],
          },
          {
            label: "View",
            submenu: [
              { role: "reload" },
              { role: "resetZoom" },
              { role: "zoomIn" },
              { role: "zoomOut" },
              { role: "togglefullscreen" },
              ...(!app.isPackaged ? [{ role: "toggleDevTools" }] : []),
            ],
          },
        ]),
      );
      await createWindow();
      app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) void createWindow();
      });
    })
    .catch((error) => {
      console.error("Gezellig could not start:", error);
      dialog.showErrorBox("Gezellig could not start", error.message);
      app.quit();
    });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
