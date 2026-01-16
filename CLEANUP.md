# 🗑️ Archivos Obsoletos - Limpieza Post-Refactoring

Los siguientes archivos fueron migrados a la nueva estructura modular y **ya NO se utilizan**:

## ❌ Archivos para Eliminar

### 📁 `src/utils/` - **ELIMINAR TODA LA CARPETA**
Todos los archivos fueron migrados:
- ✅ `utils/auth.js` → `modules/auth/services/auth.service.js`
- ✅ `utils/Fecha.js` → `modules/core/utils/date.util.js`
- ✅ `utils/fetchProductos.js` → `modules/products/repositories/products.repository.js`
- ✅ `utils/generarPresupuesto.js` → `modules/documents/services/presupuesto.service.js`
- ✅ `utils/generarRemito.js` → `modules/documents/services/remito.service.js`
- ✅ `utils/generarSeguro.js` → `modules/documents/services/seguro.service.js`

### 📁 `src/services/` - **ELIMINAR TODA LA CARPETA**
- ✅ `services/pedidosService.js` → `modules/orders/services/orders.service.js` + `modules/orders/repositories/orders.repository.js`

### 📁 `src/components/` - **ELIMINAR CARPETA VACÍA**
Todos los componentes fueron movidos a sus módulos correspondientes

### 📄 `src/supabase.js` - **ELIMINAR ARCHIVO**
- ✅ Migrado a → `modules/core/config/supabase.config.js`

### 📄 `src/firebase.js` - **REVISAR Y POSIBLEMENTE ELIMINAR**
- ⚠️ Si NO se usa Firebase en la app, eliminar
- ⚠️ Si se usa, migrar a `modules/core/config/firebase.config.js`

---

## ✅ Comando de Limpieza

Ejecuta este comando para eliminar todos los archivos obsoletos de forma segura:

```powershell
# Eliminar carpetas obsoletas
Remove-Item -Recurse -Force "src\utils"
Remove-Item -Recurse -Force "src\services"
Remove-Item -Recurse -Force "src\components"

# Eliminar archivo de configuración antigua
Remove-Item -Force "src\supabase.js"

# Opcional: Eliminar Firebase si no se usa
# Remove-Item -Force "src\firebase.js"
```

O hazlo manualmente desde el explorador de archivos.

---

## 📁 Carpetas que Podrían Estar Vacías o Sin Uso

### `src/pages/` 
- Verificar si contiene algo
- Si está vacía, eliminar

---

## ⚠️ IMPORTANTE

Antes de eliminar, asegúrate de que la aplicación funciona correctamente:

```bash
npm run dev
```

Si todo funciona bien, procede con la limpieza.

---

## 📊 Resumen de Archivos Obsoletos

| Archivo/Carpeta | Tamaño | Estado | Migrado a |
|----------------|---------|---------|-----------|
| `utils/` | ~23 KB | ❌ Obsoleto | `modules/` |
| `services/` | ~2 KB | ❌ Obsoleto | `modules/orders/` |
| `components/` | Vacía | ❌ Obsoleto | `modules/*/components/` |
| `supabase.js` | 241 bytes | ❌ Obsoleto | `modules/core/config/` |
| `firebase.js` | 1038 bytes | ⚠️ Revisar | ¿Se usa? |
| `pages/` | ? | ⚠️ Revisar | Verificar contenido |

**Total estimado a eliminar: ~26 KB**
