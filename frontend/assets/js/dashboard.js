// API Base URL
const API_URL = 'http://localhost:3000';

// Verificar autenticación al cargar
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    window.location.href = '/index.html';
    return;
  }

  // Inicializar dashboard
  cargarPerfil();
  cargarSolicitudes();
  
  // Event listeners
  document.getElementById('btnLogout').addEventListener('click', cerrarSesion);
  document.getElementById('btnNuevaSolicitud').addEventListener('click', () => {
    cambiarSeccion('nueva');
  });
  document.getElementById('btnCancelar').addEventListener('click', () => {
    cambiarSeccion('solicitudes');
  });
  document.getElementById('formNuevaSolicitud').addEventListener('submit', enviarSolicitud);
  
  // Navegación del sidebar
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const seccion = item.dataset.section;
      cambiarSeccion(seccion);
    });
  });
});

// Cambiar sección activa
function cambiarSeccion(seccion) {
  // Actualizar navegación
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.section === seccion) {
      item.classList.add('active');
    }
  });
  
  // Actualizar contenido
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
      
      // Actualizar navbar
      document.getElementById('userName').textContent = data.nombre || data.usuario;
      
      // Actualizar perfil
      document.getElementById('profileUsuario').textContent = data.usuario;
      document.getElementById('profileNombre').textContent = data.nombre || 'No especificado';
      document.getElementById('profileEmail').textContent = data.email || 'No especificado';
      document.getElementById('profileRol').textContent = data.rol?.nombre_rol || 'Usuario';
      
      // Actualizar avatar con iniciales
      const iniciales = (data.nombre || data.usuario).substring(0, 2).toUpperCase();
      document.getElementById('avatarInitials').textContent = iniciales;
    } else {
      cerrarSesion();
    }
  } catch (error) {
    console.error('Error al cargar perfil:', error);
  }
}

// Cargar solicitudes
async function cargarSolicitudes() {
  const token = localStorage.getItem('access_token');
  const tbody = document.getElementById('tablaSolicitudes');
  
  try {
    const response = await fetch(`${API_URL}/solicitudes`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const solicitudes = await response.json();
      
      if (solicitudes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading">No hay solicitudes registradas</td></tr>';
      } else {
        tbody.innerHTML = solicitudes.map(sol => `
          <tr>
            <td>${sol.id_solicitud}</td>
            <td>${sol.fecha_creacion ? new Date(sol.fecha_creacion).toLocaleDateString('es-DO') : '-'}</td>
            <td>${sol.nombre_solicitud || '-'}</td>
            <td>${sol.cantidad || '-'}</td>
            <td>${sol.departamento_solicitud || '-'}</td>
            <td><span class="status-badge status-${sol.estado.toLowerCase()}">${sol.estado}</span></td>
            <td>
              <button class="btn-view" onclick="verDetalle(${sol.id_solicitud})">Ver</button>
            </td>
          </tr>
        `).join('');
      }
      
      // Actualizar estadísticas
      actualizarEstadisticas(solicitudes);
    } else {
      tbody.innerHTML = '<tr><td colspan="7" class="loading">Error al cargar solicitudes</td></tr>';
    }
  } catch (error) {
    console.error('Error al cargar solicitudes:', error);
    tbody.innerHTML = '<tr><td colspan="7" class="loading">Error de conexión</td></tr>';
  }
}

// Actualizar estadísticas
function actualizarEstadisticas(solicitudes) {
  const total = solicitudes.length;
  const pendientes = solicitudes.filter(s => s.estado.toUpperCase() === 'PENDIENTE').length;
  const aprobadas = solicitudes.filter(s => s.estado.toUpperCase() === 'APROBADA' || s.estado.toUpperCase() === 'APROBADO').length;
  const rechazadas = solicitudes.filter(s => s.estado.toUpperCase() === 'RECHAZADA' || s.estado.toUpperCase() === 'RECHAZADO').length;
  
  document.getElementById('statTotal').textContent = total;
  document.getElementById('statPendiente').textContent = pendientes;
  document.getElementById('statAprobada').textContent = aprobadas;
  document.getElementById('statRechazada').textContent = rechazadas;
}

// Enviar nueva solicitud
async function enviarSolicitud(e) {
  e.preventDefault();
  
  const token = localStorage.getItem('access_token');
  const nombre_solicitud = document.getElementById('nombre_solicitud').value;
  const cantidad = parseInt(document.getElementById('cantidad').value);
  const departamento_solicitud = document.getElementById('departamento_solicitud').value;
  const errorMsg = document.getElementById('formError');
  const successMsg = document.getElementById('formSuccess');
  
  errorMsg.style.display = 'none';
  successMsg.style.display = 'none';
  
  // Validar campos requeridos
  if (!nombre_solicitud || !cantidad) {
    errorMsg.textContent = 'Por favor complete todos los campos requeridos';
    errorMsg.style.display = 'block';
    return;
  }

  const payload = {
    nombre_solicitud: nombre_solicitud.trim(),
    cantidad: cantidad,
    departamento_solicitud: departamento_solicitud.trim() || undefined
  };

  console.log('Enviando solicitud:', payload);
  
  try {
    const response = await fetch(`${API_URL}/solicitudes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('Respuesta del servidor:', data);

    if (response.ok) {
      successMsg.textContent = 'Solicitud creada exitosamente';
      successMsg.style.display = 'block';
      
      // Limpiar formulario
      document.getElementById('formNuevaSolicitud').reset();
      
      // Recargar solicitudes
      setTimeout(() => {
        cambiarSeccion('solicitudes');
        cargarSolicitudes();
      }, 1500);
    } else {
      errorMsg.textContent = data.message || 'Error al crear la solicitud';
      errorMsg.style.display = 'block';
    }
  } catch (error) {
    console.error('Error en la solicitud:', error);
    errorMsg.textContent = 'Error de conexión con el servidor';
    errorMsg.style.display = 'block';
  }
}

// Ver detalle de solicitud
function verDetalle(id) {
  alert(`Ver detalle de solicitud #${id}\n\nEsta funcionalidad se implementará próximamente.`);
}

// Cerrar sesión
function cerrarSesion() {
  localStorage.removeItem('access_token');
  window.location.href = '/index.html';
}
