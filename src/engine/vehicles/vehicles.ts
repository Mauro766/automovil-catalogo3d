import type { VehicleData } from './VehicleData';

export const VEHICLES_DATA: VehicleData[] = [
    {
        id: '2020audi_rs5',
        name: 'Audi RS5 2020',
        description: null,
        specifications: {
            version: 'Coupé 2.9 TFSI',
            motor: '2.9L V6 Biturbo TFSI',
            acceleration: '3.9s',
            traction: 'Quattro',
            power: '450 CV',
        },
        showroomImage: {
            id: '2020audi_rs5_showroom',
            url: '/models/vehicles/2020audi_rs5.png',
            alt: 'Audi RS5 2020',
            order: 0,
        },
        modelPath: '/models/vehicles/2020audi_rs5_optimi.glb',
        images: [
            {
                id: '2020audi_rs5_img_1',
                url: '/models/vehicles/img_vehicles/audirs52020/img1.webp',
                alt: 'Audi RS5 2020, foto 1',
                order: 1,
            },
            {
                id: '2020audi_rs5_img_2',
                url: '/models/vehicles/img_vehicles/audirs52020/img2.jpg',
                alt: 'Audi RS5 2020, foto 2',
                order: 2,
            },
            {
                id: '2020audi_rs5_img_3',
                url: '/models/vehicles/img_vehicles/audirs52020/img3.webp',
                alt: 'Audi RS5 2020, foto 3',
                order: 3,
            },
            {
                id: '2020audi_rs5_img_4',
                url: '/models/vehicles/img_vehicles/audirs52020/img4.jpg',
                alt: 'Audi RS5 2020, foto 4',
                order: 4,
            },
        ],
        price: {
            amount: 75000,
            currency: 'USD',
        },
    },
    {
        id: '2007audi_tt',
        name: 'Audi TT 2007',
        description: null,
        specifications: {
            version: 'Coupé 2.0 TFSI',
            motor: '2.0L 4 Cil. Turbo FSI',
            acceleration: '6.4s',
            traction: 'Delantera',
            power: '200 CV',
        },
        showroomImage: {
            id: '2007audi_tt_showroom',
            url: '/models/vehicles/2007audi_tt.png',
            alt: 'Audi TT 2007',
            order: 0,
        },
        modelPath: '/models/vehicles/2007audi_tt_optimi.glb',
        images: [
            {
                id: '2007audi_tt_img_1',
                url: '/models/vehicles/img_vehicles/audiTT2007/img1.jpg',
                alt: 'Audi TT 2007, foto 1',
                order: 1,
            },
            {
                id: '2007audi_tt_img_2',
                url: '/models/vehicles/img_vehicles/audiTT2007/img2.jpg',
                alt: 'Audi TT 2007, foto 2',
                order: 2,
            },
            {
                id: '2007audi_tt_img_3',
                url: '/models/vehicles/img_vehicles/audiTT2007/img3.webp',
                alt: 'Audi TT 2007, foto 3',
                order: 3,
            },
            {
                id: '2007audi_tt_img_4',
                url: '/models/vehicles/img_vehicles/audiTT2007/img4.webp',
                alt: 'Audi TT 2007, foto 4',
                order: 4,
            },
        ],
        price: {
            amount: 14000,
            currency: 'USD',
        },
    },
    {
        id: '2014audi_r8',
        name: 'Audi R8 2014',
        description: null,
        specifications: {
            version: 'Coupé 4.2 FSI Quattro',
            motor: '4.2L V8 FSI',
            acceleration: '3.6s',
            traction: 'Quattro',
            power: '430 CV',
        },
        showroomImage: {
            id: '2014audi_r8_showroom',
            url: '/models/vehicles/2014audi_r8.png',
            alt: 'Audi R8 2014',
            order: 0,
        },
        modelPath: '/models/vehicles/2014audi_r8_optimi.glb',
        images: [
            {
                id: '2014audi_r8_img_1',
                url: '/models/vehicles/img_vehicles/audiR82014/img.webp',
                alt: 'Audi R8 2014, foto 1',
                order: 1,
            },
            {
                id: '2014audi_r8_img_2',
                url: '/models/vehicles/img_vehicles/audiR82014/img2.avif',
                alt: 'Audi R8 2014, foto 2',
                order: 2,
            },
            {
                id: '2014audi_r8_img_3',
                url: '/models/vehicles/img_vehicles/audiR82014/img3.jpg',
                alt: 'Audi R8 2014, foto 3',
                order: 3,
            },
        ],
        price: {
            amount: 40000,
            currency: 'USD',
        },
    },
    {
        id: '2019audi_tt',
        name: 'Audi TT 2019',
        description: null,
        specifications: {
            version: 'Coupé 45 TFSI Quattro',
            motor: '2.0L 4 Cil. Turbo TFSI',
            acceleration: '5.2s',
            traction: 'Quattro',
            power: '245 CV',
        },
        showroomImage: {
            id: '2019audi_tt_showroom',
            url: '/models/vehicles/2019audi_tt.png',
            alt: 'Audi TT 2019',
            order: 0,
        },
        modelPath: '/models/vehicles/2019audi_tt_optimi.glb',
        images: [],
        price: {
            amount: 38000,
            currency: 'USD',
        },
    },
    {
        id: 'auto1.1',
        name: 'Porsche 911 2021',
        description: null,
        specifications: {
            version: 'Carrera S (992)',
            motor: '3.0L Bóxer 6 Biturbo',
            acceleration: '3.5s',
            traction: 'Trasera',
            power: '450 CV',
        },
        showroomImage: {
            id: 'auto1.1_showroom',
            url: '/models/vehicles/porchet1.1.png',
            alt: 'Porsche 911',
            order: 0,
        },
        modelPath: '/models/vehicles/auto1.1.glb',
        images: [
            {
                id: 'auto1.1_img_1',
                url: '/models/vehicles/img_vehicles/porsche/img1.jpg',
                alt: 'Porsche 911 2021, foto 1',
                order: 1,
            },
            {
                id: 'auto1.1_img_2',
                url: '/models/vehicles/img_vehicles/porsche/img2.jpg',
                alt: 'Porsche 911 2021, foto 2',
                order: 2,
            },
            {
                id: 'auto1.1_img_3',
                url: '/models/vehicles/img_vehicles/porsche/img3.jpg',
                alt: 'Porsche 911 2021, foto 3',
                order: 3,
            },
        ],
        price: {
            amount: 125000,
            currency: 'USD',
        },
    },
];
