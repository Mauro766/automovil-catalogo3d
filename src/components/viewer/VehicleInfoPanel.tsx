import type { VehicleData } from '../../engine/vehicles/VehicleData';
import { formatVehiclePrice } from '../../utils/priceFormatter';
import { buildWhatsAppLink } from '../../utils/whatsappLink';

interface VehicleInfoPanelProps {
    vehicle: VehicleData;
}

export function VehicleInfoPanel({ vehicle }: VehicleInfoPanelProps) {
    // Separar año del nombre del modelo para la jerarquía del título
    const yearMatch = vehicle.name.match(/\b(?:19|20)\d{2}\b/);
    const year = yearMatch ? yearMatch[0] : '';
    const modelName = year
        ? vehicle.name.replace(year, '').trim()
        : vehicle.name ?? 'Vehículo no encontrado';

    const formattedPrice = formatVehiclePrice(vehicle.price);
    const whatsappUrl = buildWhatsAppLink(vehicle.name);

    return (
        <aside className="vehicle-viewer__info">
            {/* 1. Nombre del vehículo y año */}
            <div className="vehicle-viewer__title-group">
                <h1 className="vehicle-viewer__title">{modelName}</h1>
                {year && <span className="vehicle-viewer__year">{year}</span>}
            </div>

            {/* 2. Línea divisoria sutil */}
            <div className="vehicle-viewer__divider" />

            {/* 3. Especificaciones técnicas */}
            <div className="vehicle-viewer__specs">
                {vehicle.specifications.motor && (
                    <div className="vehicle-viewer__spec-row">
                        <span className="vehicle-viewer__spec-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                        </span>
                        <span className="vehicle-viewer__spec-label">Motor</span>
                        <span className="vehicle-viewer__spec-value">{vehicle.specifications.motor}</span>
                    </div>
                )}

                {vehicle.specifications.acceleration && (
                    <div className="vehicle-viewer__spec-row">
                        <span className="vehicle-viewer__spec-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        </span>
                        <span className="vehicle-viewer__spec-label">0-100 km/h</span>
                        <span className="vehicle-viewer__spec-value">{vehicle.specifications.acceleration}</span>
                    </div>
                )}

                {vehicle.specifications.traction && (
                    <div className="vehicle-viewer__spec-row">
                        <span className="vehicle-viewer__spec-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                            </svg>
                        </span>
                        <span className="vehicle-viewer__spec-label">Tracción</span>
                        <span className="vehicle-viewer__spec-value">{vehicle.specifications.traction}</span>
                    </div>
                )}

                {vehicle.specifications.power && (
                    <div className="vehicle-viewer__spec-row">
                        <span className="vehicle-viewer__spec-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                            </svg>
                        </span>
                        <span className="vehicle-viewer__spec-label">Potencia</span>
                        <span className="vehicle-viewer__spec-value">{vehicle.specifications.power}</span>
                    </div>
                )}

                {vehicle.specifications.version && (
                    <div className="vehicle-viewer__spec-row">
                        <span className="vehicle-viewer__spec-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                            </svg>
                        </span>
                        <span className="vehicle-viewer__spec-label">Versión</span>
                        <span className="vehicle-viewer__spec-value">{vehicle.specifications.version}</span>
                    </div>
                )}
            </div>

            {/* 4. Línea divisoria sutil & 5. Sección de precio */}
            {formattedPrice ? (
                <>
                    <div className="vehicle-viewer__divider" />
                    <div className="vehicle-viewer__price-section">
                        <span className="vehicle-viewer__price-label">PRECIO</span>
                        <span className="vehicle-viewer__price-amount">{formattedPrice}</span>
                    </div>
                </>
            ) : (
                <>
                    <div className="vehicle-viewer__divider" />
                    <div className="vehicle-viewer__price-section">
                        <span className="vehicle-viewer__price-label">PRECIO</span>
                        <span className="vehicle-viewer__price-consult">CONSULTAR PRECIO</span>
                    </div>
                </>
            )}

            {/* 6. Botón de contacto WhatsApp */}
            {whatsappUrl && (
                <a
                    className="vehicle-viewer__contact-btn"
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <svg
                        className="vehicle-viewer__contact-icon"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Consultar por este vehículo
                </a>
            )}
        </aside>
    );
}
