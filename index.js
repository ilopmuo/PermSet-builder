#!/usr/bin/env node

const { program } = require('commander');
const cli = require('./src/cli');

// Configurar la CLI principal
program
  .name('permset-builder')
  .description('CLI para convertir perfiles de Salesforce a Permission Sets')
  .version('1.0.0');

// Comando principal
program
  .requiredOption('-i, --input <folder>', 'Carpeta con los archivos .profile-meta.xml')
  .requiredOption('-o, --output <folder>', 'Carpeta donde se generarán los permsets')
  .option('-m, --mode <mode>', 'Modo de generación: single, split, unified', 'single')
  .option('--dry-run', 'Solo imprime en consola lo que se generaría')
  .option('-n, --name-mapping <file>', 'Archivo JSON con nombres personalizados')
  .action(cli.run);

program.parse(); 