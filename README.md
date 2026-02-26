<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panduan Modul Sakti - Aktivasi & Konfigurasi</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.1em;
            opacity: 0.95;
        }
        
        .content {
            padding: 40px;
        }
        
        .warning-box {
            background: #fff3cd;
            border-left: 5px solid #ffc107;
            padding: 20px;
            margin-bottom: 30px;
            border-radius: 4px;
        }
        
        .warning-box h3 {
            color: #856404;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .warning-box p {
            color: #856404;
            margin: 8px 0;
        }
        
        .section {
            margin-bottom: 40px;
        }
        
        .section h2 {
            color: #667eea;
            font-size: 1.8em;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
        }
        
        .step {
            background: #f8f9fa;
            padding: 20px;
            margin-bottom: 15px;
            border-radius: 8px;
            border-left: 5px solid #667eea;
        }
        
        .step h4 {
            color: #667eea;
            margin-bottom: 10px;
            font-size: 1.2em;
        }
        
        .step ol, .step ul {
            margin-left: 20px;
            color: #555;
        }
        
        .step li {
            margin-bottom: 8px;
        }
        
        .code-block {
            background: #2d2d2d;
            color: #f8f8f2;
            padding: 15px;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            overflow-x: auto;
            margin: 15px 0;
            font-size: 0.95em;
        }
        
        .success-box {
            background: #d4edda;
            border-left: 5px solid #28a745;
            padding: 20px;
            margin: 15px 0;
            border-radius: 4px;
            color: #155724;
        }
        
        .error-box {
            background: #f8d7da;
            border-left: 5px solid #dc3545;
            padding: 20px;
            margin: 15px 0;
            border-radius: 4px;
            color: #721c24;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
        }
        
        .info-card {
            background: #e7f3ff;
            border-left: 5px solid #2196F3;
            padding: 20px;
            border-radius: 4px;
        }
        
        .info-card h4 {
            color: #0d47a1;
            margin-bottom: 10px;
        }
        
        .info-card p {
            color: #1565c0;
            font-size: 0.95em;
        }
        
        .checklist {
            background: #f0f4ff;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        
        .checklist-item {
            display: flex;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #ddd;
        }
        
        .checklist-item:last-child {
            border-bottom: none;
        }
        
        .checklist-item input {
            width: 20px;
            height: 20px;
            margin-right: 15px;
            cursor: pointer;
        }
        
        .checklist-item label {
            cursor: pointer;
            color: #333;
            flex: 1;
        }
        
        .icon {
            display: inline-block;
            margin-right: 8px;
            font-size: 1.3em;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        
        table th {
            background: #667eea;
            color: white;
            padding: 12px;
            text-align: left;
        }
        
        table td {
            padding: 12px;
            border-bottom: 1px solid #ddd;
        }
        
        table tr:hover {
            background: #f5f5f5;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            color: #666;
            border-top: 1px solid #ddd;
        }
        
        @media (max-width: 768px) {
            .info-grid {
                grid-template-columns: 1fr;
            }
            
            .header h1 {
                font-size: 1.8em;
            }
            
            .content {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚙️ Modul Sakti</h1>
            <p>Panduan Lengkap Aktivasi & Konfigurasi</p>
        </div>
        
        <div class="content">
            <!-- Prasyarat -->
            <div class="section">
                <h2>🔧 Prasyarat</h2>
                <div class="warning-box">
                    <h3><span class="icon">⚠️</span>PENTING - Grounding Sistem Baterai</h3>
                    <p><strong>Sebelum mengaktifkan modul, pastikan sistem baterai sudah tergrounding dengan baik.</strong></p>
                    <p>Grounding yang buruk dapat menyebabkan:</p>
                    <ul style="margin-left: 20px; margin-top: 10px;">
                        <li>Arus liar yang tidak terkontrol</li>
                        <li>Kerusakan pada chip transceiver RS485</li>
                        <li>Kehilangan atau korrupsi data</li>
                    </ul>
                </div>
            </div>
            
            <!-- Langkah Aktivasi -->
            <div class="section">
                <h2>🚀 Langkah Aktivasi Awal</h2>
                
                <div class="step">
                    <h4><span class="icon">1️⃣</span>Koneksi ke WiFi Modul</h4>
                    <ol>
                        <li>Cari jaringan WiFi dengan nama <strong>Modul Sakti</strong> (SSID bawaan modul)</li>
                        <li>Hubungkan ke jaringan tersebut</li>
                        <li>Masukkan password default: <code style="background: #f0f0f0; padding: 2px 5px; border-radius: 3px;">password12345</code></li>
                    </ol>
                </div>
                
                <div class="step">
                    <h4><span class="icon">2️⃣</span>Akses Interface Konfigurasi</h4>
                    <ol>
                        <li>Buka browser di perangkat Anda (PC, laptop, atau smartphone)</li>
                        <li>Akses alamat IP: <span style="background: #667eea; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;">192.168.4.1</span></li>
                        <li>Tampilan dashboard konfigurasi akan terbuka</li>
                    </ol>
                </div>
                
                <div class="step">
                    <h4><span class="icon">3️⃣</span>Konfigurasi WiFi Router</h4>
                    <p>Isi parameter berikut sesuai dengan jaringan WiFi rumah Anda:</p>
                    <table>
                        <tr>
                            <th>Parameter</th>
                            <th>Deskripsi</th>
                        </tr>
                        <tr>
                            <td><strong>WiFi Router SSID</strong></td>
                            <td>Nama SSID jaringan WiFi router rumah Anda</td>
                        </tr>
                        <tr>
                            <td><strong>WiFi Router Password</strong></td>
                            <td>Password jaringan WiFi router rumah Anda</td>
                        </tr>
                    </table>
                </div>
                
                <div class="step">
                    <h4><span class="icon">4️⃣</span>Simpan Perubahan</h4>
                    <ol>
                        <li>Klik tombol <strong>Save & Reboot</strong></li>
                        <li>Modul akan melakukan restart secara otomatis</li>
                        <li>Proses ini biasanya memakan waktu 2-3 menit</li>
                    </ol>
                </div>
            </div>
            
            <!-- Verifikasi Koneksi -->
            <div class="section">
                <h2>✅ Verifikasi Koneksi Berhasil</h2>
                
                <div class="success-box">
                    <h4><span class="icon">✓</span>Indikator Koneksi Sukses</h4>
                    <p>Jika modul berhasil terhubung ke router rumah, <strong>WiFi SSID modul akan menghilang</strong> dari list jaringan yang tersedia.</p>
                </div>
                
                <div class="error-box">
                    <h4><span class="icon">✗</span>WiFi Modul Masih Muncul?</h4>
                    <p><strong>Ini berarti:</strong> Proses koneksi belum selesai atau konfigurasi gagal</p>
                    <p style="margin-top: 10px;"><strong>Solusi:</strong></p>
                    <ul style="margin-left: 20px; margin-top: 8px;">
                        <li>Ulangi langkah 1-4 di atas</li>
                        <li>Tunggu 2-3 menit setelah reboot sebelum memeriksa ulang</li>
                        <li>Pastikan SSID dan password yang dimasukkan sudah benar</li>
                        <li>Ulangi sampai WiFi modul tidak lagi muncul di list jaringan</li>
                    </ul>
                </div>
            </div>
            
            <!-- Online Monitoring -->
            <div class="section">
                <h2>📊 Online Monitoring</h2>
                <p>Setelah modul berhasil online, Anda dapat mengakses dashboard monitoring real-time:</p>
                
                <div class="code-block">
https://fatkhurrr.github.io/lipo4Mon/index.html?id=&lt;id_modul&gt;
                </div>
                
                <h4 style="color: #667eea; margin-top: 20px;">Contoh:</h4>
                <div class="code-block">
https://fatkhurrr.github.io/lipo4Mon/index.html?id=1234567890
                </div>
                
                <div class="info-box" style="background: #e3f2fd; border-left: 5px solid #2196F3; padding: 15px; border-radius: 4px; margin-top: 20px; color: #1565c0;">
                    <strong>Catatan:</strong> Link dapat diakses dari perangkat apa pun (PC, laptop, smartphone) melalui browser, asalkan tersambung ke internet.
                </div>
            </div>
            
            <!-- Catatan Penting -->
            <div class="section">
                <h2>⚡ Catatan Penting & Perawatan</h2>
                
                <div class="step" style="background: #fff3cd; border-left-color: #ffc107;">
                    <h4 style="color: #856404;"><span class="icon">🔌</span>Penanganan Komunikasi Modul Sakti</h4>
                    <p style="color: #856404; margin-bottom: 10px;"><strong>Untuk meminimalkan kerusakan akibat transient voltage:</strong></p>
                    <ul style="color: #856404; margin-left: 20px;">
                        <li><strong>Hindari mencabut/mecolok kabel RS485 saat modul dalam kondisi aktif/beroperasi</strong></li>
                        <li>Jika perlu melakukan perubahan koneksi, matikan modul terlebih dahulu</li>
                        <li>Transient voltage dari perubahan koneksi dapat merusak chip transceiver RS485</li>
                    </ul>
                </div>
                
                <div class="step" style="background: #f8d7da; border-left-color: #dc3545; margin-top: 20px;">
                    <h4 style="color: #721c24;"><span class="icon">🔧</span>Grounding Khusus untuk Sistem Tertentu</h4>
                    <p style="color: #721c24; margin-bottom: 15px;">Beberapa modul memerlukan penanganan grounding khusus, terutama pada sistem yang menggunakan:</p>
                    <ul style="color: #721c24; margin-left: 20px; margin-bottom: 15px;">
                        <li><strong>Inverter HF</strong> (High Frequency)</li>
                        <li>Sistem dengan <strong>Power Factor (PF) jelek</strong></li>
                    </ul>
                    <p style="color: #721c24; margin-bottom: 10px;"><strong>Solusi:</strong></p>
                    <p style="color: #721c24;">Lakukan grounding tambahan dengan menghubungkan <strong>minus modul ke minus sistem baterai</strong>. Hal ini membantu menstabilkan referensi potensial dan mencegah data corruption pada port RS485.</p>
                </div>
            </div>
            
            <!-- Checklist -->
            <div class="section">
                <h2>📋 Checklist Aktivasi</h2>
                <div class="checklist">
                    <div class="checklist-item">
                        <input type="checkbox" id="check1">
                        <label for="check1">Sistem baterai sudah tergrounding dengan baik</label>
                    </div>
                    <div class="checklist-item">
                        <input type="checkbox" id="check2">
                        <label for="check2">Modul terhubung ke power supply</label>
                    </div>
                    <div class="checklist-item">
                        <input type="checkbox" id="check3">
                        <label for="check3">Terkoneksi ke WiFi modul dengan password default</label>
                    </div>
                    <div class="checklist-item">
                        <input type="checkbox" id="check4">
                        <label for="check4">Berhasil akses 192.168.4.1 di browser</label>
                    </div>
                    <div class="checklist-item">
                        <input type="checkbox" id="check5">
                        <label for="check5">Masukkan SSID dan password router rumah</label>
                    </div>
                    <div class="checklist-item">
                        <input type="checkbox" id="check6">
                        <label for="check6">Klik Save & Reboot</label>
                    </div>
                    <div class="checklist-item">
                        <input type="checkbox" id="check7">
                        <label for="check7">Tunggu reboot selesai (2-3 menit)</label>
                    </div>
                    <div class="checklist-item">
                        <input type="checkbox" id="check8">
                        <label for="check8">Verifikasi WiFi modul hilang dari list jaringan</label>
                    </div>
                    <div class="checklist-item">
                        <input type="checkbox" id="check9">
                        <label for="check9">Akses link monitoring dengan ID modul</label>
                    </div>
                </div>
            </div>
            
            <!-- Support -->
            <div class="section">
                <h2>🆘 Dukungan & Bantuan</h2>
                <p>Jika mengalami kendala, lakukan langkah-langkah berikut secara berurutan:</p>
                <ol style="margin-left: 20px; color: #555;">
                    <li style="margin-bottom: 10px;">Verifikasi kembali langkah-langkah aktivasi di atas</li>
                    <li style="margin-bottom: 10px;"><strong>Pastikan sistem baterai sudah tergrounding dengan baik</strong> - ini adalah penyebab utama masalah</li>
                    <li style="margin-bottom: 10px;">Cek koneksi kabel RS485 dan pastikan tidak ada koneksi yang lepas</li>
                    <li style="margin-bottom: 10px;">Coba restart modul dengan cara disconnect dan reconnect power</li>
                    <li>Jika masalah persisten, dokumentasikan detail error dan hubungi tim support</li>
                </ol>
            </div>
        </div>
        
        <div class="footer">
            <p>📄 Dokumentasi Modul Sakti - Edisi 1.0</p>
            <p style="margin-top: 10px; font-size: 0.9em;">Terakhir diperbarui: 2026</p>
        </div>
    </div>
</body>
</html>
