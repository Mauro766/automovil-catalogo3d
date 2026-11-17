import * as THREE from 'three';
import gsap from 'gsap';

import { CameraController } from '../camera/CameraController';
import { Vehicle } from '../vehicles/Vehicle';
import { VehicleCard2D } from '../vehicles/VehicleCard2D';
import { VehicleManager } from '../vehicles/VehicleManager';
import { ExperienceStateManager } from './ExperienceState';
import { VehicleSelector } from './VehicleSelector';

// Altura de la cámara en el centro del showroom
const CENTER_HEIGHT = 1.4;

// Distancia de órbita alrededor del vehículo individual
const ORBIT_DISTANCE = 5.2;

// Altura de la cámara durante la órbita
const ORBIT_HEIGHT = 1.6;

// Duración de la transición de acercamiento en segundos
const TRANSITION_DURATION = 1.2;

export class DragExperience {
    private camera: THREE.PerspectiveCamera;
    private cameraController: CameraController;
    private vehicleManager: VehicleManager;
    private stateManager: ExperienceStateManager;
    private vehicleSelector: VehicleSelector;

    private transitionTween: gsap.core.Tween | null = null;
    private selectedVehicle: Vehicle | null = null;
    private selectedCard: VehicleCard2D | null = null;
    private backButton: HTMLButtonElement | null = null;

    // Estado del cursor drag
    private isDragging = false;
    private previousMousePosition = { x: 0, y: 0 };
    private currentAngle = 0; // Ángulo actual de rotación u órbita
    private targetAngle = 0;
    private dampingFactor = 0.08;
    private animationFrameId: number | null = null;
    private snapTween: gsap.core.Tween | null = null;

    //Number vehicle
    private onVehicleChange: ((index: number) => void) | null = null;

    // Listeners de eventos
    private boundOnPointerDown: (e: PointerEvent) => void;
    private boundOnPointerMove: (e: PointerEvent) => void;
    private boundOnPointerUp: (e: PointerEvent) => void;

    constructor(
        camera: THREE.PerspectiveCamera,
        cameraController: CameraController,
        vehicleManager: VehicleManager,
        vehicleSelector: VehicleSelector
    ) {
        this.camera = camera;
        this.cameraController = cameraController;
        this.vehicleManager = vehicleManager;
        this.vehicleSelector = vehicleSelector;
        this.stateManager = new ExperienceStateManager();

        this.boundOnPointerDown = this.onPointerDown.bind(this);
        this.boundOnPointerMove = this.onPointerMove.bind(this);
        this.boundOnPointerUp = this.onPointerUp.bind(this);

        window.addEventListener('pointerdown', this.boundOnPointerDown);
        window.addEventListener('pointermove', this.boundOnPointerMove);
        window.addEventListener('pointerup', this.boundOnPointerUp);

        // Configurar selección de vehículos 2D mediante Raycaster
        this.vehicleSelector.onSelect((card) => {
            this.onCardSelected(card);
        });

        this.stateManager.onChange((event) => {
            this.vehicleSelector.setEnabled(event.to === 'overview');
        });

        // Bucle de renderizado para inercia / amortiguación suave
        this.tick = this.tick.bind(this);
        this.animationFrameId = requestAnimationFrame(this.tick);
    }

    public start(): void {
        this.currentAngle = 0;
        this.targetAngle = 0;
        this.cameraController.setCenterPosition(CENTER_HEIGHT);
        this.cameraController.lookAtAngle(0, CENTER_HEIGHT);
        document.body.style.cursor = 'grab';
    }
    
    //number vehicle
    public setOnVehicleChange(callback: (index: number) => void): void {
        this.onVehicleChange = callback;
    }

    private onPointerDown(e: PointerEvent): void {
        if ((e.target as HTMLElement)?.tagName === 'BUTTON' || (e.target as HTMLElement)?.closest('.contact-description')) return;

        // Si había una animación de snap en curso, cancelarla para permitir nuevo arrastre inmediato
        if (this.snapTween) {
            this.snapTween.kill();
            this.snapTween = null;
        }

        this.isDragging = true;
        this.previousMousePosition = { x: e.clientX, y: e.clientY };
        document.body.style.cursor = 'grabbing';
    }

