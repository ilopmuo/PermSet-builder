import { create } from 'xmlbuilder2';
import { getPermissionStats, combinePermissions, getPermissionIdentifier } from './webParser';

/**
 * Genera permission sets según el modo especificado
 */
async function generatePermsets(profiles, mode, nameMapping = null) {
  switch (mode) {
    case 'single':
      return generateSingleMode(profiles, nameMapping);
    case 'split':
      return generateSplitMode(profiles, nameMapping);
    case 'unified':
      return generateUnifiedMode(profiles, nameMapping);
    case 'base+specific':
      return generateBaseSpecificMode(profiles, nameMapping);
    default:
      throw new Error(`Modo no soportado: ${mode}`);
  }
}

/**
 * Modo single: un permset por perfil
 */
function generateSingleMode(profiles, nameMapping) {
  const permsets = [];
  
  profiles.forEach(profile => {
    const permsetName = getPermsetName(profile.name, nameMapping, 'single');
    const filename = `${permsetName}.permissionset-meta.xml`;
    
    const content = generatePermissionSetXML({
      name: permsetName,
      label: permsetName,
      description: `Permission set generado desde el perfil ${profile.name}`,
      permissions: profile.permissions
    });
    
    const stats = getPermissionStats(profile);
    
    permsets.push({
      filename,
      content,
      stats,
      sourceProfile: profile.name
    });
  });
  
  return permsets;
}

/**
 * Modo split: un permset por tipo de permiso dentro de cada perfil
 */
function generateSplitMode(profiles, nameMapping) {
  const permsets = [];
  
  profiles.forEach(profile => {
    const permissionTypes = Object.keys(profile.permissions);
    
    permissionTypes.forEach(permType => {
      const permissions = profile.permissions[permType];
      
      if (permissions.length > 0) {
        const permsetName = getPermsetName(
          profile.name, 
          nameMapping, 
          'split', 
          permType
        );
        const filename = `${permsetName}.permissionset-meta.xml`;
        
        // Crear objeto de permisos solo con el tipo actual
        const singleTypePermissions = {
          objectPermissions: [],
          fieldPermissions: [],
          userPermissions: [],
          classAccesses: [],
          applicationVisibilities: [],
          tabVisibilities: [],
          pageAccesses: [],
          recordTypeVisibilities: []
        };
        singleTypePermissions[permType] = permissions;
        
        const content = generatePermissionSetXML({
          name: permsetName,
          label: permsetName,
          description: `${getPermissionTypeLabel(permType)} desde el perfil ${profile.name}`,
          permissions: singleTypePermissions
        });
        
        const stats = {
          [permType]: permissions.length,
          totalPermissions: permissions.length
        };
        
        permsets.push({
          filename,
          content,
          stats,
          sourceProfile: profile.name,
          permissionType: permType
        });
      }
    });
  });
  
  return permsets;
}

/**
 * Modo unified: todos los perfiles en un solo permset
 */
function generateUnifiedMode(profiles, nameMapping) {
  const permsetName = getPermsetName('Unified', nameMapping, 'unified');
  const filename = `${permsetName}.permissionset-meta.xml`;
  
  // Combinar todos los permisos eliminando duplicados
  const combinedPermissions = combinePermissions(profiles);
  
  const content = generatePermissionSetXML({
    name: permsetName,
    label: permsetName,
    description: `Permission set unificado generado desde múltiples perfiles`,
    permissions: combinedPermissions
  });
  
  const totalPermissions = Object.values(combinedPermissions)
    .reduce((total, perms) => total + perms.length, 0);
  
  return [{
    filename,
    content,
    stats: { totalPermissions },
    sourceProfiles: profiles.map(p => p.name)
  }];
}

/**
 * Modo base+specific: permset común + permsets específicos con diferencias
 */
