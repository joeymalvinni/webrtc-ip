#!/usr/bin/env node
"use strict";

const { execFileSync } = require("node:child_process");
const { readFileSync, renameSync, rmSync, rmdirSync, writeFileSync } = require("node:fs");
const path = require("node:path");
const { minify } = require("terser");

const root = path.resolve(__dirname, "..");
const tscBin = path.join(
  root,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "tsc.cmd" : "tsc"
);

function runTsc(project) {
  execFileSync(tscBin, ["-p", project], {
    cwd: root,
    stdio: "inherit",
  });
}

async function minifyFile(file, isModule) {
  const result = await minify(readFileSync(file, "utf8"), {
    ecma: 2020,
    module: isModule,
    toplevel: !isModule,
    compress: {
      ecma: 2020,
      passes: 2,
      module: isModule,
      toplevel: !isModule,
    },
    mangle: {
      module: isModule,
      toplevel: !isModule,
    },
    format: {
      comments: false,
      ecma: 2020,
    },
  });

  if (!result.code) {
    throw new Error(`Terser did not produce output for ${file}`);
  }

  writeFileSync(file, `${result.code}\n`);
}

async function main() {
  const cjsFile = path.join(root, "dist", "webrtc-ip.js");
  const esmFile = path.join(root, "dist", "webrtc-ip.mjs");

  rmSync(path.join(root, "dist"), { recursive: true, force: true });
  runTsc("tsconfig.json");
  runTsc("tsconfig.esm.json");
  renameSync(path.join(root, "dist", "esm", "webrtc-ip.js"), esmFile);
  rmdirSync(path.join(root, "dist", "esm"));

  await minifyFile(cjsFile, false);
  await minifyFile(esmFile, true);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});