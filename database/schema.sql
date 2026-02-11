-- =====================================================
-- SISTEMA DE SOLICITUD DE SUMINISTROS
-- Base de Datos SQL SERVER (SSMS) - Según Diagrama
-- =====================================================

-- Crear la base de datos
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'sistema_suministros')
BEGIN
    CREATE DATABASE sistema_suministros;
END
GO

USE sistema_suministros;
GO

-- =====================================================
-- CREACIÓN DE TABLAS EXACTAS DEL DIAGRAMA
-- =====================================================

-- Tabla: Departamento
CREATE TABLE Departamento (
    id_departamento INT IDENTITY(1,1) PRIMARY KEY,
    nombre_departamento VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(200),
    responsable VARCHAR(100)
);
GO

-- Tabla: Auditoria
CREATE TABLE Auditoria (
    id_auditoria INT IDENTITY(1,1) PRIMARY KEY,
    tabla_afectada VARCHAR(50) NOT NULL,
    id_registro INT NOT NULL,
    tipo_operacion VARCHAR(10) NOT NULL CHECK (tipo_operacion IN ('INSERT', 'UPDATE', 'DELETE')),
    tipo_entidad VARCHAR(50),
    registro_anterior VARCHAR(MAX),
    registro_nuevo VARCHAR(MAX),
    creado_por VARCHAR(100),
    actualizado_por VARCHAR(100),
    creado_at DATETIME DEFAULT GETDATE(),
    actualizado_at DATETIME DEFAULT GETDATE()
);
GO

-- Tabla: Usuario
CREATE TABLE Usuario (
    id_usuario INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    id_departamento INT NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL,
    CONSTRAINT FK_Usuario_Departamento FOREIGN KEY (id_departamento) 
        REFERENCES Departamento(id_departamento)
);
GO

-- Tabla: Proveedor
CREATE TABLE Proveedor (
    id_proveedor INT IDENTITY(1,1) PRIMARY KEY,
    nombre_proveedor VARCHAR(150) NOT NULL,
    ruc VARCHAR(20),
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion VARCHAR(200)
);
GO

-- Tabla: Producto
CREATE TABLE Producto (
    id_producto INT IDENTITY(1,1) PRIMARY KEY,
    nombre_producto VARCHAR(150) NOT NULL,
    descripcion VARCHAR(MAX),
    unidad_medida VARCHAR(20) NOT NULL,
    codigo VARCHAR(50),
    categoria VARCHAR(50)
);
GO

-- Tabla: Inventario
CREATE TABLE Inventario (
    id_inventario INT IDENTITY(1,1) PRIMARY KEY,
    id_producto INT NOT NULL,
    cantidad_disponible INT NOT NULL DEFAULT 0,
    ubicacion_almacen VARCHAR(100),
    fecha_actualizacion DATETIME,
    CONSTRAINT FK_Inventario_Producto FOREIGN KEY (id_producto) 
        REFERENCES Producto(id_producto)
);
GO

-- Tabla: Proveedor_Producto (Relación N:M)
CREATE TABLE Proveedor_Producto (
    id_proveedor_producto INT IDENTITY(1,1) PRIMARY KEY,
    id_proveedor INT NOT NULL,
    id_producto INT NOT NULL,
    fecha_entrega DATE,
    cantidad INT NOT NULL,
    CONSTRAINT FK_ProveedorProducto_Proveedor FOREIGN KEY (id_proveedor) 
        REFERENCES Proveedor(id_proveedor),
    CONSTRAINT FK_ProveedorProducto_Producto FOREIGN KEY (id_producto) 
        REFERENCES Producto(id_producto)
);
GO

-- Tabla: Solicitud
CREATE TABLE Solicitud (
    id_solicitud INT IDENTITY(1,1) PRIMARY KEY,
    nombre_solicitud VARCHAR(150) NOT NULL,
    cantidad INT NOT NULL,
    departamento_solicitud VARCHAR(100)
);
GO

