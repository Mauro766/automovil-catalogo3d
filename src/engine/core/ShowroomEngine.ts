import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';

import { ShowroomEnvironment } from '../environment/ShowroomEnvironment';
import { ShowroomLighting } from '../lighting/ShowroomLighting';
import { HDRIEnvironment } from '../environment/EnvironmentHdri';

import { CameraController } from '../camera/CameraController';
import { DragExperience } from '../experience/ScrollExperience';
import { VehicleSelector } from '../experience/VehicleSelector';
import { LiquidLoadingScreen } from '../experience/LiquidLoadingScreen';

import { VehicleManager } from '../vehicles/VehicleManager';
import type { VehicleData } from '../vehicles/VehicleData';

export class ShowroomEngine {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: WebGPURenderer;
    private container: HTMLElement;
    private resizeObserver: ResizeObserver;

    private environment: ShowroomEnvironment;
    private lighting: ShowroomLighting;
    private hdriEnvironment: HDRIEnvironment;

    private vehicleManager: VehicleManager;

    private cameraController: CameraController | null = null;
    private dragExperience: DragExperience | null = null;
    private vehicleSelector: VehicleSelector | null = null;

    private loadingScreen: LiquidLoadingScreen | null = null;

    private isRunning = false;
    private isRevealed = false;

    private onVehicleChange: ((index: number) => void) | null = null;
    private onVehicleSelected: ((id: string) => void) | null = null;

    constructor(
        container: HTMLElement,
        vehicles: readonly VehicleData[]
    ) {
        this.container = container;

        // Escena principal.
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf6f6f6);

        // Cámara principal.
        this.camera = new THREE.PerspectiveCamera(
            55,
            1,
            0.1,
            1000
        );

        this.camera.position.set(0, 1.4, 0);
        this.camera.lookAt(5.8, 1.4, 0);

        // Renderer WebGPU.
        this.renderer = new WebGPURenderer({
            antialias: true,
            alpha: false,
        });

        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.renderer.setPixelRatio(
            Math.min(window.devicePixelRatio, 2)
        );
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Necesario para renderizar dos escenas en el mismo frame.
        this.renderer.autoClear = false;

        this.renderer.domElement.style.display = 'block';
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.renderer.domElement.style.touchAction = 'none';

        this.container.appendChild(this.renderer.domElement);

        // Resize observer.
        this.resizeObserver = new ResizeObserver(() => {
            this.resize();
        });

        this.resizeObserver.observe(this.container);

        // Entorno.
        this.environment = new ShowroomEnvironment(this.scene);

        // Iluminación.
        this.lighting = new ShowroomLighting(this.scene);

        // HDRI.
        this.hdriEnvironment = new HDRIEnvironment(
            this.renderer,
            this.scene
        );

        // Vehículos.
        this.vehicleManager = new VehicleManager(
            this.scene,
            vehicles
        );

        // Loader independiente.
        this.loadingScreen = new LiquidLoadingScreen();

        this.resize();
    }

    public async initRenderer(): Promise<void> {
        await this.renderer.init();
    }

    public async initEnvironment(): Promise<void> {
        await this.hdriEnvironment.load(
            '/textures/studio/fondo8.ktx2'
        );
    }

    public async initVehicles(): Promise<void> {
        await this.vehicleManager.loadAll2D();
    }

    public setOnVehicleChange(
        callback: (index: number) => void
    ): void {
        this.onVehicleChange = callback;
    }

    public setOnVehicleSelected(
        callback: (id: string) => void
    ): void {
        this.onVehicleSelected = callback;
    }

    public startExperience(): void {
        const cards = this.vehicleManager.getCards();

        if (cards.length === 0) {
            console.error(
                'No hay vehículos 2D cargados para iniciar la experiencia.'
            );
            return;
        }

        this.dragExperience?.dispose();
        this.vehicleSelector?.dispose();

        this.cameraController = new CameraController(this.camera);

        this.vehicleSelector = new VehicleSelector(
            this.camera,
            this.renderer.domElement,
            cards
        );

        this.dragExperience = new DragExperience(
            this.camera,
            this.cameraController,
            this.vehicleManager,
            this.vehicleSelector
        );

        if (this.onVehicleChange) {
            this.dragExperience.setOnVehicleChange(
                this.onVehicleChange
            );
        }

        if (this.onVehicleSelected) {
            this.dragExperience.setOnVehicleSelected(
                this.onVehicleSelected
            );
        }

        this.dragExperience.start();
    }

    private resize(): void {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        if (width === 0 || height === 0) return;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }

    public async revealLoadingScreen(): Promise<void> {
        if (!this.loadingScreen || this.isRevealed) return;

        this.isRevealed = true;
        await this.loadingScreen.reveal();

        this.loadingScreen.dispose();
        this.loadingScreen = null;
    }

    public start(): void {
        if (this.isRunning) return;

        this.isRunning = true;

        this.renderer.setAnimationLoop(() => {
            this.render();
        });
    }

    public stop(): void {
        if (!this.isRunning) return;

        this.isRunning = false;
        this.renderer.setAnimationLoop(null);
    }

    private render(): void {
        // Limpiar una sola vez.
        this.renderer.clear();

        // Renderizar showroom.
        this.renderer.render(this.scene, this.camera);

        // Renderizar loader por encima del showroom mientras exista.
        this.loadingScreen?.render(this.renderer);
    }

    public getScene(): THREE.Scene {
        return this.scene;
    }

    public getCamera(): THREE.PerspectiveCamera {
        return this.camera;
    }

    public dispose(): void {
        this.stop();

        this.dragExperience?.dispose();
        this.dragExperience = null;

        this.vehicleSelector?.dispose();
        this.vehicleSelector = null;

        this.vehicleManager.dispose();

        this.resizeObserver.disconnect();

        this.environment.dispose();
        this.lighting.dispose();
        this.hdriEnvironment.dispose();

        this.loadingScreen?.dispose();
        this.loadingScreen = null;

        this.scene.clear();

        this.renderer.dispose();

        if (this.renderer.domElement.parentElement === this.container) {
            this.container.removeChild(this.renderer.domElement);
        }
    }
}
