import { XMLParser } from 'fast-xml-parser';

/**
 * Configuración del parser XML (igual que el original)
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
 * Parsea perfiles desde contenido de archivos (adaptado para web)
 */
async function parseProfilesFromContent(profiles) {
  const parsedProfiles = [];
  
  for (const profile of profiles) {
    try {
      const parsedProfile = await parseProfileContent(profile.name, profile.content);
      parsedProfiles.push(parsedProfile);
    } catch (error) {
      console.error(`Error parsing profile ${profile.name}:`, error);
      // Continuar con otros perfiles en caso de error
      parsedProfiles.push({
        name: profile.name,
        filePath: profile.fileName,
        permissions: getEmptyPermissions(),
        error: error.message
      });
    }
  }
  
  if (parsedProfiles.length === 0) {
    throw new Error('No se pudieron parsear ningún perfil válido');
  }
  
  return parsedProfiles;
}

/**
 * Parsea el contenido XML de un perfil individual
 */
async function parseProfileContent(profileName, xmlContent) {
  try {
    const parsed = xmlParser.parse(xmlContent);
    const profile = parsed.Profile || {};
    
    return {
      name: profileName,
      filePath: `${profileName}.profile-meta.xml`,
      permissions: extractPermissions(profile)
    };
  } catch (error) {
    throw new Error(`Error al parsear perfil ${profileName}: ${error.message}`);
  }
}

/**
 * Extrae todos los tipos de permisos del perfil (función reutilizada)
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
  const combined = getEmptyPermissions();
  
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

/**
 * Retorna estructura vacía de permisos
 */
function getEmptyPermissions() {
  return {
    objectPermissions: [],
    fieldPermissions: [],
    userPermissions: [],
    classAccesses: [],
    applicationVisibilities: [],
    tabVisibilities: [],
    pageAccesses: [],
    recordTypeVisibilities: []
  };
}

/**
 * Valida que el contenido XML sea un perfil válido
 */
function validateProfileXML(xmlContent) {
  try {
    const parsed = xmlParser.parse(xmlContent);
    
    if (!parsed.Profile) {
      return { valid: false, error: 'El archivo no contiene un elemento Profile válido' };
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: `XML inválido: ${error.message}` };
  }
}

/**
 * Obtiene información básica de un perfil sin parsearlo completamente
 */
function getProfileInfo(xmlContent) {
  try {
    const parsed = xmlParser.parse(xmlContent);
    const profile = parsed.Profile || {};
    
    return {
      description: profile.description || 'Sin descripción',
      custom: profile.custom || false,
      hasPermissions: Object.keys(profile).some(key => 
        ['objectPermissions', 'fieldPermissions', 'userPermissions'].includes(key)
      )
    };
  } catch (error) {
    return {
      description: 'Error al leer perfil',
      custom: false,
      hasPermissions: false,
      error: error.message
    };
  }
}

export {
  parseProfilesFromContent,
  parseProfileContent,
  extractPermissions,
  getPermissionStats,
  combinePermissions,
  getPermissionIdentifier,
  validateProfileXML,
  getProfileInfo
}; 