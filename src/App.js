import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WelcomeScreen from './components/WelcomeScreen';
import FileUploader from './components/FileUploader';
import StepModeSelection from './components/StepModeSelection';
import ProcessingScreen from './components/ProcessingScreen';
import WebResultsScreen from './components/WebResultsScreen';
import { parseProfilesFromContent } from './webParser';
import * as generator from './generator';
import WebFileService from './services/webFileService';

const SCREENS = {
  WELCOME: 'welcome',
  FILE_UPLOAD: 'file-upload',
  MODE_SELECTION: 'mode-selection',
  PROCESSING: 'processing',
  RESULTS: 'results'
};

function App() {
  const [currentScreen, setCurrentScreen] = useState(SCREENS.WELCOME);
  const [appState, setAppState] = useState({
    profiles: [],
    nameMapping: null,
    mode: 'single',
    results: null,
    error: null,
    stats: null
  });

  const updateState = (updates) => {
    setAppState(prev => ({ ...prev, ...updates }));
  };

  // Mostrar autoría en consola al cargar la aplicación
  useEffect(() => {
    console.info("🚀 PermSet Builder desarrollado por Ignacio López Muñoyerro © 2025");
    console.info("📧 Contacto: ignacio.odi4@gmail.com");
    console.info("🛠️ Herramienta para conversión de perfiles Salesforce a Permission Sets");
  }, []);

  const goToScreen = (screen) => {
    setCurrentScreen(screen);
  };

  const resetApp = () => {
    setAppState({
      profiles: [],
      nameMapping: null,
      mode: 'single',
      results: null,
      error: null,
      stats: null
    });
    setCurrentScreen(SCREENS.WELCOME);
  };

  // Manejar carga de archivos
  const handleFilesLoaded = async (profiles, nameMapping) => {
    try {
      if (profiles.length === 0) {
        setAppState(prev => ({ ...prev, error: 'No se cargaron archivos válidos' }));
        return;
      }

      // Parsear perfiles
      const parsedProfiles = await parseProfilesFromContent(profiles);
      
      // Generar estadísticas
      const stats = WebFileService.generateProfileStats(profiles);
      
      updateState({
        profiles: parsedProfiles,
        nameMapping: nameMapping,
        stats: stats,
        error: null
      });

      setCurrentScreen(SCREENS.MODE_SELECTION);
    } catch (error) {
      console.error('Error processing files:', error);
      setAppState(prev => ({ ...prev, error: error.message }));
    }
  };

  // Manejar errores de carga
  const handleFileError = (error) => {
    setAppState(prev => ({ ...prev, error }));
  };

  // Ir a pantalla de procesamiento
  const startProcessing = () => {
    setCurrentScreen(SCREENS.PROCESSING);
  };

  // Procesar perfiles y generar Permission Sets (llamado desde ProcessingScreen)
  const processProfiles = async () => {
    try {
      const { profiles, nameMapping, mode } = appState;
      
      if (!profiles || profiles.length === 0) {
        throw new Error('No hay perfiles para procesar');
      }

      // Generar Permission Sets usando la lógica existente
      const permsets = await generator.generatePermsets(profiles, mode, nameMapping);
      
      updateState({
        results: {
          success: true,
          profilesCount: profiles.length,
          permsetCount: permsets.length,
          permsets: permsets,
          mode: mode
        },
        error: null
      });

      // Ir a resultados después de un breve delay para mostrar la pantalla de completado
      setTimeout(() => {
        setCurrentScreen(SCREENS.RESULTS);
      }, 1000);

    } catch (error) {
      console.error('Error processing profiles:', error);
      updateState({
        results: {
          success: false,
          error: error.message
        }
      });
      
      // Ir a resultados con error
      setTimeout(() => {
        setCurrentScreen(SCREENS.RESULTS);
      }, 1000);
    }
  };

  const screenVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  const screenTransition = {
    type: "tween",
    ease: "easeInOut",
    duration: 0.3
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="w-full max-w-4xl">
          <AnimatePresence mode="wait">
            {currentScreen === SCREENS.WELCOME && (
              <motion.div
                key="welcome"
                variants={screenVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={screenTransition}
              >
                <WelcomeScreen
                  onNext={() => goToScreen(SCREENS.FILE_UPLOAD)}
                />
              </motion.div>
            )}

            {currentScreen === SCREENS.FILE_UPLOAD && (
              <motion.div
                key="file-upload"
                variants={screenVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={screenTransition}
              >
                <div className="bg-white rounded-3xl shadow-xl p-8">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      Cargar Perfiles
                    </h2>
                    <p className="text-gray-600">
                      Sube tus archivos .profile-meta.xml para convertirlos a Permission Sets
                    </p>
                  </div>
                  
                  <FileUploader
                    onFilesLoaded={handleFilesLoaded}
                    onError={handleFileError}
                    allowMapping={true}
                  />
                  
                  {appState.error && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4"
                    >
                      <p className="text-red-800">{appState.error}</p>
                    </motion.div>
                  )}
                  
                  <div className="flex justify-between mt-8">
                    <button
                      onClick={() => goToScreen(SCREENS.WELCOME)}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      ← Volver
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {currentScreen === SCREENS.MODE_SELECTION && (
              <motion.div
                key="mode-selection"
                variants={screenVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={screenTransition}
              >
                <StepModeSelection
                  state={appState}
                  updateState={updateState}
                  onBack={() => goToScreen(SCREENS.FILE_UPLOAD)}
                  onNext={startProcessing}
                />
              </motion.div>
            )}

            {currentScreen === SCREENS.PROCESSING && (
              <motion.div
                key="processing"
                variants={screenVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={screenTransition}
              >
                <ProcessingScreen
                  state={appState}
                  updateState={updateState}
                  onBack={() => goToScreen(SCREENS.MODE_SELECTION)}
                  onProcess={processProfiles}
                />
              </motion.div>
            )}

            {currentScreen === SCREENS.RESULTS && (
              <motion.div
                key="results"
                variants={screenVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={screenTransition}
              >
                <WebResultsScreen
                  state={appState}
                  onStartOver={resetApp}
                  onGoBack={() => goToScreen(SCREENS.FILE_UPLOAD)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default App; 