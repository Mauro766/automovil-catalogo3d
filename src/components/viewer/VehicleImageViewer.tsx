import type { VehicleImage } from '../../engine/vehicles/VehicleData';

interface VehicleImageViewerProps {
    image: VehicleImage | null;
    onClose: () => void;
}

export function VehicleImageViewer({ image, onClose }: VehicleImageViewerProps) {
    if (!image) return null;

    return (
        <div
            className="vehicle-viewer__image-overlay"
            onClick={onClose}
            aria-label="Cerrar vista de fotografía"
        >
            <div
                className="vehicle-viewer__image-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    className="vehicle-viewer__image-close"
                    onClick={onClose}
                    aria-label="Cerrar"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
                <img
                    src={image.url}
                    alt={image.alt}
                    className="vehicle-viewer__image-full"
                />
            </div>
        </div>
    );
}
