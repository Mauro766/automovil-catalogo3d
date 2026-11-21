import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';
import { MeshBasicNodeMaterial } from 'three/webgpu';
import {
    Fn,
    abs,
    float,
    mix,
    sin,
    smoothstep,
    time,
    uniform,
    uv,
    vec3,
} from 'three/tsl';
import gsap from 'gsap';

export class LiquidLoadingScreen {
    private readonly scene: THREE.Scene;
    private readonly camera: THREE.OrthographicCamera;
    private readonly mesh: THREE.Mesh;
    private readonly material: MeshBasicNodeMaterial;

    private readonly progress = uniform(0);

    private isRevealing = false;
    private isDisposed = false;

    constructor() {
        // Escena independiente del showroom.
        this.scene = new THREE.Scene();

        // Cámara ortográfica: no depende de perspectiva ni distancia.
        this.camera = new THREE.OrthographicCamera(
            -1, 1, 1, -1, 0.1, 10
        );

        this.camera.position.z = 1;

        this.material = new MeshBasicNodeMaterial({
            transparent: true,
            depthTest: false,
            depthWrite: false,
            side: THREE.DoubleSide,
        });

        this.material.colorNode = Fn(() => {
            const p = this.progress;
            const coordinate = uv();

            const wave1 = sin(
                coordinate.x.mul(float(7)).add(time.mul(float(1.2)))
            ).mul(float(0.035));

            const wave2 = sin(
                coordinate.x.mul(float(15)).sub(time.mul(float(0.8)))
            ).mul(float(0.018));

            const edge = mix(
                float(-0.15),
                float(1.15),
                p
            ).add(wave1.add(wave2).mul(
                sin(p.mul(float(Math.PI)))
            ));

            const edgeDistance = abs(coordinate.y.sub(edge));

            const glow = float(1).sub(
                smoothstep(float(0), float(0.025), edgeDistance)
            );

            return mix(
                vec3(0, 0, 0),
                vec3(0.12, 0.12, 0.12),
                glow.mul(float(0.25))
            );
        })();

        this.material.opacityNode = Fn(() => {
            const p = this.progress;
            const coordinate = uv();

            const wave1 = sin(
                coordinate.x.mul(float(7)).add(time.mul(float(1.2)))
            ).mul(float(0.035));

            const wave2 = sin(
                coordinate.x.mul(float(15)).sub(time.mul(float(0.8)))
            ).mul(float(0.018));

            const edge = mix(
                float(-0.15),
                float(1.15),
                p
            ).add(wave1.add(wave2).mul(
                sin(p.mul(float(Math.PI)))
            ));

            return smoothstep(
                edge.sub(float(0.008)),
                edge.add(float(0.008)),
                coordinate.y
            );
        })();

        const geometry = new THREE.PlaneGeometry(2, 2);

        this.mesh = new THREE.Mesh(geometry, this.material);
        this.mesh.position.z = 0;
        this.mesh.frustumCulled = false;
        this.mesh.renderOrder = 9999;

        this.scene.add(this.mesh);
    }

    public render(renderer: WebGPURenderer): void {
        if (this.isDisposed) return;

        renderer.render(this.scene, this.camera);
    }

    /**
     * Sube el líquido revelando la escena (de pantalla negra a transparente).
     */
    public reveal(): Promise<void> {
        if (this.isRevealing || this.isDisposed) {
            return Promise.resolve();
        }

        this.isRevealing = true;

        return new Promise((resolve) => {
            gsap.to(this.progress, {
                value: 1,
                duration: 1.8,
                ease: 'power2.inOut',
                overwrite: 'auto',
                onComplete: () => {
                    this.mesh.visible = false;
                    resolve();
                },
            });
        });
    }

    /**
     * Baja el líquido cubriendo la escena (de transparente a pantalla negra).
     */
    public cover(): Promise<void> {
        if (this.isDisposed) {
            return Promise.resolve();
        }

        gsap.killTweensOf(this.progress);
        this.mesh.visible = true;
        this.progress.value = 1;
        this.isRevealing = false;

        return new Promise((resolve) => {
            gsap.to(this.progress, {
                value: 0,
                duration: 1.2,
                ease: 'power2.inOut',
                overwrite: 'auto',
                onComplete: () => {
                    resolve();
                },
            });
        });
    }

    public reset(): void {
        if (this.isDisposed) return;

        gsap.killTweensOf(this.progress);

        this.progress.value = 0;
        this.isRevealing = false;
        this.mesh.visible = true;
    }

    public dispose(): void {
        if (this.isDisposed) return;

        this.isDisposed = true;

        gsap.killTweensOf(this.progress);

        this.mesh.geometry.dispose();
        this.material.dispose();
        this.scene.clear();
    }
}
