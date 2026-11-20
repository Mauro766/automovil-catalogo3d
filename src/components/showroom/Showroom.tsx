import { useEffect, useRef, useState } from 'react';

import { ShowroomEngine } from '../../engine/core/ShowroomEngine';
import type { VehicleData } from '../../engine/vehicles/VehicleData';

import '../../styles/vehicle-tooltip.css';
import '../../styles/loading-screen.css';

interface ShowroomProps {
    vehicles: readonly VehicleData[];
    onVehicleChange: (index: number) => void;
    onVehicleSelected?: (id: string) => void;
}

export function Showroom({
    vehicles,
    onVehicleChange,
    onVehicleSelected,
}: ShowroomProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRevealing, setIsRevealing] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);

    useEffect(() => {
        const container = containerRef.current;

        if (!container) return;

        const engine = new ShowroomEngine(container, vehicles);

        engine.setOnVehicleChange(onVehicleChange);

        if (onVehicleSelected) {
            engine.setOnVehicleSelected(onVehicleSelected);
        }

        let cancelled = false;

        const sleep = (ms: number) =>
            new Promise((resolve) => setTimeout(resolve, ms));

        const initialize = async () => {
            try {
                // FASE 1: CARGA
                // 1. Inicializar renderer WebGPU
                await engine.initRenderer();
                if (cancelled) return;

                engine.start();
                setLoadingProgress(20);

                // 2. Cargar entorno HDRI (recurso no bloqueante si falla)
                try {
                    await engine.initEnvironment();
                } catch (error) {
                    console.error('Error cargando el HDRI:', error);
                }
                if (cancelled) return;

                setLoadingProgress(50);

                // 3. Cargar vehículos obligatorios
                await engine.initVehicles();
                if (cancelled) return;

                setLoadingProgress(85);

                // 4. Iniciar experiencia de interacción
                engine.startExperience();
                if (cancelled) return;

                // FASE 2: FINALIZACIÓN
                // El progreso llega al 100% y permanece brevemente visible
                setLoadingProgress(100);
                await sleep(400);
                if (cancelled) return;

                // FASE 3: REVEAL
                // Al comenzar a subir la cortina, los textos y el número se van con la ola
                setIsRevealing(true);
                await engine.revealLoadingScreen();

                if (!cancelled) {
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Error inicializando el showroom:', error);

                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        void initialize();

        return () => {
            cancelled = true;
            engine.dispose();
        };
    }, [vehicles, onVehicleChange, onVehicleSelected]);

    return (
        <section
            ref={sectionRef}
            style={{
                position: 'fixed',
                inset: 0,
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                userSelect: 'none',
                zIndex: isLoading ? 200 : 0,
            }}
        >
            <div
                ref={containerRef}
                style={{
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                }}
            />

            {isLoading && (
                <div className={`loading-content ${isRevealing ? 'revealing' : ''}`}>
                    <div className="loading-top">
                        <span>DEALPUSH</span>
                        <span>DIGITAL EXPERIENCES</span>
                    </div>

                    <div className="loading-bottom">
                        <h1>01</h1>

                        <div className="loading-information">
                            <span>PREPARING SHOWROOM</span>
                            <span>{loadingProgress}%</span>
                        </div>

                        <div className="loading-line">
                            <div
                                className="loading-line-progress"
                                style={{
                                    width: `${loadingProgress}%`,
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
