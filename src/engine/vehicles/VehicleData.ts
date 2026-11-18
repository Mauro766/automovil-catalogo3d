export interface VehicleData {
    id: string;
    name: string;
    imagePath: string;
    modelPath: string;
    version: string;
    motor: string;

}

export const VEHICLES_DATA: VehicleData[] = [
    {
        id: '2020audi_rs5',
        name: 'Audi RS5 2020',
        version:'v20',
        motor:'v205',
        imagePath: '/models/vehicles/2020audi_rs5.png',
        modelPath: '/models/vehicles/2020audi_rs5.glb',
    },
    {
        id: '2007audi_tt',
        name: 'Audi TT 2007',
        version:'vv',
        motor:'dd',
        imagePath: '/models/vehicles/2007audi_tt.png',
        modelPath: '/models/vehicles/2007audi_tt_optimi.glb',
    },
    {
        id: '2014audi_r8',
        name: 'Audi R8 2014',
        version:'vv',
        motor:'dd',
        imagePath: '/models/vehicles/2014audi_r8.png',
        modelPath: '/models/vehicles/2014audi_r8.glb',
    },
    {
        id: '2019audi_tt',
        name: 'Audi TT 2019',
        version:'dd',
        motor:'dd',
        imagePath: '/models/vehicles/2019audi_tt.png',
        modelPath: '/models/vehicles/2019audi_tt.glb',
    },
    {
        id: 'auto1.1',
        name: 'Porsche 911',
        version:'dd',
        motor:'dd',
        imagePath: '/models/vehicles/porchet1.1.png',
        modelPath: '/models/vehicles/auto1.1.glb',
    },
];
