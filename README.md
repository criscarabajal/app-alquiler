# 🏗️ Arquitectura Modular Monolítica

> **Documentación de Arquitectura - App de Alquiler**

Esta aplicación sigue el patrón de **Monolito Modular**, diseñada para mantener una arquitectura limpia, escalable y libre de deuda técnica.

---

## 📦 Estructura de Módulos

La aplicación está organizada en **dominios de negocio independientes**:

```
src/
├── modules/              # Módulos de dominio
│   ├── core/            # Infraestructura compartida
│   ├── auth/            # Autenticación y usuarios  
│   ├── products/        # Catálogo de productos
│   ├── orders/          # Gestión de pedidos
│   └── documents/       # Generación de PDFs
│
├── shared/              # Componentes UI compartidos
│   ├── components/
│   └── styles/
│
├── assets/              # Recursos estáticos
├── App.jsx             # Componente raíz
└── main.jsx            # Punto de entrada
```

---

## 🎯 Principios Fundamentales

### 1. **Separación por Dominios**

Cada módulo representa un **dominio de negocio autosuficiente**:

- **Core**: Configuración de base de datos, utilidades compartidas, tipos comunes
- **Auth**: Todo lo relacionado con autenticación y sesiones
- **Products**: Catálogo, búsqueda y gestión de inventario
- **Orders**: Creación, guardado y recuperación de pedidos
- **Documents**: Generación de PDFs (presupuestos, remitos, seguros)

### 2. **Arquitectura en Capas**

Cada módulo sigue una estructura de 3 capas (cuando aplica):

```
module/
├── services/       # Lógica de negocio
├── repositories/   # Acceso a datos (opcional)
├── components/     # UI específica del dominio
├── types/          # Definiciones de tipos JSDoc
└── index.js        # API pública del módulo
```

#### **Flujo de Datos**

```
UI Component → Service → Repository → Database
```

- **UI Components**: Solo interactúan con **Services**
- **Services**: Contienen la lógica de negocio, usan **Repositories**
- **Repositories**: Acceso directo a la base de datos (Supabase)

---

## 🚫 Reglas de Arquitectura

### ✅ Permitido

```javascript
// ✅ CORRECTO: Componente usa servicio
import { getProducts } from '@/modules/products';
const products = await getProducts();

// ✅ CORRECTO: Servicio usa repositorio
import { fetchAllProducts } from '../repositories/products.repository';
const data = await fetchAllProducts();

// ✅ CORRECTO: Repositorio accede a DB
import { supabase } from '@/modules/core';
const { data } = await supabase.from('productos').select('*');
```

### ❌ Prohibido

```javascript
// ❌ MAL: Componente accede directamente a DB
import { supabase } from '@/modules/core';
const { data } = await supabase.from('productos').select('*');

// ❌ MAL: Dependencias circulares
// Module A importa Module B, y Module B importa Module A

// ❌ MAL: Lógica de negocio en componentes
function ProductsList() {
  const total = products.reduce((sum, p) => sum + p.precio, 0);
  // Esta lógica debería estar en un servicio
}
```

---

## 📖 Guía de Cada Módulo

### 🔐 **Core Module**

**Propósito**: Infraestructura compartida y configuración

**Contiene**:
- `config/supabase.config.js` - Cliente de Supabase
- `utils/date.util.js` - Utilidades de fecha
- `types/common.types.js` - Tipos compartidos

**Uso**:
```javascript
import { supabase, formatearFechaHora } from '@/modules/core';
```

---

### 🔑 **Auth Module**

**Propósito**: Autenticación y gestión de sesiones

**Servicios Públicos**:
```javascript
import {
  isAuthenticated,      // → boolean
  login,               // (username, password) → { ok, error? }
  logout,              // () → void
  getCurrentUser,      // () → string|null
  setCurrentUser,      // (username) → void
  switchUser           // (currentUser) → string|null
} from '@/modules/auth';
```