function generateBaseSpecificMode(profiles, nameMapping) {
  const permsets = [];
  
  // Calcular permisos comunes entre todos los perfiles
  const commonPermissions = findCommonPermissions(profiles);
  
  // Generar permset base común
  const basePermsetName = getPermsetName('Common', nameMapping, 'base+specific');
  const baseFilename = `${basePermsetName}.permissionset-meta.xml`;
  
  const baseContent = generatePermissionSetXML({
    name: basePermsetName,
    label: basePermsetName,
    description: `Permisos comunes compartidos entre todos los perfiles`,
    permissions: commonPermissions
  });
  
  const commonCount = Object.values(commonPermissions)
    .reduce((total, perms) => total + perms.length, 0);
  
  permsets.push({
    filename: baseFilename,
    content: baseContent,
    stats: { totalPermissions: commonCount },
    sourceProfiles: profiles.map(p => p.name),
    permissionType: 'common'
  });
  
  // Generar permsets específicos para cada perfil
  profiles.forEach(profile => {
    const specificPermissions = getSpecificPermissions(profile, commonPermissions);
    const specificCount = Object.values(specificPermissions)
      .reduce((total, perms) => total + perms.length, 0);
    
    // Solo crear archivo si hay permisos específicos
    if (specificCount > 0) {
      const specificPermsetName = getPermsetName(profile.name, nameMapping, 'base+specific');
      const specificFilename = `${specificPermsetName}.permissionset-meta.xml`;
      
      const specificContent = generatePermissionSetXML({
        name: specificPermsetName,
        label: specificPermsetName,
        description: `Permisos específicos del perfil ${profile.name}`,
        permissions: specificPermissions
      });
      
      permsets.push({
        filename: specificFilename,
        content: specificContent,
        stats: { totalPermissions: specificCount },
        sourceProfile: profile.name,
        permissionType: 'specific'
      });
    }
  });
  
  return permsets;
}

/**
 * Genera el XML de Permission Set
 */
function generatePermissionSetXML({ name, label, description, permissions }) {
  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('PermissionSet', { xmlns: 'http://soap.sforce.com/2006/04/metadata' });
  
  // Información básica del permission set
  root.ele('description').txt(description);
  root.ele('hasActivationRequired').txt('false');
  root.ele('label').txt(label);
  
  // Agregar cada tipo de permiso
  addObjectPermissions(root, permissions.objectPermissions);
  addFieldPermissions(root, permissions.fieldPermissions);
  addUserPermissions(root, permissions.userPermissions);
  addClassAccesses(root, permissions.classAccesses);
  addApplicationVisibilities(root, permissions.applicationVisibilities);
  addTabVisibilities(root, permissions.tabVisibilities);
  addPageAccesses(root, permissions.pageAccesses);
  addRecordTypeVisibilities(root, permissions.recordTypeVisibilities);
  
  return root.end({ prettyPrint: true });
}

/**
 * Agrega object permissions al XML
 */
function addObjectPermissions(root, permissions) {
  permissions.forEach(perm => {
    const objPerm = root.ele('objectPermissions');
    objPerm.ele('allowCreate').txt(perm.allowCreate || false);
    objPerm.ele('allowDelete').txt(perm.allowDelete || false);
    objPerm.ele('allowEdit').txt(perm.allowEdit || false);
    objPerm.ele('allowRead').txt(perm.allowRead || false);
    objPerm.ele('modifyAllRecords').txt(perm.modifyAllRecords || false);
    objPerm.ele('object').txt(perm.object);
    objPerm.ele('viewAllRecords').txt(perm.viewAllRecords || false);
  });
}

/**
 * Agrega field permissions al XML
 */
function addFieldPermissions(root, permissions) {
  permissions.forEach(perm => {
    const fieldPerm = root.ele('fieldPermissions');
    fieldPerm.ele('editable').txt(perm.editable || false);
    fieldPerm.ele('field').txt(perm.field);
    fieldPerm.ele('readable').txt(perm.readable || false);
  });
}

/**
 * Agrega user permissions al XML
 */
function addUserPermissions(root, permissions) {
  permissions.forEach(perm => {
    const userPerm = root.ele('userPermissions');
    userPerm.ele('enabled').txt(perm.enabled || false);
    userPerm.ele('name').txt(perm.name);
  });
}

/**
 * Agrega class accesses al XML
 */
