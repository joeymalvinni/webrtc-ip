#!/usr/bin/env node
"use strict";

const { execFileSync } = require("node:child_process");
const { renameSync, rmSync, rmdirSync } = require("node:fs");
const path = require("node:path");

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

rmSync(path.join(root, "dist"), { recursive: true, force: true });
runTsc("tsconfig.json");
runTsc("tsconfig.esm.json");
renameSync(path.join(root, "dist", "esm", "webrtc-ip.js"), path.join(root, "dist", "webrtc-ip.mjs"));
rmdirSync(path.join(root, "dist", "esm"));
