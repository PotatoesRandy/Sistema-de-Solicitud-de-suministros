ALTER TABLE solicitudes
ADD codigo_autorizacion VARCHAR(50) NOT NULL DEFAULT '';

-- Generar códigos para solicitudes existentes
UPDATE solicitudes
SET codigo_autorizacion = CONCAT(
    CONVERT(VARCHAR, id_solicitud), 
    '-', 
    SUBSTRING(CONVERT(VARCHAR(36), NEWID()), 1, 8)
)
WHERE codigo_autorizacion = '' OR codigo_autorizacion IS NULL;

-- Hacer la columna única después de llenarla
ALTER TABLE solicitudes
ADD CONSTRAINT UQ_codigo_autorizacion UNIQUE (codigo_autorizacion);
