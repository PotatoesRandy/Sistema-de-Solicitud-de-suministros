// API Base URL
const API_URL = 'http://localhost:3000';

let solicitudActual = null;
let accionActual = null;
let todasSolicitudes = [];

// Verificar autenticación al cargar
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    window.location.href = '/index.html';
    return;
  }

  // Inicializar dashboard
  cargarPerfil();
  cargarSolicitudesPendientes();
  cargarHistorial();
  
  // Event listeners
  document.getElementById('btnLogout').addEventListener('click', cerrarSesion);
  
  // Navegación del sidebar
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const seccion = item.dataset.section;
      cambiarSeccion(seccion);
      
      if (seccion === 'pendientes') {
        cargarSolicitudesPendientes();
      } else if (seccion === 'historial') {
        cargarHistorial();
      }
    });
  });

  // Filtros de historial
  document.querySelectorAll('.btn-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filtrarHistorial(btn.dataset.filter);
    });
  });
});

// Cambiar sección activa
function cambiarSeccion(seccion) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.section === seccion) {
      item.classList.add('active');
    }
  });
  
  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active');
  });
  document.getElementById(`section-${seccion}`).classList.add('active');
}

// Cargar perfil del usuario
async function cargarPerfil() {
  const token = localStorage.getItem('access_token');
  
  try {
    const response = await fetch(`${API_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      document.getElementById('userName').textContent = data.nombre || data.usuario;
      document.getElementById('profileUsuario').textContent = data.usuario;
      document.getElementById('profileNombre').textContent = data.nombre || 'No especificado';
      document.getElementById('profileRol').textContent = data.rol?.nombre_rol || 'Almacen';
      
      const iniciales = (data.nombre || data.usuario).substring(0, 2).toUpperCase();
      document.getElementById('avatarInitials').textContent = iniciales;
    } else {
      cerrarSesion();
    }
  } catch (error) {
    console.error('Error al cargar perfil:', error);
  }
}

// Cargar solicitudes pendientes
async function cargarSolicitudesPendientes() {
  const token = localStorage.getItem('access_token');
  const container = document.getElementById('solicitudesPendientes');
  
  try {
    const response = await fetch(`${API_URL}/solicitudes/estado/PENDIENTE`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const solicitudes = await response.json();
      
      document.getElementById('statPendiente').textContent = solicitudes.length;
      
      if (solicitudes.length === 0) {
        container.innerHTML = '<p class="loading">No hay solicitudes pendientes</p>';
      } else {
        container.innerHTML = solicitudes.map(sol => `
          <div class="solicitud-card">
            <div class="solicitud-card-header">
              <div>
                <div class="solicitud-numero">#${sol.id_solicitud}</div>
                <div class="solicitud-fecha">${new Date(sol.fecha_creacion).toLocaleDateString('es-DO')}</div>
              </div>
            </div>

            <div class="solicitud-body">
              <div class="solicitud-info">
                <span class="solicitud-label">Articulo/Suministro</span>
                <span class="solicitud-value">${sol.nombre_solicitud}</span>
              </div>

              <div class="solicitud-info">
                <span class="solicitud-label">Cantidad</span>
                <span class="solicitud-value">${sol.cantidad}</span>
              </div>

              <div class="solicitud-info">
                <span class="solicitud-label">Departamento</span>
                <span class="solicitud-value">${sol.departamento_solicitud || 'No especificado'}</span>
              </div>

              <div class="codigo-box">
                <span class="codigo-label">Codigo de Autorizacion</span>
                <div class="codigo-value">${sol.codigo_autorizacion}</div>
              </div>
            </div>

            <div class="solicitud-actions">
              <button class="btn-aprobar" onclick='abrirModalAprobar(${JSON.stringify(sol).replace(/'/g, "&#39;")})'>
                Aprobar
              </button>
              <button class="btn-rechazar" onclick='abrirModalRechazar(${JSON.stringify(sol).replace(/'/g, "&#39;")})'>
                Rechazar
              </button>
            </div>
          </div>
        `).join('');
      }
    } else {
      container.innerHTML = '<p class="loading">Error al cargar solicitudes</p>';
    }
  } catch (error) {
    console.error('Error:', error);
    container.innerHTML = '<p class="loading">Error de conexion</p>';
  }
}

// Cargar historial
async function cargarHistorial() {
  const token = localStorage.getItem('access_token');
  const tbody = document.getElementById('tablaHistorial');
  
  try {
    const response = await fetch(`${API_URL}/solicitudes`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      todasSolicitudes = await response.json();
      mostrarHistorial(todasSolicitudes);
      
      const hoy = new Date().toDateString();
      const aprobadasHoy = todasSolicitudes.filter(s => 
        s.estado.toUpperCase() === 'APROBADA' && 
        new Date(s.fecha_creacion).toDateString() === hoy
      ).length;
      document.getElementById('statAprobadaHoy').textContent = aprobadasHoy;
    } else {
      tbody.innerHTML = '<tr><td colspan="7" class="loading">Error al cargar historial</td></tr>';
    }
  } catch (error) {
    console.error('Error:', error);
    tbody.innerHTML = '<tr><td colspan="7" class="loading">Error de conexion</td></tr>';
  }
}

// Mostrar historial en tabla
function mostrarHistorial(solicitudes) {
  const tbody = document.getElementById('tablaHistorial');
  
  if (solicitudes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="loading">No hay solicitudes</td></tr>';
    return;
  }

  tbody.innerHTML = solicitudes.map(sol => `
    <tr>
      <td>${sol.id_solicitud}</td>
      <td>${sol.codigo_autorizacion}</td>
      <td>${new Date(sol.fecha_creacion).toLocaleDateString('es-DO')}</td>
      <td>${sol.nombre_solicitud}</td>
      <td>${sol.cantidad}</td>
      <td>${sol.usuario_accion || '-'}</td>
      <td><span class="status-badge status-${sol.estado.toLowerCase()}">${sol.estado}</span></td>
    </tr>
  `).join('');
}

// Filtrar historial
function filtrarHistorial(filtro) {
  if (filtro === 'TODAS') {
    mostrarHistorial(todasSolicitudes);
  } else {
    const filtradas = todasSolicitudes.filter(s => s.estado.toUpperCase() === filtro);
    mostrarHistorial(filtradas);
  }
}

// Abrir modal para aprobar
function abrirModalAprobar(solicitud) {
  solicitudActual = solicitud;
  accionActual = 'aprobar';
  
  document.getElementById('modalTitle').textContent = 'Aprobar Solicitud';
  document.getElementById('modalDetalle').innerHTML = `
    <p><strong>Solicitud:</strong> #${solicitud.id_solicitud}</p>
    <p><strong>Articulo:</strong> ${solicitud.nombre_solicitud}</p>
    <p><strong>Cantidad:</strong> ${solicitud.cantidad}</p>
    <p><strong>Departamento:</strong> ${solicitud.departamento_solicitud || 'No especificado'}</p>
  `;
  
  document.getElementById('codigoAutorizacion').value = '';
  document.getElementById('modalError').style.display = 'none';
  document.getElementById('modalAutorizacion').classList.add('active');
  
  const btnConfirmar = document.getElementById('btnConfirmarAccion');
  btnConfirmar.onclick = confirmarAccion;
}

// Abrir modal para rechazar
function abrirModalRechazar(solicitud) {
  solicitudActual = solicitud;
  accionActual = 'rechazar';
  
  document.getElementById('modalTitle').textContent = 'Rechazar Solicitud';
  document.getElementById('modalDetalle').innerHTML = `
    <p><strong>Solicitud:</strong> #${solicitud.id_solicitud}</p>
    <p><strong>Articulo:</strong> ${solicitud.nombre_solicitud}</p>
    <p><strong>Cantidad:</strong> ${solicitud.cantidad}</p>
    <p><strong>Departamento:</strong> ${solicitud.departamento_solicitud || 'No especificado'}</p>
  `;
  
  document.getElementById('codigoAutorizacion').value = '';
  document.getElementById('modalError').style.display = 'none';
  document.getElementById('modalAutorizacion').classList.add('active');
  
  const btnConfirmar = document.getElementById('btnConfirmarAccion');
  btnConfirmar.onclick = confirmarAccion;
}

// Cerrar modal
function cerrarModal() {
  document.getElementById('modalAutorizacion').classList.remove('active');
  solicitudActual = null;
  accionActual = null;
}

// Confirmar accion
async function confirmarAccion() {
  const codigo = document.getElementById('codigoAutorizacion').value.trim().toUpperCase();
  const errorMsg = document.getElementById('modalError');
  
  if (!codigo) {
    errorMsg.textContent = 'Por favor ingrese el codigo de autorizacion';
    errorMsg.style.display = 'block';
    return;
  }

  const token = localStorage.getItem('access_token');
  const endpoint = accionActual === 'aprobar' ? 'aprobar' : 'rechazar';
  
  try {
    const response = await fetch(`${API_URL}/solicitudes/${solicitudActual.id_solicitud}/${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ codigo })
    });

    const data = await response.json();

    if (response.ok) {
      cerrarModal();
      alert(`Solicitud ${accionActual === 'aprobar' ? 'aprobada' : 'rechazada'} exitosamente`);
      cargarSolicitudesPendientes();
      cargarHistorial();
    } else {
      errorMsg.textContent = data.message || 'Codigo de autorizacion invalido';
      errorMsg.style.display = 'block';
    }
  } catch (error) {
    console.error('Error:', error);
    errorMsg.textContent = 'Error de conexion con el servidor';
    errorMsg.style.display = 'block';
  }
}

// Cerrar sesion
function cerrarSesion() {
  localStorage.removeItem('access_token');
  window.location.href = '/index.html';
}
