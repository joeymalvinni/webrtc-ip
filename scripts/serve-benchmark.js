#!/usr/bin/env node
"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const requestedPort = Number(process.env.PORT || process.argv[2] || 8081);

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

function openBrowser(url) {
  if (process.env.NO_OPEN) return;

  const command = process.platform === "darwin" ? "open" : process.platform === "win32" ? "cmd" : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];
  spawn(command, args, { stdio: "ignore", detached: true }).unref();
}

function listen(port) {
  server.once("error", (error) => {
    if (error.code === "EADDRINUSE" && port !== 0 && !process.env.PORT && !process.argv[2]) {
      console.warn(`Port ${port} is already in use; retrying on a random free port.`);
      listen(0);
      return;
    }

    throw error;
  });

  server.listen(port, "127.0.0.1");
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url || "/", "http://127.0.0.1");
  const pathname = decodeURIComponent(url.pathname === "/" ? "/benchmarks/browser.html" : url.pathname);
  const filePath = path.normalize(path.join(root, pathname));

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": types[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "credentialless",
    });
    response.end(data);
  });
});

server.on("listening", () => {
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : requestedPort;
  const url = `http://127.0.0.1:${port}/benchmarks/browser.html`;
  console.log(`Benchmark server running at ${url}`);
  openBrowser(url);
});

listen(requestedPort);
