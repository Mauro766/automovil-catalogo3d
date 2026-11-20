
import * as THREE from 'three';
import {
    CubeRenderTarget,
    PMREMGenerator,
    WebGPURenderer,
} from 'three/webgpu';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';

export class HDRIEnvironment {
    private loader: KTX2Loader;
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

        this.loader = new KTX2Loader();

        this.loader.setTranscoderPath(
            'https://cdn.jsdelivr.net/npm/three@0.187.0/examples/jsm/libs/basis/'
        );

        this.pmremGenerator = new PMREMGenerator(renderer);
    }

    public async load(path: string): Promise<void> {
        if (
            this.renderer instanceof WebGPURenderer &&
            !this.renderer.hasInitialized()
        ) {
            await this.renderer.init();
        }

        this.loader.detectSupport(this.renderer);

        const texture = await this.loader.loadAsync(path);

        try {
            this.pmremGenerator.compileEquirectangularShader();

            const renderTarget =
                this.pmremGenerator.fromEquirectangular(texture);

            this.environmentRenderTarget?.dispose();

            this.environmentRenderTarget = renderTarget;

            this.scene.environment = renderTarget.texture;
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
        this.loader.dispose();
    }
}
