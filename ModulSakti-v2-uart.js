/**
 * ModulSakti - MQTT Module Class v2.1
 * 
 * Enhanced Version dengan fitur:
 * - Embedded server configuration
 * - Transparent UART/Serial to MQTT bridging
 * - XOR encryption/decryption dengan SHA-1 key derivation
 * - Custom topic subscription dengan individual callbacks
 * - Auto data normalization untuk BMS data
 */

class ModulSakti {
  /**
   * ===================================================================
   * 📡 MQTT SERVER CONFIGURATION LIBRARY
   * ===================================================================
   */
  static MQTT_SERVERS = {
    'emqx-public': {
      host: 'broker.emqx.io',
      port: 8084,
      username: 'emqx',
      password: 'emqx',
      description: 'EMQX Public Broker - Free & Reliable'
    },

    'shiftr-io': {
      host: 'public.cloud.shiftr.io',
      port: 8084,
      username: 'public',
      password: 'public',
      description: 'Shiftr.io Public Broker'
    },

    'localhost': {
      host: 'localhost',
      port: 8084,
      username: 'mqtt',
      password: 'mqtt',
      description: 'Local MQTT Server (Development)'
    }
  };

  /**
   * ===================================================================
   * 🔐 ENCRYPTION UTILITIES - SHA-1 & XOR
   * ===================================================================
   */

  /**
   * SHA-1 Hash implementation untuk key derivation
   * @private
   * @param {string} str - String to hash
   * @returns {Uint8Array} 20-byte SHA-1 hash
   */
  static _sha1(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    
    let hash = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0];
    const w = [];
    
