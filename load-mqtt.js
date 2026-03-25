/**
 * DATA BEBAN - MQTT
 * Logika identik dengan versi embedded original.
 * Menggunakan mqtt.connect() langsung (tidak pakai ModulSakti)
 * karena protokol RS-485/Modbus memerlukan kontrol penuh atas TX/RX.
 */

const LOAD_BROKER  = "wss://broker.emqx.io:8084/mqtt";
const LOAD_USER    = "emqx";
const LOAD_PASS    = "emqx";
const LOAD_ID      = "1613606304";
const LOAD_RX      = LOAD_ID + "/RX";
const LOAD_TX      = LOAD_ID + "/TX";
const LOAD_SETING  = LOAD_ID + "/seting";
const LOAD_POLL_MS = 500;
const LOAD_TIMEOUT = 3000;

let loadClient  = null;
let loadSched   = 0;
let loadFTimer  = null;
let loadPTimer  = null;
let loadWaiting = false;

const LP1 = new Uint8Array([0x71,0x03,0x20,0x00,0x00,0x10,0x44,0xF6]);
const LP2 = new Uint8Array([0x71,0x03,0x40,0x00,0x00,0x04,0x5A,0xF9]);

// ── UI helpers ──────────────────────────────────────────────

function toggleLog() {
  document.getElementById('logDrawer').classList.toggle('open');
  document.getElementById('logToggleIcon').classList.toggle('rotated');
}

function addLoadLog(msg, cls) {
  const el = document.getElementById("loadLog");
  const t  = new Date().toLocaleTimeString("id-ID", { hour12: false });
  const c  = cls==='ok'?'#10b981' : cls==='err'?'#ef4444' : cls==='warn'?'#f59e0b' : cls==='rx'?'#3b82f6' : '#6b7280';
  el.innerHTML = `<span style="opacity:0.45">[${t}]</span> <span style="color:${c}">${msg}</span><br>`;
  el.scrollTop = el.scrollHeight;
}

function flashLoadDot(id, color) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.background   = color;
  el.style.boxShadow    = '0 0 5px ' + color;
  setTimeout(() => { el.style.background = ''; el.style.boxShadow = ''; }, 200);
}

function setLoadVal(id, v) {
  const el = document.getElementById("load-" + id);
  if (!el) return;
  el.textContent = v;
  el.classList.remove('val-updated');
  void el.offsetWidth;
  el.classList.add('val-updated');
}

function setLoadMqttStatus(ok, connecting) {
  const dot = document.getElementById('load-dot-mqtt');
  const lbl = document.getElementById('load-lbl-mqtt');
  dot.className  = 'mqtt-dot' + (connecting ? ' blink' : ok ? ' on' : ' off');
  lbl.textContent = connecting ? 'Menghubungkan' : ok ? 'Terhubung' : 'Terputus';
}

// ── Parsing frame ────────────────────────────────────────────

function toLoadBytes(payload) {
  if (payload instanceof Uint8Array) return payload;
  if (payload instanceof ArrayBuffer) return new Uint8Array(payload);
  if (payload && typeof payload === "object") {
    const len = payload.length != null ? payload.length
      : Object.keys(payload).filter(k => !isNaN(k)).length;
    const arr = new Uint8Array(len);
    for (let i = 0; i < len; i++) arr[i] = payload[i];
    return arr;
  }
  return new Uint8Array(0);
}

function extractLoadFrame(bytes) {
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] === 0x71) return bytes.slice(i);
  }
  return null;
}

function ui16f32(hi, lo) {
  const b = new ArrayBuffer(4), v = new DataView(b);
  v.setUint16(0, hi, false); v.setUint16(2, lo, false);
  return v.getFloat32(0, false);
}