    private onPointerMove(e: PointerEvent): void {
        if (!this.isDragging) return;

        const deltaX = e.clientX - this.previousMousePosition.x;
        this.previousMousePosition = { x: e.clientX, y: e.clientY };

        const sensitivity = 0.005;
        this.targetAngle += deltaX * sensitivity;
    }

    private onPointerUp(): void {
        if (!this.isDragging) return;
        this.isDragging = false;
        document.body.style.cursor = 'grab';

        // Solo aplicar snap al auto más cercano en la vista general
        if (this.stateManager.getState() === 'overview') {
            this.snapToNearestVehicle();
        }
    }

    // Efecto snap: calcula qué vehículo está más cerca del centro y anima suavemente hacia él con GSAP
    
private snapToNearestVehicle(): void {
    const totalVehicles = this.vehicleManager.getCards().length;
    if (totalVehicles === 0) return;

    const step = (Math.PI * 2) / totalVehicles;

    const nearestIndex = Math.round(this.targetAngle / step);
    const snappedAngle = nearestIndex * step;

    const normalizedIndex =
        ((nearestIndex % totalVehicles) + totalVehicles) % totalVehicles;

    if (this.snapTween) {
        this.snapTween.kill();
    }

    this.snapTween = gsap.to(this, {
        targetAngle: snappedAngle,
        duration: 0.7,
        ease: 'power2.out',

        onComplete: () => {
            this.snapTween = null;

            // Avisar qué vehículo quedó enfocado.
            this.onVehicleChange?.(normalizedIndex + 1);
        }
    });
}

    private tick(): void {
        this.currentAngle += (this.targetAngle - this.currentAngle) * this.dampingFactor;

        const state = this.stateManager.getState();

        if (state === 'overview') {
            this.camera.position.set(0, CENTER_HEIGHT, 0);
            this.cameraController.lookAtAngle(this.currentAngle, CENTER_HEIGHT);
        } else if (state === 'vehicle' && this.selectedVehicle) {
            this.cameraController.orbitAroundVehicle(
                this.selectedVehicle,
                this.currentAngle,
                ORBIT_DISTANCE,
                ORBIT_HEIGHT
            );
        }

        this.animationFrameId = requestAnimationFrame(this.tick);
    }

    // ─── SELECCIÓN: transición hacia un vehículo y carga bajo demanda del GLB ───

