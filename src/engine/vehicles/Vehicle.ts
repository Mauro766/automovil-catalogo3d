
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class Vehicle {
    private loader: GLTFLoader;
    private model: THREE.Group | null = null;

    constructor() {
        this.loader = new GLTFLoader();
    }

    public async load(path: string): Promise<THREE.Group> {
        const gltf = await this.loader.loadAsync(path);

        this.model = gltf.scene;

        const box = new THREE.Box3().setFromObject(this.model);
        const center = box.getCenter(new THREE.Vector3());

        // Centrar horizontalmente y apoyar sobre el suelo
        this.model.position.x -= center.x;
        this.model.position.z -= center.z;
        this.model.position.y -= box.min.y;

        // Configurar sombras
        this.model.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });

        const finalBox = new THREE.Box3().setFromObject(this.model);
        const size = finalBox.getSize(new THREE.Vector3());

        console.log('Vehículo cargado:', {
            width: size.x,
            height: size.y,
            depth: size.z,
        });

        return this.model;
    }

    public getModel(): THREE.Group | null {
        return this.model;
    }

    // Obtener posición del vehículo en la escena
    public getWorldPosition(): THREE.Vector3 | null {
        if (!this.model) return null;

        this.model.updateWorldMatrix(true, false);

        return this.model.getWorldPosition(new THREE.Vector3());
    }

    // Obtener dimensiones del vehículo
    public getDimensions(): THREE.Vector3 | null {
        if (!this.model) return null;

        const box = new THREE.Box3().setFromObject(this.model);

        return box.getSize(new THREE.Vector3());
    }

    // Obtener el punto al que debe mirar la cámara
    public getFocusPoint(): THREE.Vector3 | null {
        const position = this.getWorldPosition();
        const dimensions = this.getDimensions();

        if (!position || !dimensions) return null;

        return position.add(
            new THREE.Vector3(0, dimensions.y * 0.45, 0)
        );
    }

    // Controlar visibilidad
    public setVisible(visible: boolean): void {
        if (!this.model) return;

        this.model.visible = visible;
    }
}
