import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  FolderOpen, 
  Settings, 
  File, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const ConfigurationScreen = ({ state, updateState, onBack, onNext }) => {
  const [isValidated, setIsValidated] = useState(false);

  const modes = [
    {
      id: 'single',
      title: 'Single',
      description: 'Un Permission Set por cada perfil',
      icon: <File className="w-5 h-5" />
    },
    {
      id: 'split',
      title: 'Split',
      description: 'Un Permission Set por tipo de permiso',
      icon: <Settings className="w-5 h-5" />
    },
    {
      id: 'unified',
      title: 'Unified',
      description: 'Todos los perfiles en un solo Permission Set',
      icon: <CheckCircle className="w-5 h-5" />
    }
  ];

  const handleSelectProfilesFolder = async () => {
    try {
      const folder = await window.electronAPI.selectProfilesFolder();
      if (folder) {
        updateState({ profilesFolder: folder });
        validateConfiguration({ ...state, profilesFolder: folder });
      }
    } catch (error) {
      console.error('Error selecting profiles folder:', error);
    }
  };

  const handleSelectOutputFolder = async () => {
    try {
      const folder = await window.electronAPI.selectOutputFolder();
      if (folder) {
        updateState({ outputFolder: folder });
        validateConfiguration({ ...state, outputFolder: folder });
      }
    } catch (error) {
      console.error('Error selecting output folder:', error);
    }
  };

  const handleSelectMappingFile = async () => {
    try {
      const file = await window.electronAPI.selectMappingFile();
      if (file) {
        updateState({ mappingFile: file });
      }
    } catch (error) {
      console.error('Error selecting mapping file:', error);
    }
  };

  const handleModeChange = (mode) => {
    updateState({ mode });
    validateConfiguration({ ...state, mode });
  };

  const validateConfiguration = (currentState) => {
    const isValid = currentState.profilesFolder && currentState.outputFolder;
    setIsValidated(isValid);
  };

  const handleNext = () => {
    if (isValidated) {
      onNext();
    }
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
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
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Configuración</h2>
          <p className="text-gray-600">
            Selecciona las carpetas y configura las opciones de generación
          </p>
        </motion.div>

        {/* Carpeta de perfiles */}
        <motion.div variants={itemVariants} className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Carpeta de Perfiles *
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSelectProfilesFolder}
              className="btn-apple-secondary px-6 py-3 flex items-center gap-2"
            >
              <FolderOpen className="w-5 h-5" />
              Seleccionar Carpeta
            </button>
            {state.profilesFolder && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-gray-600 truncate max-w-md">
                  {state.profilesFolder}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Carpeta de salida */}
        <motion.div variants={itemVariants} className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Carpeta de Salida *
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSelectOutputFolder}
              className="btn-apple-secondary px-6 py-3 flex items-center gap-2"
            >
              <FolderOpen className="w-5 h-5" />
              Seleccionar Carpeta
            </button>
            {state.outputFolder && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-gray-600 truncate max-w-md">
                  {state.outputFolder}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Modo de generación */}
        <motion.div variants={itemVariants} className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Modo de Generación
          </label>
          <div className="grid md:grid-cols-3 gap-4">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleModeChange(mode.id)}
                className={`p-4 rounded-2xl border-2 transition-all text-left ${
                  state.mode === mode.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-xl ${
                    state.mode === mode.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {mode.icon}
                  </div>
                  <span className="font-semibold text-gray-900">
                    {mode.title}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {mode.description}
                </p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Archivo de mapping opcional */}
        <motion.div variants={itemVariants} className="mb-10">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Archivo de Mapeo de Nombres (Opcional)
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSelectMappingFile}
              className="btn-apple-ghost px-6 py-3 flex items-center gap-2"
            >
              <File className="w-5 h-5" />
              Seleccionar Archivo JSON
            </button>
            {state.mappingFile && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-gray-600 truncate max-w-md">
                  {state.mappingFile}
                </span>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Personaliza los nombres de los Permission Sets generados
          </p>
        </motion.div>

        {/* Validación */}
        {!isValidated && (
          <motion.div variants={itemVariants} className="mb-6">
            <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <span className="text-sm text-amber-800">
                Debes seleccionar las carpetas de perfiles y salida para continuar
              </span>
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
            onClick={handleNext}
            disabled={!isValidated}
            className={`px-8 py-3 flex items-center gap-2 ${
              isValidated
                ? 'btn-apple-primary'
                : 'btn-apple bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>Procesar</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ConfigurationScreen; 