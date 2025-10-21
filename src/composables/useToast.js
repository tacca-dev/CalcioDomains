import { ref } from 'vue'

// Stato globale per i toast
const toasts = ref([])
let toastId = 0

export function useToast() {
  /**
   * Mostra un toast
   * @param {Object} options - { message, type, duration }
   */
  function showToast({ message, type = 'info', duration = 4000 }) {
    const id = toastId++
    const toast = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      visible: true
    }

    toasts.value.push(toast)

    // Rimuovi automaticamente dopo duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }

  /**
   * Rimuovi un toast
   */
  function removeToast(id) {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  /**
   * Shortcut per toast di successo
   */
  function success(message, duration) {
    return showToast({ message, type: 'success', duration })
  }

  /**
   * Shortcut per toast di errore
   */
  function error(message, duration) {
    return showToast({ message, type: 'error', duration })
  }

  /**
   * Shortcut per toast di warning
   */
  function warning(message, duration) {
    return showToast({ message, type: 'warning', duration })
  }

  /**
   * Shortcut per toast informativo
   */
  function info(message, duration) {
    return showToast({ message, type: 'info', duration })
  }

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info
  }
}
