import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FolderOpen, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight,
  ArrowLeft,
  FileText,
  AlertCircle
} from 'lucide-react';

const StepFolderSelection = ({ state, updateState, onNext, onBack }) => {
  const [profileCount, setProfileCount] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isValid, setIsValid] = useState(false);

  // Validar carpeta de perfiles cuando cambia
  useEffect(() => {
    if (state.profilesFolder) {
      validateProfilesFolder(state.profilesFolder);
    }
  }, [state.profilesFolder]);

  // Validar estado general
  useEffect(() => {
    const valid = state.profilesFolder && state.outputFolder && profileCount > 0 && !validationError;
    setIsValid(valid);
  }, [state.profilesFolder, state.outputFolder, profileCount, validationError]);

  const validateProfilesFolder = async (folderPath) => {
    setIsValidating(true);
    setValidationError('');
    
    try {
      const files = await window.electronAPI.validateProfilesFolder?.(folderPath) || [];
      
      if (files.length === 0) {
        setValidationError('No se encontraron archivos .profile-meta.xml en la carpeta seleccionada');
        setProfileCount(0);
        updateState({ detectedProfiles: [] });
      } else {
        setProfileCount(files.length);
        setValidationError('');
        // Guardar información de perfiles detectados en el estado global
        updateState({ detectedProfiles: files });
      }
    } catch (error) {
      setValidationError('Error al acceder a la carpeta seleccionada');
      setProfileCount(0);
      updateState({ detectedProfiles: [] });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSelectProfilesFolder = async () => {
    try {
      const folder = await window.electronAPI.selectProfilesFolder();
      if (folder) {
        updateState({ profilesFolder: folder });
      }
    } catch (error) {
      console.error('Error selecting profiles folder:', error);
      setValidationError('Error al seleccionar la carpeta');
    }
  };

  const handleSelectOutputFolder = async () => {
    try {
      const folder = await window.electronAPI.selectOutputFolder();
      if (folder) {
        updateState({ outputFolder: folder });
      }
    } catch (error) {
      console.error('Error selecting output folder:', error);
    }
  };

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="max-w-3xl mx-auto"
    >
      <div className="card-apple">
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="PermSet Builder Logo" 
              className="w-16 h-16 object-contain drop-shadow-md" 
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Selección de Carpetas
          </h2>
          <p className="text-gray-600">
            Elige dónde están tus perfiles y dónde guardar los Permission Sets
          </p>
          <div className="text-sm text-gray-500 mt-2">
            Paso 1 de 2
          </div>
        </motion.div>

        {/* Carpeta de Perfiles */}
        <motion.div variants={itemVariants} className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-4">
            Carpeta de Perfiles *
          </label>
          
          <button
            onClick={handleSelectProfilesFolder}
            className="w-full p-6 border-2 border-dashed border-gray-300 rounded-3xl hover:border-primary-400 hover:bg-primary-50 transition-all duration-200 group"
          >
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gray-100 group-hover:bg-primary-100 rounded-2xl flex items-center justify-center mb-3 transition-colors">
                <FolderOpen className="w-6 h-6 text-gray-500 group-hover:text-primary-600" />
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-900 mb-1">
                  {state.profilesFolder ? 'Cambiar carpeta de perfiles' : 'Seleccionar carpeta de perfiles'}
                </div>
                <div className="text-sm text-gray-500">
                  Debe contener archivos .profile-meta.xml
                </div>
              </div>
            </div>
          </button>

          {/* Estado de la carpeta seleccionada */}
          {state.profilesFolder && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 bg-gray-50 rounded-2xl"
            >
              <div className="flex items-start gap-3">
                {isValidating ? (
                  <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mt-0.5" />
                ) : validationError ? (
                  <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {state.profilesFolder}
                  </div>
                  {isValidating ? (
                    <div className="text-sm text-gray-500">Validando carpeta...</div>
                  ) : validationError ? (
                    <div className="text-sm text-amber-700">{validationError}</div>
                  ) : (
                    <div className="text-sm text-green-700 flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {profileCount} perfil{profileCount !== 1 ? 'es' : ''} encontrado{profileCount !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Carpeta de Salida */}
        <motion.div variants={itemVariants} className="mb-10">
          <label className="block text-sm font-semibold text-gray-700 mb-4">
            Carpeta de Salida *
          </label>
          
          <button
            onClick={handleSelectOutputFolder}
            className="w-full p-6 border-2 border-dashed border-gray-300 rounded-3xl hover:border-primary-400 hover:bg-primary-50 transition-all duration-200 group"
          >
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gray-100 group-hover:bg-primary-100 rounded-2xl flex items-center justify-center mb-3 transition-colors">
                <FolderOpen className="w-6 h-6 text-gray-500 group-hover:text-primary-600" />
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-900 mb-1">
                  {state.outputFolder ? 'Cambiar carpeta de salida' : 'Seleccionar carpeta de salida'}
                </div>
                <div className="text-sm text-gray-500">
                  Donde se guardarán los Permission Sets generados
                </div>
              </div>
            </div>
          </button>

          {state.outputFolder && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 bg-gray-50 rounded-2xl"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div className="text-sm font-medium text-gray-900 truncate">
                  {state.outputFolder}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Mensaje de validación general */}
        {!isValid && state.profilesFolder && state.outputFolder && (
          <motion.div 
            variants={itemVariants} 
            className="mb-6"
          >
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                {validationError || 'Asegúrate de que ambas carpetas sean válidas para continuar'}
              </div>
            </div>
          </motion.div>
        )}

        {/* Botones de navegación */}
        <motion.div variants={itemVariants} className="flex justify-between pt-6 border-t border-gray-100">
          <button
            onClick={onBack}
            className="btn-apple-ghost px-6 py-3 flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
          <button
            onClick={onNext}
            disabled={!isValid}
            className={`px-8 py-3 flex items-center gap-2 font-semibold transition-all ${
              isValid
                ? 'btn-apple-primary hover:shadow-lg transform hover:scale-[1.02]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed rounded-2xl'
            }`}
          >
            <span>Continuar</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Marca de agua de autoría */}
        <motion.div variants={itemVariants} className="mt-8">
          <div className="text-xs text-gray-500 text-center select-none bg-gray-50/50 py-2 px-4 rounded-full mx-auto w-fit">
            Ignacio López Muñoyerro – PermSet Builder © 2025
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StepFolderSelection; 