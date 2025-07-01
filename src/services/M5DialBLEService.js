// M5DialBLEService - handles Web Bluetooth connection to M5Stack Dial Pomodoro timer
// Uses the same UUIDs as Arduino sketch & Python demo
const SERVICE_UUID = '19B10000-E8F2-537E-4F6C-D104768A1214';
const COMMAND_CHAR_UUID = '19B10001-E8F2-537E-4F6C-D104768A1214';
const STATUS_CHAR_UUID = '19B10002-E8F2-537E-4F6C-D104768A1214';

/**
 * Lightweight singleton BLE helper using EventTarget for events: 'connected', 'disconnected', 'status'.
 * Consumer code should listen using `on()` or via the custom hook.
 */
class M5DialBLEService extends EventTarget {
  constructor() {
    super();
    this.device = null;
    this.server = null;
    this.commandChar = null;
    this.statusChar = null;
    this.connected = false;
  }

  async connect() {
    try {
      if (!navigator.bluetooth) throw new Error('Web Bluetooth not supported in this browser');
      this.dispatchEvent(new CustomEvent('connecting'));
      let device;
      try {
        device = await navigator.bluetooth.requestDevice({
          filters: [{ name: 'M5Dial-Pomodoro' }],
          optionalServices: [SERVICE_UUID],
        });
      } catch (err) {
        if (err.name === 'NotFoundError') {
          // fallback: broader scan by name prefix
          console.warn('Specific name not found, falling back to namePrefix');
          device = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: 'M5Dial' }],
            optionalServices: [SERVICE_UUID],
          });
        } else {
          throw err;
        }
      }
      this.device = device;
      this.device.addEventListener('gattserverdisconnected', this._handleDisconnect.bind(this));
      this.server = await this.device.gatt.connect();
      const service = await this.server.getPrimaryService(SERVICE_UUID);
      this.commandChar = await service.getCharacteristic(COMMAND_CHAR_UUID);
      this.statusChar = await service.getCharacteristic(STATUS_CHAR_UUID);
      await this.statusChar.startNotifications();
      this.statusChar.addEventListener('characteristicvaluechanged', this._handleStatus.bind(this));
      this.connected = true;
      this.dispatchEvent(new CustomEvent('connected'));
    } catch (e) {
      console.error('BLE connect error', e);
      this.dispatchEvent(new CustomEvent('error', { detail: e }));
      throw e;
    }
  }

  async disconnect() {
    if (this.device && this.device.gatt && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this._handleDisconnect();
  }

  async sendCommand(cmd) {
    if (!this.commandChar) throw new Error('Not connected');
    const data = typeof cmd === 'string' ? cmd : JSON.stringify(cmd);
    await this.commandChar.writeValue(new TextEncoder().encode(data));
  }

  _handleStatus(ev) {
    const value = ev.target.value;
    const text = new TextDecoder().decode(value);
    // Attempt to parse JSON; fallback to raw text
    let payload = text;
    try { payload = JSON.parse(text); } catch (_) {}
    this.dispatchEvent(new CustomEvent('status', { detail: payload }));
  }

  _handleDisconnect() {
    if (this.connected) {
      this.connected = false;
      this.dispatchEvent(new CustomEvent('disconnected'));
      // auto-reconnect? leaving to hook
    }
  }
}

// Export a singleton instance
export const m5DialBLEService = new M5DialBLEService();
export default m5DialBLEService;