-- Tabla: Requerimiento
CREATE TABLE Requerimiento (
    id_requerimiento INT IDENTITY(1,1) PRIMARY KEY,
    numero_requerimiento VARCHAR(50) NOT NULL,
    fecha_emision DATE NOT NULL,
    fecha_necesidad DATE NOT NULL,
    id_solicitud INT NOT NULL,
    id_empleado INT NOT NULL,
    id_departamento INT NOT NULL,
    fin_validacion VARCHAR(100),
    CONSTRAINT FK_Requerimiento_Solicitud FOREIGN KEY (id_solicitud) 
        REFERENCES Solicitud(id_solicitud),
    CONSTRAINT FK_Requerimiento_Empleado FOREIGN KEY (id_empleado) 
        REFERENCES Usuario(id_usuario),
    CONSTRAINT FK_Requerimiento_Departamento FOREIGN KEY (id_departamento) 
        REFERENCES Departamento(id_departamento)
);
GO

-- Tabla: Detalle_Requerimiento
CREATE TABLE Detalle_Requerimiento (
    id_detalle INT IDENTITY(1,1) PRIMARY KEY,
    id_requerimiento INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad_solicitada INT NOT NULL,
    hora_entrega TIME,
    CONSTRAINT FK_DetalleReq_Requerimiento FOREIGN KEY (id_requerimiento) 
        REFERENCES Requerimiento(id_requerimiento) ON DELETE CASCADE,
    CONSTRAINT FK_DetalleReq_Producto FOREIGN KEY (id_producto) 
        REFERENCES Producto(id_producto)
);
GO

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

CREATE INDEX idx_usuario_departamento ON Usuario(id_departamento);
CREATE INDEX idx_inventario_producto ON Inventario(id_producto);
CREATE INDEX idx_proveedor_producto_proveedor ON Proveedor_Producto(id_proveedor);
CREATE INDEX idx_proveedor_producto_producto ON Proveedor_Producto(id_producto);
CREATE INDEX idx_requerimiento_solicitud ON Requerimiento(id_solicitud);
CREATE INDEX idx_requerimiento_empleado ON Requerimiento(id_empleado);
CREATE INDEX idx_requerimiento_departamento ON Requerimiento(id_departamento);
CREATE INDEX idx_detalle_requerimiento ON Detalle_Requerimiento(id_requerimiento);
CREATE INDEX idx_detalle_producto ON Detalle_Requerimiento(id_producto);
CREATE INDEX idx_auditoria_tabla_fecha ON Auditoria(tabla_afectada, creado_at);
CREATE INDEX idx_auditoria_usuario ON Auditoria(creado_por);
GO

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger: Auditoría al insertar usuario
CREATE TRIGGER tr_auditoria_usuario_insert
ON Usuario
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO Auditoria (tabla_afectada, id_registro, tipo_operacion, fecha_operacion, nombre_empleado)
    SELECT 'Usuario', i.id_usuario, 'INSERT', GETDATE(), i.nombre
    FROM inserted i;
END;
GO

-- Trigger: Auditoría al actualizar usuario
CREATE TRIGGER tr_auditoria_usuario_update
ON Usuario
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO Auditoria (tabla_afectada, id_registro, tipo_operacion, fecha_operacion, 
                          nombre_empleado, registro_anterior)
    SELECT 
        'Usuario', 
        i.id_usuario, 
        'UPDATE',
        GETDATE(),
        i.nombre,
        'Usuario anterior: ' + d.usuario + ', Rol: ' + d.rol
    FROM inserted i
    INNER JOIN deleted d ON i.id_usuario = d.id_usuario;
END;
GO

-- Trigger: Auditoría al eliminar usuario
CREATE TRIGGER tr_auditoria_usuario_delete
ON Usuario
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO Auditoria (tabla_afectada, id_registro, tipo_operacion, fecha_operacion, nombre_empleado)
    SELECT 'Usuario', d.id_usuario, 'DELETE', GETDATE(), d.nombre
    FROM deleted d;
