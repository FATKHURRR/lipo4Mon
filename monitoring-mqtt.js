/**
 * MONITORING MQTT WITH MODULSAKTI
 * Mengelola koneksi MQTT BMS dan routing data ke fungsi UI di bms-core.js
 */

let modulsMap = new Map();

function startMQTT() {
  xxx = id_logger.split("-");
  console.log("[startMQTT] Logger IDs:", xxx);
  xxx.forEach(loggerId => initModulSaktiForLogger(loggerId));
}

function initModulSaktiForLogger(loggerId) {
  console.log(`[initModulSakti] Initializing for: ${loggerId}`);

  const modul = new ModulSakti({
    serverId: 'emqx-public',
    idModule: loggerId,
    encryptionSalt: '',

    onBatteryData: (payload) => {
      // Battery JSON → langsung ke handleJSON dengan topic yang benar
      handleJSON(`sysMon/${loggerId}/AutoPoll/Battery_0`, payload);
    },

    onHeartbeat: (payload) => {
      // Info string (bukan JSON) → handleJSON dengan topic info
      handleJSON(`sysMon/${loggerId}/info`, payload);
    },

    onConnect: () => {
      console.log(`[onConnect] Connected for: ${loggerId}`);
      modul.publishBinary(loggerId + "/seting", "POLL1");
    },

    onDisconnect: () => console.log(`[onDisconnect] Disconnected for: ${loggerId}`),
    onError: (error) => console.error(`[onError] Error for ${loggerId}:`, error)
  });

  modulsMap.set(loggerId, modul);
  modul.init();
}

/**
 * handleJSON — routing pesan MQTT ke UI
 * topic info  → string CSV  : "ip,rssi,?,pollSts"
 * topic lain  → JSON string : data baterai
 */
function handleJSON(topic, message) {
  const infoTopic = "sysMon/" + xxx[0] + "/info";

  if (topic === infoTopic || topic === infoTopic + "/") {
    // ── Info topic: format CSV, BUKAN JSON ──
    const a = message.toString().split(",");
    document.getElementById("network_ip").innerText     = "Alamat IP: " + a[0];
    document.getElementById("network_signal").innerText = "Sinyal: "    + a[1];
    const varpol    = document.getElementById("pollingState");
    let   text_head = " 🌐 " + a[0] + " 📶" + a[1];
    if (a[3] === "1") { varpol.innerHTML = "▶️ Aktif";  pollingSts = true;  text_head += " ▶️ "; }
    else              { varpol.innerHTML = "⏹️ Pasif"; pollingSts = false; text_head += " ⏹️ "; }
    document.getElementById("id_monitoring").innerText        = text_head;
    document.getElementById("id_monitoring_footer").innerText = text_head;

  } else {
    // ── Battery topic: format JSON ──
    try {
      const raw  = JSON.parse(message.toString());
      const batt = normalizeFromMqtt(raw, topic);
      const idx  = batteries.findIndex(b =>
        b.loggerId === batt.loggerId && b.addr === batt.addr && b.typeBattery === batt.typeBattery
      );
      if (idx >= 0) { batteries[idx] = batt; update_cards(batt); }
      else { batt.elementId = `battery-${batt.loggerId}-${batt.typeBattery}-${batt.addr}`; batteries.push(batt); sortBatteries(); }
      updateSummary();
      updateModal();
    } catch (e) {
      console.warn("[handleJSON] Parse error on topic:", topic, "| msg:", message.toString().substring(0, 80), "|", e.message);
    }
  }
}

function initMonitoringWithModulSakti() {
  const params = new URLSearchParams(window.location.search);
  if ([...params].length > 0) {
    let qd = {};
    for (const [k, v] of params.entries()) qd[k] = v;
    if (qd.id) { id_logger = qd.id; startMQTT(); }
    else {
      let u = prompt("Masukkan ID Logger:");
      if (u && u.trim()) { id_logger = u; startMQTT(); }
      else alert("Error: Muat ulang halaman!");
    }
  } else {
    let u = prompt("Masukkan ID Logger:");
    if (u && u.trim()) { id_logger = u; startMQTT(); }
    else alert("Error: Muat ulang halaman!");
  }
  updateConnectionCount();
}

document.addEventListener('DOMContentLoaded', initMonitoringWithModulSakti);
