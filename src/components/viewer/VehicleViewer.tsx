import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { VehicleViewerEngine } from '../../engine/core/VehicleViewerEngine';
import type { VehicleData } from '../../engine/vehicles/VehicleData';
import Header from '../ui/Header';
import { VehicleGallery } from './VehicleGallery';
import { VehicleInfoPanel } from './VehicleInfoPanel';
import '../../styles/vehicle-viewer.css';

interface VehicleViewerProps {
    vehicle: VehicleData | null;
    onBack: () => void;
}

export function VehicleViewer({ vehicle, onBack }: VehicleViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<VehicleViewerEngine | null>(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isExitingRef = useRef(false);

    const images = vehicle?.images ?? [];

    useEffect(() => {
        const container = containerRef.current;
        if (!container || !vehicle) return;

        let isActive = true;
        const engine = new VehicleViewerEngine(container);
        engineRef.current = engine;

        const initAndReveal = async () => {
            try {
                await engine.loadVehicle(vehicle);
                if (!isActive) return;

                // Primero se ejecuta la animación líquida de reveal
                await engine.revealLoadingScreen();
                if (isActive) {
                    setIsRevealed(true);
                }
            } catch (loadError: unknown) {
                console.error(`Error cargando el modelo de ${vehicle.name}:`, loadError);
                if (isActive) {
                    setError('No se pudo cargar el modelo 3D de este vehículo.');
                    await engine.revealLoadingScreen();
                    setIsRevealed(true);
                }
            }
        };

        void initAndReveal();

        return () => {
            isActive = false;
            engineRef.current = null;
            engine.dispose();
        };
    }, [vehicle]);

    // Animación de entrada GSAP para los elementos al revelarse la página
    useEffect(() => {
        if (!isRevealed) return;

        const ctx = gsap.context(() => {
            // Header entra desde arriba
            gsap.fromTo(
                '.vehicle-viewer .header',
                { y: -50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
            );

            // La columna de galería entra desde la izquierda completa y alineada
            gsap.fromTo(
                '.vehicle-viewer__gallery',
                { x: -60, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.1 }
            );

            // Panel de información entra desde la derecha
            gsap.fromTo(
                '.vehicle-viewer__info',
                { x: 60, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.15 }
            );

            // Botón de volver y botón 360 entran desde abajo
            gsap.fromTo(
                '.vehicle-viewer__bottom-nav',
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.2 }
            );

            gsap.fromTo(
                '.vehicle-viewer__action-360-container',
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.25 }
            );
        });

        return () => ctx.revert();
    }, [isRevealed]);

    // Transición de salida líquida al hacer clic en volver al catálogo
    const handleBack = async () => {
        if (isExitingRef.current) return;
        isExitingRef.current = true;
        setIsExiting(true);

        // Desvanecer elementos de la UI hacia sus orígenes
        gsap.to(['.vehicle-viewer .header', '.vehicle-viewer__gallery', '.vehicle-viewer__info', '.vehicle-viewer__bottom-nav', '.vehicle-viewer__action-360-container'], {
            opacity: 0,
            duration: 0.4,
            ease: 'power2.in',
        });

        if (engineRef.current) {
            try {
                // El líquido baja cubriendo la pantalla
                await engineRef.current.coverLoadingScreen();
            } catch (e) {
                console.error('Error durante la transición de salida:', e);
            }
        }

        onBack();
    };

    return (
        <main className={`vehicle-viewer ${isRevealed ? 'is-revealed' : 'is-loading'}`}>
            {/* Canvas central con el vehículo 3D interactivo y el líquido */}
            <div
                className="vehicle-viewer__canvas"
                ref={containerRef}
                style={{
                    zIndex: isExiting || !isRevealed ? 500 : 1,
                }}
            />

            {/* Todo el contenido HTML solo se muestra cuando el líquido termina de subir */}
            {isRevealed && (
                <>
                    <Header onBack={handleBack} />
                    <VehicleGallery images={images} />

                    {vehicle && <VehicleInfoPanel vehicle={vehicle} />}

                    <div className="vehicle-viewer__bottom-nav">
                        <button
                            className="vehicle-viewer__back-btn"
                            type="button"
                            onClick={handleBack}
                        >
                            <svg
                                className="vehicle-viewer__back-arrow"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <line x1="19" y1="12" x2="5" y2="12" />
                                <polyline points="12 19 5 12 12 5" />
                            </svg>
                            <span>VOLVER AL CATÁLOGO</span>
                        </button>
                    </div>

                    <div className="vehicle-viewer__action-360-container">
                        <div className="vehicle-viewer__pill-btn">
                            <svg
                                className="vehicle-viewer__pill-icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                            </svg>
                            <span>Ver en 360°</span>
                        </div>
                    </div>
                </>
            )}

            {error ? (
                <p className="vehicle-viewer__status" role="alert">{error}</p>
            ) : !vehicle ? (
                <p className="vehicle-viewer__status" role="alert">
                    No encontramos el vehículo solicitado.
                </p>
            ) : null}
        </main>
    );
}
