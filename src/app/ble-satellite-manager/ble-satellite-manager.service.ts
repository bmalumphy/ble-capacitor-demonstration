import { Injectable } from '@angular/core';
import { BleClient, numberToUUID, numbersToDataView, ScanResult } from '@capacitor-community/bluetooth-le';
import { ToastController } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BleSatelliteManagerService {

  bluetoothScanResults: ScanResult[] = [];

  bluetoothConnectedDevice?: ScanResult;

  LIGHT_BLUE_SERVICE_UUID = numberToUUID(0x180D);
  LIGHT_BLUE_CHARACTERISTIC_UUID = "D28F3C34-534F-4C47-897A-D548E0A9AE32";

  isBleConnectedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isBleConnected: Observable<boolean> = this.isBleConnectedSubject.asObservable();

  private isBleScanningSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isBleScanning: Observable<boolean> = this.isBleScanningSubject.asObservable();

  constructor(public toastController: ToastController) {}

  async scanForBluetoothDevices() {
    try {
      await BleClient.initialize({ androidNeverForLocation: true });

      this.bluetoothScanResults = [];
      this.isBleScanningSubject.next(true);

      await BleClient.requestLEScan(
        {
          services: [this.LIGHT_BLUE_SERVICE_UUID],
        },
        (result) => {
          console.log('Received new scan result');
          this.bluetoothScanResults.push(result);
          this.isBleScanningSubject.next(false);
        }
      );
  
      setTimeout(async () => {
        await BleClient.stopLEScan();
        console.log('Stopped scanning');
        this.isBleScanningSubject.next(false);
      }, 5000);
    } catch (error) {
      this.isBleScanningSubject.next(false);
      console.error(error);
    }
  }

  async connectToBluetoothDevice(scanResult: ScanResult) {
    const device = scanResult.device;

    try {
      await BleClient.connect(
        device.deviceId,
        this.onBluetooDeviceDisconnected.bind(this)
      );

      this.bluetoothConnectedDevice = scanResult;

      const deviceName = device.name ?? device.deviceId;
      this.isBleConnectedSubject.next(true);
      this.presentToast(`connected to device ${deviceName}`);
    } catch (error) {
      console.error('connectToDevice', error);
      this.presentToast(JSON.stringify(error));
    }
  }

  async disconnectFromBluetoothDevice(scanResult: ScanResult) {
    const device = scanResult.device;
    try {
      await BleClient.disconnect(scanResult.device.deviceId);
      const deviceName = device.name ?? device.deviceId;
      this.bluetoothConnectedDevice = undefined;
      this.isBleConnectedSubject.next(false);
      this.presentToast(`disconnected from device ${deviceName}`);
    } catch (error) {
      console.error('disconnectFromDevice', error);
    }
  }

  async onBluetooDeviceDisconnected(disconnectedDeviceId: string) {
    this.bluetoothConnectedDevice = undefined;
    this.isBleConnectedSubject.next(false);
    this.presentToast(`Diconnected from device with id: ${disconnectedDeviceId}`);
  }

  async sendBluetoothWriteCommand(command: number[]) {
    if (!this.bluetoothConnectedDevice) {
      this.presentToast('Bluetooth device not connected');
      return;
    }

    try {
      await BleClient.write(
        this.bluetoothConnectedDevice.device.deviceId,
        this.LIGHT_BLUE_SERVICE_UUID,
        this.LIGHT_BLUE_CHARACTERISTIC_UUID,
        numbersToDataView(command)
      );
      this.presentToast('command sent');
    } catch (error) {
      console.log(`error: ${JSON.stringify(error)}`);
      this.presentToast(JSON.stringify(error));
    }
  }

  async sendBluetoothReadCommand() {
    if (!this.bluetoothConnectedDevice) {
      this.presentToast('Bluetooth device not connected');
      return;
    }
    const device = this.bluetoothConnectedDevice.device;

    const heartRate = (await BleClient.read(
      device.deviceId,
      this.LIGHT_BLUE_SERVICE_UUID,
      this.LIGHT_BLUE_CHARACTERISTIC_UUID
    )).getUint16(0, true).toString();

    this.presentToast(heartRate);
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 1700,
    });
    toast.present();
  }
}