**Componentes**:
- `Login.jsx` - Formulario de inicio de sesión
- `HeaderUserMenu.jsx` - Menú de usuario

---

### 📦 **Products Module**

**Propósito**: Gestión de catálogo de productos

**Arquitectura**:
```
products.service.js    (lógica de negocio)
     ↓
products.repository.js (acceso a DB)
     ↓
Supabase (tabla: bbdd-prueba)
```

**Servicios Públicos**:
```javascript
import {
  getProducts,          // () → Promise<Product[]>
  getProductsByCategory, // (category) → Promise<Product[]>
  searchProducts,       // (query) → Promise<Product[]>
  getRentableProducts   // () → Promise<Product[]>
} from '@/modules/products';
```

**Componentes**:
- `ProductosPOS.jsx` - Vista principal de productos

---

### 🛒 **Orders Module**

**Propósito**: Gestión de pedidos (crear, guardar, cargar)

**Arquitectura**:
```
orders.service.js     (lógica de negocio)
     ↓
orders.repository.js  (acceso a DB)
     ↓
Supabase (tabla: pedidos)
```

**Servicios Públicos**:
```javascript
import {
  createOrUpdateOrder,  // (orderData) → Promise<void>
  getOrder,            // (pedidoNumero) → Promise<Order|null>
  getOrders,           // () → Promise<Order[]>
  removeOrder,         // (pedidoNumero) → Promise<void>
  calculateOrderTotal, // (carrito, jornadasMap) → number
  generateOrderNumber  // () → string
} from '@/modules/orders';
```

**Componentes**:
- `Carrito.jsx` - Carrito de compras
- `ListaPedidosModal.jsx` - Modal con lista de pedidos

---

### 📄 **Documents Module**

**Propósito**: Generación de documentos PDF

**Servicios Públicos**:
```javascript
import {
  generarPresupuestoPDF,    // (cliente, productos, ...) → void
  generarRemitoPDF,         // (cliente, productos, ...) → void
  generarSeguroPDF,         // (cliente, productos, ...) → void
  generarNumeroPresupuesto  // () → string
} from '@/modules/documents';
```

---

## 🔄 Patrón Barrel Export

Cada módulo expone su API pública a través de `index.js`:

```javascript
// modules/products/index.js
export * from './services/products.service.js';
export * from './types/product.types.js';
```

**Beneficios**:
- Imports limpios y concisos
- Fácil refactorizar estructura interna
- API pública clara y controlada

---

## 📝 Tipos con JSDoc

Usamos JSDoc para tipado sin TypeScript:

```javascript
/**
 * Get all products from the catalog
 * @returns {Promise<Product[]>}
 */
export async function getProducts() {
  // implementación
}

/**
 * @typedef {Object} Product
 * @property {string} nombre
 * @property {number} precio
 * @property {string} categoria
 */
```

**IDE Benefits**:
- Autocompletado inteligente
- Validación en tiempo de escritura
- Documentación inline

---

## 🛠️ Cómo Agregar Nueva Funcionalidad

### Agregar un nuevo servicio a un módulo existente

1. **Crear servicio** en `modules/{module}/services/`
2. **Exportarlo** en `modules/{module}/index.js`
3. **Usarlo** en componentes

```javascript
// 1. Crear: modules/products/services/products.service.js
export async function getProductStock(productId) {
  // lógica
}

// 2. Exportar: modules/products/index.js
export { getProductStock } from './services/products.service.js';

// 3. Usar: en cualquier componente
import { getProductStock } from '@/modules/products';
const stock = await getProductStock('123');
```

### Agregar un nuevo módulo

1. **Crear estructura**:
```
modules/nuevo-modulo/
├── services/
├── types/
├── components/      (opcional)
├── repositories/    (opcional)
└── index.js
```

