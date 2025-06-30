# 🛠️ PermSet Builder

**Aplicación de escritorio** elegante y minimalista para convertir perfiles de Salesforce (`.profile-meta.xml`) a Permission Sets (`.permissionset-meta.xml`) con interfaz visual profesional inspirada en el diseño de Apple.

![PermSet Builder](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Electron](https://img.shields.io/badge/Electron-27.1.2-9feaf9.svg)
![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.5-38b2ac.svg)

## ✨ Características

### 🖥️ **Aplicación de Escritorio**
- **Interfaz Elegante**: Diseño minimalista inspirado en Apple con animaciones fluidas
- **Multiplataforma**: Compatible con Windows, macOS y Linux
- **Drag & Drop**: Selección intuitiva de carpetas y archivos
- **Vista Previa**: Modal para visualizar el contenido de los Permission Sets generados
- **Progreso en Tiempo Real**: Barra de progreso con pasos detallados

### ⚡ **CLI Integrada**
- **Tres Modos de Conversión**: Single, Split, Unified
- **Mapeo de Nombres**: Personalización completa de nombres de archivos
- **Validación Completa**: XML compatible con Salesforce DX
- **Modo Dry-Run**: Vista previa de archivos sin generarlos

## 🚀 Instalación y Uso

### 📱 **Aplicación de Escritorio (Recomendado)**

```bash
# Clonar el repositorio
git clone <repository-url>
cd permBuilder

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run electron-dev

# Compilar aplicación para distribución
npm run build-app
```

#### **Uso de la Aplicación**

1. **🏠 Pantalla de Inicio**
   - Presentación elegante con características principales
   - Botón "Comenzar" para iniciar el proceso

2. **⚙️ Configuración**
   - **Carpeta de Perfiles**: Selecciona la carpeta con archivos `.profile-meta.xml`
   - **Carpeta de Salida**: Elige dónde guardar los Permission Sets
   - **Modo de Generación**: 
     - `Single`: Un Permission Set por perfil
     - `Split`: Un Permission Set por tipo de permiso
     - `Unified`: Todos los perfiles combinados
   - **Mapeo de Nombres** (Opcional): Archivo JSON para personalizar nombres

3. **🔄 Procesamiento**
   - Barra de progreso animada
   - Pasos detallados del proceso
   - Información de configuración

4. **📊 Resultados**
   - Estadísticas de archivos generados
   - Lista de Permission Sets con vista previa
   - Botones para abrir carpeta de salida
   - Modal para visualizar contenido XML

### 💻 **CLI (Terminal)**

```bash
# Modo básico
node index.js -i ./profiles -o ./permsets -m single

# Con mapeo de nombres personalizado
node index.js -i ./profiles -o ./permsets -m split -n ./names.json

# Modo unified
node index.js -i ./profiles -o ./permsets -m unified

# Vista previa (dry-run)
node index.js -i ./profiles -o ./permsets -m split --dry-run
```

## 🎛️ Opciones CLI

| Flag | Descripción | Valores |
|------|-------------|---------|
| `-i, --input` | Carpeta con archivos `.profile-meta.xml` | Ruta de carpeta |
| `-o, --output` | Carpeta donde se generarán los permsets | Ruta de carpeta |
| `-m, --mode` | Modo de generación | `single`, `split`, `unified` |
| `--dry-run` | Solo muestra lo que se generaría | - |
| `-n, --name-mapping` | Archivo JSON con nombres personalizados | Ruta de archivo |

## 🔧 Modos de Generación

### 1. **Single** (Por defecto)
Un Permission Set por cada perfil.
```
Admin.permissionset-meta.xml
Sales_Manager.permissionset-meta.xml
```

### 2. **Split**
Un Permission Set por cada tipo de permiso dentro de cada perfil.
```
Admin_ObjectAccess.permissionset-meta.xml
Admin_FieldAccess.permissionset-meta.xml
Admin_UserPermissions.permissionset-meta.xml
Sales_Manager_ObjectAccess.permissionset-meta.xml
```

### 3. **Unified**
Combina todos los perfiles en un único Permission Set eliminando duplicados.
```
UnifiedPermissions.permissionset-meta.xml
```

## 📝 Personalización de Nombres

Archivo `names.json` para personalizar nombres:

```json
{
  "Admin": "AdminAccess",
  "Sales_Manager": "SalesTeamPermissions",
  "splitOverrides": {
    "Admin_userPermissions": "AdminCorePermissions",
    "Admin_objectPermissions": "AdminObjectAccess",
    "Sales_Manager_userPermissions": "SalesUserPermissions"
  }
}
```

## 📂 Estructura del Proyecto

```
permBuilder/
├── 📁 src/                          # Código React
│   ├── components/                  # Componentes de UI
│   │   ├── WelcomeScreen.js         # Pantalla de inicio
│   │   ├── ConfigurationScreen.js   # Configuración
│   │   ├── ProcessingScreen.js      # Procesamiento
│   │   └── ResultsScreen.js         # Resultados
│   ├── App.js                       # Componente principal
│   ├── index.js                     # Punto de entrada React
│   └── index.css                    # Estilos Tailwind CSS
├── 📁 src/ (CLI)                    # Código CLI original
│   ├── cli.js                       # Lógica principal CLI
│   ├── parser.js                    # Parseo XML
│   ├── generator.js                 # Generación permsets
│   └── utils.js                     # Utilidades
├── 📁 public/                       # Archivos Electron
│   ├── electron.js                  # Proceso principal
│   ├── preload.js                   # Bridge seguro
│   └── index.html                   # HTML base
├── 📁 profiles/                     # Ejemplos de entrada
├── 📁 permsets/                     # Salida generada
├── names.json                       # Ejemplo mapping
├── index.js                         # CLI standalone
├── package.json                     # Dependencias
├── tailwind.config.js               # Config Tailwind
└── README.md                        # Este archivo
```

## 🎨 Tecnologías

### **Frontend**
- **React 18.2**: Interfaz de usuario moderna
- **Tailwind CSS 3.3**: Estilos utilitarios con diseño Apple-like
- **Framer Motion 10.16**: Animaciones fluidas y elegantes
- **Lucide React**: Iconografía consistente y moderna

### **Desktop**
- **Electron 27.1**: Empaquetado multiplataforma
- **IPC Seguro**: Comunicación entre procesos con contextIsolation

### **Backend/CLI**
- **Node.js**: Runtime principal
- **Commander**: CLI potente y flexible
- **fast-xml-parser**: Parseo XML eficiente
- **xmlbuilder2**: Generación XML válida

## ✅ Tipos de Permisos Soportados

La herramienta extrae y convierte:

- **Object Permissions** (`objectPermissions`)
- **Field Permissions** (`fieldPermissions`)  
- **User Permissions** (`userPermissions`)
- **Class Accesses** (`classAccesses`)
- **Application Visibilities** (`applicationVisibilities`)
- **Tab Visibilities** (`tabVisibilities`)
- **Page Accesses** (`pageAccesses`)
- **Record Type Visibilities** (`recordTypeVisibilities`)

## 🔍 Validación y Compatibilidad

Los archivos generados son 100% compatibles con:
- ✅ `sfdx force:source:deploy`
- ✅ Salesforce DX
- ✅ Metadata API v58.0+
- ✅ Salesforce CLI

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm start                    # React development server
npm run electron             # Solo Electron
npm run electron-dev         # Electron + React hot reload

# Producción
npm run build               # Build React
npm run electron-pack       # Empaquetar Electron
npm run build-app          # Build + Package completo

# CLI
npm run cli                 # Ejecutar CLI standalone
```

## 🐛 Solución de Problemas

### **Aplicación de Escritorio**

**Error: "No se puede seleccionar carpeta"**
- Verifica que tengas permisos de lectura en la carpeta
- En macOS, da permisos de acceso a archivos a la app

**La app no inicia**
- Ejecuta `npm run electron-dev` desde terminal
- Verifica que todas las dependencias estén instaladas

### **CLI**

**Error: "No se encontraron archivos .profile-meta.xml"**
- Verifica que la carpeta contenga archivos con extensión correcta
- Asegúrate de que la ruta sea válida

**Error en parseo XML**
- Verifica que los archivos XML estén bien formados
- Comprueba la estructura de perfiles de Salesforce

## 🚀 Roadmap

- [ ] **Drag & Drop** directo de archivos
- [ ] **Temas personalizables** (claro/oscuro)
- [ ] **Filtros avanzados** de permisos
- [ ] **Exportación a ZIP**
- [ ] **Integración con SFDX CLI**
- [ ] **Plantillas predefinidas**
- [ ] **Comparación de Permission Sets**
- [ ] **Auto-updater**

## 📄 Licencia

MIT License - Libre para uso comercial y personal.

---

**Desarrollado con ❤️ para la comunidad Salesforce**

*Optimiza tu gestión de permisos con una herramienta que combina la potencia de la línea de comandos con la elegancia de una interfaz moderna.* 