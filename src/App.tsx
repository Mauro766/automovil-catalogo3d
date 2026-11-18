import { useCallback, useEffect, useState } from 'react';
import { Showroom } from './components/showroom/Showroom';
import { VehicleViewer } from './components/viewer/VehicleViewer';
import Hero from './components/ui/Hero';
import { VEHICLES_DATA } from './engine/vehicles/VehicleData';

function App() {
  const [numberVehicle, setNumberVehicle] = useState(1);
  const [pathname, setPathname] = useState(window.location.pathname);
  const vehicleData = VEHICLES_DATA[numberVehicle - 1];

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((path: string) => {
    window.history.pushState(null, '', path);
    setPathname(window.location.pathname);
  }, []);

  const handleVehicleSelected = useCallback((id: string) => {
    navigate(`/vehicle/${encodeURIComponent(id)}`);
  }, [navigate]);

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
        vehicle={VEHICLES_DATA.find((vehicle) => vehicle.id === vehicleId) ?? null}
        onBack={() => navigate('/')}
      />
    );
  }

  return (
    <>
      <Hero
        number_vehicle={numberVehicle}
        version={vehicleData?.version ?? ''}
        motor={vehicleData?.motor ?? ''}
      />

      <main style={{ width: '100%', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <Showroom
          onVehicleChange={setNumberVehicle}
          onVehicleSelected={handleVehicleSelected}
        />
      </main>
    </>
  );
}

export default App;