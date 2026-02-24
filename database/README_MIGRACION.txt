=====================================
 ParkSystem Pro — Guía de Migración
 Compatible con XAMPP + MySQL + phpMyAdmin
=====================================

REQUISITOS PREVIOS:
- XAMPP instalado (https://www.apachefriends.org/)
- Apache y MySQL activos en el panel de control de XAMPP

=====================================
PASO 1: Copiar proyecto al servidor
=====================================

1. Abrir la carpeta de instalación de XAMPP:
   - Windows: C:\xampp\htdocs\
   - Mac: /Applications/XAMPP/htdocs/
   - Linux: /opt/lampp/htdocs/

2. Crear una carpeta llamada "parksystem" dentro de htdocs.

3. Copiar TODOS los archivos del proyecto dentro de esa carpeta:
   C:\xampp\htdocs\parksystem\

=====================================
PASO 2: Importar base de datos
=====================================

1. Abrir XAMPP Control Panel.

2. Iniciar los servicios:
   - Hacer clic en "Start" en Apache
   - Hacer clic en "Start" en MySQL

3. Abrir phpMyAdmin:
   - Ir al navegador: http://localhost/phpmyadmin

4. Importar schema.sql:
   a. Clic en la pestaña "Importar" (arriba)
   b. Clic en "Seleccionar archivo"
   c. Buscar y seleccionar: database/schema.sql
   d. Clic en "Continuar" o "Go"
   e. Debe aparecer: "La importación se realizó exitosamente"

5. Importar seed.sql (datos iniciales, OPCIONAL):
   a. En el panel izquierdo, seleccionar la base de datos "parksystem_pro"
   b. Clic en la pestaña "Importar"
   c. Seleccionar archivo: database/seed.sql
   d. Clic en "Continuar"

=====================================
PASO 3: Configurar conexión PHP (si aplica)
=====================================

Si se implementa backend PHP, crear archivo de conexión:

Archivo: config/database.php

<?php
$host = 'localhost';
$dbname = 'parksystem_pro';
$username = 'root';        // usuario por defecto en XAMPP
$password = '';             // sin contraseña por defecto en XAMPP

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    die("Error de conexión: " . $e->getMessage());
}
?>

=====================================
PASO 4: Verificar funcionamiento
=====================================

1. Asegurar que Apache y MySQL están corriendo en XAMPP.

2. Abrir el navegador web.

3. Ir a: http://localhost/parksystem

4. El sistema debe cargar correctamente.

=====================================
PASO 5: Verificar base de datos
=====================================

1. Ir a: http://localhost/phpmyadmin

2. En el panel izquierdo, hacer clic en "parksystem_pro"

3. Verificar que existen las siguientes tablas:
   - configuracion
   - tarifas
   - vehiculos
   - ingresos
   - salidas
   - pagos
   - mensualidades
   - mensualidad_pagos

4. Hacer clic en cada tabla para verificar su estructura.

=====================================
ESTRUCTURA DE TABLAS
=====================================

configuracion    → Configuración general (nombre, gracia, recibos)
tarifas          → Precios por tipo vehículo y tipo cobro
vehiculos        → Registro maestro de vehículos
ingresos         → Entradas de vehículos al parqueadero
salidas          → Salidas con cálculo de tarifa
pagos            → Todos los pagos (hora, día, mensual)
mensualidades    → Suscripciones mensuales activas
mensualidad_pagos → Historial de pagos mensuales

=====================================
NOTAS IMPORTANTES
=====================================

- La contraseña de MySQL en XAMPP por defecto está vacía.
- Si cambió la contraseña, actualizar en config/database.php
- El charset es utf8mb4 para soporte completo de caracteres.
- Hacer backup periódico: phpMyAdmin > Exportar > SQL
- Para producción, CAMBIAR las credenciales por defecto.

=====================================
SOPORTE
=====================================

Si tiene problemas:
1. Verificar que Apache y MySQL están activos en XAMPP
2. Revisar los logs en: C:\xampp\mysql\data\*.err
3. Asegurar que el puerto 3306 no está ocupado por otro servicio
4. Probar la conexión directamente en phpMyAdmin

=====================================
