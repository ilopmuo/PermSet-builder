import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Servicio para manejar archivos en el navegador
export class WebFileService {
  
  /**
   * Lee múltiples archivos de perfil desde el input de archivos
   */
  static async readProfileFiles(fileList) {
    const profiles = [];
    
    for (const file of fileList) {
      if (file.name.endsWith('.profile-meta.xml')) {
        try {
          const content = await this.readFileContent(file);
          const profile = {
            name: file.name.replace('.profile-meta.xml', ''),
            fileName: file.name,
            content: content,
            size: file.size
          };
          profiles.push(profile);
        } catch (error) {
          console.error(`Error leyendo archivo ${file.name}:`, error);
          throw new Error(`Error al leer ${file.name}: ${error.message}`);
        }
      }
    }
    
    if (profiles.length === 0) {
      throw new Error('No se encontraron archivos .profile-meta.xml válidos');
    }
    
    return profiles;
  }
  
  /**
   * Lee el contenido de un archivo usando FileReader
   */
  static readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      
      reader.onerror = () => {
        reject(new Error(`Error al leer el archivo: ${file.name}`));
      };
      
      reader.readAsText(file, 'utf-8');
    });
  }
  
  /**
   * Lee el contenido de un archivo de mapping JSON
   */
  static async readMappingFile(file) {
    try {
      const content = await this.readFileContent(file);
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Error al leer mapping file: ${error.message}`);
    }
  }
  
  /**
   * Genera y descarga un ZIP con todos los Permission Sets
   */
  static async downloadPermissionSets(permsets, fileName = 'PermissionSets.zip') {
    try {
      const zip = new JSZip();
      
      // Agregar cada permission set al ZIP
      permsets.forEach(permset => {
        zip.file(permset.filename, permset.content);
      });
      
      // Generar el ZIP
      const content = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 6
        }
      });
      
      // Descargar el archivo
      saveAs(content, fileName);
      
      return {
        success: true,
        fileCount: permsets.length,
        fileName: fileName
      };
      
    } catch (error) {
      console.error('Error generando ZIP:', error);
      throw new Error(`Error al generar descarga: ${error.message}`);
    }
  }
  
  /**
   * Descarga un solo archivo Permission Set
   */
  static downloadSingleFile(content, filename) {
    try {
      const blob = new Blob([content], { type: 'application/xml' });
      saveAs(blob, filename);
      return { success: true, filename };
    } catch (error) {
      throw new Error(`Error al descargar archivo: ${error.message}`);
    }
  }
  
  /**
   * Valida si un archivo es un perfil válido (básica validación)
   */
  static validateProfileFile(file) {
    // Validar extensión
    if (!file.name.endsWith('.profile-meta.xml')) {
      return { valid: false, error: 'El archivo debe tener extensión .profile-meta.xml' };
    }
    
    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return { valid: false, error: 'El archivo es demasiado grande (máximo 10MB)' };
    }
    
    return { valid: true };
  }
  
  /**
   * Procesa archivos desde drag & drop
   */
  static async handleDroppedFiles(items) {
    const files = [];
    
    for (const item of items) {
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file && file.name.endsWith('.profile-meta.xml')) {
          files.push(file);
        }
      }
    }
    
    return files;
  }
  
  /**
   * Crea un archivo de ejemplo para descargar
   */
  static downloadSampleMapping() {
    const sampleMapping = {
      "Admin": "AdminPermissions",
      "Sales_Manager": "SalesPermissions", 
      "splitOverrides": {
        "Admin_objectPermissions": "Admin_ObjectAccess",
        "Admin_userPermissions": "Admin_UserPerms",
        "Sales_Manager_objectPermissions": "Sales_ObjectAccess"
      }
    };
    
    const content = JSON.stringify(sampleMapping, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    saveAs(blob, 'sample-mapping.json');
  }
  
  /**
   * Genera estadísticas de los archivos cargados
   */
  static generateProfileStats(profiles) {
    return {
      totalProfiles: profiles.length,
      totalSize: profiles.reduce((sum, p) => sum + p.size, 0),
      profileNames: profiles.map(p => p.name),
      averageSize: profiles.length > 0 ? 
        Math.round(profiles.reduce((sum, p) => sum + p.size, 0) / profiles.length) : 0
    };
  }
}

export default WebFileService; 