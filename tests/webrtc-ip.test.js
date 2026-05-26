const assert = require("node:assert/strict");
const test = require("node:test");

const {
  WebRTCIPError,
  clearIPCache,
  getIP,
  getIPInfo,
  getIPOrNull,
  isSupported,
  isWebRTCIPError,
} = require("../dist/webrtc-ip.js");

const publicCandidate = "candidate:1 1 udp 2122260223 203.0.113.42 54321 typ srflx raddr 0.0.0.0 rport 0";
const hostCandidate = "candidate:2 1 udp 2122260223 192.168.1.7 54322 typ host";

const originals = {
  RTCPeerConnection: globalThis.RTCPeerConnection,
  webkitRTCPeerConnection: globalThis.webkitRTCPeerConnection,
  mozRTCPeerConnection: globalThis.mozRTCPeerConnection,
  window: globalThis.window,
};

function restoreGlobal(name, value) {
  if (value === undefined) {
    delete globalThis[name];
  } else {
    globalThis[name] = value;
  }
}

function resetWebRTCGlobals() {
  delete globalThis.RTCPeerConnection;
  delete globalThis.webkitRTCPeerConnection;
  delete globalThis.mozRTCPeerConnection;
  delete globalThis.window;
}

function restoreWebRTCGlobals() {
  restoreGlobal("RTCPeerConnection", originals.RTCPeerConnection);
  restoreGlobal("webkitRTCPeerConnection", originals.webkitRTCPeerConnection);
  restoreGlobal("mozRTCPeerConnection", originals.mozRTCPeerConnection);
  restoreGlobal("window", originals.window);
}

function installMockPeerConnection({ candidates = [publicCandidate], complete = true, delay = 0 } = {}) {
  class MockRTCPeerConnection {
    static instances = [];

    constructor(config) {
      this.config = config;
      this.closed = false;
      this.iceGatheringState = "new";
      this.onicecandidate = null;
      this.onicegatheringstatechange = null;
      MockRTCPeerConnection.instances.push(this);
    }

    createDataChannel(label) {
      this.dataChannelLabel = label;
    }

    createOffer() {
      return Promise.resolve({ type: "offer", sdp: "" });
    }

    setLocalDescription() {
      const emit = () => {
        if (this.closed) return;

        for (const candidate of candidates) {
          if (this.closed) return;
          this.onicecandidate?.({ candidate: { candidate } });
        }

        if (complete && !this.closed) {
          this.iceGatheringState = "complete";
          this.onicegatheringstatechange?.();
        }
      };

      if (delay > 0) {
        setTimeout(emit, delay);
      } else {
        queueMicrotask(emit);
      }

      return Promise.resolve();
    }

    close() {
      this.closed = true;
    }
  }

  globalThis.RTCPeerConnection = MockRTCPeerConnection;
  return MockRTCPeerConnection;
}

function hasErrorCode(code) {
  return (error) => {
    assert.ok(error instanceof WebRTCIPError);
    assert.equal(error.code, code);
    return true;
  };
}

test.beforeEach(() => {
  clearIPCache();
  resetWebRTCGlobals();
});

test.after(() => {
  restoreWebRTCGlobals();
});

test("reports unsupported environments", async () => {
  assert.equal(isSupported(), false);
  await assert.rejects(() => getIP(), hasErrorCode("UNSUPPORTED"));
  assert.equal(await getIPOrNull(), null);
});

test("identifies WebRTCIPError values", () => {
  assert.equal(isWebRTCIPError(new WebRTCIPError("TIMEOUT", "timed out")), true);
  assert.equal(isWebRTCIPError({ name: "WebRTCIPError", code: "TIMEOUT" }), true);
  assert.equal(isWebRTCIPError({ name: "WebRTCIPError", code: "OTHER" }), false);
});

test("resolves a public WebRTC candidate", async () => {
  installMockPeerConnection();

  assert.equal(isSupported(), true);

  const info = await getIPInfo({ cache: false });

  assert.equal(info.ip, "203.0.113.42");
  assert.equal(info.type, "srflx");
  assert.equal(info.protocol, "udp");
  assert.equal(info.port, 54321);
  assert.equal(info.candidate, publicCandidate);
  assert.ok(info.elapsedMs >= 0);
});

