import * as THREE from 'three';
import { Vehicle } from './Vehicle';
import { VehicleCard2D } from './VehicleCard2D';
import { VEHICLES_DATA } from './VehicleData';
import type { VehicleData } from './VehicleData';

export class VehicleManager {
    private scene: THREE.Scene;
    private textureLoader: THREE.TextureLoader;
    private cards: VehicleCard2D[] = [];
    private active3DVehicle: Vehicle | null = null;
    private activeData: VehicleData | null = null;
    private radius = 5.8; // Autos más cerca de la cámara central (antes 8.5)

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.textureLoader = new THREE.TextureLoader();
    }

    // Carga los 5 planos 2D a partir de las imágenes PNG optimizadas
    public async loadAll2D(): Promise<void> {
        const total = VEHICLES_DATA.length;

        for (let i = 0; i < total; i++) {
            const data = VEHICLES_DATA[i];
            const card = new VehicleCard2D(data);
            await card.load(this.textureLoader, i);

            const group = card.getGroup();

            // Distribuir circularmente exactamente como los vehículos originales
            const angle = (i / total) * Math.PI * 2;
            const x = Math.sin(angle) * this.radius;
            const z = Math.cos(angle) * this.radius;

            group.position.set(x, 0, z);
            // Orientar el plano hacia el centro del showroom (0, y, 0)
            group.lookAt(0, 0, 0);

            this.scene.add(group);
            this.cards.push(card);
        }
    }

    public getCards(): VehicleCard2D[] {
        return this.cards;
    }

    public getActive3DVehicle(): Vehicle | null {
        return this.active3DVehicle;
    }

    // Carga bajo demanda del modelo 3D GLB solo para el auto seleccionado
    public async load3DForCard(card: VehicleCard2D): Promise<Vehicle> {
        return this.load3D(card.getData(), card);
    }

    public async load3DForData(data: VehicleData): Promise<Vehicle> {
        return this.load3D(data);
    }

    private async load3D(data: VehicleData, card?: VehicleCard2D): Promise<Vehicle> {
        // Si ya hay un modelo 3D activo para este mismo auto, reutilizarlo
        if (this.active3DVehicle && this.activeData?.id === data.id) {
            this.active3DVehicle.setVisible(true);
            return this.active3DVehicle;
        }

        // Liberar cualquier otro modelo 3D previo para ahorrar memoria
        this.unloadActive3D();

        const vehicle = new Vehicle();
        const model = await vehicle.load(data.modelPath);

        if (card) {
            // Ubicar el modelo 3D exactamente en la posición y orientación de la tarjeta 2D
            const cardPos = card.getWorldPosition();
            model.position.set(cardPos.x, 0, cardPos.z);
            model.lookAt(0, 0, 0);
        }

        this.scene.add(model);
        this.active3DVehicle = vehicle;
        this.activeData = data;

        return vehicle;
    }

    // Oculta todas las cartas 2D excepto la seleccionada (o todas si se pasa false)
    public setCardsVisibility(visible: boolean, exceptCard?: VehicleCard2D): void {
        this.cards.forEach((c) => {
            if (exceptCard && c === exceptCard) {
                c.setVisible(true);
            } else {
                c.setVisible(visible);
            }
        });
    }

    // Liberar memoria del modelo GLB cuando volvemos a la vista 2D general
    public unloadActive3D(): void {
        if (!this.active3DVehicle) return;

        const model = this.active3DVehicle.getModel();
        if (model) {
            this.scene.remove(model);
            model.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.geometry.dispose();
                    if (Array.isArray(child.material)) {
                        child.material.forEach((m) => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        }

        this.active3DVehicle = null;
        this.activeData = null;
    }

    public dispose(): void {
        this.unloadActive3D();
        this.cards.forEach((c) => {
            this.scene.remove(c.getGroup());
            c.dispose();
        });
        this.cards = [];
    }
}
