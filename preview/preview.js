// preview.js - Carga JSON estático y renderiza una vista previa estilo dashboard
 //(mock) para mostrar cómo se verían las tarjetas
document.addEventListener('DOMContentLoaded', async () => {
    const ui = {
      stats: document.getElementById('stats'),
      cards: document.getElementById('cards'),
      error: document.getElementById('preview-error')
    };
  
    try {
      const res = await fetch('data/mock_diario.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('No se pudo cargar mock_diario.json');
      const data = await res.json();
      renderPreview(data, ui);
    } catch (err) {
      if (ui.error) {
        ui.error.textContent = `⚠️ No pude leer el JSON: ${err.message}`;
        ui.error.classList.remove('hidden');
      }
      console.error('Error fetch mock:', err);
    }    
  });
  
  function renderPreview(data, ui) {
    const usuario = data.usuario;
    const entrenamientos = (data.entrenamientos || []).filter(e => e.usuario_id === usuario.id);
    const emociones = indexBy(data.emociones || [], 'entrenamiento_id');
    const ciclo = indexBy(data.ciclo_menstrual || [], 'entrenamiento_id');
    const alimentacion = indexBy(data.alimentacion || [], 'entrenamiento_id');
  
    // 1) Stats / KPIs (ejemplo de "cómo lo vas a procesar")
    const totalKm = sum(entrenamientos.map(e => e.distancia_km || 0));
    const totalSesiones = entrenamientos.length;
    const porTipo = countBy(entrenamientos.map(e => e.tipo || 'Otro'));
    const ritmos = entrenamientos
      .map(e => e.distancia_km > 0 ? hhmmssToMin(e.duracion) / e.distancia_km : null)
      .filter(x => Number.isFinite(x));
    const ritmoProm = ritmos.length ? (ritmos.reduce((a,b) => a+b, 0) / ritmos.length) : null;
    const nivelesEmo = Object.values(emociones).map(e => e.nivel).filter(Number.isFinite);
    const emoProm = nivelesEmo.length ? (nivelesEmo.reduce((a,b)=>a+b,0)/nivelesEmo.length) : null;
  
    ui.stats.innerHTML = `
      <div class="stats-grid">
        <div class="stat"><span class="label">Total km</span><span class="value">${totalKm.toFixed(1)}</span></div>
        <div class="stat"><span class="label">Sesiones</span><span class="value">${totalSesiones}</span></div>
        <div class="stat"><span class="label">Ritmo prom.</span><span class="value">${ritmoProm ? minToPace(ritmoProm) + ' /km' : '—'}</span></div>
        <div class="stat"><span class="label">Ánimo prom.</span><span class="value">${emoProm ? emoProm.toFixed(1) + '/10' : '—'}</span></div>
      </div>
      <div class="chips">
        ${Object.entries(porTipo).map(([tipo, n]) => `<span class="chip">${tipo}: ${n}</span>`).join('')}
      </div>
    `;
  
    // 2) Cards con joins (emociones, ciclo, alimentación por entrenamiento)
    const df = new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' });
    const ordered = [...entrenamientos].sort((a, b) => (b.fecha||'').localeCompare(a.fecha||''));
  
    ui.cards.innerHTML = ordered.map(ent => {
      const emo = emociones[ent.id];
      const cm = ciclo[ent.id];
      const ali = alimentacion[ent.id];
  
      const ritmo = ent.distancia_km > 0 ? minToPace(hhmmssToMin(ent.duracion)/ent.distancia_km) : '—';
      return `
        <article class="card">
          <header class="card-header">
            <div>
              <h3>${escapeHtml(ent.tipo || 'Actividad')}</h3>
              <p class="muted">${df.format(new Date(ent.fecha))}</p>
            </div>
            <span class="badge">${escapeHtml(ent.sentimiento || '')}</span>
          </header>
          <div class="card-body">
            <ul class="kv">
              <li><strong>Distancia:</strong> ${num(ent.distancia_km)} km</li>
              <li><strong>Duración:</strong> ${escapeHtml(ent.duracion || '—')}</li>
              <li><strong>Ritmo:</strong> ${ritmo} /km</li>
              <li><strong>Clima:</strong> ${escapeHtml(ent.clima || '—')}</li>
            </ul>
            ${ent.descripcion ? `<p class="desc">${escapeHtml(ent.descripcion)}</p>` : ''}
            ${emo ? `<div class="subcard"><strong>Emoción:</strong> ${escapeHtml(emo.emocion)} <span class="muted">(${emo.nivel}/10)</span><br>${emo.comentario ? `<span class="muted">${escapeHtml(emo.comentario)}</span>` : ''}</div>` : ''}
            ${cm ? `<div class="subcard"><strong>Ciclo:</strong> ${escapeHtml(cm.fase)} <span class="muted">energía ${cm.energia_nivel}/10</span><br>${cm.sintomas ? `<span class="muted">${escapeHtml(cm.sintomas)}</span>` : ''}</div>` : ''}
            ${ali ? `<div class="subcard"><strong>Alimentación ${escapeHtml(ali.momento)}:</strong> ${escapeHtml(ali.comida)}<br>${ali.sensacion_post ? `<span class="muted">${escapeHtml(ali.sensacion_post)}</span>` : ''}</div>` : ''}
          </div>
        </article>
      `;
    }).join('');
  }
  
  // Helpers
  function hhmmssToMin(hhmmss) {
    if (!hhmmss) return NaN;
    const [hh='0', mm='0', ss='0'] = hhmmss.split(':').map(x => parseInt(x, 10));
    return hh*60 + mm + (ss/60);
  }  

  function minToPace(min) {
    const m = Math.floor(min);
    const s = Math.round((min - m) * 60);
    return `${m}:${String(s).padStart(2,'0')}`;
  }
  function sum(arr){ return arr.reduce((a,b)=>a+(b||0),0); }
  function countBy(arr){ return arr.reduce((acc, x)=> (acc[x]=(acc[x]||0)+1, acc), {}); }
  function indexBy(arr, key){ const out = {}; arr.forEach(o => { if (o && o[key] != null) out[o[key]] = o; }); return out; }
  function num(x){ return (Number(x)||0).toFixed(2).replace(/\.00$/, ''); }
  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m]);
  }
  
  