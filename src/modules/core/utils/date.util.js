/**
 * Formatea una fecha y hora en formato legible
 * @param {Date|string} fecha - Fecha a formatear
 * @returns {string} Fecha formateada como "DD/MM/YYYY HH:MM"
 */
export function formatearFechaHora(fecha) {
    const f = typeof fecha === 'string' ? new Date(fecha) : fecha;

    const dd = String(f.getDate()).padStart(2, '0');
    const mm = String(f.getMonth() + 1).padStart(2, '0');
    const yyyy = f.getFullYear();
    const hh = String(f.getHours()).padStart(2, '0');
    const min = String(f.getMinutes()).padStart(2, '0');

    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}
