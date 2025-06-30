import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  FileText, 
  FolderOpen, 
  Eye,
  X,
  RefreshCw,
  ArrowLeft,
  AlertCircle,
  ExternalLink,
  Copy
} from 'lucide-react';

const ResultsScreen = ({ state, onStartOver, onGoBack }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleViewFile = async (filename) => {
    try {
      setIsLoading(true);
      const filePath = `${state.outputFolder}/${filename}`;
      const result = await window.electronAPI.readFileContent(filePath);
      
      if (result.success) {
        setSelectedFile(filename);
        setFileContent(result.content);
        setIsModalOpen(true);
      } else {
        console.error('Error reading file:', result.error);
      }
    } catch (error) {
      console.error('Error viewing file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenFolder = async () => {
    try {
      await window.electronAPI.openFolder(state.outputFolder);
    } catch (error) {
      console.error('Error opening folder:', error);
    }
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(fileContent);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    setFileContent('');
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

  const modalVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      transition: { duration: 0.2 }
    }
  };

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="max-w-4xl mx-auto"
      >
        <div className="card-apple">
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            {state.error ? (
              <>
                <div className="w-20 h-20 bg-red-100 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-3xl font-bold text-red-900 mb-2">Error</h2>
                <p className="text-red-600">{state.error}</p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-green-100 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Éxito!</h2>
                <p className="text-gray-600">
                  Se han generado {state.results?.permsetCount} Permission Sets a partir de {state.results?.profilesCount} perfiles
                </p>
              </>
            )}
          </motion.div>

          {!state.error && state.results && (
            <>
              {/* Estadísticas */}
              <motion.div variants={itemVariants} className="mb-8">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-primary-50 rounded-2xl p-6 text-center">
                    <div className="text-2xl font-bold text-primary-900 mb-1">
                      {state.results.profilesCount}
                    </div>
                    <div className="text-sm text-primary-700">Perfiles Procesados</div>
                  </div>
                  <div className="bg-green-50 rounded-2xl p-6 text-center">
                    <div className="text-2xl font-bold text-green-900 mb-1">
                      {state.results.permsetCount}
                    </div>
                    <div className="text-sm text-green-700">Permission Sets</div>
                  </div>
                  <div className="bg-blue-50 rounded-2xl p-6 text-center">
                    <div className="text-2xl font-bold text-blue-900 mb-1">
                      {state.results.permsets?.reduce((total, p) => total + (p.stats?.totalPermissions || 0), 0)}
                    </div>
                    <div className="text-sm text-blue-700">Permisos Totales</div>
                  </div>
                </div>
              </motion.div>

              {/* Lista de archivos generados */}
              <motion.div variants={itemVariants} className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Archivos Generados
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {state.results.permsets?.map((permset, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          <FileText className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {permset.filename}
                          </div>
                          <div className="text-sm text-gray-500">
                            {permset.stats?.totalPermissions || 0} permisos
                            {permset.sourceProfile && (
                              <span> • desde {permset.sourceProfile}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewFile(permset.filename)}
                        disabled={isLoading}
                        className="btn-apple-ghost px-4 py-2 flex items-center gap-2 text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        Ver
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Acciones */}
              <motion.div variants={itemVariants} className="flex flex-wrap gap-4 justify-center mb-6">
                <button
                  onClick={handleOpenFolder}
                  className="btn-apple-primary px-6 py-3 flex items-center gap-2"
                >
                  <FolderOpen className="w-5 h-5" />
                  Abrir Carpeta
                </button>
                <button
                  onClick={handleOpenFolder}
                  className="btn-apple-secondary px-6 py-3 flex items-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  Explorar Archivos
                </button>
              </motion.div>
            </>
          )}

          {/* Botones de navegación */}
          <motion.div variants={itemVariants} className="flex justify-between pt-6 border-t border-gray-100">
            <button
              onClick={onGoBack}
              className="btn-apple-ghost px-6 py-3 flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver
            </button>
            <button
              onClick={onStartOver}
              className="btn-apple-secondary px-6 py-3 flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Nuevo Proceso
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

      {/* Modal para ver contenido del archivo */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={closeModal}
          >
            <motion.div
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-white rounded-3xl shadow-apple-xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header del modal */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedFile}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Contenido del Permission Set
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyContent}
                    className="btn-apple-ghost px-4 py-2 flex items-center gap-2 text-sm"
                  >
                    <Copy className="w-4 h-4" />
                    Copiar
                  </button>
                  <button
                    onClick={closeModal}
                    className="btn-apple-ghost px-3 py-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Contenido del archivo */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <pre className="text-sm text-gray-800 bg-gray-50 rounded-2xl p-4 overflow-x-auto">
                  <code>{fileContent}</code>
                </pre>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ResultsScreen; 