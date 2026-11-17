
import * as THREE from 'three';

export class ShowroomLighting {
  private scene: THREE.Scene;
  private lights: THREE.Light[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.createLighting();
  }

  private createLighting(): void {
    // Iluminación completamente uniforme en 360° (evita que un lado esté oscuro o con sombras desiguales)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xf4f4f4, 0.8);

    // Luz cenital suave de apoyo general
    const topLight = new THREE.DirectionalLight(0xffffff, 0.5);
    topLight.position.set(0, 15, 0);

    this.lights = [ambientLight, hemisphereLight, topLight];

    this.lights.forEach((light) => {
      this.scene.add(light);
    });
  }

  public dispose(): void {
    this.lights.forEach((light) => {
      this.scene.remove(light);
    });

    this.lights = [];
  }
}
