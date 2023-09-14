import { ChangeDetectorRef, Component } from '@angular/core';
import { BleSatelliteManagerService } from '../ble-satellite-manager/ble-satellite-manager.service';
import { ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class HomePage {

  public isConnected: boolean = false;
  public bluetoothIsScanning: boolean = false;
  public hasBleSatellites: boolean = false;

  constructor(public bleSatelliteManagerService: BleSatelliteManagerService, private cdRef: ChangeDetectorRef) {}
  
  ngOnInit() {
    this.bleSatelliteManagerService.isBleConnected.subscribe(isConnected => {
      this.isConnected = isConnected;
      this.cdRef.detectChanges();
    })

    this.bleSatelliteManagerService.isBleScanning.subscribe(isScanning => {
      this.bluetoothIsScanning = isScanning;
      this.cdRef.detectChanges();
    })
  }
}
