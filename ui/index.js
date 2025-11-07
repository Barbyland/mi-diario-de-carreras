// ui/index.js — pegamento UI
import { apiOk } from '../data/api.js';
import {
  cargarEntradas,
  guardarEntrada,
  actualizarEntrada,
  eliminarEntrada
} from './data-layer.js';

function setOrigenText(text) {
  const el = document.getElementById('origenDatos');
  if (el) el.textContent = `Origen de datos: ${text}`;
}

async function refresh(callbacks) {
  const entradas = await cargarEntradas();
  const { renderEntradas } = await import('./render.js');
  renderEntradas(entradas, callbacks);
}

document.addEventListener('DOMContentLoaded', async () => {
  // Origen visible
  const originText = (await apiOk()) ? 'API (entrenamientos)' : 'LocalStorage';
  setOrigenText(originText);

  // Acciones
  const callbacks = {
    onEdit: async (e) => {
      const { UIForm } = await import('./form.js');
      UIForm.enterEditMode(e);
    },
    onDelete: async (e) => {
      await eliminarEntrada(e.id);
      await refresh(callbacks);
    }
  };

  // Form
  const { initForm } = await import('./form.js');
  initForm({
    onSave: async (payload, editingId) => {
      if (editingId) await actualizarEntrada(editingId, payload);
      else           await guardarEntrada(payload);
      await refresh(callbacks);
    },
    onCancel: () => refresh(callbacks)
  });

  // Primera carga
  await refresh(callbacks);
});
