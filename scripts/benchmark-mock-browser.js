#!/usr/bin/env node
"use strict";

const { performance } = require("node:perf_hooks");
const path = require("node:path");

const iterations = Number(process.argv[2] || 1000);
const candidateDelayMs = Number(process.env.MOCK_CANDIDATE_DELAY_MS || 0);
const ip = process.env.MOCK_IP || "203.0.113.42";

class MockRTCPeerConnection {
  constructor() {
    this.onicecandidate = null;
    this.closed = false;
  }

  createDataChannel() {}

  createOffer() {
    return Promise.resolve({ type: "offer", sdp: "" });
  }

  setLocalDescription() {
    const emit = () => {
      if (this.closed || !this.onicecandidate) return;

      this.onicecandidate({
        candidate: {
          candidate: `candidate:1 1 udp 2122260223 ${ip} 54321 typ srflx raddr 0.0.0.0 rport 0`,
        },
      });
    };

    if (candidateDelayMs > 0) {
      setTimeout(emit, candidateDelayMs);
    } else {
      queueMicrotask(emit);
    }

    return Promise.resolve();
  }

  close() {
    this.closed = true;
  }
}

global.window = {
  RTCPeerConnection: MockRTCPeerConnection,
  setTimeout,
  clearTimeout,
};

const distPath = path.resolve(__dirname, "../dist/webrtc-ip.js");
delete require.cache[distPath];
const { getIP } = require(distPath);

function percentile(sorted, p) {
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

function summarize(name, samples, result) {
  const sorted = [...samples].sort((a, b) => a - b);
  const total = samples.reduce((sum, value) => sum + value, 0);

  return {
    benchmark: name,
    iterations: samples.length,
    ip: result,
    "mean_us": (total / samples.length * 1000).toFixed(3),
    "min_us": (sorted[0] * 1000).toFixed(3),
    "p50_us": (percentile(sorted, 0.50) * 1000).toFixed(3),
    "p95_us": (percentile(sorted, 0.95) * 1000).toFixed(3),
    "p99_us": (percentile(sorted, 0.99) * 1000).toFixed(3),
    "max_us": (sorted[sorted.length - 1] * 1000).toFixed(3),
  };
}

async function time(fn) {
  const start = performance.now();
  const result = await fn();
  return { duration: performance.now() - start, result };
}

(async () => {
  const cold = [];
  let coldResult = "";
  for (let i = 0; i < iterations; i++) {
    const { duration, result } = await time(() => getIP(`stun:mock-${i}.invalid:19302`));
    cold.push(duration);
    coldResult = result;
  }

  const warm = [];
  const warmKey = "stun:mock-warm.invalid:19302";
  await getIP(warmKey);
  let warmResult = "";
  for (let i = 0; i < iterations; i++) {
    const { duration, result } = await time(() => getIP(warmKey));
    warm.push(duration);
    warmResult = result;
  }

  console.table([
    summarize("mock cold WebRTC lookup", cold, coldResult),
    summarize("mock cached lookup", warm, warmResult),
  ]);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});