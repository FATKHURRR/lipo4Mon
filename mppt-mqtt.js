/**
 * MPPT SOLAR MONITOR
 * Logika identik dengan pola versi original — mqtt.connect() langsung.
 * subscribeCustom via ModulSakti bermasalah jika dipanggil sebelum connect.
 */

const MPPT_ID        = "1161847276";
const MPPT_BROKER    = "wss://broker.emqx.io:8084/mqtt";
const MPPT_USER      = "emqx";
const MPPT_PASS      = "emqx";
const MPPT_TX_TOPIC  = `mpptMon/${MPPT_ID}/TX`;

let mpptClient    = null;
let mpptConnected = false;

// ── Status dot ───────────────────────────────────────────────
function updateMPPTConnectionStatus(connected) {
  const dot = document.getElementById('mppt-status-dot');
  if (!dot) return;
  dot.classList.toggle('on',  connected);
  dot.classList.toggle('off', !connected);
}

// ── Update UI dari JSON ──────────────────────────────────────
function handleMPPTMessage(payload) {
  try {
    const json = typeof payload === 'string' ? JSON.parse(payload) : payload;
    console.log("[mpptMQTT] Data:", json);

    const d   = json.data   || {};
    const dev = json.device || {};

    // Helper: set element text
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    // Metrics yang sudah ada
    set('mppt-volt-pv',      (d.volt_pv       || 0).toFixed(2));
    set('mppt-volt-bat',     (d.volt_battery  || 0).toFixed(2));
    set('mppt-current',      (d.current        || 0).toFixed(2));
    set('mppt-power',        Math.floor(d.power        || 0));
    set('mppt-peak-power',   Math.floor(d.peak_power   || 0));
    set('mppt-energy-today', (d.today_energy  || 0).toFixed(3));

    // IP address
    set('mppt-ip', dev.ip || "-");

    // Waktu dari MPPT (tahun, bulan, tanggal, jam, menit, detik)
    if (d.year) {
      const pad = v => String(v).padStart(2, '0');
      const timeStr = `${d.year}-${pad(d.month)}-${pad(d.date)} ${pad(d.hour)}:${pad(d.minute)}:${pad(d.second)}`;
      set('mppt-time', timeStr);
    }

  } catch (e) {
    console.error("[mpptMQTT] JSON Parse Error:", e, "| raw:", String(payload).substring(0, 80));
  }
}

// ── Koneksi MQTT ─────────────────────────────────────────────
function connectMPPTMQTT() {
  updateMPPTConnectionStatus(false);
  console.log("[mpptMQTT] Connecting...");

  mpptClient = mqtt.connect(MPPT_BROKER, {
    username: MPPT_USER,
    password: MPPT_PASS,
    reconnectPeriod: 4000
  });

  mpptClient.on("connect", () => {
    mpptConnected = true;
    updateMPPTConnectionStatus(true);
    console.log("[mpptMQTT] Connected, subscribing to", MPPT_TX_TOPIC);
    mpptClient.subscribe(MPPT_TX_TOPIC, { qos: 0 });
  });

  mpptClient.on("message", (topic, payload) => {
    if (topic !== MPPT_TX_TOPIC) return;
    handleMPPTMessage(payload.toString());
  });

  mpptClient.on("error",     err => { updateMPPTConnectionStatus(false); console.error("[mpptMQTT] Error:", err.message); });
  mpptClient.on("close",     ()  => { mpptConnected = false; updateMPPTConnectionStatus(false); });
  mpptClient.on("reconnect", ()  => { updateMPPTConnectionStatus(false); });
}

// ── Auto-start ───────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', connectMPPTMQTT);
} else {
  connectMPPTMQTT();
}
