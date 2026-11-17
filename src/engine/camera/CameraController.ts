
import * as THREE from 'three';
import { Vehicle } from '../vehicles/Vehicle';

export class CameraController {
    private camera: THREE.PerspectiveCamera;

    constructor(camera: THREE.PerspectiveCamera) {
        this.camera = camera;
    }

    // Posicionar la cámara en el centro del showroom mirando hacia un ángulo dado
    public setCenterPosition(height: number): void {
        this.camera.position.set(0, height, 0);
    }

    // Rotar la cámara sobre su propio eje vertical en el centro
    public lookAtAngle(angle: number, height: number): void {
        const lookDistance = 10;

        const lookX = Math.sin(angle) * lookDistance;
        const lookZ = Math.cos(angle) * lookDistance;

        this.camera.lookAt(lookX, height, lookZ);
    }

    // Posicionar la cámara para enfocar un vehículo
    public focusOnVehicle(
        vehicle: Vehicle,
        angle: number,
        distance: number
    ): void {
        const target = vehicle.getFocusPoint();

        if (!target) return;

        const height = 2.5;

        this.camera.position.set(
            target.x + Math.sin(angle) * distance,
            target.y + height,
            target.z + Math.cos(angle) * distance
        );

        this.camera.lookAt(target);
    }

    // Orbitar alrededor del vehículo
    public orbitAroundVehicle(
        vehicle: Vehicle,
        angle: number,
        distance: number,
        height: number
    ): void {
        const target = vehicle.getFocusPoint();

        if (!target) return;

        this.camera.position.set(
            target.x + Math.sin(angle) * distance,
            target.y + height,
            target.z + Math.cos(angle) * distance
        );

        this.camera.lookAt(target);
    }
}
