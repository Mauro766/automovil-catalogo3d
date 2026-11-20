import * as THREE from 'three';
import { MeshBasicNodeMaterial } from 'three/webgpu';
import { Fn, float, length, sin, smoothstep, texture, time, uniform, uv, vec4 } from 'three/tsl';
import type { VehicleData } from './VehicleData';

export class VehicleCard2D {
    public data: VehicleData;
    private group: THREE.Group;
    private mesh: THREE.Mesh | null = null;
    private material: MeshBasicNodeMaterial | null = null;
    private texture: THREE.Texture | null = null;
    private hoverPosition = uniform(new THREE.Vector2(0.5, 0.5));
    private hoverStrength = uniform(0.0);
    private height = 2.4;
    private width = 2.4 * (16 / 9); // Proporción 1920x1080 (16:9)

    constructor(data: VehicleData) {
        this.data = data;
        this.group = new THREE.Group();
        this.group.name = `vehicle-card-${data.id}`;
    }

    public async load(textureLoader: THREE.TextureLoader, _index?: number): Promise<THREE.Group> {
        this.texture = await textureLoader.loadAsync(this.data.showroomImage.url);
        this.texture.colorSpace = THREE.SRGBColorSpace;
        this.texture.generateMipmaps = true;
        this.texture.minFilter = THREE.LinearMipmapLinearFilter;
        this.texture.magFilter = THREE.LinearFilter;

        const mapNode = texture(this.texture);

        const hoverEffect = Fn(() => {
            const coord = uv();
            const delta = coord.sub(this.hoverPosition);
            const dist = length(delta);

            const innerRadius = float(0.12);
            const outerRadius = float(0.28);
            const effectMask = float(1.0).sub(smoothstep(innerRadius, outerRadius, dist));

            const ripple = sin(dist.mul(52.0).sub(time.mul(2.2))).mul(0.5).add(0.5);
            const displacement = ripple.mul(effectMask).mul(this.hoverStrength.mul(0.028));
            const warpedUv = coord.add(delta.mul(displacement));
            const sampled = mapNode.sample(warpedUv);
            const glow = effectMask.mul(this.hoverStrength.mul(0.014));

            return vec4(sampled.rgb.add(glow), sampled.a);
        })();

        const material = new MeshBasicNodeMaterial({
            transparent: true,
            alphaTest: 0.01,
            side: THREE.DoubleSide,
            depthWrite: false,
        });

        material.colorNode = hoverEffect;
        material.transparent = true;
        this.material = material;

        const geometry = new THREE.PlaneGeometry(this.width, this.height);
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.name = `card-mesh-${this.data.id}`;
        this.mesh.position.y = this.height / 2;

        this.group.add(this.mesh);

        return this.group;
    }

    /*
    private createFloatingBadge(displayNumber: number): void {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Fondo cuadrado gris como en la imagen
        ctx.fillStyle = '#a6a6a6';
        ctx.fillRect(10, 10, 108, 108);

        // Número centrado en blanco
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 68px "JetBrains Mono", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(displayNumber.toString(), 64, 66);

        this.badgeTexture = new THREE.CanvasTexture(canvas);
        this.badgeTexture.colorSpace = THREE.SRGBColorSpace;

        const badgeGeo = new THREE.PlaneGeometry(0.35, 0.35);
        const badgeMat = new THREE.MeshBasicMaterial({
            map: this.badgeTexture,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
        });

        this.badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
        this.badgeMesh.name = `badge-${this.data.id}`;
        // Posicionado flotando arriba en la parte superior del auto
        this.badgeMesh.position.set(0, this.height + 0.35, 0.02);

        this.group.add(this.badgeMesh);
    }
    */

    public getGroup(): THREE.Group {
        return this.group;
    }

    public getMesh(): THREE.Mesh | null {
        return this.mesh;
    }

    public getData(): VehicleData {
        return this.data;
    }

    public getWorldPosition(): THREE.Vector3 {
        this.group.updateWorldMatrix(true, false);
        return this.group.getWorldPosition(new THREE.Vector3());
    }

    public getFocusPoint(): THREE.Vector3 {
        const pos = this.getWorldPosition();
        return pos.add(new THREE.Vector3(0, this.height * 0.45, 0));
    }

    public setVisible(visible: boolean): void {
        this.group.visible = visible;
    }

    public setHover(uv: THREE.Vector2 | null): void {
        if (!this.material) return;

        if (uv) {
            this.hoverPosition.value.copy(uv);
            this.hoverStrength.value = 1;
        } else {
            this.hoverStrength.value = 0;
        }
    }

    public dispose(): void {
        if (this.mesh) {
            this.mesh.geometry.dispose();
            if (Array.isArray(this.mesh.material)) {
                this.mesh.material.forEach((m) => m.dispose());
            } else {
                this.mesh.material.dispose();
            }
        }
        /*
        if (this.badgeMesh) {
            this.badgeMesh.geometry.dispose();
            if (Array.isArray(this.badgeMesh.material)) {
                this.badgeMesh.material.forEach((m) => m.dispose());
            } else {
                this.badgeMesh.material.dispose();
            }
        }
        this.badgeTexture?.dispose();
        */
        this.texture?.dispose();
    }
}
