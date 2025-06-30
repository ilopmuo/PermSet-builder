import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, ArrowLeft } from 'lucide-react';

const ProcessingScreen = ({ state, updateState, onBack, onProcess }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [isProcessing, setIsProcessing] = useState(true);

  const steps = [
    'Validando configuración...',
    'Leyendo archivos de perfil...',
    'Analizando permisos...',
    'Generando Permission Sets...',
    'Escribiendo archivos...',
    '¡Completado!'
  ];

  useEffect(() => {
    const processProfiles = async () => {
      try {
        setIsProcessing(true);
        
        // Simular progreso por pasos con animación
        for (let i = 0; i < steps.length - 2; i++) {
          setCurrentStep(steps[i]);
          setProgress((i / (steps.length - 2)) * 70);
          
          // Pausa para mostrar el progreso
          await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
        }

        // Paso de procesamiento real
        setCurrentStep(steps[steps.length - 2]); // "Generando Permission Sets..."
        setProgress(85);
        
        // Ejecutar el procesamiento real
        if (onProcess) {
          await onProcess();
        }
        
        // Finalización
        setCurrentStep(steps[steps.length - 1]);
        setProgress(100);
        
        // Pausa para mostrar completado antes de que App.js cambie de pantalla
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setIsProcessing(false);

      } catch (error) {
        console.error('Processing error:', error);
        setIsProcessing(false);
        updateState({ error: error.message });
      }
    };

    // Solo ejecutar si no hay resultados aún (para evitar bucles)
    if (!state.results) {
      processProfiles();
    } else {
      // Si ya hay resultados, mostrar completado inmediatamente
      setCurrentStep(steps[steps.length - 1]);
      setProgress(100);
      setIsProcessing(false);
    }
  }, [state, updateState, onProcess]);

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const pulseVariants = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="max-w-2xl mx-auto"
    >
      <div className="card-apple text-center">
        {/* Icono animado */}
        <motion.div 
          variants={pulseVariants}
          initial="initial"
          animate="animate"
          className="mb-8"
        >
          <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center relative">
            <img 
              src="/logo.png" 
              alt="PermSet Builder Logo" 
              className="w-24 h-24 object-contain drop-shadow-lg" 
            />
            {/* Overlay con icono de estado */}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center shadow-lg">
              {isProcessing ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5 text-white" />
              )}
            </div>
          </div>
        </motion.div>

        {/* Título y descripción */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isProcessing ? 'Procesando...' : '¡Completado!'}
          </h2>
          <p className="text-gray-600">
            {isProcessing 
              ? 'Convirtiendo tus perfiles a Permission Sets'
              : 'Tus Permission Sets han sido generados exitosamente'
            }
          </p>
        </div>

        {/* Paso actual */}
        <div className="mb-8">
          <motion.p 
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg text-primary-700 font-medium"
          >
            {currentStep}
          </motion.p>
        </div>

        {/* Barra de progreso */}
        <div className="mb-8">
          <div className="progress-apple">
            <motion.div 
              className="progress-apple-indicator"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>0%</span>
            <motion.span
              key={progress}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {Math.round(progress)}%
            </motion.span>
            <span>100%</span>
          </div>
        </div>

        {/* Información de configuración */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left">
          <h3 className="font-semibold text-gray-900 mb-4">Configuración</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Modo:</span>
              <span className="font-medium text-gray-900 capitalize">{state.mode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Perfiles cargados:</span>
              <span className="font-medium text-gray-900">
                {state.profiles?.length || 0} archivo{state.profiles?.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Salida:</span>
              <span className="font-medium text-gray-900">
                Descarga directa
              </span>
            </div>
            {state.nameMapping && Object.keys(state.nameMapping).length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Name Mapping:</span>
                <span className="font-medium text-gray-900">
                  {Object.keys(state.nameMapping).length} mapeo{Object.keys(state.nameMapping).length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Botón volver (solo cuando no está procesando) */}
        {!isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={onBack}
              className="btn-apple-ghost px-6 py-3 flex items-center gap-2 mx-auto"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver a Configuración
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ProcessingScreen; 