test("returns only the IP string from getIP", async () => {
  installMockPeerConnection();

  assert.equal(await getIP({ cache: false }), "203.0.113.42");
});

test("reuses cached lookups", async () => {
  const MockRTCPeerConnection = installMockPeerConnection();

  assert.equal(await getIP("stun:cache.example.test:19302"), "203.0.113.42");
  assert.equal(await getIP("stun:cache.example.test:19302"), "203.0.113.42");
  assert.equal(MockRTCPeerConnection.instances.length, 1);
});

test("expires cached lookups after cacheTtl", async () => {
  const MockRTCPeerConnection = installMockPeerConnection();

  assert.equal(await getIP({ stun: "stun:ttl.example.test:19302", cacheTtl: 1 }), "203.0.113.42");
  await new Promise((resolve) => setTimeout(resolve, 5));
  assert.equal(await getIP({ stun: "stun:ttl.example.test:19302", cacheTtl: 1 }), "203.0.113.42");
  assert.equal(MockRTCPeerConnection.instances.length, 2);
});

test("skips host candidates unless includeLocal is enabled", async () => {
  installMockPeerConnection({ candidates: [hostCandidate] });

  await assert.rejects(
    () => getIP({ stun: [], timeout: 50, cache: false }),
    hasErrorCode("NO_PUBLIC_CANDIDATE")
  );

  clearIPCache();
  installMockPeerConnection({ candidates: [hostCandidate] });

  assert.equal(
    await getIP({ stun: [], includeLocal: true, cache: false }),
    "192.168.1.7"
  );
});

test("supports AbortSignal cancellation", async () => {
  installMockPeerConnection({ candidates: [], complete: false });
  const controller = new AbortController();
  const promise = getIP({ signal: controller.signal, timeout: 1000, cache: false });

  controller.abort();

  await assert.rejects(() => promise, hasErrorCode("ABORTED"));
});

test("does not start a cached lookup for an already-aborted signal", async () => {
  const MockRTCPeerConnection = installMockPeerConnection({ candidates: [], complete: false });
  const controller = new AbortController();
  controller.abort();

  await assert.rejects(
    () => getIP({ signal: controller.signal, timeout: 5 }),
    hasErrorCode("ABORTED")
  );
  assert.equal(MockRTCPeerConnection.instances.length, 0);
});

test("aborting a cached caller does not cancel the shared lookup", async () => {
  const MockRTCPeerConnection = installMockPeerConnection({ delay: 5 });
  const controller = new AbortController();
  const options = { stun: "stun:cached-abort.example.test:19302", signal: controller.signal };
  const promise = getIP(options);

  controller.abort();

  await assert.rejects(() => promise, hasErrorCode("ABORTED"));
  assert.equal(await getIP("stun:cached-abort.example.test:19302"), "203.0.113.42");
  assert.equal(MockRTCPeerConnection.instances.length, 1);
});

test("rejects on timeout", async () => {
  installMockPeerConnection({ candidates: [], complete: false });

  await assert.rejects(
    () => getIP({ timeout: 5, cache: false }),
    hasErrorCode("TIMEOUT")
  );
});

test("rejects invalid STUN URLs", async () => {
  await assert.rejects(
    () => getIP({ stun: "https://example.com" }),
    hasErrorCode("INVALID_STUN_URL")
  );

  await assert.rejects(
    () => getIP({ stun: "turn:example.com:3478" }),
    hasErrorCode("INVALID_STUN_URL")
  );
});

test("rejects invalid numeric options", async () => {
  await assert.rejects(
    () => getIP({ timeout: 0 }),
    hasErrorCode("INVALID_OPTIONS")
  );

  await assert.rejects(
    () => getIP({ cacheTtl: -1 }),
    hasErrorCode("INVALID_OPTIONS")
  );
});