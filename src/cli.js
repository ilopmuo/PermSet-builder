const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const parser = require('./parser');
const generator = require('./generator');
const utils = require('./utils');

/**
 * Función principal que ejecuta la CLI
 */
async function run(options) {
  try {
    console.log(chalk.blue('🛠️  PermSet Builder CLI'));
    console.log(chalk.gray('════════════════════════════'));
    
    // Validar opciones
    validateOptions(options);
    
    // Cargar mapping de nombres si existe
    const nameMapping = await loadNameMapping(options.nameMapping);
    
    // Leer archivos de perfil
    console.log(chalk.yellow('📂 Leyendo archivos de perfil...'));
    const profiles = await parser.readProfiles(options.input);
    console.log(chalk.green(`✅ Encontrados ${profiles.length} perfiles`));
    
    // Generar permsets según el modo
    console.log(chalk.yellow(`🔄 Generando permsets (modo: ${options.mode})...`));
    const permsets = await generator.generatePermsets(profiles, options.mode, nameMapping);
    
    if (options.dryRun) {
      // Modo dry-run: solo mostrar lo que se generaría
      console.log(chalk.cyan('\n🔍 MODO DRY-RUN - Archivos que se generarían:'));
      permsets.forEach(permset => {
        console.log(chalk.white(`  📄 ${permset.filename}`));
        console.log(chalk.gray(`     Permisos: ${permset.stats.totalPermissions}`));
      });
    } else {
      // Escribir archivos
      console.log(chalk.yellow('💾 Escribiendo archivos...'));
      await writePermsets(permsets, options.output);
      console.log(chalk.green(`✅ Generados ${permsets.length} archivos en ${options.output}`));
    }
    
    console.log(chalk.blue('\n🎉 ¡Proceso completado!'));
    
  } catch (error) {
    console.error(chalk.red('❌ Error:'), error.message);
    process.exit(1);
  }
}

/**
 * Valida las opciones proporcionadas
 */
function validateOptions(options) {
  // Validar carpeta de entrada
  if (!fs.existsSync(options.input)) {
    throw new Error(`La carpeta de entrada no existe: ${options.input}`);
  }
  
  // Validar modo
  const validModes = ['single', 'split', 'unified'];
  if (!validModes.includes(options.mode)) {
    throw new Error(`Modo inválido: ${options.mode}. Debe ser uno de: ${validModes.join(', ')}`);
  }
  
  // Crear carpeta de salida si no existe
  if (!options.dryRun && !fs.existsSync(options.output)) {
    fs.mkdirSync(options.output, { recursive: true });
  }
}

/**
 * Carga el archivo de mapping de nombres si existe
 */
async function loadNameMapping(mappingFile) {
  if (!mappingFile) return null;
  
  try {
    if (!fs.existsSync(mappingFile)) {
      throw new Error(`Archivo de mapping no encontrado: ${mappingFile}`);
    }
    
    const content = fs.readFileSync(mappingFile, 'utf8');
    const mapping = JSON.parse(content);
    console.log(chalk.green('✅ Mapping de nombres cargado'));
    return mapping;
  } catch (error) {
    throw new Error(`Error al cargar mapping de nombres: ${error.message}`);
  }
}

/**
 * Escribe los permsets generados en la carpeta de salida
 */
async function writePermsets(permsets, outputDir) {
  for (const permset of permsets) {
    const filePath = path.join(outputDir, permset.filename);
    fs.writeFileSync(filePath, permset.content, 'utf8');
    console.log(chalk.gray(`  📄 ${permset.filename}`));
  }
}

module.exports = {
  run
}; 