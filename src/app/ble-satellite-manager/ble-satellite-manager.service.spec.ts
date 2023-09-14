import { TestBed } from '@angular/core/testing';

import { BleSatelliteManagerService } from './ble-satellite-manager.service';

describe('BleSatelliteManagerService', () => {
  let service: BleSatelliteManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BleSatelliteManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
