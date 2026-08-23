/**
 * src/scripts/utils.ts
 * Utilidades compartidas del cliente
 */

/**
 * Formatea una fecha ISO a fecha legible en Colombia (es-CO)
 */
export function formatDate(iso: string): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/**
 * Escapa caracteres HTML para prevenir inyección XSS
 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, function(m) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m] || m;
  });
}

/**
 * Muestra notificaciones flotantes de tipo Toast
 */
export function showToast(message: string, type: 'success' | 'error' = 'success') {
  const toastNotification = document.getElementById('toast-notification');
  if (!toastNotification) return;

  toastNotification.textContent = message;
  toastNotification.className = `toast ${type}`;
  toastNotification.classList.remove('hidden');

  setTimeout(() => {
    toastNotification.classList.add('hidden');
  }, 3500);
}
