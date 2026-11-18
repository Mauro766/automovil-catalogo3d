import { useEffect, useRef } from 'react';
import { ShowroomEngine } from '../../engine/core/ShowroomEngine';
import '../../styles/vehicle-tooltip.css';

interface ShowroomProps {
    onVehicleChange: (index: number) => void;
    onVehicleSelected?: (id: string) => void;
}

export function Showroom({ onVehicleChange, onVehicleSelected }: ShowroomProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const section = sectionRef.current;
        const container = containerRef.current;

        if (!section || !container) return;


        const engine = new ShowroomEngine(container);

        engine.setOnVehicleChange(onVehicleChange);
        if (onVehicleSelected) {
            engine.setOnVehicleSelected(onVehicleSelected);
        }

        engine.start();

        const loadVehicles = async () => {
            try {
                await engine.initRenderer();
                await engine.initVehicles();
                engine.startExperience();
            } catch (error) {
                console.error('Error cargando los vehículos 2D:', error);
            }
        };

        void loadVehicles();

        return () => {
            engine.dispose();
        };
    }, [onVehicleChange, onVehicleSelected]);

    return (
        <section
            ref={sectionRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                overflow: 'hidden',
                userSelect: 'none',
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
        </section>
    );
}
