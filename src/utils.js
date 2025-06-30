const fs = require('fs');
const path = require('path');

/**
 * Verifica si un archivo existe
 */
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * Crea un directorio si no existe
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Obtiene todos los archivos con una extensión específica en un directorio
 */
function getFilesWithExtension(dirPath, extension) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }
  
  const files = fs.readdirSync(dirPath);
  return files.filter(file => file.endsWith(extension));
}

/**
 * Valida si una cadena es un nombre de archivo válido
 */
function isValidFileName(fileName) {
  const invalidChars = /[<>:"/\\|?*]/;
  return !invalidChars.test(fileName) && fileName.length > 0;
}

/**
 * Limpia un nombre para que sea válido como nombre de archivo
 */
function sanitizeFileName(fileName) {
  return fileName
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .trim();
}

/**
 * Obtiene el nombre base de un archivo sin extensión
 */
function getFileNameWithoutExtension(filePath) {
  return path.basename(filePath, path.extname(filePath));
}

/**
 * Formatea un número con separadores de miles
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Obtiene el timestamp actual en formato legible
 */
function getCurrentTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

/**
 * Valida la estructura de un archivo de mapping
 */
function validateNameMapping(mapping) {
  if (!mapping || typeof mapping !== 'object') {
    throw new Error('El mapping debe ser un objeto JSON válido');
  }
  
  // Validar que los nombres no contengan caracteres inválidos
  Object.values(mapping).forEach(name => {
    if (typeof name === 'string' && !isValidFileName(name)) {
      throw new Error(`Nombre inválido en mapping: ${name}`);
    }
  });
  
  // Validar splitOverrides si existe
  if (mapping.splitOverrides) {
    if (typeof mapping.splitOverrides !== 'object') {
      throw new Error('splitOverrides debe ser un objeto');
    }
    
    Object.values(mapping.splitOverrides).forEach(name => {
      if (typeof name === 'string' && !isValidFileName(name)) {
        throw new Error(`Nombre inválido en splitOverrides: ${name}`);
      }
    });
  }
  
  return true;
}

/**
 * Genera un resumen de los permisos procesados
 */
function generateProcessingSummary(profiles, permsets) {
  const summary = {
    profilesProcessed: profiles.length,
    permsetesGenerated: permsets.length,
    totalPermissions: 0,
    permissionsByType: {}
  };
  
  // Contar permisos por tipo
  profiles.forEach(profile => {
    Object.keys(profile.permissions).forEach(permType => {
      const count = profile.permissions[permType].length;
      summary.totalPermissions += count;
      summary.permissionsByType[permType] = (summary.permissionsByType[permType] || 0) + count;
    });
  });
  
  return summary;
}

module.exports = {
  fileExists,
  ensureDirectoryExists,
  getFilesWithExtension,
  isValidFileName,
  sanitizeFileName,
  getFileNameWithoutExtension,
  formatNumber,
  getCurrentTimestamp,
  validateNameMapping,
  generateProcessingSummary
}; 