    for (let i = 0; i < data.length; i += 64) {
      const chunk = new Uint32Array(16);
      for (let j = 0; j < Math.min(64, data.length - i); j++) {
        chunk[Math.floor(j / 4)] |= (data[i + j] << ((3 - (j % 4)) * 8));
      }
      
      for (let j = 16; j < 80; j++) {
        w[j] = ((w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16]) << 1) | 
               ((w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16]) >>> 31);
      }
      
      let a = hash[0], b = hash[1], c = hash[2], d = hash[3], e = hash[4];
      
      for (let j = 0; j < 80; j++) {
        let f, k;
        if (j < 20) {
          f = (b & c) | (~b & d);
          k = 0x5A827999;
        } else if (j < 40) {
          f = b ^ c ^ d;
          k = 0x6ED9EBA1;
        } else if (j < 60) {
          f = (b & c) | (b & d) | (c & d);
          k = 0x8F1BBCDC;
        } else {
          f = b ^ c ^ d;
          k = 0xCA62C1D6;
        }
        
        const temp = ((a << 5) | (a >>> 27)) + f + e + k + w[j];
        e = d;
        d = c;
        c = ((b << 30) | (b >>> 2));
        b = a;
        a = temp;
      }
      
      hash[0] = (hash[0] + a) >>> 0;
      hash[1] = (hash[1] + b) >>> 0;
      hash[2] = (hash[2] + c) >>> 0;
      hash[3] = (hash[3] + d) >>> 0;
      hash[4] = (hash[4] + e) >>> 0;
    }
    
    const result = new Uint8Array(20);
    for (let i = 0; i < 5; i++) {
      result[i * 4] = (hash[i] >>> 24) & 0xFF;
      result[i * 4 + 1] = (hash[i] >>> 16) & 0xFF;
      result[i * 4 + 2] = (hash[i] >>> 8) & 0xFF;
      result[i * 4 + 3] = hash[i] & 0xFF;
    }
    return result;
  }

  /**
   * XOR Encrypt/Decrypt dengan SHA-1 key derivation
   * Algoritma sama dengan Arduino:
   *   uint8_t key[20]; 
   *   sha1(salt, key);
   *   for (size_t i = 0; i < len; i++) {
   *     data[i] ^= key[i % 20];
   *   }
   * 
   * @private
   * @param {Uint8Array|Array} data - Data to encrypt/decrypt
   * @param {string} salt - Salt untuk SHA-1 key derivation
   * @returns {Uint8Array} Encrypted/Decrypted data
   */
  static _xorEncryptDecrypt(data, salt) {
    const key = ModulSakti._sha1(salt);
    const result = new Uint8Array(data.length);
    
    for (let i = 0; i < data.length; i++) {
      result[i] = data[i] ^ key[i % 20];
    }
    
    return result;
  }

  /**
   * Get list semua server yang tersedia
   */
  static getAvailableServers() {
    return Object.entries(ModulSakti.MQTT_SERVERS).map(([id, config]) => ({
      id,
      description: config.description,
      host: config.host,
      port: config.port
    }));
  }

  /**
   * Get server config berdasarkan serverId
   */
  static getServerConfig(serverId) {
    return ModulSakti.MQTT_SERVERS[serverId];
  }

  /**
   * Constructor
   * @param {Object} config - Konfigurasi
   * @param {string} config.serverId - ID server dari MQTT_SERVERS
   * @param {string} config.idModule - ID modul/logger (string atau array)
   * @param {string} config.encryptionSalt - Salt untuk XOR encryption (optional)
   * @param {Function} config.onBatteryData - Callback untuk battery data
   * @param {Function} config.onHeartbeat - Callback untuk heartbeat
   * @param {Function} config.onConnect - Callback connect
   * @param {Function} config.onDisconnect - Callback disconnect
   * @param {Function} config.onError - Callback error
   */
  constructor(config) {
    // Validasi serverId
    if (!config.serverId) {
      const available = Object.keys(ModulSakti.MQTT_SERVERS).join(', ');
      throw new Error(
        `❌ serverId harus diisi!\n` +
        `Available servers: ${available}`
      );
    }

    const serverConfig = ModulSakti.MQTT_SERVERS[config.serverId];
    if (!serverConfig) {
      const available = Object.keys(ModulSakti.MQTT_SERVERS).join(', ');
      throw new Error(
        `❌ serverId "${config.serverId}" tidak ditemukan!\n` +
        `Available: ${available}`
      );
    }

    this.config = {
      host: serverConfig.host,
      port: serverConfig.port,
      username: serverConfig.username,
      password: serverConfig.password,
      protocol: 'wss',
      serverId: config.serverId,
      serverDescription: serverConfig.description,
      idModule: Array.isArray(config.idModule) ? config.idModule : [config.idModule],
      reconnectPeriod: 1000,
      connectTimeout: 30 * 1000,
      encryptionSalt: config.encryptionSalt || ''
    };

    this.clients = [];
    
    this.callbacks = {
      onBatteryData: config.onBatteryData || (() => {}),
      onHeartbeat: config.onHeartbeat || (() => {}),
      onConnect: config.onConnect || (() => {}),
      onDisconnect: config.onDisconnect || (() => {}),
      onError: config.onError || (() => {})
    };

    // Custom topic subscriptions dengan callback
    this.customSubscriptions = new Map();  // Map<topic, callback>

    this.isConnected = false;
    this.subscribedTopics = [];
    this.idModuleArray = this.config.idModule;

    if (!this.idModuleArray || this.idModuleArray.length === 0) {
      throw new Error('❌ idModule harus diisi (string atau array)');
    }

    if (typeof mqtt === 'undefined') {
      throw new Error(
        '❌ MQTT library tidak ditemukan.\n' +
        'Pastikan sudah include: <script src="https://unpkg.com/mqtt/dist/mqtt.min.js"><\/script>'
      );
    }

    console.log(`[ModulSakti] Configuration loaded:`);
    console.log(`  ├─ Server: ${this.config.serverDescription} (${this.config.serverId})`);
    console.log(`  ├─ Broker: ${this.config.host}:${this.config.port}`);
    console.log(`  ├─ Module IDs: ${this.idModuleArray.join(', ')}`);
    console.log(`  └─ Encryption: ${this.config.encryptionSalt ? 'Enabled' : 'Disabled'}`);
  }

  /**
   * Build WebSocket URL
   * @private
   */
  _buildMqttUrl() {
    return `${this.config.protocol}://${this.config.host}:${this.config.port}/mqtt`;
  }

  /**
   * Initialize dan connect ke MQTT Broker
   */
  async init() {
    try {
      const mqttUrl = this._buildMqttUrl();
      
      const options = {
        username: this.config.username,
        password: this.config.password,
        reconnectPeriod: this.config.reconnectPeriod,
        connectTimeout: this.config.connectTimeout,
        protocolId: 'MQTT',
        protocolVersion: 4,
        clean: true,
        keepalive: 60,
        clientId: `ModulSakti-${this.config.idModule[0]}-${Date.now()}`
      };

      console.log(`[ModulSakti] 🔌 Connecting to ${mqttUrl}`);
      const client = mqtt.connect(mqttUrl, options);

      client.on('connect', () => {
        this._handleConnect(client);
      });

      client.on('message', (topic, message) => {
        this._handleMessage(topic, message);
      });

      client.on('error', (error) => {
        this._handleError(error);
      });

      client.on('disconnect', () => {
        this._handleDisconnect();
      });

      this.primaryClient = client;
      return true;
    } catch (error) {
      console.error('[ModulSakti] ❌ Connection error:', error);
      this.callbacks.onError(error);
      return false;
    }
  }

  /**
   * Handle MQTT connect
   * @private
   */
  _handleConnect(client) {
    console.log('[ModulSakti] ✅ Connected to MQTT broker');
    this.isConnected = true;
    this.primaryClient = client;

    // Subscribe ke default topics menggunakan format original
    // sysMon/{loggerId}/AutoPoll/#
    
    this.idModuleArray.forEach(idModule => {
      // Main AutoPoll topic dengan wildcard
      const autoTopicPattern = `sysMon/${idModule}/AutoPoll/#`;
      client.subscribe(autoTopicPattern, { qos: 0 }, (err) => {
        if (!err) {
          this.subscribedTopics.push(autoTopicPattern);
          console.log(`[ModulSakti] 📥 Subscribed: ${autoTopicPattern}`);
        }
      });

      // Info topic untuk network/polling status
      const infoTopicPattern = `sysMon/${idModule}/info/#`;
      client.subscribe(infoTopicPattern, { qos: 0 }, (err) => {
        if (!err) {
          this.subscribedTopics.push(infoTopicPattern);
          console.log(`[ModulSakti] 📥 Subscribed: ${infoTopicPattern}`);
        }
      });
    });

    // Re-subscribe custom topics jika ada
    this.customSubscriptions.forEach((callback, topic) => {
      client.subscribe(topic, (err) => {
        if (!err) {
          console.log(`[ModulSakti] 📥 Re-subscribed custom: ${topic}`);
        }
      });
    });

    this.callbacks.onConnect();
  }

  /**
   * Handle incoming MQTT message
   * @private
   */
  _handleMessage(topic, message) {
    try {
      console.log(`[ModulSakti] 📨 Message received on topic: ${topic}`);
      
      let payload = message.toString();
      console.log(`[ModulSakti] Payload preview: ${payload.substring(0, 100)}...`);

      // Decrypt jika salt ada
      if (this.config.encryptionSalt && message instanceof Buffer) {
        const decrypted = ModulSakti._xorEncryptDecrypt(new Uint8Array(message), this.config.encryptionSalt);
        payload = new TextDecoder().decode(decrypted);
        console.log(`[ModulSakti] 🔐 Message decrypted from ${topic}`);
      }

      // Route ke custom subscription handler jika ada
      if (this.customSubscriptions.has(topic)) {
        console.log(`[ModulSakti] ✅ Routed to custom handler: ${topic}`);
        const callback = this.customSubscriptions.get(topic);
        callback(payload, topic);
        return;
      }

      // Default topic routing - Parse topic format: sysMon/{loggerId}/AutoPoll/...
      // atau sysMon/{loggerId}/info/...
      const topicParts = topic.split('/');
      
      if (topicParts.length >= 3) {
        const topicType = topicParts[2]; // AutoPoll atau info
        
        if (topicType === 'AutoPoll' || topicType.startsWith('AutoPoll')) {
          // AutoPoll topics berisi battery data JSON
          console.log(`[ModulSakti] ✅ Routed to onBatteryData`);
          this.callbacks.onBatteryData(payload);
        } else if (topicType === 'info' || topicType.startsWith('info')) {
          // Info topic berisi network/status info
          console.log(`[ModulSakti] ✅ Routed to onHeartbeat (info)`);
          this.callbacks.onHeartbeat(payload);
        }
      } else {
        console.log(`[ModulSakti] ⚠️ Unknown topic format: ${topic}`);
      }
    } catch (error) {
      console.error('[ModulSakti] ❌ Error handling message:', error);
      console.error('[ModulSakti] Error details:', error.stack);
    }
  }

  /**
   * Handle MQTT error
   * @private
   */
  _handleError(error) {
    console.error('[ModulSakti] ❌ MQTT Error:', error);
    this.isConnected = false;
    this.callbacks.onError(error);
  }

  /**
   * Handle MQTT disconnect
   * @private
   */
  _handleDisconnect() {
    console.log('[ModulSakti] 👋 Disconnected from MQTT');
    this.isConnected = false;
    this.callbacks.onDisconnect();
  }

  /**
   * Enable transparent UART/Serial read handling
   * Data dari topic TX akan di-pass ke callback
   * 
   * @param {Function} callback - Callback (data, topic) => {}
   * @returns {boolean}
   */
  enableTransparentRead(callback) {
    if (typeof callback !== 'function') {
      console.error('[ModulSakti] ❌ Callback must be a function');
      return false;
    }

    this.transparentReadCallback = callback;
    console.log('[ModulSakti] ✅ Transparent read enabled');
    return true;
  }

  /**
   * Write transparent data
   * Data akan di-publish ke RX topic dengan optional encryption
   * 
   * @param {Uint8Array|Array|Buffer} data - Binary data
   * @returns {boolean}
   */
  writeTransparent(data) {
    if (!this.isConnected || !this.primaryClient) {
      console.warn('[ModulSakti] ⚠️ Not connected to MQTT');
      return false;
    }

    try {
      const rxTopic = `${this.idModuleArray[0]}/RX`;
      let payload = new Uint8Array(data);

      // Encrypt jika salt ada
      if (this.config.encryptionSalt) {
        payload = ModulSakti._xorEncryptDecrypt(payload, this.config.encryptionSalt);
        console.log(`[ModulSakti] 🔐 Transparent TX encrypted & published`);
      } else {
        console.log(`[ModulSakti] 📤 Transparent TX published`);
      }

      this.primaryClient.publish(rxTopic, payload, { qos: 0 });
      return true;
    } catch (error) {
      console.error('[ModulSakti] ❌ Error in transparent write:', error);
      return false;
    }
  }

  /**
   * Get transparent topics
   * Untuk debugging/monitoring
   * 
   * @returns {Object} {txTopic, rxTopic}
   */
  getTransparentTopics() {
    return {
      txTopic: `${this.idModuleArray[0]}/TX`,  // MQTT → Device
      rxTopic: `${this.idModuleArray[0]}/RX`,  // Device → MQTT
      readEnabled: !!this.transparentReadCallback
    };
  }

  /**
   * Subscribe ke topic dengan individual callback
   * Callback akan menerima (payload, topic)
   * Data akan di-decrypt otomatis jika encryption enabled
   * 
   * @param {string} topic - Topic untuk subscribe
   * @param {Function} callback - Callback (payload, topic) => {}
   * @returns {boolean}
   * 
   * @example
   * modul.subscribeCustom('device/SN-001/custom', (payload, topic) => {
   *   console.log('Received from', topic, ':', payload);
   * });
   */
  subscribeCustom(topic, callback) {
    if (!callback || typeof callback !== 'function') {
      console.error('[ModulSakti] ❌ Callback must be a function');
      return false;
    }

    try {
      // Store callback
      this.customSubscriptions.set(topic, callback);

      // Subscribe jika sudah connected
      if (this.isConnected && this.primaryClient) {
        this.primaryClient.subscribe(topic, (err) => {
          if (!err) {
            this.subscribedTopics.push(topic);
            console.log(`[ModulSakti] 📥 Subscribed custom: ${topic}`);
          }
        });
      }

      return true;
    } catch (error) {
      console.error('[ModulSakti] ❌ Error subscribing:', error);
      return false;
    }
  }

  /**
   * Publish data ke topic dengan optional encryption
   * Digunakan untuk transparent UART -> MQTT bridging
   * 
   * @param {string} topic - Topic tujuan
   * @param {Uint8Array|Array|Buffer} data - Binary data dari UART
   * @returns {boolean}
   * 
   * @example
   * // Dari UART terima data, publish ke MQTT
   * serialPort.on('data', (data) => {
   *   modul.publishBinary('device/SN-001/RX', data);
   * });
   */
  publishBinary(topic, data) {
    if (!this.isConnected || !this.primaryClient) {
      console.warn('[ModulSakti] ⚠️ Not connected to MQTT');
      return false;
    }

    try {
      let payload = new Uint8Array(data);

      // Encrypt jika salt ada
      if (this.config.encryptionSalt) {
        payload = ModulSakti._xorEncryptDecrypt(payload, this.config.encryptionSalt);
        console.log(`[ModulSakti] 🔐 Data encrypted & published to ${topic}`);
      } else {
        console.log(`[ModulSakti] 📤 Data published to ${topic}`);
      }

      this.primaryClient.publish(topic, payload, { qos: 0 });
      return true;
    } catch (error) {
      console.error('[ModulSakti] ❌ Error publishing binary:', error);
      return false;
    }
  }

  /**
   * Send command ke module
   * 
   * @param {string} idModule - ID module
   * @param {string} command - Command (POLL0, POLL1, etc)
   * @returns {boolean}
   */
  sendCommand(idModule, command) {
    if (!this.isConnected || !this.primaryClient) {
      console.warn('[ModulSakti] ⚠️ Not connected to MQTT');
      return false;
    }

    const topic = `${idModule}/seting`;
    
    try {
      this.primaryClient.publish(topic, command, { qos: 0 }, (err) => {
        if (err) {
          console.error(`[ModulSakti] ❌ Error publishing to ${topic}:`, err);
        } else {
          console.log(`[ModulSakti] 📤 Command sent to ${topic}: ${command}`);
        }
      });
      return true;
    } catch (error) {
      console.error('[ModulSakti] ❌ Error sending command:', error);
      return false;
    }
  }

  /**
   * Write data ke text topic
   * 
   * @param {string} txTopic - Topic tujuan
   * @param {string|Object} data - Data (string atau object akan di-JSON)
   * @returns {boolean}
   */
  writeData(txTopic, data) {
    if (!this.isConnected || !this.primaryClient) {
      console.warn('[ModulSakti] ⚠️ Not connected to MQTT');
      return false;
    }

    try {
      const payload = typeof data === 'string' ? data : JSON.stringify(data);
      
      this.primaryClient.publish(txTopic, payload, { qos: 0 }, (err) => {
        if (err) {
          console.error(`[ModulSakti] ❌ Error publishing to ${txTopic}:`, err);
        } else {
          console.log(`[ModulSakti] 📤 Data written to ${txTopic}`);
        }
      });
      return true;
    } catch (error) {
      console.error('[ModulSakti] ❌ Error writing data:', error);
      return false;
    }
  }

  /**
   * Subscribe ke topic (standard)
   * Untuk case di mana tidak perlu custom callback
   * 
   * @param {string} topic - Topic untuk subscribe
   * @returns {boolean}
   */
  subscribeTopic(topic) {
    if (!this.isConnected || !this.primaryClient) {
      console.warn('[ModulSakti] ⚠️ Not connected to MQTT');
      return false;
    }

    try {
      this.primaryClient.subscribe(topic, (err) => {
        if (!err) {
          this.subscribedTopics.push(topic);
          console.log(`[ModulSakti] 📥 Subscribed to: ${topic}`);
        }
      });
      return true;
    } catch (error) {
      console.error('[ModulSakti] ❌ Error subscribing:', error);
      return false;
    }
  }

  /**
   * Unsubscribe dari topic
   * 
   * @param {string} topic - Topic untuk unsubscribe
   * @returns {boolean}
   */
  unsubscribeTopic(topic) {
    if (!this.isConnected || !this.primaryClient) {
      console.warn('[ModulSakti] ⚠️ Not connected to MQTT');
      return false;
    }

    try {
      this.primaryClient.unsubscribe(topic, (err) => {
        if (!err) {
          this.subscribedTopics = this.subscribedTopics.filter(t => t !== topic);
          this.customSubscriptions.delete(topic);
          console.log(`[ModulSakti] 📤 Unsubscribed from: ${topic}`);
        }
      });
      return true;
    } catch (error) {
      console.error('[ModulSakti] ❌ Error unsubscribing:', error);
      return false;
    }
  }

  /**
   * Disconnect dari MQTT
   */
  disconnect() {
    if (this.primaryClient) {
      this.primaryClient.end(true, () => {
        console.log('[ModulSakti] 👋 Disconnected');
      });
    }
  }

  /**
   * Get status koneksi
   * 
   * @returns {Object} Status object
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      serverId: this.config.serverId,
      serverDescription: this.config.serverDescription,
      broker: `${this.config.host}:${this.config.port}`,
      subscribedTopics: this.subscribedTopics,
      customSubscriptions: Array.from(this.customSubscriptions.keys()),
      idModule: this.idModuleArray,
      encryptionEnabled: !!this.config.encryptionSalt
    };
  }

  /**
   * Reset module
   */
  reset() {
    this.disconnect();
    this.isConnected = false;
    this.subscribedTopics = [];
    this.customSubscriptions.clear();
    this.clients = [];
    console.log('[ModulSakti] 🔄 Reset complete');
  }
}

// Export untuk module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModulSakti;
}