function parseLoadFrame(raw) {
  const frame = extractLoadFrame(raw);
  if (!frame) { addLoadLog("0x71 tidak ditemukan", "err"); return; }
  if (frame.length < 5 || frame[1] !== 0x03) { addLoadLog("Frame tidak valid", "err"); return; }
  const bc = frame[2];
  if (bc === 0x20 && frame.length >= 10) {
    const volt = ui16f32((frame[3]<<8)|frame[4],  (frame[5]<<8)|frame[6]);
    const curr = ui16f32((frame[7]<<8)|frame[8],  (frame[9]<<8)|frame[10]);
    const actP = ui16f32((frame[11]<<8)|frame[12],(frame[13]<<8)|frame[14]) * 1000;
    const reaP = ui16f32((frame[15]<<8)|frame[16],(frame[17]<<8)|frame[18]) * 1000;
    const pf   = ui16f32((frame[23]<<8)|frame[24],(frame[25]<<8)|frame[26]);
    const freq = ui16f32((frame[31]<<8)|frame[32],(frame[33]<<8)|frame[34]);
    setLoadVal("volt",    volt.toFixed(2));
    setLoadVal("current", curr.toFixed(3));
    setLoadVal("active",  actP.toFixed(1));
    setLoadVal("reactive",reaP.toFixed(1));
    setLoadVal("pf",      pf.toFixed(3));
    setLoadVal("freq",    freq.toFixed(2));
    document.getElementById("load-last-update").textContent =
      new Date().toLocaleTimeString("id-ID", { hour12: false });
    addLoadLog("V="+volt.toFixed(2)+" I="+curr.toFixed(3)+" P="+actP.toFixed(1)+
               "W PF="+pf.toFixed(3)+" f="+freq.toFixed(2)+"Hz", "ok");
    return;
  }
  if (bc === 8 && frame.length >= 9) {
    const exp = ui16f32((frame[3]<<8)|frame[4],(frame[5]<<8)|frame[6]);
    setLoadVal("export", exp.toFixed(3));
    addLoadLog("Energi="+exp.toFixed(3)+"kWh", "ok");
    return;
  }
  addLoadLog("byteCount tidak cocok: 0x"+bc.toString(16)+" len="+frame.length, "warn");
}

// ── Polling ──────────────────────────────────────────────────

function sendLoadReq() {
  if (!loadClient || !loadClient.connected || loadWaiting) return;
  const payload = loadSched === 0 ? LP1 : LP2;
  document.getElementById("load-sched-badge").textContent = loadSched === 0 ? "V/I/P" : "ENERGI";
  loadClient.publish(LOAD_RX, payload, { qos: 0 });
  loadWaiting = true;
  flashLoadDot("load-dot-tx", "#f59e0b");
  addLoadLog("→ TX sched="+loadSched+": "+
    Array.from(payload).map(b=>b.toString(16).padStart(2,"0").toUpperCase()).join(" "));
  loadFTimer = setTimeout(() => {
    if (loadWaiting) { addLoadLog("TIMEOUT 3 detik", "err"); loadWaiting = false; }
  }, LOAD_TIMEOUT);
}

// ── Koneksi MQTT (identik dengan versi original) ─────────────

function connectLoadMQTT() {
  setLoadMqttStatus(false, true);
  addLoadLog("Menghubungkan ke broker...");
  loadClient = mqtt.connect(LOAD_BROKER, { username: LOAD_USER, password: LOAD_PASS, reconnectPeriod: 4000 });

  loadClient.on("connect", () => {
    setLoadMqttStatus(true, false);
    addLoadLog("Terhubung. Subscribe " + LOAD_TX, "ok");
    loadClient.subscribe(LOAD_TX, { qos: 0 });
    loadClient.publish(LOAD_SETING, "POLL0");
    setTimeout(() => {
      sendLoadReq();
      loadPTimer = setInterval(() => { if (!loadWaiting) sendLoadReq(); }, LOAD_POLL_MS);
    }, 1000);
  });

  loadClient.on("message", (topic, payload) => {
    if (topic !== LOAD_TX) return;
    const bytes = toLoadBytes(payload);
    flashLoadDot("load-dot-rx", "#10b981");
    addLoadLog("← RX ["+bytes.length+"B]: "+
      Array.from(bytes).map(b=>b.toString(16).padStart(2,"0").toUpperCase()).join(" "), "rx");
    if (loadFTimer) { clearTimeout(loadFTimer); loadFTimer = null; }
    loadWaiting = false;
    parseLoadFrame(bytes);
    loadSched = loadSched === 0 ? 1 : 0;
  });

  loadClient.on("error",     err => { setLoadMqttStatus(false, false); addLoadLog("Error: "+err.message, "err"); });
  loadClient.on("close",     ()  => {
    setLoadMqttStatus(false, false); addLoadLog("Koneksi terputus.", "warn");
    loadWaiting = false;
    if (loadPTimer) { clearInterval(loadPTimer); loadPTimer = null; }
  });
  loadClient.on("reconnect", ()  => { setLoadMqttStatus(false, true); addLoadLog("Menghubungkan kembali..."); });
}

// ── Auto-start ───────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', connectLoadMQTT);
} else {
  connectLoadMQTT();
}
