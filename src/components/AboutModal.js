import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, User, Calendar, Code } from 'lucide-react';

const AboutModal = ({ isOpen, onClose }) => {
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

  const itemVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="bg-white rounded-3xl shadow-apple-xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <img 
                  src="/logo.png" 
                  alt="PermSet Builder Logo" 
                  className="w-8 h-8 object-contain" 
                />
                <h3 className="text-xl font-semibold text-gray-900">
                  Acerca de PermSet Builder
                </h3>
              </div>
              <button
                onClick={onClose}
                className="btn-apple-ghost px-3 py-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido */}
            <motion.div 
              variants={containerVariants}
              initial="initial"
              animate="animate"
              className="p-6 space-y-6"
            >
              {/* Información del autor */}
              <motion.div variants={itemVariants} className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-3xl mx-auto mb-4 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Ignacio López Muñoyerro
                </h4>
                <p className="text-gray-600 text-sm">
                  Desarrollador de Salesforce
                </p>
              </motion.div>

              {/* Información de la aplicación */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                  <Code className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Versión</div>
                    <div className="text-sm text-gray-600">1.0.0</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Contacto</div>
                    <div className="text-sm text-gray-600">ignacio.odi4@gmail.com</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Año</div>
                    <div className="text-sm text-gray-600">2025</div>
                  </div>
                </div>
              </motion.div>

              {/* Descripción */}
              <motion.div variants={itemVariants} className="text-center">
                <p className="text-sm text-gray-600 leading-relaxed">
                  Esta herramienta ha sido desarrollada por Ignacio López Muñoyerro 
                  para facilitar la migración de perfiles a Permission Sets en Salesforce.
                </p>
              </motion.div>

              {/* Copyright */}
              <motion.div variants={itemVariants} className="text-center pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  © 2025 Ignacio López Muñoyerro. Todos los derechos reservados.
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AboutModal; 