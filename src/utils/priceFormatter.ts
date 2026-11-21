import type { VehiclePrice } from '../engine/vehicles/VehicleData';

/**
 * Formatea un objeto VehiclePrice utilizando Intl.NumberFormat.
 * Ejemplos:
 * - USD: US$ 40.000
 * - ARS: $ 40.000
 */
export function formatVehiclePrice(price: VehiclePrice | null): string | null {
    if (!price || typeof price.amount !== 'number') {
        return null;
    }

    const formatter = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: price.currency,
        maximumFractionDigits: 0,
    });

    const formatted = formatter.format(price.amount);

    if (price.currency === 'USD') {
        return formatted.replace('USD', 'US$').trim();
    }

    return formatted;
}
