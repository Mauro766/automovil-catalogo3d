
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

    public fitToVehicle(
        vehicle: Vehicle,
        aspect: number,
        angle: number,
        margin = 1.2
    ): { target: THREE.Vector3; distance: number } | null {
        const model = vehicle.getModel();
        if (!model || aspect <= 0) return null;

        model.updateWorldMatrix(true, true);
        const bounds = new THREE.Box3().setFromObject(model);
        if (bounds.isEmpty()) return null;

        const target = bounds.getCenter(new THREE.Vector3());
        const sphere = bounds.getBoundingSphere(new THREE.Sphere());
        const verticalFov = THREE.MathUtils.degToRad(this.camera.fov);
        const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * aspect);
        const limitingFov = Math.min(verticalFov, horizontalFov);
        const distance = Math.max(sphere.radius, 0.01) / Math.sin(limitingFov / 2) * margin;

        this.camera.near = Math.max(distance - sphere.radius * 2, 0.01);
        this.camera.far = distance + sphere.radius * 4;
        this.camera.updateProjectionMatrix();
        this.orbitAroundPoint(target, angle, distance);

        return { target, distance };
    }

    public orbitAroundPoint(
        target: THREE.Vector3,
        angle: number,
        distance: number,
        elevation = 0.14
    ): void {
        const horizontalDistance = Math.cos(elevation) * distance;
        this.camera.position.set(
            target.x + Math.sin(angle) * horizontalDistance,
            target.y + Math.sin(elevation) * distance,
            target.z + Math.cos(angle) * horizontalDistance
        );
        this.camera.lookAt(target);
    }
}