2. **Definir tipos** en `types/*.types.js`
3. **Implementar lógica** en `services/*.service.js`
4. **Exportar API** en `index.js`
5. **Usar** desde otros módulos

---

## 🚀 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Lint
npm run lint

# Preview producción
npm run preview
```

---

## ⚠️ Advertencias Importantes

### 1. **NO crear dependencias circulares**

```javascript
// ❌ NUNCA HACER ESTO
// Module A importa Module B
// Module B importa Module A
```

**Solución**: Extraer lógica compartida al módulo `core`

### 2. **NO saltear la capa de servicios**

```javascript
// ❌ NUNCA acceder a DB desde UI
import { supabase } from '@/modules/core';

function MyComponent() {
  const { data } = await supabase.from('products').select('*');
}
```

**Solución**: Siempre usar servicios

```javascript
// ✅ CORRECTO
import { getProducts } from '@/modules/products';

function MyComponent() {
  const products = await getProducts();
}
```

### 3. **NO poner lógica de negocio en componentes**

```javascript
// ❌ MAL: Cálculos complejos en componente
function Checkout({ products }) {
  const total = products.reduce((sum, p) => {
    const discount = p.discount || 0;
    const tax = p.price * 0.21;
    return sum + ((p.price - discount) + tax);
  }, 0);
}
```

**Solución**: Mover a servicio

```javascript
// ✅ CORRECTO
import { calculateTotal } from '@/modules/orders';

function Checkout({ products }) {
  const total = calculateTotal(products);
}
```

---

## 📚 Recursos y Convenciones

### Naming Conventions

- **Archivos de servicios**: `*.service.js`
- **Archivos de repositorios**: `*.repository.js`
- **Archivos de tipos**: `*.types.js`
- **Archivos de configuración**: `*.config.js`
- **Componentes**: `PascalCase.jsx`

### Estructura de Commits

Cuando trabajes en esta arquitectura:

```
feat(products): add product search service
fix(auth): correct logout clearing session
refactor(orders): separate repository layer
docs(readme): update architecture rules
```

---

## 🎓 Para Futuros Prompts

**Cuando agregues nueva funcionalidad, recuerda**:

1. ✅ Identificar a qué **dominio/módulo** pertenece
2. ✅ Crear **servicio** con lógica de negocio
3. ✅ Crear **repositorio** si accede a DB
4. ✅ Usar **tipos JSDoc** para documentar
5. ✅ **Exportar** en el `index.js` del módulo
6. ✅ Importar desde la **API pública** del módulo
7. ✅ **NO** crear dependencias circulares
8. ✅ **NO** saltear la capa de servicios

---

## 🏆 Beneficios de Esta Arquitectura

✨ **Escalabilidad**: Agregar features sin tocar código existente

🔒 **Maintainability**: Fácil encontrar y modificar código

🚫 **Sin deuda técnica**: Reglas claras previenen malas prácticas

🧪 **Testeable**: Capas independientes facilitan testing

📖 **Autodocumentada**: Estructura clara y tipos JSDoc

🔄 **Refactorable**: Cambiar implementación sin afectar consumidores

---

## 📞 Preguntas Frecuentes

**Q: ¿Puedo importar un módulo desde otro?**  
A: ✅ Sí, pero solo desde la API pública (`index.js`) y sin crear ciclos.

**Q: ¿Dónde va la lógica de negocio?**  
A: Siempre en `services/`, nunca en componentes.

**Q: ¿Necesito crear un repositorio siempre?**  
A: Solo si el servicio necesita acceder a la base de datos.

**Q: ¿Qué va en `shared/`?**  
A: Componentes UI genéricos que no pertenecen a ningún dominio específico.

**Q: ¿Puedo crear subcarpetas en `services/`?**  
A: Sí, si el módulo crece mucho, organizar en subcarpetas está bien.

---

**Mantén esta arquitectura limpia y consistente. Tu yo futuro te lo agradecerá. 🚀**
