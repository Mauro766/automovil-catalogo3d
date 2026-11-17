
import * as THREE from 'three';
import { CubeRenderTarget, PMREMGenerator, WebGPURenderer } from 'three/webgpu';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';

export class HDRIEnvironment {
    private loader: EXRLoader;
    private renderer: WebGPURenderer;
    private pmremGenerator: PMREMGenerator;
    private environmentRenderTarget: CubeRenderTarget | null = null;
    private scene: THREE.Scene;

    constructor(
        renderer: WebGPURenderer,
        scene: THREE.Scene
    ) {
        this.scene = scene;
        this.renderer = renderer;
        this.loader = new EXRLoader();
        this.pmremGenerator = new PMREMGenerator(renderer);
    }

    public async load(path: string): Promise<void> {
        const texture = await this.loader.loadAsync(path);

        try {
            if (this.renderer instanceof WebGPURenderer && !this.renderer.hasInitialized()) {
                await this.renderer.init();
            }

            await this.pmremGenerator.compileEquirectangularShader();
            this.environmentRenderTarget =
                this.pmremGenerator.fromEquirectangular(texture);

            // El HDRI alimenta los reflejos metálicos y de carrocería (IBL)
            this.scene.environment =
                this.environmentRenderTarget.texture;
            this.scene.environmentIntensity = 1.0;
        } finally {
            texture.dispose();
        }
    }

    public dispose(): void {
        this.scene.environment = null;
        this.scene.background = null;

        this.environmentRenderTarget?.dispose();
        this.environmentRenderTarget = null;

        this.pmremGenerator.dispose();
    }
}
