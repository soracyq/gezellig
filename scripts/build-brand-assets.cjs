/* global __dirname */
// Vector source is assets/icon.svg. Requires Sharp in the development runtime.
const fs = require("node:fs/promises");
const path = require("node:path");
const { Buffer } = require("node:buffer");
const { createRequire } = require("node:module");
const root = path.resolve(__dirname, "..");
const sharp = createRequire(
  path.join(root, ".artifact-build/node_modules/__brand.cjs"),
)("sharp");
(async () => {
  const svg = await fs.readFile(path.join(root, "assets/icon.svg"), "utf8");
  const png = (size) =>
    sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
  const source = svg.match(/<rect[\s\S]*?(?=<\/svg>)/)[0];
  const logo = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="64" viewBox="0 0 240 64">
  <title>Gezellig</title>
  ${source.trim()}
  <text x="80" y="45" font-family="Segoe UI, sans-serif" font-size="40" font-weight="700" letter-spacing="-1.2" fill="#243F4D">Gezellig</text>
</svg>\n`;
  await fs.mkdir(path.join(root, "public/brand"), { recursive: true });
  await fs.writeFile(path.join(root, "assets/logo.svg"), logo);
  await fs.writeFile(
    path.join(root, "assets/logo.png"),
    await sharp(Buffer.from(logo)).resize(480, 128).png().toBuffer(),
  );
  await fs.writeFile(path.join(root, "assets/mark.svg"), svg);
  await fs.writeFile(path.join(root, "assets/icon.png"), await png(1024));
  await fs.writeFile(path.join(root, "assets/favicon.png"), await png(48));
  await fs.writeFile(path.join(root, "public/brand/icon.svg"), svg);
  await fs.writeFile(path.join(root, "public/brand/logo.svg"), logo);
  for (const size of [192, 512])
    await fs.writeFile(
      path.join(root, `public/brand/icon-${size}.png`),
      await png(size),
    );
  const sizes = [16, 24, 32, 48, 64, 128, 256];
  const images = await Promise.all(sizes.map(png));
  const directory = Buffer.alloc(6 + 16 * sizes.length);
  directory.writeUInt16LE(1, 2);
  directory.writeUInt16LE(sizes.length, 4);
  let offset = directory.length;
  images.forEach((data, i) => {
    const entry = 6 + i * 16;
    directory[entry] = directory[entry + 1] = sizes[i] === 256 ? 0 : sizes[i];
    directory.writeUInt16LE(1, entry + 4);
    directory.writeUInt16LE(32, entry + 6);
    directory.writeUInt32LE(data.length, entry + 8);
    directory.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });
  await fs.writeFile(
    path.join(root, "assets/gezellig.ico"),
    Buffer.concat([directory, ...images]),
  );
  console.log("Generated Gezellig SVG, PNG and seven-size Windows ICO assets.");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