END;
GO

-- Trigger: Auditoría al insertar solicitud
CREATE TRIGGER tr_auditoria_solicitud_insert
ON Solicitud
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO Auditoria (tabla_afectada, id_registro, tipo_operacion, fecha_operacion)
    SELECT 'Solicitud', i.id_solicitud, 'INSERT', GETDATE()
    FROM inserted i;
END;
GO

-- Trigger: Auditoría al actualizar inventario
CREATE TRIGGER tr_auditoria_inventario_update
ON Inventario
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO Auditoria (tabla_afectada, id_registro, tipo_operacion, fecha_operacion, registro_anterior)
    SELECT 
        'Inventario',
        i.id_inventario,
        'UPDATE',
        GETDATE(),
        'Cantidad anterior: ' + CAST(d.cantidad_disponible AS VARCHAR(10)) + 
        ' -> Nueva: ' + CAST(i.cantidad_disponible AS VARCHAR(10))
    FROM inserted i
    INNER JOIN deleted d ON i.id_inventario = d.id_inventario
    WHERE i.cantidad_disponible <> d.cantidad_disponible;
    
    -- Actualizar fecha_actualizacion
    UPDATE Inventario
    SET fecha_actualizacion = GETDATE()
    FROM Inventario inv
    INNER JOIN inserted i ON inv.id_inventario = i.id_inventario;
END;
GO

-- Trigger: Generar número de requerimiento automático
CREATE TRIGGER tr_generar_numero_requerimiento
ON Requerimiento
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @anio_actual VARCHAR(4) = CAST(YEAR(GETDATE()) AS VARCHAR(4));
    DECLARE @siguiente_num INT;
    
    SELECT @siguiente_num = ISNULL(MAX(CAST(RIGHT(numero_requerimiento, 6) AS INT)), 0) + 1
    FROM Requerimiento
    WHERE numero_requerimiento LIKE 'REQ-' + @anio_actual + '%';
    
    INSERT INTO Requerimiento (numero_requerimiento, fecha_emision, fecha_necesidad, 
                              id_solicitud, id_empleado, id_departamento, fin_validacion)
    SELECT 
        'REQ-' + @anio_actual + '-' + RIGHT('000000' + CAST(@siguiente_num AS VARCHAR(6)), 6),
        fecha_emision,
        fecha_necesidad,
        id_solicitud,
        id_empleado,
        id_departamento,
        fin_validacion
    FROM inserted;
END;
GO

-- Trigger: Auditoría al insertar requerimiento
CREATE TRIGGER tr_auditoria_requerimiento_insert
ON Requerimiento
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO Auditoria (tabla_afectada, id_registro, tipo_operacion, fecha_operacion)
    SELECT 'Requerimiento', i.id_requerimiento, 'INSERT', GETDATE()
    FROM inserted i;
END;
GO

-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS
-- =====================================================

-- Procedimiento: Crear solicitud
CREATE PROCEDURE sp_crear_solicitud
    @p_nombre_solicitud VARCHAR(150),
    @p_cantidad INT,
    @p_departamento VARCHAR(100),
    @p_id_solicitud INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        
        INSERT INTO Solicitud (nombre_solicitud, cantidad, departamento_solicitud)
        VALUES (@p_nombre_solicitud, @p_cantidad, @p_departamento);
        
        SET @p_id_solicitud = SCOPE_IDENTITY();
        
        COMMIT TRANSACTION;
        SELECT 'Solicitud creada exitosamente' AS mensaje, @p_id_solicitud AS id_solicitud;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        SET @p_id_solicitud = -1;
        SELECT 'Error al crear solicitud: ' + ERROR_MESSAGE() AS mensaje;
    END CATCH
END;
GO

