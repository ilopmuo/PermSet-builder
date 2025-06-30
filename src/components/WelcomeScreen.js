import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Shield, Sparkles, Info } from 'lucide-react';
import AboutModal from './AboutModal';

const WelcomeScreen = ({ onNext }) => {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const features = [
    {
      icon: <Zap className="w-6 h-6 text-primary-600" />,
      title: "Conversión Rápida",
      description: "Transforma múltiples perfiles en segundos"
    },
    {
      icon: <Shield className="w-6 h-6 text-primary-600" />,
      title: "Validación Completa", 
      description: "XML compatible con Salesforce DX"
    },
    {
      icon: <Sparkles className="w-6 h-6 text-primary-600" />,
      title: "Múltiples Modos",
      description: "Single, Split o Unified según tus necesidades"
    }
  ];

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="text-center"
    >
      <div className="card-apple max-w-2xl mx-auto">
        {/* Logo y título */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="PermSet Builder Logo" 
              className="w-20 h-20 object-contain drop-shadow-lg" 
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            PermSet Builder
          </h1>
          <p className="text-xl text-gray-600">
            Aplicación web gratuita para convertir perfiles de Salesforce a Permission Sets
          </p>
          <p className="text-sm text-blue-600 bg-blue-50 rounded-lg px-4 py-2 mt-4 inline-block">
            🌐 100% en el navegador • Sin instalación • Sin subida de archivos
          </p>
        </motion.div>

        {/* Características */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center"
              >
                <div className="w-12 h-12 bg-primary-50 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Botones de acción */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <button
            onClick={onNext}
            className="btn-apple-primary px-8 py-4 text-base font-semibold group"
          >
            <span>Comenzar</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            onClick={() => setIsAboutOpen(true)}
            className="btn-apple-ghost px-6 py-4 text-base flex items-center gap-2"
          >
            <Info className="w-5 h-5" />
            <span>Acerca de</span>
          </button>
        </motion.div>

        {/* Información adicional */}
        <motion.div variants={itemVariants} className="mt-8 pt-8 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-6">
            Herramienta web gratuita para desarrolladores de Salesforce. 
            Todos los archivos se procesan localmente en tu navegador.
          </p>
          
          {/* Marca de agua de autoría */}
          <div className="text-xs text-gray-500 text-center select-none bg-gray-50/50 py-2 px-4 rounded-full mx-auto w-fit">
            Ignacio López Muñoyerro – PermSet Builder © 2025
          </div>
        </motion.div>
      </div>

      {/* Modal About */}
      <AboutModal 
        isOpen={isAboutOpen} 
        onClose={() => setIsAboutOpen(false)} 
      />
    </motion.div>
  );
};

export default WelcomeScreen; 