function addClassAccesses(root, permissions) {
  permissions.forEach(perm => {
    const classAccess = root.ele('classAccesses');
    classAccess.ele('apexClass').txt(perm.apexClass);
    classAccess.ele('enabled').txt(perm.enabled || false);
  });
}

/**
 * Agrega application visibilities al XML
 */
function addApplicationVisibilities(root, permissions) {
  permissions.forEach(perm => {
    const appVis = root.ele('applicationVisibilities');
    appVis.ele('application').txt(perm.application);
    appVis.ele('default').txt(perm.default || false);
    appVis.ele('visible').txt(perm.visible || false);
  });
}

/**
 * Agrega tab visibilities al XML
 */
function addTabVisibilities(root, permissions) {
  permissions.forEach(perm => {
    const tabVis = root.ele('tabVisibilities');
    tabVis.ele('tab').txt(perm.tab);
    tabVis.ele('visibility').txt(perm.visibility || 'DefaultOff');
  });
}

/**
 * Agrega page accesses al XML
 */
function addPageAccesses(root, permissions) {
  permissions.forEach(perm => {
    const pageAccess = root.ele('pageAccesses');
    pageAccess.ele('apexPage').txt(perm.apexPage);
    pageAccess.ele('enabled').txt(perm.enabled || false);
  });
}

/**
 * Agrega record type visibilities al XML
 */
function addRecordTypeVisibilities(root, permissions) {
  permissions.forEach(perm => {
    const recordTypeVis = root.ele('recordTypeVisibilities');
    recordTypeVis.ele('recordType').txt(perm.recordType);
    recordTypeVis.ele('visible').txt(perm.visible || false);
    if (perm.default !== undefined) {
      recordTypeVis.ele('default').txt(perm.default);
    }
  });
}

/**
 * Obtiene el nombre del permission set según el mapping y modo
 */
function getPermsetName(profileName, nameMapping, mode, permissionType = null) {
  if (!nameMapping) {
    return getDefaultPermsetName(profileName, mode, permissionType);
  }
  
  // Verificar mapping específico para split mode
  if (mode === 'split' && nameMapping.splitOverrides && permissionType) {
    const splitKey = `${profileName}_${permissionType}`;
    if (nameMapping.splitOverrides[splitKey]) {
      return nameMapping.splitOverrides[splitKey];
    }
  }
  
  // Verificar mapping general
  if (nameMapping[profileName]) {
    const baseName = nameMapping[profileName];
    if (mode === 'split' && permissionType) {
      return `${baseName}_${getPermissionTypeLabel(permissionType)}`;
    }
    return baseName;
  }
  
  // Si no hay mapping, usar nombre por defecto
  return getDefaultPermsetName(profileName, mode, permissionType);
}

/**
 * Genera nombres por defecto para permission sets
 */
function getDefaultPermsetName(profileName, mode, permissionType) {
  switch (mode) {
    case 'single':
      return profileName;
    case 'split':
      return `${profileName}_${getPermissionTypeLabel(permissionType)}`;
    case 'unified':
      return 'UnifiedPermissions';
    case 'base+specific':
      return profileName === 'Common' ? 'Common' : profileName;
    default:
      return profileName;
  }
}

/**
 * Obtiene etiquetas legibles para tipos de permisos
 */
function getPermissionTypeLabel(permissionType) {
  const labels = {
    objectPermissions: 'ObjectAccess',
    fieldPermissions: 'FieldAccess',
    userPermissions: 'UserPermissions',
    classAccesses: 'ClassAccess',
    applicationVisibilities: 'AppVisibility',
    tabVisibilities: 'TabVisibility',
    pageAccesses: 'PageAccess',
    recordTypeVisibilities: 'RecordTypeVisibility'
  };
  
  return labels[permissionType] || permissionType;
}

/**
 * Encuentra permisos comunes entre todos los perfiles
 */
