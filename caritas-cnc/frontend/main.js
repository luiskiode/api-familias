// ✅ Mostrar secciones por ID
function showSection(id) {
  const secciones = document.querySelectorAll('.seccion');
  secciones.forEach(sec => sec.classList.add('oculto'));

  const visible = document.getElementById(id);
  if (visible) visible.classList.remove('oculto');
  else console.warn(`Sección "${id}" no encontrada.`);
}

// ✅ Ir al listado
function goToListado() {
  showSection('listado');
  // Puedes aquí cargar los datos desde Supabase si quieres
}

// ✅ Esperar que cargue el DOM antes de asociar eventos (opcional pero recomendado)
document.addEventListener("DOMContentLoaded", () => {
  // Puedes agregar más lógica al cargar
});
