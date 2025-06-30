const fs = require('fs');
const path = require('path');
const { XMLParser } = require('fast-xml-parser');

/**
 * Configuración del parser XML
 */
const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  allowBooleanAttributes: true,
  parseAttributeValue: true,
  trimValues: true,
  parseTagValue: true,
  ignoreNameSpace: false,
  parseTrueNumberOnly: false
};

const xmlParser = new XMLParser(parserOptions);

/**
 * Lee todos los archivos de perfil de una carpeta
 */
async function readProfiles(inputDir) {
  const files = fs.readdirSync(inputDir);
  const profileFiles = files.filter(file => file.endsWith('.profile-meta.xml'));
  
  if (profileFiles.length === 0) {
    throw new Error('No se encontraron archivos .profile-meta.xml en la carpeta especificada');
  }
  
  const profiles = [];
  
  for (const file of profileFiles) {
    const filePath = path.join(inputDir, file);
    const profile = await parseProfileFile(filePath);
    profiles.push(profile);
  }
  
  return profiles;
}

/**
 * Parsea un archivo de perfil individual
 */
async function parseProfileFile(filePath) {
  const fileName = path.basename(filePath, '.profile-meta.xml');
  const xmlContent = fs.readFileSync(filePath, 'utf8');
  
  try {
    const parsed = xmlParser.parse(xmlContent);
    const profile = parsed.Profile || {};
    
    return {
      name: fileName,
      filePath: filePath,
      permissions: extractPermissions(profile)
    };
  } catch (error) {
    throw new Error(`Error al parsear ${filePath}: ${error.message}`);
  }
}

/**
 * Extrae todos los tipos de permisos del perfil
 */
function extractPermissions(profile) {
  return {
    objectPermissions: extractArrayPermissions(profile.objectPermissions),
    fieldPermissions: extractArrayPermissions(profile.fieldPermissions),
    userPermissions: extractArrayPermissions(profile.userPermissions),
    classAccesses: extractArrayPermissions(profile.classAccesses),
    applicationVisibilities: extractArrayPermissions(profile.applicationVisibilities),
    tabVisibilities: extractArrayPermissions(profile.tabVisibilities),
    pageAccesses: extractArrayPermissions(profile.pageAccesses),
    recordTypeVisibilities: extractArrayPermissions(profile.recordTypeVisibilities)
  };
}

/**
 * Normaliza permisos que pueden ser un array o un objeto único
 */
function extractArrayPermissions(permissions) {
  if (!permissions) return [];
  
  // Si es un array, devolverlo tal como está
  if (Array.isArray(permissions)) {
    return permissions;
  }
  
  // Si es un objeto único, convertirlo a array
  return [permissions];
}

/**
 * Obtiene estadísticas de permisos de un perfil
 */
function getPermissionStats(profile) {
  const permissions = profile.permissions;
  
  return {
    objectPermissions: permissions.objectPermissions.length,
    fieldPermissions: permissions.fieldPermissions.length,
    userPermissions: permissions.userPermissions.length,
    classAccesses: permissions.classAccesses.length,
    applicationVisibilities: permissions.applicationVisibilities.length,
    tabVisibilities: permissions.tabVisibilities.length,
    pageAccesses: permissions.pageAccesses.length,
    recordTypeVisibilities: permissions.recordTypeVisibilities.length,
    totalPermissions: Object.values(permissions).reduce((total, perms) => total + perms.length, 0)
  };
}

/**
 * Combina permisos de múltiples perfiles eliminando duplicados
 */
function combinePermissions(profiles) {
  const combined = {
    objectPermissions: [],
    fieldPermissions: [],
    userPermissions: [],
    classAccesses: [],
    applicationVisibilities: [],
    tabVisibilities: [],
    pageAccesses: [],
    recordTypeVisibilities: []
  };
  
  profiles.forEach(profile => {
    Object.keys(combined).forEach(permType => {
      const permissions = profile.permissions[permType];
      permissions.forEach(perm => {
        // Evitar duplicados basados en el identificador principal
        const exists = combined[permType].some(existing => 
          getPermissionIdentifier(existing, permType) === getPermissionIdentifier(perm, permType)
        );
        
        if (!exists) {
          combined[permType].push(perm);
        }
      });
    });
  });
  
  return combined;
}

/**
 * Obtiene el identificador único de un permiso según su tipo
 */
function getPermissionIdentifier(permission, type) {
  switch (type) {
    case 'objectPermissions':
      return permission.object;
    case 'fieldPermissions':
      return permission.field;
    case 'userPermissions':
      return permission.name;
    case 'classAccesses':
      return permission.apexClass;
    case 'applicationVisibilities':
      return permission.application;
    case 'tabVisibilities':
      return permission.tab;
    case 'pageAccesses':
      return permission.apexPage;
    case 'recordTypeVisibilities':
      return `${permission.recordType}`;
    default:
      return JSON.stringify(permission);
  }
}

module.exports = {
  readProfiles,
  parseProfileFile,
  extractPermissions,
  getPermissionStats,
  combinePermissions
}; 