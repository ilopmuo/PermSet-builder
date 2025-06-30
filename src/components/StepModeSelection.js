import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  File, 
  Settings, 
  CheckCircle,
  Zap,
  Folder,
  FileText,
  Eye
} from 'lucide-react';
import PreviewVisualizer from './PreviewVisualizer';

const StepModeSelection = ({ state, updateState, onNext, onBack, onAnalyzer }) => {
  const [selectedMode, setSelectedMode] = useState(state.mode || 'single');

  const modes = [
    {
      id: 'single',
      title: 'Single',
      icon: <File className="w-6 h-6" />,
      emoji: '🧩',
      description: 'Un Permission Set por cada perfil',
      detail: 'Ideal para migrar perfiles completos manteniendo su estructura original',
      pros: ['Migración directa', 'Estructura simple', 'Fácil de entender'],
      color: 'blue'
    },
    {
      id: 'split',
      title: 'Split',
      icon: <Settings className="w-6 h-6" />,
      emoji: '🪓',
      description: 'Un Permission Set por tipo de permiso',
      detail: 'Separa cada tipo de permiso en archivos independientes para máxima flexibilidad',
      pros: ['Granularidad máxima', 'Flexibilidad total', 'Reutilización fácil'],
      color: 'purple'
    },
    {
      id: 'unified',
      title: 'Unified',
      icon: <CheckCircle className="w-6 h-6" />,
      emoji: '🧷',
      description: 'Un único Permission Set para todo',
      detail: 'Combina todos los perfiles eliminando duplicados en un solo archivo',
      pros: ['Gestión simple', 'Sin duplicados', 'Deploy rápido'],
      color: 'green'
    },
    {
      id: 'base+specific',
      title: 'Base + Specific',
      icon: <Folder className="w-6 h-6" />,
      emoji: '🎯',
      description: 'Permission Set común + archivos específicos',
      detail: 'Genera un archivo base con permisos comunes y archivos específicos con diferencias',
      pros: ['Optimización inteligente', 'Reduce duplicación', 'Fácil mantenimiento'],
      color: 'orange'
    }
  ];

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
    updateState({ mode });
  };

  const handleNext = () => {
    updateState({ mode: selectedMode });
    onNext();
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

  const getColorClasses = (color, isSelected) => {
    const colors = {
      blue: {
        border: isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300',
        icon: isSelected ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600',
        accent: 'text-blue-600'
      },
      purple: {
        border: isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300',
        icon: isSelected ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-600',
        accent: 'text-purple-600'
      },
      green: {
        border: isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300',
        icon: isSelected ? 'bg-green-500 text-white' : 'bg-green-100 text-green-600',
        accent: 'text-green-600'
      },
      orange: {
        border: isSelected ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300',
        icon: isSelected ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-600',
        accent: 'text-orange-600'
      }
    };
    return colors[color];
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="max-w-5xl mx-auto"
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
            Modo de Generación
          </h2>
          <p className="text-gray-600">
            Selecciona cómo quieres organizar tus Permission Sets
          </p>
          <div className="text-sm text-gray-500 mt-2">
            Paso 2 de 2
          </div>
        </motion.div>

        {/* Selector de modos con vista previa contextual */}
        <motion.div variants={itemVariants}>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Elige tu modo preferido
          </h3>
          
          <div className="space-y-6">
            {modes.map((mode) => {
              const isSelected = selectedMode === mode.id;
              const colorClasses = getColorClasses(mode.color, isSelected);
              
              return (
                <div key={mode.id} className="space-y-4">
                  {/* Botón del modo */}
                  <motion.button
                    onClick={() => handleModeSelect(mode.id)}
                    className={`w-full p-6 border-2 rounded-3xl text-left transition-all duration-200 ${colorClasses.border}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${colorClasses.icon}`}>
                        {mode.icon}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{mode.emoji}</span>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {mode.title}
                          </h4>
                          {isSelected && (
                            <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                          )}
                        </div>
                        
                        <p className="text-gray-700 mb-3">
                          {mode.description}
                        </p>
                        
                        <p className="text-sm text-gray-600 mb-3">
                          {mode.detail}
                        </p>
                        
                        <div className="flex flex-wrap gap-2">
                          {mode.pros.map((pro, index) => (
                            <span 
                              key={index}
                              className={`text-xs px-2 py-1 rounded-full ${
                                isSelected 
                                  ? `bg-${mode.color}-100 ${colorClasses.accent}` 
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {pro}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.button>

                  {/* Vista previa contextual - Solo se muestra para el modo seleccionado */}
                  <AnimatePresence mode="wait">
                    {isSelected && (
                      <motion.div
                        key={`selected-${mode.id}`} // Key única para detectar cambios
                        initial={{ opacity: 0, height: 0, y: 6 }}
                        animate={{ 
                          opacity: 1, 
                          height: 'auto', 
                          y: 0,
                          transition: {
                            duration: 0.8,
                            ease: [0.16, 1, 0.3, 1], // Curva más suave y fluida
                            height: {
                              duration: 0.8,
                              ease: [0.16, 1, 0.3, 1]
                            }
                          }
                        }}
                        exit={{ 
                          opacity: 0, 
                          height: 0, 
                          y: -6,
                          transition: {
                            duration: 0.6,
                            ease: [0.16, 1, 0.3, 1]
                          }
                        }}
                        className="overflow-hidden"
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ 
                            opacity: 1, 
                            y: 0,
                            transition: {
                              duration: 0.7,
                              delay: 0.2,
                              ease: [0.16, 1, 0.3, 1]
                            }
                          }}
                          exit={{ 
                            opacity: 0, 
                            y: -4,
                            transition: {
                              duration: 0.4,
                              ease: [0.16, 1, 0.3, 1]
                            }
                          }}
                          className="flex flex-col lg:flex-row items-start gap-6 mt-6"
                        >
                          {/* Información del modo seleccionado */}
                          <div className="flex-1">
                            <div className="p-6 bg-gray-50/80 rounded-3xl border border-gray-100">
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                  <FileText className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">
                                    Información del modo {mode.title}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {mode.id === 'single' && 'Cada perfil se convertirá en un archivo Permission Set independiente con el mismo nombre.'}
                                    {mode.id === 'split' && 'Cada tipo de permiso (Object, Field, User, etc.) se dividirá en archivos separados para máxima granularidad.'}
                                    {mode.id === 'unified' && 'Todos los permisos de todos los perfiles se combinarán en un único archivo eliminando duplicados automáticamente.'}
                                    {mode.id === 'base+specific' && 'Se creará un archivo Common.permissionset-meta.xml con permisos compartidos entre todos los perfiles, y archivos específicos por perfil con solo sus permisos únicos.'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Vista previa de archivos */}
                          <div className="w-full lg:w-[400px] mt-4 lg:mt-0">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">
                              Vista previa del resultado
                            </h4>
                            <div className="bg-white rounded-2xl border border-gray-200 p-1 shadow-sm">
                              <motion.div
                                key={`preview-${mode.id}`}
                                initial={{ opacity: 0, scale: 0.99 }}
                                animate={{ 
                                  opacity: 1, 
                                  scale: 1,
                                  transition: {
                                    duration: 0.7,
                                    delay: 0.4,
                                    ease: [0.16, 1, 0.3, 1]
                                  }
                                }}
                                exit={{ 
                                  opacity: 0, 
                                  scale: 0.97,
                                  transition: {
                                    duration: 0.4,
                                    ease: [0.16, 1, 0.3, 1]
                                  }
                                }}
                              >
                                <PreviewVisualizer 
                                  mode={mode.id}
                                  profilesFolder={state.profilesFolder}
                                  outputFolder={state.outputFolder}
                                  detectedProfiles={state.detectedProfiles}
                                />
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Botones de navegación */}
        <motion.div 
          variants={itemVariants} 
          className="pt-8 border-t border-gray-100 mt-12 space-y-4"
        >
          {/* Botón Analizar Perfiles */}
          <div className="flex justify-center">
            <button
              onClick={onAnalyzer}
              className="btn-apple-secondary px-6 py-3 flex items-center gap-2 hover:shadow-lg transform hover:scale-[1.02] transition-all"
            >
              <Eye className="w-5 h-5" />
              🔍 Analizar perfiles
            </button>
          </div>
          
          {/* Botones principales */}
          <div className="flex justify-between">
            <button
              onClick={onBack}
              className="btn-apple-ghost px-6 py-3 flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver a Carpetas
            </button>
            <button
              onClick={handleNext}
              className="btn-apple-primary px-8 py-3 flex items-center gap-2 font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all"
            >
              <span>Generar Permission Sets</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
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

export default StepModeSelection; 