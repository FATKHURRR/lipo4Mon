/**
 * BMS CORE - Variabel global dan fungsi UI untuk monitoring baterai
 * Dipindahkan dari embedded script di monitoring.html
 */

// ── Variabel Global ──
let id_logger = "-";
let client, client2;
let batteries = [];
let pollingSts = false;
let xxx;
const cardTimers = {};

// ── Utility: waktu HH:MM:SS ──
function getCurrentTimeHHMMSS() {
  const now = new Date();
  return [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map(v => v.toString().padStart(2, '0')).join(':');
}

// ── Normalisasi data dari MQTT ──
function normalizeFromMqtt(data, topic) {
  const cells = data.cell_voltages.map(v => (v / 1000).toFixed(3));
  const cell_vmax = Math.max(...data.cell_voltages) / 1000;
  const cell_vmin = Math.min(...data.cell_voltages) / 1000;
  return {
    loggerId: topic.split('/')[1],
    typeBattery: data.typeBattery,
    addr: data.AddrBattery,
    soc: data.SOC.toFixed(1),
    soh: data.SOH.toFixed(1),
    voltage: data.bat_voltage.toFixed(2),
    busVoltage: data.bus_voltage.toFixed(2),
    current: data.bat_current.toFixed(2),
    bus_current: data.bus_current.toFixed(2),
    capacity: data.full_capacity.toFixed(2),
    remaining: data.rem_capacity.toFixed(2),
    cycles: data.cycle_count,
    cells,
    cell_vmax: cell_vmax.toFixed(3),
    cell_vmin: cell_vmin.toFixed(3),
    cell_vdif: ((cell_vmax - cell_vmin) * 1000).toFixed(0),
    time: getCurrentTimeHHMMSS(),
    power: (data.bat_voltage * data.bat_current).toFixed(2)
  };
}

// ── Sort & Re-render semua kartu ──
function sortBatteries() {
  batteries.sort((a, b) => {
    if (a.typeBattery < b.typeBattery) return -1;
    if (a.typeBattery > b.typeBattery) return 1;
    return parseInt(a.addr) - parseInt(b.addr);
  });
  reRenderAllCards();
}

function reRenderAllCards() {
  const grid = document.getElementById("batteryGrid");
  grid.innerHTML = '';
  batteries.forEach(batt => {
    let cid = `card-${batt.loggerId}-${batt.typeBattery}-${batt.addr}`;
    if (cardTimers[cid]) { clearTimeout(cardTimers[cid]); delete cardTimers[cid]; }
    let card = document.createElement("div");
    card.id = cid;
    card.className = "battery-card rounded-xl shadow-sm p-5 cursor-pointer hover:shadow-md fade-in";
    card.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold">${batt.typeBattery} <span class="text-blue-600">#${batt.addr}</span></h3>
        <div class="led" id="led-card-${batt.loggerId}-${batt.typeBattery}-${batt.addr}"></div>
      </div>
      <div class="mb-4">
        <div class="flex justify-between items-center mb-1">
          <span class="text-sm" style="color:var(--card-subtext)">SOC</span>
          <span class="font-semibold" id="soc-value-${batt.loggerId}-${batt.typeBattery}-${batt.addr}">${batt.soc}%</span>
        </div>
        <div class="progress-bar"><div id="soc-bar-${batt.loggerId}-${batt.typeBattery}-${batt.addr}" class="progress-fill" style="width:${batt.soc}%"></div></div>
      </div>
      <div class="grid grid-cols-2 gap-5 text-sm">
        <div class="space-y-2">
          <div class="flex items-center"><i class="fas fa-bolt text-yellow-500 mr-2"></i><div><div style="color:var(--card-subtext)">Tegangan</div><div id="voltage-${batt.loggerId}-${batt.typeBattery}-${batt.addr}" class="font-semibold">${batt.voltage} V</div></div></div>
          <div class="flex items-center"><i class="fas fa-minus-circle text-blue-500 mr-2"></i><div><div style="color:var(--card-subtext)">Selisih Sel</div><div id="voltagedif-${batt.loggerId}-${batt.typeBattery}-${batt.addr}" class="font-semibold">${batt.cell_vdif} mV</div></div></div>
          <div class="flex items-center"><i class="fas fa-minus-circle text-red-500 mr-2"></i><div><div style="color:var(--card-subtext)">Sel Min</div><div id="cellmin-${batt.loggerId}-${batt.typeBattery}-${batt.addr}" class="font-semibold">${batt.cell_vmin} V</div></div></div>
        </div>
        <div class="space-y-2">
          <div class="flex items-center"><i class="fas fa-tachometer-alt text-blue-500 mr-2"></i><div><div style="color:var(--card-subtext)">Arus</div><div id="current-${batt.loggerId}-${batt.typeBattery}-${batt.addr}" class="font-semibold">${batt.current} A</div></div></div>
          <div class="flex items-center"><i class="fas fa-bolt text-red-500 mr-2"></i><div><div style="color:var(--card-subtext)">Daya</div><div id="power-${batt.loggerId}-${batt.typeBattery}-${batt.addr}" class="font-semibold">${(batt.voltage * batt.current).toFixed(1)} W</div></div></div>
          <div class="flex items-center"><i class="fas fa-plus-circle text-green-500 mr-2"></i><div><div style="color:var(--card-subtext)">Sel Maks</div><div id="cellmax-${batt.loggerId}-${batt.typeBattery}-${batt.addr}" class="font-semibold">${batt.cell_vmax} V</div></div></div>
        </div>
      </div>
      <div class="mt-4 pt-3 border-t text-xs flex justify-between" style="color:var(--card-subtext);border-color:rgba(128,128,128,0.15)">
        <span>Siklus: ${batt.cycles}</span>
        <span class="last-update"><i class="far fa-clock mr-1"></i>${batt.time}</span>
      </div>`;
    card.onclick = () => openModal(batt.loggerId, batt.addr, batt.typeBattery);
    grid.appendChild(card);
    const sb = document.getElementById(`soc-bar-${batt.loggerId}-${batt.typeBattery}-${batt.addr}`);
    sb.className = batt.soc > 70 ? 'progress-fill bg-green-500' : batt.soc > 30 ? 'progress-fill bg-yellow-500' : 'progress-fill bg-red-500';
    const led = document.getElementById(`led-card-${batt.loggerId}-${batt.typeBattery}-${batt.addr}`);
    led.classList.add("active"); setTimeout(() => led.classList.remove("active"), 250);
    cardTimers[cid] = setTimeout(() => {
      let c = document.getElementById(cid);
      if (c) { c.remove(); removeBatteryFromArray(batt.loggerId, batt.typeBattery, batt.addr); }
      delete cardTimers[cid];
    }, 30000);
  });
  updateConnectionCount();
}

// ── Update jumlah koneksi ──
function updateConnectionCount() {
  document.getElementById('total-batteries').textContent = batteries.length;
  document.getElementById('batteryGrid').classList.toggle('hidden', batteries.length === 0);
  document.getElementById('empty-state').classList.toggle('hidden', batteries.length !== 0);
  document.getElementById('summarySection').classList.toggle('hidden', batteries.length === 0);
}

// ── Hapus baterai dari array ──
function removeBatteryFromArray(loggerId, typeBattery, addr) {
  batteries = batteries.filter(b => !(b.loggerId === loggerId && b.typeBattery === typeBattery && b.addr === addr));
  updateConnectionCount();
  updateSummary();
  sortBatteries();
}

// ── Update kartu baterai yang sudah ada ──
function update_cards(batt) {
  let cid = `card-${batt.loggerId}-${batt.typeBattery}-${batt.addr}`;
  let card = document.getElementById(cid);
  if (!card) {
    batt.elementId = `battery-${batt.loggerId}-${batt.typeBattery}-${batt.addr}`;
    batteries.push(batt);
    sortBatteries();
    return;
  }
  const g = (id) => document.getElementById(id + `-${batt.loggerId}-${batt.typeBattery}-${batt.addr}`);
  g('soc-value').textContent = `${batt.soc}%`;
  g('soc-bar').style.width = `${batt.soc}%`;
  g('voltage').innerHTML = `${batt.voltage} V`;
  g('current').innerHTML = `${batt.current} A`;
  g('cellmin').innerHTML = `${batt.cell_vmin} V`;
  g('cellmax').innerHTML = `${batt.cell_vmax} V`;
  g('power').innerHTML = `${(batt.voltage * batt.current).toFixed(1)} W`;
  g('voltagedif').innerHTML = `${batt.cell_vdif} mV`;
  const sb = g('soc-bar');
  sb.className = batt.soc > 70 ? 'progress-fill bg-green-500' : batt.soc > 30 ? 'progress-fill bg-yellow-500' : 'progress-fill bg-red-500';
  card.querySelector(".last-update").innerHTML = `<i class="far fa-clock mr-1"></i>${batt.time}`;
  const led = g('led-card');
  led.classList.add("active"); setTimeout(() => led.classList.remove("active"), 250);
  if (cardTimers[cid]) clearTimeout(cardTimers[cid]);
  cardTimers[cid] = setTimeout(() => {
    let c = document.getElementById(cid);
    if (c) { c.remove(); removeBatteryFromArray(batt.loggerId, batt.typeBattery, batt.addr); }
    delete cardTimers[cid];
  }, 30000);
}

// ── Update ringkasan ──
function updateSummary() {
  if (batteries.length === 0) {
    ['avg-voltage', 'avg-soc', 'avg-soh', 'total-current', 'total-power']
      .forEach(id => document.getElementById(id).textContent = "-");
    return;
  }
  let tv = 0, ts = 0, th = 0, tc = 0, tp = 0;
  batteries.forEach(b => {
    tv += parseFloat(b.voltage); ts += parseFloat(b.soc);
    th += parseFloat(b.soh); tc += parseFloat(b.current); tp += parseFloat(b.power);
  });
  const n = batteries.length;
  document.getElementById("avg-voltage").textContent = `${(tv / n).toFixed(2)} V`;
  document.getElementById("avg-soc").textContent = `${(ts / n).toFixed(1)}%`;
  document.getElementById("avg-soh").textContent = `${(th / n).toFixed(1)}%`;
  document.getElementById("total-current").textContent = `${tc.toFixed(2)} A`;
  document.getElementById("total-power").textContent = `${tp.toFixed(2)} W`;
}

// ── Modal baterai ──
const _getModal = () => document.getElementById("batteryModal");
let currentAddr = null, currentLoggerId = null, currentTypeBattery = null;

function openModal(loggerId, addr, typeBattery) {
  currentLoggerId = loggerId; currentAddr = addr; currentTypeBattery = typeBattery;
  updateModal();
  _getModal().classList.remove("hidden");
  document.body.style.overflow = 'hidden';
}

function updateModal() {
  if (!currentAddr || !currentLoggerId || !currentTypeBattery) return;
  const batt = batteries.find(b => b.loggerId === currentLoggerId && b.addr === currentAddr && b.typeBattery === currentTypeBattery);
  if (!batt) return;
  document.getElementById("modalTitle").textContent = `${batt.typeBattery} #${batt.addr}`;
  document.getElementById("modalSOC").textContent = `${batt.soc}%`;
  document.getElementById("modalSOH").textContent = `${batt.soh}%`;
  document.getElementById("modalCycles").textContent = batt.cycles;
  document.getElementById("modalVoltage").textContent = `${batt.voltage} V`;
  document.getElementById("modalBusVoltage").textContent = `${batt.busVoltage} V`;
  document.getElementById("modalCurrent").textContent = `${batt.current} A`;
  document.getElementById("modalCapacity").textContent = batt.capacity;
  document.getElementById("modalRemaining").textContent = batt.remaining;
  document.getElementById("modalLastUpdate").textContent = batt.time;
  document.getElementById("modalcellmin").textContent = `${batt.cell_vmin} V`;
  document.getElementById("modalcellmax").textContent = `${batt.cell_vmax} V`;
  document.getElementById("modalcelldif").textContent = `${batt.cell_vdif} mV`;
  document.getElementById("modalPower").textContent = `${batt.power} W`;
  document.getElementById("modalBusCurrentValue").textContent = `${batt.bus_current} A`;
  document.getElementById("modalBusPowerValue").textContent = `${(batt.busVoltage * batt.bus_current).toFixed(2)} W`;
  document.getElementById("modalLossPower").textContent = `${Math.abs((batt.busVoltage * batt.bus_current) - batt.power).toFixed(2)} W`;
  document.getElementById("soc-progress").style.width = `${batt.soc}%`;
  document.getElementById("soh-progress").style.width = `${batt.soh}%`;
  const sp = document.getElementById("soc-progress"), shp = document.getElementById("soh-progress");
  sp.className = batt.soc > 70 ? "progress-fill bg-blue-500" : batt.soc > 30 ? "progress-fill bg-yellow-500" : "progress-fill bg-red-500";
  shp.className = batt.soh > 80 ? "progress-fill bg-green-500" : batt.soh > 60 ? "progress-fill bg-yellow-500" : "progress-fill bg-red-500";
  const cellsDiv = document.getElementById("modalCells");
  cellsDiv.innerHTML = "";
  const cellVals = batt.cells.map(v => parseFloat(v));
  const maxV = Math.max(...cellVals), minV = Math.min(...cellVals);
  batt.cells.forEach((v, i) => {
    const cv = parseFloat(v), sc = cv < 3.2 ? "cell-danger" : cv < 3.4 ? "cell-warning" : "cell-normal";
    const box = document.createElement("div");
    box.className = `cell-voltage ${sc} bg-white rounded-lg shadow-sm p-3 flex flex-col items-center`;
    if (cv === maxV) box.classList.add('cell-highest-voltage');
    else if (cv === minV) box.classList.add('cell-lowest-voltage');
    const lbl = document.createElement("div");
    lbl.className = "text-xs font-medium text-gray-500 mb-1"; lbl.textContent = `Sel ${i + 1}`;
    const val = document.createElement("div");
    val.className = "text-sm font-bold";
    val.textContent = `${v} V`;
    val.className += sc === "cell-danger" ? " text-red-600" : sc === "cell-warning" ? " text-yellow-600" : " text-green-600";
    box.appendChild(lbl); box.appendChild(val); cellsDiv.appendChild(box);
  });
  blinkLed("led-modal");
}

function blinkLed(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove("bg-gray-300");
  el.classList.add("bg-green-500");
  setTimeout(() => { el.classList.remove("bg-green-500"); el.classList.add("bg-gray-300"); }, 250);
}

// ── Event listener modal (dipasang setelah DOM ready) ──
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById("batteryModal");
  document.getElementById("closeModal").onclick = () => {
    modal.classList.add("hidden");
    document.body.style.overflow = 'auto';
    currentAddr = currentLoggerId = currentTypeBattery = null;
  };
  modal.onclick = e => {
    if (e.target === modal) {
      modal.classList.add("hidden");
      document.body.style.overflow = 'auto';
      currentAddr = currentLoggerId = currentTypeBattery = null;
    }
  };
});
