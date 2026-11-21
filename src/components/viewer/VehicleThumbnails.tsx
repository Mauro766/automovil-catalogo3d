import type { VehicleImage } from '../../engine/vehicles/VehicleData';

interface VehicleThumbnailsProps {
    images: readonly VehicleImage[];
    selectedIndex: number;
    onSelect: (index: number) => void;
}

export function VehicleThumbnails({
    images,
    selectedIndex,
    onSelect,
}: VehicleThumbnailsProps) {
    if (!images || images.length === 0) {
        return null;
    }

    // Se muestran hasta 4 miniaturas según el diseño de referencia
    const visibleImages = images.slice(0, 4);

    return (
        <div className="vehicle-viewer__gallery" aria-label="Galería de miniaturas">
            {visibleImages.map((image, index) => (
                <button
                    key={image.id}
                    type="button"
                    className={`vehicle-viewer__gallery-item ${selectedIndex === index ? 'is-selected' : ''}`}
                    onClick={() => onSelect(index)}
                    aria-label={image.alt || `Fotografía ${index + 1}`}
                >
                    <img
                        src={image.url}
                        alt={image.alt || ''}
                        loading="lazy"
                    />
                </button>
            ))}
        </div>
    );
}
