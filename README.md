# Modul Sakti - Panduan Aktivasi & Konfigurasi

## 🔧 Prasyarat

⚠️ **PENTING - Grounding Sistem Baterai**

**Sebelum mengaktifkan modul, pastikan sistem baterai sudah tergrounding dengan baik.**

Grounding yang buruk dapat menyebabkan:
- Arus liar yang tidak terkontrol
- Kerusakan pada chip transceiver RS485
- Kehilangan atau korrupsi data

---

## 🚀 Langkah Aktivasi Awal

### 1️⃣ Koneksi ke WiFi Modul

1. Cari jaringan WiFi dengan nama **Modul Sakti** (SSID bawaan modul)
2. Hubungkan ke jaringan tersebut
3. Masukkan password default: `password12345`

### 2️⃣ Akses Interface Konfigurasi

1. Buka browser di perangkat Anda (PC, laptop, atau smartphone)
2. Akses alamat IP: **192.168.4.1**
3. Tampilan dashboard konfigurasi akan terbuka

### 3️⃣ Konfigurasi WiFi Router

Isi parameter berikut sesuai dengan jaringan WiFi rumah Anda:

| Parameter | Deskripsi |
|-----------|-----------|
| **WiFi Router SSID** | Nama SSID jaringan WiFi router rumah Anda |
| **WiFi Router Password** | Password jaringan WiFi router rumah Anda |

### 4️⃣ Simpan Perubahan

1. Klik tombol **Save & Reboot**
2. Modul akan melakukan restart secara otomatis
3. Proses ini biasanya memakan waktu **2-3 menit**

---

## ✅ Verifikasi Koneksi Berhasil

### ✓ Indikator Koneksi Sukses

Jika modul berhasil terhubung ke router rumah, **WiFi SSID modul akan menghilang** dari list jaringan yang tersedia.

### ✗ WiFi Modul Masih Muncul?

**Ini berarti:** Proses koneksi belum selesai atau konfigurasi gagal

**Solusi:**
- Ulangi langkah 1-4 di atas
- Tunggu 2-3 menit setelah reboot sebelum memeriksa ulang
- Pastikan SSID dan password yang dimasukkan sudah benar
- Ulangi sampai WiFi modul tidak lagi muncul di list jaringan

---

## 📊 Online Monitoring

Setelah modul berhasil online, Anda dapat mengakses dashboard monitoring real-time:

```
https://fatkhurrr.github.io/lipo4Mon/index.html?id=<id_modul>
```

**Contoh:**
```
https://fatkhurrr.github.io/lipo4Mon/index.html?id=1234567890
```

> **Catatan:** Link dapat diakses dari perangkat apa pun (PC, laptop, smartphone) melalui browser, asalkan tersambung ke internet.

---

## ⚡ Catatan Penting & Perawatan

### 🔌 Penanganan Port RS485

**Untuk meminimalkan kerusakan akibat transient voltage:**

- ⚠️ **Hindari mencabut/mecolok kabel RS485 saat modul dalam kondisi aktif/beroperasi**
- Jika perlu melakukan perubahan koneksi, matikan modul terlebih dahulu
- Transient voltage dari perubahan koneksi dapat merusak chip transceiver RS485

### 🔧 Grounding Khusus untuk Sistem Tertentu

Beberapa modul memerlukan penanganan grounding khusus, terutama pada sistem yang menggunakan:
- **Inverter HF** (High Frequency)
- Sistem dengan **Power Factor (PF) jelek**

**Solusi:**

Lakukan grounding tambahan dengan menghubungkan **minus modul ke minus sistem baterai**. Hal ini membantu menstabilkan referensi potensial dan mencegah data corruption pada port RS485.

---

## 📋 Checklist Aktivasi

- [ ] Sistem baterai sudah tergrounding dengan baik
- [ ] Modul terhubung ke power supply
- [ ] Terkoneksi ke WiFi modul dengan password default
- [ ] Berhasil akses 192.168.4.1 di browser
- [ ] Masukkan SSID dan password router rumah
- [ ] Klik Save & Reboot
- [ ] Tunggu reboot selesai (2-3 menit)
- [ ] Verifikasi WiFi modul hilang dari list jaringan
- [ ] Akses link monitoring dengan ID modul

---

## 🆘 Dukungan & Bantuan

Jika mengalami kendala, lakukan langkah-langkah berikut secara berurutan:

1. Verifikasi kembali langkah-langkah aktivasi di atas
2. **Pastikan sistem baterai sudah tergrounding dengan baik** - ini adalah penyebab utama masalah
3. Cek koneksi kabel RS485 dan pastikan tidak ada koneksi yang lepas
4. Coba restart modul dengan cara disconnect dan reconnect power
5. Jika masalah persisten, dokumentasikan detail error dan hubungi tim support

---

**Dokumentasi Modul Sakti - Edisi 1.0**
