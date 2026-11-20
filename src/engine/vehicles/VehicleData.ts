export interface VehicleSpecifications {
    version?: string;
    motor?: string;
    power?: string;
    acceleration?: string;
    traction?: string;
    transmission?: string;
}

export interface VehicleImage {
    id: string;
    url: string;
    alt: string;
    order: number;
}

export interface VehicleData {
    id: string;
    name: string;
    description: string | null;
    specifications: VehicleSpecifications;
    showroomImage: VehicleImage;
    modelPath: string;
    gallery: VehicleImage[];
}
