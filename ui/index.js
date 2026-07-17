import {
  cargarEntradas,
  guardarEntrada,
  actualizarEntrada,
  eliminarEntrada
} from './data-layer.js';
import { initForm, UIForm } from './form.js';
import { renderEntradas } from './render.js';

function setAppStatus(message, kind = 'info') {
  const status = document.getElementById('appStatus');
  if (!status) return;
  status.textContent = message;
  status.dataset.kind = kind;
}

async function refresh(callbacks) {
  const entries = await cargarEntradas();
  renderEntradas(entries, callbacks);
}

document.addEventListener('DOMContentLoaded', async () => {
  const callbacks = {
    onEdit(entry) {
      UIForm.enterEditMode(entry);
    },
    async onDelete(entry) {
      try {
        await eliminarEntrada(entry.id);
        await refresh(callbacks);
        setAppStatus('Registro eliminado.', 'success');
      } catch (error) {
        setAppStatus(`No se pudo eliminar: ${error.message}`, 'error');
      }
    }
  };

  initForm({
    async onSave(payload, editingId) {
      if (editingId) await actualizarEntrada(editingId, payload);
      else await guardarEntrada(payload);
      await refresh(callbacks);
      setAppStatus(editingId ? 'Cambios guardados.' : 'Entrenamiento registrado.', 'success');
    },
    onCancel() {
      setAppStatus('Edición cancelada.');
    }
  });

  try {
    await refresh(callbacks);
  } catch (error) {
    setAppStatus(`No se pudieron cargar los registros: ${error.message}`, 'error');
  }
});