-- Procedimiento: Actualizar inventario
CREATE PROCEDURE sp_actualizar_inventario
    @p_id_producto INT,
    @p_cantidad INT,
    @p_tipo_operacion VARCHAR(10), -- 'ENTRADA' o 'SALIDA'
    @p_ubicacion VARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @v_cantidad_actual INT;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Verificar si existe registro en inventario
        SELECT @v_cantidad_actual = cantidad_disponible
        FROM Inventario WITH (UPDLOCK)
        WHERE id_producto = @p_id_producto;
        
        IF @v_cantidad_actual IS NULL
        BEGIN
            -- Crear nuevo registro
            INSERT INTO Inventario (id_producto, cantidad_disponible, ubicacion_almacen, fecha_actualizacion)
            VALUES (@p_id_producto, 
                    CASE WHEN @p_tipo_operacion = 'ENTRADA' THEN @p_cantidad ELSE 0 END, 
                    @p_ubicacion,
                    GETDATE());
            
            SELECT 'Inventario creado exitosamente' AS mensaje;
        END
        ELSE
        BEGIN
            -- Actualizar existente
            IF @p_tipo_operacion = 'ENTRADA'
            BEGIN
                UPDATE Inventario
                SET cantidad_disponible = cantidad_disponible + @p_cantidad,
                    ubicacion_almacen = ISNULL(@p_ubicacion, ubicacion_almacen),
                    fecha_actualizacion = GETDATE()
                WHERE id_producto = @p_id_producto;
                
                SELECT 'Inventario actualizado exitosamente' AS mensaje;
            END
            ELSE
            BEGIN
                IF @v_cantidad_actual >= @p_cantidad
                BEGIN
                    UPDATE Inventario
                    SET cantidad_disponible = cantidad_disponible - @p_cantidad,
                        fecha_actualizacion = GETDATE()
                    WHERE id_producto = @p_id_producto;
                    
                    SELECT 'Inventario actualizado exitosamente' AS mensaje;
                END
                ELSE
                BEGIN
                    ROLLBACK TRANSACTION;
                    SELECT 'Stock insuficiente. Disponible: ' + CAST(@v_cantidad_actual AS VARCHAR(10)) AS mensaje;
                    RETURN;
                END
            END
        END
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        SELECT 'Error al actualizar inventario: ' + ERROR_MESSAGE() AS mensaje;
    END CATCH
END;
GO

-- Procedimiento: Crear requerimiento
CREATE PROCEDURE sp_crear_requerimiento
    @p_fecha_necesidad DATE,
    @p_id_solicitud INT,
    @p_id_empleado INT,
    @p_id_departamento INT,
    @p_fin_validacion VARCHAR(100) = NULL,
    @p_id_requerimiento INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- El trigger generará automáticamente el numero_requerimiento
        INSERT INTO Requerimiento (fecha_emision, fecha_necesidad, id_solicitud, 
                                  id_empleado, id_departamento, fin_validacion)
        VALUES (GETDATE(), @p_fecha_necesidad, @p_id_solicitud, 
                @p_id_empleado, @p_id_departamento, @p_fin_validacion);
        
        SET @p_id_requerimiento = SCOPE_IDENTITY();
        
        COMMIT TRANSACTION;
        SELECT 'Requerimiento creado exitosamente' AS mensaje, @p_id_requerimiento AS id_requerimiento;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        SET @p_id_requerimiento = -1;
        SELECT 'Error al crear requerimiento: ' + ERROR_MESSAGE() AS mensaje;
    END CATCH
END;
GO

-- Procedimiento: Agregar detalle a requerimiento
CREATE PROCEDURE sp_agregar_detalle_requerimiento
    @p_id_requerimiento INT,
    @p_id_producto INT,
    @p_cantidad_solicitada INT,
    @p_hora_entrega TIME = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        INSERT INTO Detalle_Requerimiento (id_requerimiento, id_producto, cantidad_solicitada, hora_entrega)
        VALUES (@p_id_requerimiento, @p_id_producto, @p_cantidad_solicitada, @p_hora_entrega);
        
        COMMIT TRANSACTION;
        SELECT 'Detalle agregado exitosamente' AS mensaje;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        SELECT 'Error al agregar detalle: ' + ERROR_MESSAGE() AS mensaje;
    END CATCH
