import { VEHICLES_DATA } from './vehicles';
import type { VehicleData } from './VehicleData';

export interface VehicleRepository {
    getAll(): Promise<readonly VehicleData[]>;
}

class LocalVehicleRepository implements VehicleRepository {
    public async getAll(): Promise<readonly VehicleData[]> {
        return VEHICLES_DATA;
    }
}

export const vehicleRepository: VehicleRepository = new LocalVehicleRepository();