    private async onCardSelected(card: VehicleCard2D): Promise<void> {
        const state = this.stateManager.getState();
        if (state !== 'overview') return;

        this.selectedCard = card;
        this.stateManager.setState('transitioning');

        const target = card.getFocusPoint();
        const startPos = this.camera.position.clone();

        this.currentAngle = 0;
        this.targetAngle = 0;

        // Calcular posición de cámara frente al auto
        const cardPos = card.getWorldPosition();
        // Dirección normal hacia el centro: vector desde el card hacia (0,0,0)
        const dir = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), cardPos).normalize();
        const endPos = new THREE.Vector3(
            cardPos.x + dir.x * ORBIT_DISTANCE,
            cardPos.y + ORBIT_HEIGHT,
            cardPos.z + dir.z * ORBIT_DISTANCE
        );

        // Ocultar los otros 4 autos 2D
        this.vehicleManager.setCardsVisibility(false, card);

        // Iniciar carga del modelo 3D GLB bajo demanda en paralelo a la transición de cámara
        const loadPromise = this.vehicleManager.load3DForCard(card);

        const progress = { t: 0 };

        this.transitionTween = gsap.to(progress, {
            t: 1,
            duration: TRANSITION_DURATION,
            ease: 'power2.inOut',

            onUpdate: () => {
                this.camera.position.lerpVectors(startPos, endPos, progress.t);
                this.camera.lookAt(target);
            },

            onComplete: async () => {
                // Esperar a que el modelo 3D esté listo si aún no terminó
                const vehicle3D = await loadPromise;
                this.selectedVehicle = vehicle3D;

                // Ocultar la tarjeta 2D y dar paso al modelo 3D
                card.setVisible(false);
                vehicle3D.setVisible(true);

                this.stateManager.setState('vehicle');
                this.showBackButton();
            }
        });
    }

    // ─── REGRESO a la vista general ───

    public returnToOverview(): void {
        const state = this.stateManager.getState();
        if (state !== 'vehicle') return;

        this.stateManager.setState('transitioning');
        this.hideBackButton();

        // Reactivar la tarjeta 2D del auto y ocultar el 3D
        if (this.selectedCard) {
            this.selectedCard.setVisible(true);
        }
        if (this.selectedVehicle) {
            this.selectedVehicle.setVisible(false);
        }

        const startPos = this.camera.position.clone();
        const endPos = new THREE.Vector3(0, CENTER_HEIGHT, 0);

        const progress = { t: 0 };

        this.transitionTween = gsap.to(progress, {
            t: 1,
            duration: TRANSITION_DURATION,
            ease: 'power2.inOut',

            onUpdate: () => {
                this.camera.position.lerpVectors(startPos, endPos, progress.t);

                if (this.selectedCard) {
                    const cardTarget = this.selectedCard.getFocusPoint();
                    this.camera.lookAt(
                        cardTarget.x * (1 - progress.t),
                        CENTER_HEIGHT,
                        cardTarget.z * (1 - progress.t)
                    );
                }
            },

            onComplete: () => {
                // Liberar el modelo 3D de memoria
                this.vehicleManager.unloadActive3D();
                this.selectedVehicle = null;
                this.selectedCard = null;

                // Restaurar visibilidad de todas las tarjetas 2D
                this.vehicleManager.setCardsVisibility(true);

                this.stateManager.setState('overview');
                this.currentAngle = 0;
                this.targetAngle = 0;
                this.cameraController.setCenterPosition(CENTER_HEIGHT);
                this.cameraController.lookAtAngle(0, CENTER_HEIGHT);
            }
        });
    }

    // ─── Botón de regreso ───

    private showBackButton(): void {
        if (this.backButton) return;

        this.backButton = document.createElement('button');
        this.backButton.textContent = '← Volver al Showroom';
        this.backButton.style.cssText = `
            position: fixed;
            top: 28px;
            left: 28px;
            z-index: 1000;
            padding: 12px 24px;
            background: rgba(255, 255, 255, 0.92);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(0, 0, 0, 0.08);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
            border-radius: 30px;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 14px;
            font-weight: 500;
            color: #111;
            cursor: pointer;
            transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
            opacity: 0;
            user-select: none;
        `;

        this.backButton.addEventListener('mouseenter', () => {
            if (this.backButton) {
                this.backButton.style.background = '#ffffff';
                this.backButton.style.transform = 'translateY(-1px) scale(1.02)';
                this.backButton.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.12)';
            }
        });

        this.backButton.addEventListener('mouseleave', () => {
            if (this.backButton) {
                this.backButton.style.background = 'rgba(255, 255, 255, 0.92)';
                this.backButton.style.transform = 'none';
                this.backButton.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08)';
            }
        });

        this.backButton.addEventListener('click', () => {
            this.returnToOverview();
        });

        document.body.appendChild(this.backButton);

        gsap.to(this.backButton, {
            opacity: 1,
            duration: 0.4,
            ease: 'power2.out',
        });
    }

    private hideBackButton(): void {
        if (!this.backButton) return;

        const button = this.backButton;
        this.backButton = null;

        gsap.to(button, {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
                button.remove();
            }
        });
    }

    // ─── Limpieza ───

    public dispose(): void {
        if (this.snapTween) {
            this.snapTween.kill();
            this.snapTween = null;
        }

        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        window.removeEventListener('pointerdown', this.boundOnPointerDown);
        window.removeEventListener('pointermove', this.boundOnPointerMove);
        window.removeEventListener('pointerup', this.boundOnPointerUp);

        document.body.style.cursor = 'default';

        this.transitionTween?.kill();
        this.transitionTween = null;

        this.hideBackButton();
        this.vehicleSelector.dispose();
        this.stateManager.dispose();
    }
}