END;
GO

-- Procedimiento: Registrar relación proveedor-producto
CREATE PROCEDURE sp_registrar_proveedor_producto
    @p_id_proveedor INT,
    @p_id_producto INT,
    @p_cantidad INT,
    @p_fecha_entrega DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Verificar si ya existe la relación
        IF EXISTS (SELECT 1 FROM Proveedor_Producto 
                   WHERE id_proveedor = @p_id_proveedor 
                   AND id_producto = @p_id_producto)
        BEGIN
            -- Actualizar
            UPDATE Proveedor_Producto
            SET cantidad = @p_cantidad,
                fecha_entrega = ISNULL(@p_fecha_entrega, fecha_entrega)
            WHERE id_proveedor = @p_id_proveedor 
            AND id_producto = @p_id_producto;
            
            SELECT 'Relación proveedor-producto actualizada' AS mensaje;
        END
        ELSE
        BEGIN
            -- Insertar
            INSERT INTO Proveedor_Producto (id_proveedor, id_producto, cantidad, fecha_entrega)
            VALUES (@p_id_proveedor, @p_id_producto, @p_cantidad, @p_fecha_entrega);
            
            SELECT 'Relación proveedor-producto registrada' AS mensaje;
        END
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        SELECT 'Error al registrar relación: ' + ERROR_MESSAGE() AS mensaje;
    END CATCH
END;
GO

-- Procedimiento: Consultar inventario de un producto
CREATE PROCEDURE sp_consultar_inventario
    @p_id_producto INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        p.id_producto,
        p.nombre_producto,
        p.codigo,
        p.descripcion,
        p.unidad_medida,
        p.categoria,
        ISNULL(i.cantidad_disponible, 0) AS cantidad_disponible,
        i.ubicacion_almacen,
        i.fecha_actualizacion
    FROM Producto p
    LEFT JOIN Inventario i ON p.id_producto = i.id_producto
    WHERE p.id_producto = @p_id_producto;
END;
GO

-- Procedimiento: Obtener requerimientos de una solicitud
CREATE PROCEDURE sp_obtener_requerimientos_solicitud
    @p_id_solicitud INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        r.id_requerimiento,
        r.numero_requerimiento,
        r.fecha_emision,
        r.fecha_necesidad,
        r.fin_validacion,
        u.nombre AS empleado_solicita,
        d.nombre_departamento,
        s.nombre_solicitud,
        s.cantidad AS cantidad_solicitud
    FROM Requerimiento r
    INNER JOIN Usuario u ON r.id_empleado = u.id_usuario
    INNER JOIN Departamento d ON r.id_departamento = d.id_departamento
    INNER JOIN Solicitud s ON r.id_solicitud = s.id_solicitud
    WHERE r.id_solicitud = @p_id_solicitud;
END;
GO

-- Procedimiento: Obtener detalle de requerimiento
CREATE PROCEDURE sp_obtener_detalle_requerimiento
    @p_id_requerimiento INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        dr.id_detalle,
        dr.id_requerimiento,
        p.id_producto,
        p.nombre_producto,
        p.codigo,
        p.unidad_medida,
        dr.cantidad_solicitada,
        dr.hora_entrega
    FROM Detalle_Requerimiento dr
    INNER JOIN Producto p ON dr.id_producto = p.id_producto
    WHERE dr.id_requerimiento = @p_id_requerimiento;
END;
GO

-- =====================================================
-- DATOS DE PRUEBA
-- =====================================================

