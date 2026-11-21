import { useState } from 'react';
import type { VehicleImage } from '../../engine/vehicles/VehicleData';
import { VehicleThumbnails } from './VehicleThumbnails';
import { VehicleImageViewer } from './VehicleImageViewer';

interface VehicleGalleryProps {
    images: readonly VehicleImage[];
}

export function VehicleGallery({ images }: VehicleGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const sortedImages = [...images].sort((a, b) => a.order - b.order);

    const handleSelect = (index: number) => {
        // Al seleccionar la miniatura se abre la fotografía seleccionada
        setSelectedIndex(index);
    };

    const handleClose = () => {
        setSelectedIndex(null);
    };

    const selectedImage = selectedIndex !== null ? sortedImages[selectedIndex] ?? null : null;

    return (
        <>
            <VehicleThumbnails
                images={sortedImages}
                selectedIndex={selectedIndex ?? -1}
                onSelect={handleSelect}
            />

            <VehicleImageViewer
                image={selectedImage}
                onClose={handleClose}
            />
        </>
    );
}
