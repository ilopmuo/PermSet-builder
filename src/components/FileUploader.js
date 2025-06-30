import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, AlertCircle, X, CheckCircle, Download } from 'lucide-react';
import WebFileService from '../services/webFileService';

const FileUploader = ({ onFilesLoaded, onError, allowMapping = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mappingFile, setMappingFile] = useState(null);

  // Manejar drag & drop
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  }, []);

  const handleFileSelect = useCallback(async (e) => {
    const files = Array.from(e.target.files);
    await processFiles(files);
  }, []);

  const handleMappingSelect = useCallback(async (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.json')) {
      setMappingFile(file);
    } else {
      onError('Por favor selecciona un archivo JSON válido');
    }
  }, [onError]);

  const processFiles = async (files) => {
    try {
      setLoading(true);
      
      // Filtrar solo archivos .profile-meta.xml
      const profileFiles = files.filter(file => 
        file.name.endsWith('.profile-meta.xml')
      );
      
      if (profileFiles.length === 0) {
        onError('No se encontraron archivos .profile-meta.xml válidos');
        return;
      }

      // Validar archivos
      const invalidFiles = [];
      for (const file of profileFiles) {
        const validation = WebFileService.validateProfileFile(file);
        if (!validation.valid) {
          invalidFiles.push(`${file.name}: ${validation.error}`);
        }
      }

      if (invalidFiles.length > 0) {
        onError(`Archivos inválidos encontrados:\n${invalidFiles.join('\n')}`);
        return;
      }

      setUploadedFiles(profileFiles);
      
      // Leer archivos
      const profiles = await WebFileService.readProfileFiles(profileFiles);
      
      // Leer mapping si existe
      let mapping = null;
      if (mappingFile) {
        mapping = await WebFileService.readMappingFile(mappingFile);
      }

      onFilesLoaded(profiles, mapping);
      
    } catch (error) {
      onError(error.message);
      setUploadedFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (indexToRemove) => {
    const newFiles = uploadedFiles.filter((_, index) => index !== indexToRemove);
    setUploadedFiles(newFiles);
    
    if (newFiles.length === 0) {
      onFilesLoaded([], null);
    }
  };

  const removeMappingFile = () => {
    setMappingFile(null);
  };

  const downloadSampleMapping = () => {
    WebFileService.downloadSampleMapping();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Área de drag & drop principal */}
      <motion.div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${uploadedFiles.length > 0 ? 'bg-gray-50' : 'bg-white'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          accept=".profile-meta.xml"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600">Procesando archivos...</p>
            </motion.div>
          ) : uploadedFiles.length > 0 ? (
            <motion.div
              key="uploaded"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center text-green-600 mb-4">
                <CheckCircle className="w-8 h-8 mr-2" />
                <span className="text-lg font-medium">
                  {uploadedFiles.length} archivo{uploadedFiles.length !== 1 ? 's' : ''} cargado{uploadedFiles.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {uploadedFiles.map((file, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-between bg-white p-2 rounded border"
                  >
                    <div className="flex items-center">
                      <File className="w-4 h-4 text-blue-500 mr-2" />
                      <span className="text-sm truncate">{file.name}</span>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
              
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                Agregar más archivos
              </label>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <Upload className="w-16 h-16 text-gray-400 mx-auto" />
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Arrastra tus archivos de perfil aquí
                </h3>
                <p className="text-gray-600 mb-4">
                  O haz clic para seleccionar archivos .profile-meta.xml
                </p>
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-colors"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Seleccionar Archivos
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Sección de mapping (opcional) */}
      {allowMapping && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">
              Mapeo de Nombres (Opcional)
            </h4>
            <button
              onClick={downloadSampleMapping}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <Download className="w-4 h-4 mr-1" />
              Descargar ejemplo
            </button>
          </div>
          
          <p className="text-sm text-gray-600">
            Sube un archivo JSON para personalizar los nombres de los Permission Sets generados.
          </p>

          {mappingFile ? (
            <div className="flex items-center justify-between bg-white p-3 rounded border">
              <div className="flex items-center">
                <File className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm">{mappingFile.name}</span>
              </div>
              <button
                onClick={removeMappingFile}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <input
                type="file"
                id="mapping-upload"
                accept=".json"
                onChange={handleMappingSelect}
                className="hidden"
              />
              <label
                htmlFor="mapping-upload"
                className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" />
                Seleccionar archivo JSON
              </label>
            </div>
          )}
        </motion.div>
      )}

      {/* Información de privacidad */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-green-50 border border-green-200 rounded-lg p-4"
      >
        <div className="flex items-start">
          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-green-800 font-medium mb-1">
              🔒 Procesamiento 100% local
            </p>
            <p className="text-green-700">
              Tus archivos se procesan completamente en tu navegador. 
              No se suben a ningún servidor externo.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FileUploader; 