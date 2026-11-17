import { useState } from 'react';
import { Showroom } from './components/showroom/Showroom';
import Hero from './components/ui/Hero';
import { VEHICLES_DATA } from './engine/vehicles/VehicleData';

function App() {
  const [numberVehicle, setNumberVehicle] = useState(1);
  const vehicleData = VEHICLES_DATA[numberVehicle - 1];

  return (
    <>
      <Hero
        number_vehicle={numberVehicle}
        version={vehicleData?.version ?? ''}
        motor={vehicleData?.motor ?? ''}
      />

      <main style={{ width: '100%', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <Showroom onVehicleChange={setNumberVehicle} />
      </main>
    </>
  );
}

export default App;