import React from 'react';
import { motion } from 'framer-motion';
import { 
  Folder, 
  FileText, 
  FolderOpen,
  ChevronRight
} from 'lucide-react';

const PreviewVisualizer = ({ mode, profilesFolder, outputFolder, detectedProfiles = [] }) => {
  // Extraer nombres de perfiles de los datos detectados
  const getProfileNames = () => {
    if (detectedProfiles && detectedProfiles.length > 0) {
      return detectedProfiles.map(profile => profile.baseName);
    }
    // Datos de ejemplo si no hay perfiles detectados
    return ['Admin', 'Sales_Manager', 'Marketing_User'];
  };

  const profileNames = getProfileNames();

  const generatePreviewFiles = () => {
    switch (mode) {
      case 'single':
        return profileNames.map(name => ({
          name: `${name}.permissionset-meta.xml`,
          type: 'single',
          source: name
        }));
      
      case 'split':
        const permissionTypes = [
          'ObjectAccess',
          'FieldAccess', 
          'UserPermissions',
          'ClassAccess',
          'AppVisibility'
        ];
        
        const splitFiles = [];
        profileNames.forEach(profileName => {
          permissionTypes.forEach(permType => {
            splitFiles.push({
              name: `${profileName}_${permType}.permissionset-meta.xml`,
              type: 'split',
              source: profileName,
              permType: permType
            });
          });
        });
        return splitFiles;
      
      case 'unified':
        return [{
          name: 'UnifiedPermissions.permissionset-meta.xml',
          type: 'unified',
          source: 'All profiles'
        }];
        
      case 'base+specific':
        const baseSpecificFiles = [
          {
            name: 'Common.permissionset-meta.xml',
            type: 'common',
            source: 'Shared permissions'
          }
        ];
        
        // Agregar archivos específicos por perfil
        profileNames.forEach(profileName => {
          baseSpecificFiles.push({
            name: `${profileName}.permissionset-meta.xml`,
            type: 'specific',
            source: profileName
          });
        });
        
        return baseSpecificFiles;
      
      default:
        return [];
    }
  };

  const previewFiles = generatePreviewFiles();
  
  const getFileIcon = (file) => {
    if (file.type === 'unified') return '🧷';
    if (file.type === 'split') return '🪓';
    if (file.type === 'common') return '🎯';
    if (file.type === 'specific') return '🔸';
    return '🧩';
  };

  const getFileColor = (file) => {
    if (file.type === 'unified') return 'text-green-600';
    if (file.type === 'split') return 'text-purple-600';
    if (file.type === 'common') return 'text-orange-600';
    if (file.type === 'specific') return 'text-orange-400';
    return 'text-blue-600';
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    initial: { x: -10, opacity: 0 },
    animate: { 
      x: 0, 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  const folderName = outputFolder ? outputFolder.split(/[/\\]/).pop() : 'permsets';

  return (
    <div className="bg-gray-900 rounded-3xl p-6 text-gray-100 font-mono text-sm overflow-hidden">
      {/* Header del terminal */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-700">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <span className="text-gray-400 ml-2">Vista previa de archivos</span>
      </div>

      {/* Estructura de archivos */}
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="space-y-1"
      >
        {/* Carpeta raíz */}
        <motion.div variants={itemVariants} className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-blue-400" />
          <span className="text-blue-400">{folderName}/</span>
        </motion.div>

        {/* Archivos generados */}
        {previewFiles.slice(0, 8).map((file, index) => (
          <motion.div 
            key={index}
            variants={itemVariants}
            className="flex items-center gap-2 ml-4"
          >
            <span className="text-gray-500">├─</span>
            <span className="text-lg">{getFileIcon(file)}</span>
            <FileText className={`w-4 h-4 ${getFileColor(file)}`} />
            <span className={`${getFileColor(file)} font-medium`}>
              {file.name}
            </span>
          </motion.div>
        ))}

        {/* Indicador si hay más archivos */}
        {previewFiles.length > 8 && (
          <motion.div 
            variants={itemVariants}
            className="flex items-center gap-2 ml-4 text-gray-500"
          >
            <span>├─</span>
            <span>... y {previewFiles.length - 8} archivos más</span>
          </motion.div>
        )}

        {/* Estadísticas */}
        <motion.div 
          variants={itemVariants}
          className="mt-4 pt-3 border-t border-gray-700"
        >
          <div className="text-gray-400 text-xs space-y-1">
            <div>📊 Total de archivos: <span className="text-green-400">{previewFiles.length}</span></div>
            <div>📂 Perfiles de origen: <span className="text-blue-400">{profileNames.length}</span></div>
            {mode === 'split' && (
              <div>🪓 Tipos de permiso: <span className="text-purple-400">5 por perfil</span></div>
            )}
            {mode === 'unified' && (
              <div>🧷 Duplicados eliminados: <span className="text-green-400">Automático</span></div>
            )}
            {mode === 'base+specific' && (
              <>
                <div>🎯 Archivo base: <span className="text-orange-400">1 común</span></div>
                <div>🔸 Archivos específicos: <span className="text-orange-300">{profileNames.length}</span></div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Información del modo */}
      <div className="mt-6 p-4 bg-gray-800 rounded-2xl">
        <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
          Modo {mode.toUpperCase()}
        </div>
        <div className="text-sm">
          {mode === 'single' && (
            <span className="text-blue-400">
              Conversión 1:1 - Un permset por perfil
            </span>
          )}
          {mode === 'split' && (
            <span className="text-purple-400">
              Máxima granularidad - Permiso por archivo
            </span>
          )}
          {mode === 'unified' && (
            <span className="text-green-400">
              Todo en uno - Sin duplicados
            </span>
          )}
          {mode === 'base+specific' && (
            <span className="text-orange-400">
              Base común + específicos - Optimización inteligente
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewVisualizer; 