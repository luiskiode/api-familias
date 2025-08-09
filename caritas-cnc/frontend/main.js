// =======================================================
// Utilidades de UI: secciones
// =======================================================
function showSection(id) {
  // Tu HTML/CSS nuevo usa .seccion + .active
  document.querySelectorAll('.seccion').forEach(sec => sec.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
  else console.warn(`Sección "${id}" no encontrada.`);
}

function goToListado() {
  showSection('listado');
  // Si quieres, aquí puedes disparar la carga de familias
  // loadFamilias();
}

// =======================================================
// Pendientes (Supabase REST)
// Requiere supabaseUrl y supabaseAnonKey definidos en supabase-config.js
// Tabla: public.pendientes  (id, descripcion, estado:boolean)
// =======================================================

async function loadPendientes() {
  const url = `${supabaseUrl}/rest/v1/pendientes?select=id,descripcion,estado&order=id.asc`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      console.error('❌ Error HTTP al cargar pendientes:', res.status, txt);
      showPendientesError('No se pudieron cargar los pendientes.');
      return;
    }

    const data = await res.json();
    renderPendientes(data);
  } catch (err) {
    console.error('❌ Error de red al cargar pendientes:', err);
    showPendientesError('No se pudieron cargar los pendientes (red).');
  }
}

function renderPendientes(items = []) {
  // Soporte a dos layouts:
  // 1) Tabla con id="pendientesTable" y <tbody>
  // 2) Contenedor simple con id="pendientesList"
  const table = document.getElementById('pendientesTable');
  const list = document.getElementById('pendientesList');

  if (table) {
    const tbody = table.querySelector('tbody') || table.appendChild(document.createElement('tbody'));
    tbody.innerHTML = '';
    items.forEach(t => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHTML(t.descripcion ?? '')}</td>
        <td style="text-align:center;">
          <input type="checkbox" ${t.estado ? 'checked' : ''} onchange="togglePendiente(${t.id}, this.checked)">
        </td>
      `;
      tbody.appendChild(tr);
    });
  } else if (list) {
    list.innerHTML = '';
    items.forEach(t => {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.justifyContent = 'space-between';
      row.style.alignItems = 'center';
      row.style.padding = '.4rem 0';
      row.style.borderBottom = '1px solid #e5e5e5';
      row.innerHTML = `
        <span>${escapeHTML(t.descripcion ?? '')}</span>
        <input type="checkbox" ${t.estado ? 'checked' : ''} onchange="togglePendiente(${t.id}, this.checked)">
      `;
      list.appendChild(row);
    });
  } else {
    console.warn('No encontré ni #pendientesTable ni #pendientesList para pintar los pendientes.');
  }
}

async function togglePendiente(id, estado) {
  const url = `${supabaseUrl}/rest/v1/pendientes?id=eq.${id}`;
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify({ estado })
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      console.error('❌ Error HTTP al actualizar pendiente:', res.status, txt);
      alert('No se pudo actualizar la tarea.');
      return;
    }

    // Opcional: refrescar la lista
    // await loadPendientes();
  } catch (err) {
    console.error('❌ Error de red al actualizar pendiente:', err);
    alert('No se pudo actualizar la tarea (red).');
  }
}

// =======================================================
// (Opcional) Familias desde tu API en Render
// =======================================================
// async function loadFamilias() {
//   try {
//     const res = await fetch('https://api-familias.onrender.com/familias');
//     if (!res.ok) throw new Error('HTTP ' + res.status);
//     const data = await res.json();
//     // TODO: pinta tu tabla de familias con "data"
//   } catch (err) {
//     console.error('Error al cargar familias:', err);
//   }
// }

// =======================================================
// Helpers
// =======================================================
function showPendientesError(msg) {
  const errBox = document.getElementById('pendientesError');
  if (errBox) errBox.textContent = msg;
}

function escapeHTML(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// =======================================================
// Inicio
// =======================================================
document.addEventListener('DOMContentLoaded', () => {
  // Cargar pendientes si existe la sección correspondiente
  if (document.getElementById('pendientesTable') || document.getElementById('pendientesList')) {
    loadPendientes();
  }
});