-- Insertar departamentos
INSERT INTO Departamento (nombre_departamento, ubicacion, responsable) VALUES
('Recursos Humanos', 'Edificio A - Piso 1', 'María González'),
('Tecnología', 'Edificio B - Piso 3', 'Carlos Méndez'),
('Administración', 'Edificio A - Piso 2', 'Ana Rodríguez'),
('Operaciones', 'Edificio C - Piso 1', 'Luis Martínez');
GO

-- Insertar usuarios
INSERT INTO Usuario (nombre, usuario, id_departamento, contrasena, rol) VALUES
('Juan Pérez', 'jperez', 1, 'password123', 'Administrador'),
('María López', 'mlopez', 2, 'password123', 'Empleado'),
('Carlos Ruiz', 'cruiz', 3, 'password123', 'Gerente'),
('Ana Torres', 'atorres', 4, 'password123', 'Almacenista');
GO

-- Insertar proveedores
INSERT INTO Proveedor (nombre_proveedor, ruc, telefono, email, direccion) VALUES
('Suministros Oficina S.A.', '20123456789', '555-0001', 'ventas@suministros.com', 'Av. Principal 123'),
('Tech Solutions', '20987654321', '555-0002', 'info@techsolutions.com', 'Calle Comercio 456'),
('Papelería Central', '20456789123', '555-0003', 'contacto@papeleria.com', 'Jr. Los Olivos 789');
GO

-- Insertar productos
INSERT INTO Producto (nombre_producto, descripcion, unidad_medida, codigo, categoria) VALUES
('Papel Bond A4', 'Papel bond blanco de 75g', 'Paquete', 'PAP-001', 'Papelería'),
('Lapiceros Azules', 'Caja de 50 lapiceros azules', 'Caja', 'LAP-001', 'Útiles'),
('Toner HP LaserJet', 'Toner original HP 85A', 'Unidad', 'TON-001', 'Consumibles'),
('Archivadores', 'Archivador lomo ancho', 'Unidad', 'ARC-001', 'Oficina'),
('Mouse Inalámbrico', 'Mouse inalámbrico USB', 'Unidad', 'INF-001', 'Tecnología');
GO

-- Insertar inventario
INSERT INTO Inventario (id_producto, cantidad_disponible, ubicacion_almacen, fecha_actualizacion) VALUES
(1, 75, 'Almacén Principal - A1', GETDATE()),
(2, 35, 'Almacén Principal - A2', GETDATE()),
(3, 12, 'Almacén Principal - B1', GETDATE()),
(4, 45, 'Almacén Principal - A3', GETDATE()),
(5, 20, 'Almacén Principal - C1', GETDATE());
GO

-- Insertar relación proveedor-producto
INSERT INTO Proveedor_Producto (id_proveedor, id_producto, cantidad, fecha_entrega) VALUES
(1, 1, 1000, '2025-11-15'),
(1, 2, 500, '2025-11-15'),
(1, 4, 800, '2025-11-20'),
(2, 3, 100, '2025-11-18'),
(2, 5, 200, '2025-11-18'),
(3, 1, 800, '2025-11-25');
GO

-- Insertar solicitudes
INSERT INTO Solicitud (nombre_solicitud, cantidad, departamento_solicitud) VALUES
('Solicitud de papelería para RRHH', 50, 'Recursos Humanos'),
('Equipos informáticos urgentes', 5, 'Tecnología'),
('Material de oficina mensual', 100, 'Administración');
GO

-- =====================================================
-- EJEMPLOS DE USO
-- =====================================================

