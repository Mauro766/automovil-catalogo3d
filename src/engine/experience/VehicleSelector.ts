import * as THREE from 'three';
import { VehicleCard2D } from '../vehicles/VehicleCard2D';

export class VehicleSelector {
    private raycaster: THREE.Raycaster;
    private pointer: THREE.Vector2;
    private camera: THREE.PerspectiveCamera;
    private cards: VehicleCard2D[];
    private canvas: HTMLCanvasElement;
    private tooltipElement: HTMLDivElement;
    private tooltipLabel: HTMLSpanElement;

    private onSelectCallback: ((card: VehicleCard2D) => void) | null = null;
    private boundOnPointerDown: (event: PointerEvent) => void;
    private boundOnPointerMove: (event: PointerEvent) => void;
    private boundOnPointerUp: (event: PointerEvent) => void;
    private boundOnPointerLeave: () => void;
    private startX = 0;
    private startY = 0;
    private enabled = true;
    private hoveredCard: VehicleCard2D | null = null;

    constructor(
        camera: THREE.PerspectiveCamera,
        canvas: HTMLCanvasElement,
        cards: VehicleCard2D[]
    ) {
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        this.camera = camera;
        this.cards = cards;
        this.canvas = canvas;

        this.tooltipElement = document.createElement('div');
        this.tooltipElement.className = 'vehicle-tooltip';
        this.tooltipElement.setAttribute('aria-hidden', 'true');
        this.tooltipElement.innerHTML = '<svg width="121" height="32" viewBox="0 0 121 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.0043 5.10613L0.304582 27.4023C-0.85635 29.8214 1.49968 32.4313 4.02462 31.5232L29.5494 22.3425C30.5265 21.991 31.5571 21.8113 32.5955 21.8113H111.138C116.109 21.8113 120.138 17.7819 120.138 12.8113V9C120.138 4.02944 116.109 0 111.138 0H19.1184C15.6568 0 12.502 1.9853 11.0043 5.10613Z" fill="#38A2F9"/></svg>';

        this.tooltipLabel = document.createElement('span');
        this.tooltipLabel.className = 'vehicle-tooltip__label';
        this.tooltipElement.appendChild(this.tooltipLabel);
        document.body.appendChild(this.tooltipElement);

        this.boundOnPointerDown = this.onPointerDown.bind(this);
        this.boundOnPointerMove = this.onPointerMove.bind(this);
        this.boundOnPointerUp = this.onPointerUp.bind(this);
        this.boundOnPointerLeave = this.onPointerLeave.bind(this);

        this.canvas.addEventListener('pointerdown', this.boundOnPointerDown);
        this.canvas.addEventListener('pointermove', this.boundOnPointerMove);
        this.canvas.addEventListener('pointerup', this.boundOnPointerUp);
        this.canvas.addEventListener('pointerleave', this.boundOnPointerLeave);
    }

    public onSelect(callback: (card: VehicleCard2D) => void): void {
        this.onSelectCallback = callback;
    }

    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
        if (!enabled) {
            this.clearHover();
        }
    }

    private getCardUnderPointer(event: PointerEvent): { card: VehicleCard2D | null; uv: THREE.Vector2 | null } {
        const rect = this.canvas.getBoundingClientRect();
        const pointerX = event.clientX - rect.left;
        const pointerY = event.clientY - rect.top;
        this.pointer.x = (pointerX / rect.width) * 2 - 1;
        this.pointer.y = -(pointerY / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.pointer, this.camera);

        const cardMeshes: THREE.Mesh[] = [];
        const cardMap = new Map<THREE.Object3D, VehicleCard2D>();

        for (const card of this.cards) {
            const mesh = card.getMesh();
            if (mesh && card.getGroup().visible) {
                cardMeshes.push(mesh);
                cardMap.set(mesh, card);
            }
        }

        const intersects = this.raycaster.intersectObjects(cardMeshes, false);
        if (intersects.length === 0) {
            return { card: null, uv: null };
        }

        const hit = intersects[0];
        const hitCard = hit.object ? cardMap.get(hit.object) ?? null : null;
        return { card: hitCard, uv: hit.uv ? hit.uv.clone() : null };
    }

    private clearHover(): void {
        if (this.hoveredCard) {
            this.hoveredCard.setHover(null);
            this.hoveredCard = null;
        }
        this.hideTooltip();
    }

    private showTooltip(card: VehicleCard2D, event: PointerEvent): void {
        const rect = this.canvas.getBoundingClientRect();
        const pointerX = event.clientX - rect.left;
        const pointerY = event.clientY - rect.top;

        this.tooltipLabel.textContent = card.getData().name;
        this.tooltipElement.style.left = `${rect.left + pointerX + 1}px`;
        this.tooltipElement.style.top = `${rect.top + pointerY - 37}px`;
        this.tooltipElement.classList.add('vehicle-tooltip--visible');
        this.tooltipElement.setAttribute('aria-hidden', 'false');
    }

    private hideTooltip(): void {
        this.tooltipElement.classList.remove('vehicle-tooltip--visible');
        this.tooltipElement.setAttribute('aria-hidden', 'true');
    }

    private updateHoverFromPointer(event: PointerEvent): void {
        if (!this.enabled || event.buttons !== 0) {
            this.clearHover();
            return;
        }

        const { card, uv } = this.getCardUnderPointer(event);

        if (this.hoveredCard && this.hoveredCard !== card) {
            this.hoveredCard.setHover(null);
        }

        this.hoveredCard = card;

        if (card) {
            card.setHover(uv);
            this.showTooltip(card, event);
        } else {
            this.hoveredCard = null;
            this.hideTooltip();
        }
    }

    private onPointerDown(event: PointerEvent): void {
        this.startX = event.clientX;
        this.startY = event.clientY;
        this.hideTooltip();
    }

    private onPointerMove(event: PointerEvent): void {
        this.updateHoverFromPointer(event);
    }

    private onPointerLeave(): void {
        this.clearHover();
    }

    private onPointerUp(event: PointerEvent): void {
        if (!this.enabled) return;

        const deltaX = Math.abs(event.clientX - this.startX);
        const deltaY = Math.abs(event.clientY - this.startY);
        if (deltaX > 6 || deltaY > 6) return;

        const { card } = this.getCardUnderPointer(event);
        if (card) {
            this.onSelectCallback?.(card);
        }
    }

    public dispose(): void {
        this.clearHover();
        this.canvas.removeEventListener('pointerdown', this.boundOnPointerDown);
        this.canvas.removeEventListener('pointermove', this.boundOnPointerMove);
        this.canvas.removeEventListener('pointerup', this.boundOnPointerUp);
        this.canvas.removeEventListener('pointerleave', this.boundOnPointerLeave);
        this.tooltipElement.remove();
        this.onSelectCallback = null;
    }
}
