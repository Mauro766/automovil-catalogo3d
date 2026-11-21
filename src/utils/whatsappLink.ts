import { CONTACT_CONFIG } from '../config/contact';

/**
 * Genera la URL de WhatsApp con un mensaje pre-completado
 * para consultar por un vehículo específico.
 *
 * Si no hay número configurado, devuelve null.
 */
export function buildWhatsAppLink(vehicleName: string): string | null {
    const { whatsappNumber } = CONTACT_CONFIG;

    if (!whatsappNumber) {
        return null;
    }

    const message = `Hola, estoy interesado en el ${vehicleName}. ¿Podrían informarme sobre disponibilidad y precio? Gracias.`;

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