/*
-- Crear una solicitud
DECLARE @id_solicitud INT;
EXEC sp_crear_solicitud 
    @p_nombre_solicitud = 'Solicitud de útiles', 
    @p_cantidad = 25, 
    @p_departamento = 'Finanzas',
    @p_id_solicitud = @id_solicitud OUTPUT;

-- Crear un requerimiento
DECLARE @id_req INT;
EXEC sp_crear_requerimiento 
    @p_fecha_necesidad = '2025-12-01',
    @p_id_solicitud = 1,
    @p_id_empleado = 2,
    @p_id_departamento = 1,
    @p_id_requerimiento = @id_req OUTPUT;

-- Agregar detalle al requerimiento
EXEC sp_agregar_detalle_requerimiento 
    @p_id_requerimiento = 1,
    @p_id_producto = 1,
    @p_cantidad_solicitada = 10;

-- Actualizar inventario (entrada)
EXEC sp_actualizar_inventario 
    @p_id_producto = 1,
    @p_cantidad = 50,
    @p_tipo_operacion = 'ENTRADA',
    @p_ubicacion = 'Almacén A';

-- Actualizar inventario (salida)
EXEC sp_actualizar_inventario 
    @p_id_producto = 1,
    @p_cantidad = 10,
    @p_tipo_operacion = 'SALIDA';

-- Consultar inventario
EXEC sp_consultar_inventario @p_id_producto = 1;

-- Ver auditoría
SELECT * FROM Auditoria ORDER BY fecha_operacion DESC;
*/

PRINT 'Base de datos creada exitosamente con todas las tablas, triggers y procedimientos';
GO

USE sistema_suministros;
GO

-- Renombrar la tabla Solicitud a solicitudes
EXEC sp_rename 'Solicitud', 'solicitudes';
GO

-- Actualizar los triggers relacionados
-- Trigger de auditoría al insertar solicitud
EXEC sp_rename 'tr_auditoria_solicitud_insert', 'tr_auditoria_solicitudes_insert';
GO
ALTER TRIGGER tr_auditoria_solicitudes_insert
ON solicitudes
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO Auditoria (tabla_afectada, id_registro, tipo_operacion, fecha_operacion)
    SELECT 'solicitudes', i.id_solicitud, 'INSERT', GETDATE()
    FROM inserted i;
END;
GO


ALTER TRIGGER tr_auditoria_solicitudes_insert
ON solicitudes
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO Auditoria (tabla_afectada, id_registro, tipo_operacion, creado_at)
    SELECT 'solicitudes', i.id_solicitud, 'INSERT', GETDATE()
    FROM inserted i;
END;
GO


-- Actualizar los procedimientos almacenados que usen la tabla Solicitud
-- Ejemplo: sp_crear_solicitud
ALTER PROCEDURE sp_crear_solicitud
    @p_nombre_solicitud VARCHAR(150),
    @p_cantidad INT,
    @p_departamento VARCHAR(100),
    @p_id_solicitud INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        
        INSERT INTO solicitudes (nombre_solicitud, cantidad, departamento_solicitud)
        VALUES (@p_nombre_solicitud, @p_cantidad, @p_departamento);
        
        SET @p_id_solicitud = SCOPE_IDENTITY();
        
        COMMIT TRANSACTION;
        SELECT 'Solicitud creada exitosamente' AS mensaje, @p_id_solicitud AS id_solicitud;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        SET @p_id_solicitud = -1;
        SELECT 'Error al crear solicitud: ' + ERROR_MESSAGE() AS mensaje;
    END CATCH
END;
GO

-- Actualizar procedimientos que referencien la tabla en joins, por ejemplo:
-- sp_obtener_requerimientos_solicitud
ALTER PROCEDURE sp_obtener_requerimientos_solicitud
    @p_id_solicitud INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        r.id_requerimiento,
        r.numero_requerimiento,
        r.fecha_emision,
        r.fecha_necesidad,
        r.fin_validacion,
        u.nombre AS empleado_solicita,
        d.nombre_departamento,
        s.nombre_solicitud,
        s.cantidad AS cantidad_solicitud
    FROM Requerimiento r
    INNER JOIN Usuario u ON r.id_empleado = u.id_usuario
    INNER JOIN Departamento d ON r.id_departamento = d.id_departamento
    INNER JOIN solicitudes s ON r.id_solicitud = s.id_solicitud
    WHERE r.id_solicitud = @p_id_solicitud;
END;
GO




