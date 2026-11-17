
import * as THREE from 'three';

export class ShowroomEnvironment {
    constructor(_scene: THREE.Scene) {
        // Entorno limpio sin planos geométricos que generen cortes visuales
    }

    public dispose(): void {
        // Sin mallas que liberar
    }
}
