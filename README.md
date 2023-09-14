# __Light Blue Implementation__

## Summary

BLE is a complicated and volatile protocol implementation on mobile. This repository is meant to demonstrate my proficiency in understanding how the ecosystem of BLE on Android + iOS works. We will use [This plugin for Capacitor](https://github.com/capacitor-community/bluetooth-le) for the Satellite Manager logic to speed up the process. While it doesn't implement modern Swift/Kotlin best practices, neither does it provide peripheral management nor reconnection management, it's sufficient for this demonstration. The devices that I posess do not have open ended APIs or GATT services for demonstration purposes, so I used [LightBlue for virtual BLE simulation](https://github.com/capacitor-community/bluetooth-le).

Note that for practical purposes related to the business associated with this project, I used Angular and Typescript for the front end. However, my experience is limited to around a year in these areas-which was some time ago-so be mindful that there may be some misses on perfect execution.

## Implementation Details

The `BLESatelliteManagerService` controls the state management of the BLE service layer. It'll keep track of state and execute actions managing current detected satellites, connection status, and notifications on when state changes (handled via Android Toasts for simplicity). This is also the service where Unit Testing was covered (with some help from Github CoPilot due to a lack of TS knowledge).

The service has five main functionalities:
1. Scanning for Satellites using a simulated device `GATT service-uuid` (180D) on `LightBlue`.
2. Connecting to a Satellite.
3. Disconnecting from a Satellite.
4. Perform a `Read` operation to a simulated Characteristic.
5. Similarly perform a `Write` operation to a simulated Characteristic.

The `HomePage` uses a UI similar to Go-Pro's demonstration of using this library. We use the `Observable` patterns (or `Pub-sub pattern`) to communicate state changes from the `BLESatelliteManagerService` to the `HomePage`.