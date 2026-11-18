import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';

import { CameraController } from '../camera/CameraController';
import { HDRIEnvironment } from '../environment/EnvironmentHdri';
import { ShowroomLighting } from '../lighting/ShowroomLighting';
import { VehicleManager } from '../vehicles/VehicleManager';
import type { VehicleData } from '../vehicles/VehicleData';
import type { Vehicle } from '../vehicles/Vehicle';

export class VehicleViewerEngine {
    private readonly scene: THREE.Scene;
    private readonly camera: THREE.PerspectiveCamera;
    private readonly renderer: WebGPURenderer;
    private readonly container: HTMLElement;
    private readonly resizeObserver: ResizeObserver;
    private readonly lighting: ShowroomLighting;
    private readonly hdriEnvironment: HDRIEnvironment;
    private readonly vehicleManager: VehicleManager;
    private readonly cameraController: CameraController;
    private vehicle: Vehicle | null = null;
    private frame: { target: THREE.Vector3; distance: number } | null = null;
    private angle = 0;
    private previousPointerX = 0;
    private isDragging = false;
    private isRunning = false;
    private isDisposed = false;

    private readonly onPointerDownBound = this.onPointerDown.bind(this);
    private readonly onPointerMoveBound = this.onPointerMove.bind(this);
    private readonly onPointerUpBound = this.onPointerUp.bind(this);

    constructor(container: HTMLElement) {
        this.container = container;
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf6f6f6);
        this.camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000);
        this.renderer = new WebGPURenderer({ antialias: true, alpha: false });
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        if ('shadowMap' in this.renderer) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }

        this.renderer.domElement.style.display = 'block';
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.renderer.domElement.style.touchAction = 'none';
        this.renderer.domElement.style.cursor = 'grab';
        this.container.appendChild(this.renderer.domElement);

        this.lighting = new ShowroomLighting(this.scene);
        this.hdriEnvironment = new HDRIEnvironment(this.renderer, this.scene);
        this.vehicleManager = new VehicleManager(this.scene);
        this.cameraController = new CameraController(this.camera);

        this.renderer.domElement.addEventListener('pointerdown', this.onPointerDownBound);
        this.renderer.domElement.addEventListener('pointermove', this.onPointerMoveBound);
        this.renderer.domElement.addEventListener('pointerup', this.onPointerUpBound);
        this.renderer.domElement.addEventListener('pointercancel', this.onPointerUpBound);

        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(this.container);
        this.resize();
    }

    public async loadVehicle(data: VehicleData): Promise<void> {
        if (!this.renderer.hasInitialized()) {
            await this.renderer.init();
        }
        if (this.isDisposed) return;

        await this.hdriEnvironment.load('/textures/studio/fondo2.exr').catch((error) => {
            console.error('Error cargando el HDRI:', error);
        });
        if (this.isDisposed) return;

        this.vehicle = await this.vehicleManager.load3DForData(data);
        if (this.isDisposed) {
            this.vehicleManager.unloadActive3D();
            return;
        }

        this.updateCameraFrame();
        this.start();
    }

    private updateCameraFrame(): void {
        if (!this.vehicle) return;
        this.frame = this.cameraController.fitToVehicle(
            this.vehicle,
            this.camera.aspect,
            this.angle
        );
    }

    private resize(): void {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        if (width === 0 || height === 0) return;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.updateCameraFrame();
    }

    private onPointerDown(event: PointerEvent): void {
        if (event.button !== 0) return;
        this.isDragging = true;
        this.previousPointerX = event.clientX;
        this.renderer.domElement.style.cursor = 'grabbing';
        this.renderer.domElement.setPointerCapture(event.pointerId);
    }

    private onPointerMove(event: PointerEvent): void {
        if (!this.isDragging || !this.frame) return;

        const deltaX = event.clientX - this.previousPointerX;
        this.previousPointerX = event.clientX;
        this.angle += deltaX * 0.006;
        this.cameraController.orbitAroundPoint(this.frame.target, this.angle, this.frame.distance);
    }

    private onPointerUp(): void {
        this.isDragging = false;
        this.renderer.domElement.style.cursor = 'grab';
    }

    private start(): void {
        if (this.isRunning || this.isDisposed) return;
        this.isRunning = true;
        this.renderer.setAnimationLoop(() => this.renderer.render(this.scene, this.camera));
    }

    public dispose(): void {
        if (this.isDisposed) return;
        this.isDisposed = true;
        this.isRunning = false;
        this.renderer.setAnimationLoop(null);
        this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDownBound);
        this.renderer.domElement.removeEventListener('pointermove', this.onPointerMoveBound);
        this.renderer.domElement.removeEventListener('pointerup', this.onPointerUpBound);
        this.renderer.domElement.removeEventListener('pointercancel', this.onPointerUpBound);
        this.resizeObserver.disconnect();
        this.vehicleManager.dispose();
        this.lighting.dispose();
        this.hdriEnvironment.dispose();
        this.scene.clear();
        this.renderer.dispose();

        if (this.renderer.domElement.parentElement === this.container) {
            this.container.removeChild(this.renderer.domElement);
        }
    }
}
