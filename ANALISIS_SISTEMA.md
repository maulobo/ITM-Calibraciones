# 📑 Informe de Análisis y Evolución del Sistema ITM

## 1. Situación Actual (AS-IS)

El sistema actual funciona como un **registro digital de instrumentos y certificados**, con una estructura jerárquica simple.

### 🏗 Arquitectura Actual
*   **Backend:** NestJS + MongoDB.
*   **Frontend:** Next.js + Tailwind CSS.
*   **Modelo de Datos:** `Cliente` -> `Sucursal` -> `Instrumento`.

### 📦 Funcionalidades Existentes
| Módulo | Alcance Actual | Limitaciones Detectadas |
| :--- | :--- | :--- |
| **Instrumentos** | Registro individual (Serie, Modelo, Vencimiento). Un solo campo de "Estado". | No permite agrupar equipos por ingreso. Estados mezclados (técnico y logístico). |
| **Clientes** | Datos básicos (Razón social, CUIT, Contacto). | Faltan datos comerciales (Condición de pago) y logísticos (Dirección completa). |
| **Presupuestos** | Creación de cotizaciones simples. | Numeración básica. No vinculado al flujo de ingreso de equipos. |
| **Certificados** | Subida de PDF y generación de QR. | Sin trazabilidad del patrón utilizado. |

---

## 2. Requerimientos de Evolución (TO-BE)

El objetivo es transformar el sistema en una **Plataforma de Gestión Integral (ERP de Laboratorio)**, centrada en el flujo de trabajo y no solo en el dato estático.

### 🚨 A. Nuevo Núcleo: "Servicio Técnico" (Orden de Trabajo)
*   **Concepto:** Nueva entidad que agrupa múltiples instrumentos que ingresan juntos (ej: Un cliente envía 5 manómetros en una caja).
*   **Cambios:**
    *   Generación de **Nº de Orden** consecutivo.
    *   **Contacto Específico:** Registro de quién envía el equipo (Nombre, Mail, Teléfono), independiente del contacto comercial.
    *   **Notificaciones Agrupadas:** Un solo email de aviso por todo el lote de equipos.

### 🔄 B. Gestión de Instrumentos Avanzada
*   **Nuevos Campos:**
    *   `Nº de TAG` (Identificación del cliente).
    *   `Link Pipe` (Enlace externo).
    *   `Orden de Compra` (SI/NO/NA).
    *   `Laboratorio`: ITM o Externo (con control de fechas de salida/retorno).
*   **Matriz de Estados (Separación de conceptos):**
    1.  **Estado Técnico:** *Para calibrar, Reparar, Calibrado, Verificado, Fuera de servicio.*
    2.  **Estado Logístico:** *Ingreso, En proceso, Listo para retirar, Retirado, En espera.*
    3.  **Vigencia:** *Vigente, Próximo a vencer, Vencido* (Calculado automático).

### 💰 C. Presupuestos y Ventas
*   **Numeración:** Formato `Año-Numero` (ej: 25-00154).
*   **Estados:** *En espera (Default), Aprobado, Rechazado.*
*   **Automatización:** Heredar "Forma de Pago" del perfil del cliente.
*   **Vinculación:** Poder asociar un presupuesto a un "Servicio Técnico" existente (equipos en taller) o crearlo para venta directa.

### 🚚 D. Nuevos Módulos
1.  **Remitos:**
    *   Generación de documentos de traslado.
    *   Flujo: Selección de equipos en estado "Listo para retirar" -> Generar Remito.
    *   Historial de remitos generados.
2.  **Patrones (Activos de ITM):**
    *   Gestión de equipos propios.
    *   Alertas de vencimiento interno.
    *   **Trazabilidad:** Vincular qué patrón se usó en cada certificado de cliente.
3.  **Alquileres:**
    *   Gestión de flota de alquiler.
    *   Estados: *Disponible, Reservado, Alquilado.*
    *   Control de fechas de devolución.

---

## 3. Puntos Clave para Reunión (Preguntas y Definiciones)

### 📌 Prioridades
*   Confirmar que la creación del **"Servicio Técnico"** es el paso 1, ya que cambia la forma en que se ingresan los equipos al sistema.

### 📌 Definiciones de Negocio
*   **Remitos:** ¿Son solo documentos para imprimir o deben descontar stock/cambiar estados automáticamente?
*   **Migración:** ¿Qué hacemos con los equipos históricos que no tienen "Servicio Técnico" asociado? (¿Se quedan huérfanos o creamos uno genérico?).
*   **Patrones:** ¿Es necesario que el sistema impida emitir un certificado si el patrón usado está vencido? (Regla de validación).

### 📌 Infraestructura
*   Confirmar acceso a AWS para configurar los nuevos templates de email (Notificación agrupada).
