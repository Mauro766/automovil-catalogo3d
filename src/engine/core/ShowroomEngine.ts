import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';

import { ShowroomEnvironment } from '../environment/ShowroomEnvironment';
import { ShowroomLighting } from '../lighting/ShowroomLighting';
import { HDRIEnvironment } from '../environment/EnvironmentHdri';

import { CameraController } from '../camera/CameraController';
import { DragExperience } from '../experience/ScrollExperience';
import { VehicleSelector } from '../experience/VehicleSelector';
import { VehicleManager } from '../vehicles/VehicleManager';

export class ShowroomEngine {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer | WebGPURenderer;
    private container: HTMLElement;
    private resizeObserver: ResizeObserver;

    private environment: ShowroomEnvironment;
    private lighting: ShowroomLighting;
    private hdriEnvironment: HDRIEnvironment;

    private vehicleManager: VehicleManager;
    private cameraController: CameraController | null = null;
    private dragExperience: DragExperience | null = null;
    private vehicleSelector: VehicleSelector | null = null;

    private isRunning = false;

    private onVehicleChange: ((index: number) => void) | null = null;
    private onVehicleSelected: ((id: string) => void) | null = null;

    constructor(container: HTMLElement) {
        this.container = container;

        // Crear escena
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf6f6f6);

        // Crear cámara: posición central del showroom, mirando hacia los vehículos
        this.camera = new THREE.PerspectiveCamera(
            55,
            1,
            0.1,
            1000
        );

        // Posición inicial en el centro del showroom a altura de persona
        this.camera.position.set(0, 1.4, 0);
        this.camera.lookAt(5.8, 1.4, 0);

        // Crear renderer con WebGPU y fallback automático a WebGL2 cuando corresponda
        this.renderer = new WebGPURenderer({
            antialias: true,
            alpha: false,
        });

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

        this.container.appendChild(this.renderer.domElement);

        // Observar cambios de tamaño
        this.resizeObserver = new ResizeObserver(() => {
            this.resize();
        });

        this.resizeObserver.observe(this.container);

        // Crear entorno
        this.environment = new ShowroomEnvironment(this.scene);

        // Crear iluminación
        this.lighting = new ShowroomLighting(this.scene);

        // Crear HDRI
        this.hdriEnvironment = new HDRIEnvironment(
            this.renderer,
            this.scene
        );

        // Gestor de vehículos 2D y 3D bajo demanda
        this.vehicleManager = new VehicleManager(this.scene);

        this.resize();
    }

    public async initRenderer(): Promise<void> {
        const hasInitialized = 'hasInitialized' in this.renderer && typeof this.renderer.hasInitialized === 'function'
            ? this.renderer.hasInitialized()
            : false;

        if (this.renderer instanceof WebGPURenderer && !hasInitialized) {
            await this.renderer.init();
        }

      
    }

    // Inicializa la carga de los planos 2D optimizados
    public async initVehicles(): Promise<void> {
        await this.vehicleManager.loadAll2D();
    }

    //number vehicle
    public setOnVehicleChange(callback: (index: number) => void): void {
        this.onVehicleChange = callback;
    }

    public setOnVehicleSelected(callback: (id: string) => void): void {
        this.onVehicleSelected = callback;
    }

    // Iniciar experiencia controlada por cursor drag
    public startExperience(): void {
        const cards = this.vehicleManager.getCards();
        if (cards.length === 0) {
            console.error('No hay vehículos 2D cargados para iniciar la experiencia.');
            return;
        }

        // Evitar crear más de una experiencia
        this.dragExperience?.dispose();
        this.vehicleSelector?.dispose();

        this.cameraController = new CameraController(this.camera);

        // Crear selector de vehículos con Raycaster apuntando a los planos 2D
        this.vehicleSelector = new VehicleSelector(
            this.camera,
            this.renderer.domElement,
            cards
        );

        // Crear experiencia de arrastre con cursor
        this.dragExperience = new DragExperience(
    this.camera,
    this.cameraController,
    this.vehicleManager,
    this.vehicleSelector
);

if (this.onVehicleChange) {
    this.dragExperience.setOnVehicleChange(this.onVehicleChange);
}

if (this.onVehicleSelected) {
    this.dragExperience.setOnVehicleSelected(this.onVehicleSelected);
}

this.dragExperience.start();
    }

    // Actualizar dimensiones
    private resize(): void {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        if (width === 0 || height === 0) return;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }

    // Iniciar renderizado
    public start(): void {
        if (this.isRunning) return;

        this.isRunning = true;

        this.renderer.setAnimationLoop(() => {
            this.render();
        });
    }

    // Detener renderizado
    public stop(): void {
        if (!this.isRunning) return;

        this.isRunning = false;
        this.renderer.setAnimationLoop(null);
    }

    // Renderizar escena
    private render(): void {
        this.renderer.render(this.scene, this.camera);
    }

    public getScene(): THREE.Scene {
        return this.scene;
    }

    public getCamera(): THREE.PerspectiveCamera {
        return this.camera;
    }

    // Liberar recursos
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

        this.scene.clear();

        this.renderer.dispose();

        if (this.renderer.domElement.parentElement === this.container) {
            this.container.removeChild(this.renderer.domElement);
        }
    }
}