function findCommonPermissions(profiles) {
  if (profiles.length === 0) return {};
  if (profiles.length === 1) return profiles[0].permissions;
  
  const commonPermissions = {
    objectPermissions: [],
    fieldPermissions: [],
    userPermissions: [],
    classAccesses: [],
    applicationVisibilities: [],
    tabVisibilities: [],
    pageAccesses: [],
    recordTypeVisibilities: []
  };
  
  const permissionTypes = Object.keys(commonPermissions);
  
  // Para cada tipo de permiso
  permissionTypes.forEach(permType => {
    const firstProfilePerms = profiles[0].permissions[permType] || [];
    
    // Filtrar permisos que están en TODOS los perfiles
    const commonPerms = firstProfilePerms.filter(perm => {
      const permIdentifier = getPermissionIdentifier(perm, permType);
      
      // Verificar que este permiso existe en todos los demás perfiles
      return profiles.slice(1).every(profile => {
        const profilePerms = profile.permissions[permType] || [];
        return profilePerms.some(profilePerm => 
          getPermissionIdentifier(profilePerm, permType) === permIdentifier &&
          arePermissionsEqual(perm, profilePerm, permType)
        );
      });
    });
    
    commonPermissions[permType] = commonPerms;
  });
  
  return commonPermissions;
}

/**
 * Obtiene permisos específicos de un perfil (excluye los comunes)
 */
function getSpecificPermissions(profile, commonPermissions) {
  const specificPermissions = {
    objectPermissions: [],
    fieldPermissions: [],
    userPermissions: [],
    classAccesses: [],
    applicationVisibilities: [],
    tabVisibilities: [],
    pageAccesses: [],
    recordTypeVisibilities: []
  };
  
  const permissionTypes = Object.keys(specificPermissions);
  
  // Para cada tipo de permiso
  permissionTypes.forEach(permType => {
    const profilePerms = profile.permissions[permType] || [];
    const commonPerms = commonPermissions[permType] || [];
    
    // Filtrar permisos que NO están en los comunes
    const specificPerms = profilePerms.filter(perm => {
      const permIdentifier = getPermissionIdentifier(perm, permType);
      
      // Verificar que este permiso NO está en los comunes
      return !commonPerms.some(commonPerm =>
        getPermissionIdentifier(commonPerm, permType) === permIdentifier &&
        arePermissionsEqual(perm, commonPerm, permType)
      );
    });
    
    specificPermissions[permType] = specificPerms;
  });
  
  return specificPermissions;
}

/**
 * Compara si dos permisos son iguales (mismo acceso y configuración)
 */
function arePermissionsEqual(perm1, perm2, permType) {
  switch (permType) {
    case 'objectPermissions':
      return perm1.object === perm2.object &&
             perm1.allowCreate === perm2.allowCreate &&
             perm1.allowDelete === perm2.allowDelete &&
             perm1.allowEdit === perm2.allowEdit &&
             perm1.allowRead === perm2.allowRead &&
             perm1.modifyAllRecords === perm2.modifyAllRecords &&
             perm1.viewAllRecords === perm2.viewAllRecords;
             
    case 'fieldPermissions':
      return perm1.field === perm2.field &&
             perm1.editable === perm2.editable &&
             perm1.readable === perm2.readable;
             
    case 'userPermissions':
      return perm1.name === perm2.name &&
             perm1.enabled === perm2.enabled;
             
    case 'classAccesses':
      return perm1.apexClass === perm2.apexClass &&
             perm1.enabled === perm2.enabled;
             
    case 'applicationVisibilities':
      return perm1.application === perm2.application &&
             perm1.default === perm2.default &&
             perm1.visible === perm2.visible;
             
    case 'tabVisibilities':
      return perm1.tab === perm2.tab &&
             perm1.visibility === perm2.visibility;
             
    case 'pageAccesses':
      return perm1.apexPage === perm2.apexPage &&
             perm1.enabled === perm2.enabled;
             
    case 'recordTypeVisibilities':
      return perm1.recordType === perm2.recordType &&
             perm1.visible === perm2.visible &&
             perm1.default === perm2.default;
             
    default:
      return JSON.stringify(perm1) === JSON.stringify(perm2);
  }
}

export {
  generatePermsets,
  generatePermissionSetXML
}; 