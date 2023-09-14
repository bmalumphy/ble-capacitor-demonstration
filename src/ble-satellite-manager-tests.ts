// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

import { BleSatelliteManagerService } from './app/ble-satellite-manager/ble-satellite-manager.service';
import { BleClient, ScanResult } from '@capacitor-community/bluetooth-le';
import { ToastController } from '@ionic/angular';

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);

describe('BleSatelliteManagerService', () => {
  let service: BleSatelliteManagerService;
  let toastControllerSpy: jasmine.SpyObj<ToastController>;

  beforeEach(() => {
    toastControllerSpy = jasmine.createSpyObj('ToastController', ['create', 'present']);

    TestBed.configureTestingModule({
      providers: [
        { provide: ToastController, useValue: toastControllerSpy },
      ],
    });

    service = TestBed.inject(BleSatelliteManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('scanForBluetoothDevices', () => {
    it('should scan for Bluetooth devices and stop after 5 seconds', async () => {
      spyOn(BleClient, 'initialize').and.returnValue(Promise.resolve());
      spyOn(BleClient, 'requestLEScan').and.callFake(async (_, callback) => {
        callback({ device: { deviceId: 'device1' } } as ScanResult);
      });
      spyOn(BleClient, 'stopLEScan').and.returnValue(Promise.resolve());

      await service.scanForBluetoothDevices();

      expect(BleClient.initialize).toHaveBeenCalled();
      expect(BleClient.requestLEScan).toHaveBeenCalled();
    });

    it('should handle errors during scanning', async () => {
      spyOn(BleClient, 'initialize').and.returnValue(Promise.resolve());
      spyOn(BleClient, 'requestLEScan').and.throwError('Scan error');
      spyOn(BleClient, 'stopLEScan').and.returnValue(Promise.resolve());

      await service.scanForBluetoothDevices();

      expect(BleClient.initialize).toHaveBeenCalled();
      expect(BleClient.requestLEScan).toHaveBeenCalled();
    });
  });

  describe('connectToBluetoothDevice', () => {
    it('should connect to a Bluetooth device', async () => {
      const scanResult: ScanResult = {
        device: { deviceId: 'device1', name: 'Device 1' },
        rssi: -50,
      };
      spyOn(BleClient, 'connect').and.returnValue(Promise.resolve());
      spyOn(service, 'presentToast');

      await service.connectToBluetoothDevice(scanResult);

      expect(BleClient.connect).toHaveBeenCalledWith(
        'device1',
        jasmine.any(Function)
      );
      expect(service.bluetoothConnectedDevice).toEqual(scanResult);
      expect(service.isBleConnectedSubject.value).toBeTrue();
      expect(service.presentToast).toHaveBeenCalledWith('connected to device Device 1');
    });

    it('should handle errors during connection', async () => {
      const scanResult: ScanResult = {
        device: { deviceId: 'device1', name: 'Device 1' },
        rssi: -50,
      };
      spyOn(BleClient, 'connect').and.throwError('Connection error');
      spyOn(service, 'presentToast');

      await service.connectToBluetoothDevice(scanResult);

      expect(BleClient.connect).toHaveBeenCalledWith(
        'device1',
        jasmine.any(Function)
      );
      expect(service.bluetoothConnectedDevice).toBeUndefined();
      expect(service.isBleConnectedSubject.value).toBeFalse();
      expect(service.presentToast).toHaveBeenCalled();
    });
  });
});
