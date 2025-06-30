import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  FileText, 
  Download, 
  Eye,
  X,
  RefreshCw,
  ArrowLeft,
  AlertCircle,
  Copy,
  Package
} from 'lucide-react';
import WebFileService from '../services/webFileService';

const WebResultsScreen = ({ state, onStartOver, onGoBack }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleViewFile = (permset) => {
    setSelectedFile(permset.filename);
    setFileContent(permset.content);
    setIsModalOpen(true);
  };

  const handleDownloadAll = async () => {
    try {
      setIsDownloading(true);
      
      const { results } = state;
      if (!results?.permsets || results.permsets.length === 0) {
        return;
      }

      const fileName = `PermissionSets_${results.mode}_${new Date().toISOString().split('T')[0]}.zip`;
      
      await WebFileService.downloadPermissionSets(results.permsets, fileName);
      
    } catch (error) {
      console.error('Error downloading files:', error);
      alert(`Error al descargar archivos: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadSingle = async (permset) => {
    try {
      await WebFileService.downloadSingleFile(permset.content, permset.filename);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert(`Error al descargar archivo: ${error.message}`);
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
            {state.error || (state.results && !state.results.success) ? (
              <>
                <div className="w-20 h-20 bg-red-100 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-3xl font-bold text-red-900 mb-2">Error</h2>
                <p className="text-red-600">
                  {state.error || state.results?.error || 'Error desconocido'}
                </p>
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
                <p className="text-sm text-blue-600 bg-blue-50 rounded-lg px-4 py-2 mt-4 inline-block">
                  🎉 Listos para descargar en modo {state.results?.mode}
                </p>
              </>
            )}
          </motion.div>

          {!state.error && state.results && state.results.success && (
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

              {/* Descarga masiva */}
              <motion.div variants={itemVariants} className="mb-8">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <Package className="w-8 h-8 text-blue-600 mr-2" />
                    <h3 className="text-xl font-semibold text-gray-900">
                      Descargar Todo
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Descarga todos los Permission Sets en un archivo ZIP
                  </p>
                  <button
                    onClick={handleDownloadAll}
                    disabled={isDownloading}
                    className="btn-apple-primary px-8 py-3 flex items-center gap-2 mx-auto"
                  >
                    {isDownloading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <Download className="w-5 h-5" />
                    )}
                    {isDownloading ? 'Generando ZIP...' : 'Descargar ZIP'}
                  </button>
                </div>
              </motion.div>

              {/* Lista de archivos generados */}
              <motion.div variants={itemVariants} className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Archivos Generados
                </h3>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {state.results.permsets?.map((permset, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          <FileText className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900 truncate">
                            {permset.filename}
                          </div>
                          <div className="text-sm text-gray-500">
                            {permset.stats?.totalPermissions || 0} permisos
                            {permset.sourceProfile && (
                              <span> • desde {permset.sourceProfile}</span>
                            )}
                            {permset.permissionType && (
                              <span> • {permset.permissionType}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleViewFile(permset)}
                          className="btn-apple-ghost px-3 py-2 flex items-center gap-1 text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </button>
                        <button
                          onClick={() => handleDownloadSingle(permset)}
                          className="btn-apple-secondary px-3 py-2 flex items-center gap-1 text-sm"
                        >
                          <Download className="w-4 h-4" />
                          Descargar
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
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

          {/* Información de privacidad */}
          <motion.div variants={itemVariants} className="mt-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-green-800 font-medium mb-1">
                    🔒 Procesamiento 100% local completado
                  </p>
                  <p className="text-green-700">
                    Tus archivos fueron procesados completamente en tu navegador. 
                    Ningún dato fue enviado a servidores externos.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Marca de agua de autoría */}
          <motion.div variants={itemVariants} className="mt-8">
            <div className="text-xs text-gray-500 text-center select-none bg-gray-50/50 py-2 px-4 rounded-full mx-auto w-fit">
              Ignacio López Muñoyerro – PermSet Builder Web © 2025
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

export default WebResultsScreen; 