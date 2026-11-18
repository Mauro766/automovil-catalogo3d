import { useEffect, useRef, useState } from 'react';
import { VehicleViewerEngine } from '../../engine/core/VehicleViewerEngine';
import type { VehicleData } from '../../engine/vehicles/VehicleData';
import '../../styles/vehicle-viewer.css';

interface VehicleViewerProps {
    vehicle: VehicleData | null;
    onBack: () => void;
}

export function VehicleViewer({ vehicle, onBack }: VehicleViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || !vehicle) return;

        let isActive = true;
        const engine = new VehicleViewerEngine(container);

        void engine.loadVehicle(vehicle).catch((loadError: unknown) => {
            console.error(`Error cargando el modelo de ${vehicle.name}:`, loadError);
            if (isActive) {
                setError('No se pudo cargar el modelo 3D de este vehículo.');
            }
        });

        return () => {
            isActive = false;
            engine.dispose();
        };
    }, [vehicle]);

    return (
        <main className="vehicle-viewer">
            <div className="vehicle-viewer__canvas" ref={containerRef} />
            <header className="vehicle-viewer__header">
                <button className="vehicle-viewer__back" type="button" onClick={onBack}>
                    <span aria-hidden="true">←</span> Volver al showroom
                </button>
                <div className="vehicle-viewer__identity">
                    <span>DEALPUSH / VISTA 3D</span>
                    <h1>{vehicle?.name ?? 'Vehículo no encontrado'}</h1>
                </div>
            </header>
            {error ? (
                <p className="vehicle-viewer__status" role="alert">{error}</p>
            ) : !vehicle ? (
                <p className="vehicle-viewer__status" role="alert">
                    No encontramos el vehículo solicitado.
                </p>
            ) : (
                <p className="vehicle-viewer__hint">ARRASTRÁ PARA EXPLORAR 360°</p>
            )}
        </main>
    );
}
