import { useCallback, useEffect, useState } from 'react';
import { Showroom } from './components/showroom/Showroom';
import { VehicleViewer } from './components/viewer/VehicleViewer';
import Hero from './components/ui/Hero';
import type { VehicleData } from './engine/vehicles/VehicleData';
import { vehicleRepository } from './engine/vehicles/VehicleRepository';

function App() {
  const [numberVehicle, setNumberVehicle] = useState(1);
  const [pathname, setPathname] = useState(window.location.pathname);
  const [vehicles, setVehicles] = useState<readonly VehicleData[] | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    let isActive = true;

    void vehicleRepository.getAll()
      .then((loadedVehicles) => {
        if (isActive) setVehicles(loadedVehicles);
      })
      .catch((error: unknown) => {
        console.error('Error cargando el catálogo de vehículos:', error);
        if (isActive) setCatalogError('No se pudo cargar el catálogo de vehículos.');
      });

    return () => {
      isActive = false;
    };
  }, []);

  const navigate = useCallback((path: string) => {
    window.history.pushState(null, '', path);
    setPathname(window.location.pathname);
  }, []);

  const handleVehicleSelected = useCallback((id: string) => {
    navigate(`/vehicle/${encodeURIComponent(id)}`);
  }, [navigate]);

  if (catalogError) {
    return <main role="alert">{catalogError}</main>;
  }

  if (!vehicles) {
    return <main role="status" aria-busy="true">Cargando vehículos...</main>;
  }

  const vehicleData = vehicles[numberVehicle - 1];
  const vehicleRoute = pathname.match(/^\/vehicle\/([^/]+)\/?$/);
  if (vehicleRoute) {
    let vehicleId = vehicleRoute[1];
    try {
      vehicleId = decodeURIComponent(vehicleId);
    } catch {
      // Keep the raw route segment so the viewer can show its not-found state.
    }

    return (
      <VehicleViewer
        vehicle={vehicles.find((vehicle) => vehicle.id === vehicleId) ?? null}
        onBack={() => navigate('/')}
      />
    );
  }

  return (
    <>
      <Hero
        number_vehicle={numberVehicle}
        version={vehicleData?.specifications.version ?? ''}
        motor={vehicleData?.specifications.motor ?? ''}
      />

      <main
        style={{
          width: '100%',
          minHeight: '100vh',
          position: 'relative',
        }}
      >        <Showroom
          vehicles={vehicles}
          onVehicleChange={setNumberVehicle}
          onVehicleSelected={handleVehicleSelected}
        />
      </main>
    </>
  );
}

export default App;