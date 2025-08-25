import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform, Dimensions } from 'react-native';

export class DeviceUtils {
  // Tipos de dispositivos
  static DEVICE_TYPES = {
    SMART_METER: 'smart_meter',
    SENSOR: 'sensor',
    SWITCH: 'switch',
    MONITOR: 'monitor',
    CONTROLLER: 'controller',
  };

  // Estados de conexión
  static CONNECTION_STATES = {
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected',
    CONNECTING: 'connecting',
    ERROR: 'error',
    TIMEOUT: 'timeout',
  };

  // Protocolos de comunicación
  static PROTOCOLS = {
    WIFI: 'wifi',
    BLUETOOTH: 'bluetooth',
    ZIGBEE: 'zigbee',
    MODBUS: 'modbus',
    TCP_IP: 'tcp_ip',
  };

  /**
   * Inicializa el sistema de dispositivos
   */
  static async initialize() {
    try {
      // Cargar dispositivos guardados
      const devices = await this.getStoredDevices();
      
      // Verificar conectividad
      const connectivity = await this.checkConnectivity();
      
      // Inicializar protocolos de comunicación
      await this.initializeProtocols();

      return {
        success: true,
        devices: devices.length,
        connectivity,
      };
    } catch (error) {
      console.error('Error initializing device system:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Escanea dispositivos disponibles
   * @param {string} protocol - Protocolo a usar para el escaneo
   */
  static async scanForDevices(protocol = this.PROTOCOLS.WIFI) {
    try {
      let discoveredDevices = [];

      switch (protocol) {
        case this.PROTOCOLS.WIFI:
          discoveredDevices = await this.scanWifiDevices();
          break;
        case this.PROTOCOLS.BLUETOOTH:
          discoveredDevices = await this.scanBluetoothDevices();
          break;
        case this.PROTOCOLS.ZIGBEE:
          discoveredDevices = await this.scanZigbeeDevices();
          break;
        default:
          throw new Error(`Unsupported protocol: ${protocol}`);
      }

      return {
        success: true,
        devices: discoveredDevices,
        protocol,
      };
    } catch (error) {
      console.error('Error scanning for devices:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Conecta a un dispositivo específico
   * @param {Object} device - Información del dispositivo
   */
  static async connectToDevice(device) {
    try {
      // Validar información del dispositivo
      if (!this.validateDeviceInfo(device)) {
        throw new Error('Invalid device information');
      }

      // Intentar conexión según el protocolo
      const connectionResult = await this.establishConnection(device);
      
      if (!connectionResult.success) {
        throw new Error(connectionResult.error);
      }

      // Guardar dispositivo conectado
      await this.saveConnectedDevice(device);
      
      // Inicializar comunicación
      await this.initializeDeviceCommunication(device);

      return {
        success: true,
        device: {
          ...device,
          connectionState: this.CONNECTION_STATES.CONNECTED,
          connectedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Error connecting to device:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Desconecta de un dispositivo
   * @param {string} deviceId - ID del dispositivo
   */
  static async disconnectFromDevice(deviceId) {
    try {
      const device = await this.getDeviceById(deviceId);
      if (!device) {
        throw new Error('Device not found');
      }

      // Cerrar conexión
      await this.closeConnection(device);
      
      // Actualizar estado
      device.connectionState = this.CONNECTION_STATES.DISCONNECTED;
      device.disconnectedAt = new Date().toISOString();
      
      await this.updateDeviceInfo(device);

      return { success: true };
    } catch (error) {
      console.error('Error disconnecting from device:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Configura un dispositivo
   * @param {string} deviceId - ID del dispositivo
   * @param {Object} config - Configuración del dispositivo
   */
  static async configureDevice(deviceId, config) {
    try {
      const device = await this.getDeviceById(deviceId);
      if (!device) {
        throw new Error('Device not found');
      }

      if (device.connectionState !== this.CONNECTION_STATES.CONNECTED) {
        throw new Error('Device not connected');
      }

      // Enviar configuración al dispositivo
      const configResult = await this.sendDeviceConfiguration(device, config);
      
      if (!configResult.success) {
        throw new Error(configResult.error);
      }

      // Actualizar configuración local
      device.configuration = { ...device.configuration, ...config };
      device.lastConfigured = new Date().toISOString();
      
      await this.updateDeviceInfo(device);

      return { success: true, device };
    } catch (error) {
      console.error('Error configuring device:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Lee datos de un dispositivo
   * @param {string} deviceId - ID del dispositivo
   * @param {Array} parameters - Parámetros a leer
   */
  static async readDeviceData(deviceId, parameters = []) {
    try {
      const device = await this.getDeviceById(deviceId);
      if (!device) {
        throw new Error('Device not found');
      }

      if (device.connectionState !== this.CONNECTION_STATES.CONNECTED) {
        throw new Error('Device not connected');
      }

      // Leer datos del dispositivo
      const data = await this.requestDeviceData(device, parameters);
      
      // Guardar datos en historial
      await this.saveDeviceData(deviceId, data);

      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error reading device data:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envía comando a un dispositivo
   * @param {string} deviceId - ID del dispositivo
   * @param {string} command - Comando a enviar
   * @param {Object} parameters - Parámetros del comando
   */
  static async sendDeviceCommand(deviceId, command, parameters = {}) {
    try {
      const device = await this.getDeviceById(deviceId);
      if (!device) {
        throw new Error('Device not found');
      }

      if (device.connectionState !== this.CONNECTION_STATES.CONNECTED) {
        throw new Error('Device not connected');
      }

      // Enviar comando
      const result = await this.executeDeviceCommand(device, command, parameters);
      
      // Registrar comando en historial
      await this.logDeviceCommand(deviceId, command, parameters, result);

      return result;
    } catch (error) {
      console.error('Error sending device command:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtiene información de un dispositivo
   * @param {string} deviceId - ID del dispositivo
   */
  static async getDeviceInfo(deviceId) {
    try {
      const device = await this.getDeviceById(deviceId);
      if (!device) {
        throw new Error('Device not found');
      }

      // Obtener información adicional si está conectado
      if (device.connectionState === this.CONNECTION_STATES.CONNECTED) {
        const liveInfo = await this.getLiveDeviceInfo(device);
        return {
          success: true,
          device: { ...device, ...liveInfo },
        };
      }

      return { success: true, device };
    } catch (error) {
      console.error('Error getting device info:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Lista todos los dispositivos
   */
  static async listDevices() {
    try {
      const devices = await this.getStoredDevices();
      
      // Actualizar estados de conexión
      for (const device of devices) {
        const status = await this.checkDeviceStatus(device);
        device.connectionState = status.state;
        device.lastSeen = status.lastSeen;
      }

      return { success: true, devices };
    } catch (error) {
      console.error('Error listing devices:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Elimina un dispositivo
   * @param {string} deviceId - ID del dispositivo
   */
  static async removeDevice(deviceId) {
    try {
      // Desconectar si está conectado
      await this.disconnectFromDevice(deviceId);
      
      // Eliminar de almacenamiento
      const devices = await this.getStoredDevices();
      const filteredDevices = devices.filter(d => d.id !== deviceId);
      
      await AsyncStorage.setItem('connectedDevices', JSON.stringify(filteredDevices));
      
      // Limpiar datos del dispositivo
      await this.clearDeviceData(deviceId);

      return { success: true };
    } catch (error) {
      console.error('Error removing device:', error);
      return { success: false, error: error.message };
    }
  }

  // Métodos auxiliares privados

  /**
   * Escanea dispositivos WiFi
   */
  static async scanWifiDevices() {
    // Simulación de escaneo WiFi
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockDevices = [
          {
            id: 'wifi_meter_001',
            name: 'Medidor Inteligente #001',
            type: this.DEVICE_TYPES.SMART_METER,
            protocol: this.PROTOCOLS.WIFI,
            ipAddress: '10.10.7.24500',
            macAddress: '00:11:22:33:44:55',
            signal: -45,
            manufacturer: 'ElectroPuno',
            model: 'EP-SM-2024',
            firmware: '1.2.3',
          },
          {
            id: 'wifi_sensor_001',
            name: 'Sensor de Corriente #001',
            type: this.DEVICE_TYPES.SENSOR,
            protocol: this.PROTOCOLS.WIFI,
            ipAddress: '10.10.7.24501',
            macAddress: '00:11:22:33:44:56',
            signal: -52,
            manufacturer: 'ElectroPuno',
            model: 'EP-CS-2024',
            firmware: '1.1.0',
          },
        ];
        resolve(mockDevices);
      }, 2000);
    });
  }

  /**
   * Escanea dispositivos Bluetooth
   */
  static async scanBluetoothDevices() {
    // Simulación de escaneo Bluetooth
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockDevices = [
          {
            id: 'bt_switch_001',
            name: 'Interruptor Inteligente #001',
            type: this.DEVICE_TYPES.SWITCH,
            protocol: this.PROTOCOLS.BLUETOOTH,
            bluetoothId: 'EP:SW:01:23:45:67',
            signal: -60,
            manufacturer: 'ElectroPuno',
            model: 'EP-SW-2024',
            firmware: '1.0.5',
          },
        ];
        resolve(mockDevices);
      }, 1500);
    });
  }

  /**
   * Escanea dispositivos Zigbee
   */
  static async scanZigbeeDevices() {
    // Simulación de escaneo Zigbee
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockDevices = [
          {
            id: 'zb_monitor_001',
            name: 'Monitor de Energía #001',
            type: this.DEVICE_TYPES.MONITOR,
            protocol: this.PROTOCOLS.ZIGBEE,
            zigbeeId: '0x00124B001F2A3B4C',
            networkId: 0x1234,
            manufacturer: 'ElectroPuno',
            model: 'EP-EM-2024',
            firmware: '2.1.0',
          },
        ];
        resolve(mockDevices);
      }, 3000);
    });
  }

  /**
   * Establece conexión con dispositivo
   * @param {Object} device - Información del dispositivo
   */
  static async establishConnection(device) {
    try {
      // Simulación de establecimiento de conexión
      return new Promise((resolve) => {
        setTimeout(() => {
          const success = Math.random() > 0.1; // 90% de éxito
          
          if (success) {
            resolve({ success: true });
          } else {
            resolve({
              success: false,
              error: 'Connection timeout',
            });
          }
        }, 2000);
      });
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Cierra conexión con dispositivo
   * @param {Object} device - Información del dispositivo
   */
  static async closeConnection(device) {
    try {
      // Simulación de cierre de conexión
      console.log(`Closing connection to device: ${device.name}`);
      return { success: true };
    } catch (error) {
      console.error('Error closing connection:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envía configuración al dispositivo
   * @param {Object} device - Información del dispositivo
   * @param {Object} config - Configuración a enviar
   */
  static async sendDeviceConfiguration(device, config) {
    try {
      // Simulación de envío de configuración
      console.log(`Sending configuration to ${device.name}:`, config);
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true });
        }, 1000);
      });
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Solicita datos del dispositivo
   * @param {Object} device - Información del dispositivo
   * @param {Array} parameters - Parámetros a leer
   */
  static async requestDeviceData(device, parameters) {
    try {
      // Simulación de lectura de datos
      const mockData = this.generateMockDeviceData(device.type);
      
      if (parameters.length > 0) {
        // Filtrar solo los parámetros solicitados
        const filteredData = {};
        parameters.forEach(param => {
          if (mockData[param] !== undefined) {
            filteredData[param] = mockData[param];
          }
        });
        return filteredData;
      }

      return mockData;
    } catch (error) {
      throw new Error(`Error reading device data: ${error.message}`);
    }
  }

  /**
   * Ejecuta comando en dispositivo
   * @param {Object} device - Información del dispositivo
   * @param {string} command - Comando a ejecutar
   * @param {Object} parameters - Parámetros del comando
   */
  static async executeDeviceCommand(device, command, parameters) {
    try {
      // Simulación de ejecución de comando
      console.log(`Executing command '${command}' on ${device.name}:`, parameters);
      
      return new Promise((resolve) => {
        setTimeout(() => {
          const success = Math.random() > 0.05; // 95% de éxito
          
          if (success) {
            resolve({
              success: true,
              result: `Command '${command}' executed successfully`,
            });
          } else {
            resolve({
              success: false,
              error: 'Command execution failed',
            });
          }
        }, 500);
      });
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtiene información en vivo del dispositivo
   * @param {Object} device - Información del dispositivo
   */
  static async getLiveDeviceInfo(device) {
    try {
      // Simulación de información en vivo
      return {
        uptime: Math.floor(Math.random() * 86400), // Segundos
        temperature: 25 + Math.random() * 10,
        signalStrength: -40 - Math.random() * 30,
        lastDataUpdate: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting live device info:', error);
      return {};
    }
  }

  /**
   * Verifica estado del dispositivo
   * @param {Object} device - Información del dispositivo
   */
  static async checkDeviceStatus(device) {
    try {
      // Simulación de verificación de estado
      const isOnline = Math.random() > 0.2; // 80% online
      
      return {
        state: isOnline ? this.CONNECTION_STATES.CONNECTED : this.CONNECTION_STATES.DISCONNECTED,
        lastSeen: new Date().toISOString(),
      };
    } catch (error) {
      return {
        state: this.CONNECTION_STATES.ERROR,
        lastSeen: null,
      };
    }
  }

  /**
   * Genera datos simulados del dispositivo
   * @param {string} deviceType - Tipo de dispositivo
   */
  static generateMockDeviceData(deviceType) {
    const baseData = {
      timestamp: new Date().toISOString(),
      deviceId: `mock_${Date.now()}`,
    };

    switch (deviceType) {
      case this.DEVICE_TYPES.SMART_METER:
        return {
          ...baseData,
          voltage: 220 + Math.random() * 20,
          current: 5 + Math.random() * 10,
          power: 1000 + Math.random() * 2000,
          energy: 1500 + Math.random() * 500,
          frequency: 50 + Math.random() * 2,
          powerFactor: 0.8 + Math.random() * 0.2,
        };
        
      case this.DEVICE_TYPES.SENSOR:
        return {
          ...baseData,
          current: Math.random() * 20,
          temperature: 20 + Math.random() * 15,
          humidity: 40 + Math.random() * 40,
        };
        
      case this.DEVICE_TYPES.SWITCH:
        return {
          ...baseData,
          state: Math.random() > 0.5 ? 'on' : 'off',
          switchCount: Math.floor(Math.random() * 1000),
        };
        
      case this.DEVICE_TYPES.MONITOR:
        return {
          ...baseData,
          totalEnergy: 5000 + Math.random() * 10000,
          dailyEnergy: 50 + Math.random() * 100,
          peakPower: 2000 + Math.random() * 1000,
        };
        
      default:
        return baseData;
    }
  }

  /**
   * Valida información del dispositivo
   * @param {Object} device - Información del dispositivo
   */
  static validateDeviceInfo(device) {
    const requiredFields = ['id', 'name', 'type', 'protocol'];
    
    for (const field of requiredFields) {
      if (!device[field]) {
        return false;
      }
    }

    if (!Object.values(this.DEVICE_TYPES).includes(device.type)) {
      return false;
    }

    if (!Object.values(this.PROTOCOLS).includes(device.protocol)) {
      return false;
    }

    return true;
  }

  /**
   * Obtiene dispositivos almacenados
   */
  static async getStoredDevices() {
    try {
      const devices = await AsyncStorage.getItem('connectedDevices');
      return devices ? JSON.parse(devices) : [];
    } catch (error) {
      console.error('Error getting stored devices:', error);
      return [];
    }
  }

  /**
   * Guarda dispositivo conectado
   * @param {Object} device - Información del dispositivo
   */
  static async saveConnectedDevice(device) {
    try {
      const devices = await this.getStoredDevices();
      
      // Verificar si el dispositivo ya existe
      const existingIndex = devices.findIndex(d => d.id === device.id);
      
      if (existingIndex >= 0) {
        devices[existingIndex] = device;
      } else {
        devices.push(device);
      }

      await AsyncStorage.setItem('connectedDevices', JSON.stringify(devices));
    } catch (error) {
      console.error('Error saving connected device:', error);
    }
  }

  /**
   * Obtiene dispositivo por ID
   * @param {string} deviceId - ID del dispositivo
   */
  static async getDeviceById(deviceId) {
    try {
      const devices = await this.getStoredDevices();
      return devices.find(d => d.id === deviceId) || null;
    } catch (error) {
      console.error('Error getting device by ID:', error);
      return null;
    }
  }

  /**
   * Actualiza información del dispositivo
   * @param {Object} device - Información actualizada del dispositivo
   */
  static async updateDeviceInfo(device) {
    try {
      const devices = await this.getStoredDevices();
      const index = devices.findIndex(d => d.id === device.id);
      
      if (index >= 0) {
        devices[index] = device;
        await AsyncStorage.setItem('connectedDevices', JSON.stringify(devices));
      }
    } catch (error) {
      console.error('Error updating device info:', error);
    }
  }

  /**
   * Guarda datos del dispositivo
   * @param {string} deviceId - ID del dispositivo
   * @param {Object} data - Datos a guardar
   */
  static async saveDeviceData(deviceId, data) {
    try {
      const key = `deviceData_${deviceId}`;
      const existingData = await AsyncStorage.getItem(key);
      const dataHistory = existingData ? JSON.parse(existingData) : [];
      
      dataHistory.unshift({
        ...data,
        timestamp: new Date().toISOString(),
      });

      // Mantener solo los últimos 100 registros
      if (dataHistory.length > 100) {
        dataHistory.splice(100);
      }

      await AsyncStorage.setItem(key, JSON.stringify(dataHistory));
    } catch (error) {
      console.error('Error saving device data:', error);
    }
  }

  /**
   * Registra comando del dispositivo
   * @param {string} deviceId - ID del dispositivo
   * @param {string} command - Comando ejecutado
   * @param {Object} parameters - Parámetros del comando
   * @param {Object} result - Resultado del comando
   */
  static async logDeviceCommand(deviceId, command, parameters, result) {
    try {
      const key = `deviceCommands_${deviceId}`;
      const existingCommands = await AsyncStorage.getItem(key);
      const commandHistory = existingCommands ? JSON.parse(existingCommands) : [];
      
      commandHistory.unshift({
        command,
        parameters,
        result,
        timestamp: new Date().toISOString(),
      });

      // Mantener solo los últimos 50 comandos
      if (commandHistory.length > 50) {
        commandHistory.splice(50);
      }

      await AsyncStorage.setItem(key, JSON.stringify(commandHistory));
    } catch (error) {
      console.error('Error logging device command:', error);
    }
  }

  /**
   * Limpia datos del dispositivo
   * @param {string} deviceId - ID del dispositivo
   */
  static async clearDeviceData(deviceId) {
    try {
      const keysToRemove = [
        `deviceData_${deviceId}`,
        `deviceCommands_${deviceId}`,
        `deviceConfig_${deviceId}`,
      ];
      
      await AsyncStorage.multiRemove(keysToRemove);
    } catch (error) {
      console.error('Error clearing device data:', error);
    }
  }

  /**
   * Verifica conectividad
   */
  static async checkConnectivity() {
    try {
      // Simulación de verificación de conectividad
      return {
        wifi: true,
        bluetooth: true,
        internet: true,
      };
    } catch (error) {
      console.error('Error checking connectivity:', error);
      return {
        wifi: false,
        bluetooth: false,
        internet: false,
      };
    }
  }

  /**
   * Inicializa protocolos de comunicación
   */
  static async initializeProtocols() {
    try {
      // Simulación de inicialización de protocolos
      console.log('Initializing communication protocols...');
      return { success: true };
    } catch (error) {
      console.error('Error initializing protocols:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Inicializa comunicación con dispositivo
   * @param {Object} device - Información del dispositivo
   */
  static async initializeDeviceCommunication(device) {
    try {
      // Simulación de inicialización de comunicación
      console.log(`Initializing communication with ${device.name}...`);
      return { success: true };
    } catch (error) {
      console.error('Error initializing device communication:', error);
      return { success: false, error: error.message };
    }
  }
}

