# Browser build and hosting

Run these from the project folder:

```powershell
npm.cmd ci
npm.cmd run export:web
npm.cmd run preview:web
```

`ci` is needed for a fresh checkout or dependency update, not on every reopening. The local production address is `http://127.0.0.1:4173`. Stop with Ctrl+C. Later reopen with `npm.cmd run preview:web`. If the port is occupied, use `npm.cmd run preview:web -- --port 4174`; retain that exact address for the same browser data.

The build output is `dist`. All ten exported routes, fonts, scripts, the import worker and eight downloads must be served together. Do not open HTML through `file://`, omit the worker or put the app under a subdirectory without configuring and testing a base path.

## Netlify preparation

The checked-in `netlify.toml` specifies Node 24, build command `npm run export:web` and publish directory `dist`. These match [Expo's static publishing guidance](https://docs.expo.dev/guides/publishing-websites/). A future deployment can connect this repository and use that configuration, or upload the complete prebuilt `dist` directory. No deployment or hosting account has been created in this task.

Use HTTPS. Serve extensionless routes such as `/grammar` from their exported `.html` files (Netlify pretty URLs support this pattern). Do not rewrite existing `.js`, `.ttf`, `.csv` or `.xlsx` files to the homepage. After deployment, check direct navigation and refresh for every route, worker startup, both import formats and all downloads. A restrictive host CSP must permit the local worker and Expo's generated scripts/styles; the local preview and desktop policy are in `desktop/static-files.cjs`.

The application currently has no backend. Local storage belongs to its browser origin. Moving from localhost to a hosted domain starts a different local store; importing source files can rebuild curriculum there, but progress sync/export is not implemented. No secrets or environment variables are needed for this phase.

## Browser limitations

Use current Chrome or Edge on Windows for the tested path. Web Locks and file/worker APIs require a secure context: HTTPS on a host or a loopback address locally. Production export is not an installed offline PWA. The Electron package supplies local offline resources and a stable desktop profile.

The build includes the XLSX parser in a separate worker bundle. This keeps its parsing work off the interface thread, but it adds download size. Runtime checks bound personal imports and reject malformed data; they are not a general spreadsheet editor. Browser storage capacity varies. If saving fails, the app reports the failure rather than claiming success. Keep original import files.
