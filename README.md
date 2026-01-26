Cara aktifasi/setting Modul Sakti:
- konek ke wifi modul
- default password: password12345
- jika berhasil koneksi, buka browser, akses ip 192.168.4.1
- ubah wifi router ssid -> sesuai ssid router rumah
- ubah wifi router pass -> sesuai password router rumah
- klik save & reboot

jika wifi module masih muncul, berarti modul belum berhasil konek ke wifi.
ulangi sampai wifi modul hilang ( sudah tudak memancarkan wifi/ssid)

NOTE: Minimalisir proses cabut colok port RS485 saat modul kondisi aktif, untuk menghindari transient voltage,
yang potensial merusak chip transceiver RS485.
- beebrapa modul perlu "meng-grounding-kan" dengan battery sistem, biasanya yang menggunakan inverter HF, Atau PF jelek,
sehingga data pada port RS485 corrupt, solving dengan menggrounfkan minus modul, atau langsung menghububngkan minus modul ke 
minus sistem baterai.

untuk Online monitoring bisa langsung akses ke link : https://fatkhurrr.github.io/lipo4Mon/index.html?id=<id_modul>
misal https://fatkhurrr.github.io/lipo4Mon/index.html?id=1234567890
link ini bisa di buka baik di PC maupun di HP.

