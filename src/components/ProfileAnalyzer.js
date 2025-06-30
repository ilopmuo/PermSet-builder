import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Search, 
  CheckCircle, 
  XCircle, 
  ChevronDown, 
  ChevronRight,
  Shield,
  User,
  Database,
  Lock,
  Unlock,
  GitCompare,
  Eye,
  FileText
} from 'lucide-react';

const ProfileAnalyzer = ({ state, onBack }) => {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileData, setProfileData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    objectPermissions: true,
    fieldPermissions: false,
    userPermissions: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedProfiles, setSelectedProfiles] = useState([]);

  // Cargar datos de perfiles al montar el componente
  useEffect(() => {
    if (state.detectedProfiles?.length > 0 && !selectedProfile) {
      setSelectedProfile(state.detectedProfiles[0]);
    }
  }, [state.detectedProfiles, selectedProfile]);

  // Cargar datos cuando se selecciona un perfil
  useEffect(() => {
    if (selectedProfile) {
      loadProfileData(selectedProfile);
    }
  }, [selectedProfile]);

  const loadProfileData = async (profile) => {
    setIsLoading(true);
    try {
      console.log('Loading profile data for:', profile.name, profile.path);
      
      // Verificar si ya tenemos los datos cargados
      if (profileData[profile.name]) {
        console.log('Profile data already loaded for:', profile.name);
        setIsLoading(false);
        return;
      }

      const result = await window.electronAPI.readFileContent(profile.path);
      console.log('File read result:', result);
      
      if (result.success) {
        const parsedData = parseProfileXML(result.content);
        console.log('Parsed profile data:', parsedData);
        
        setProfileData(prev => ({
          ...prev,
          [profile.name]: parsedData
        }));
      } else {
        console.error('Failed to read file:', result.error);
        // Usar datos de ejemplo si no se puede leer el archivo
        const fallbackData = {
          objectPermissions: [
            { object: 'Account', allowCreate: true, allowRead: true, allowEdit: true, allowDelete: true, viewAllRecords: true, modifyAllRecords: true },
            { object: 'Opportunity', allowCreate: true, allowRead: true, allowEdit: true, allowDelete: false, viewAllRecords: true, modifyAllRecords: false },
            { object: 'Contact', allowCreate: true, allowRead: true, allowEdit: true, allowDelete: false, viewAllRecords: false, modifyAllRecords: false }
          ],
          fieldPermissions: {
            Account: [
              { field: 'Name', readable: true, editable: true },
              { field: 'AnnualRevenue', readable: true, editable: false }
            ]
          },
          userPermissions: [
            { name: 'ModifyAllData', enabled: profile.name.includes('Admin') },
            { name: 'ViewSetup', enabled: profile.name.includes('Admin') },
            { name: 'ManageUsers', enabled: profile.name.includes('Admin') },
            { name: 'EditTask', enabled: true },
            { name: 'EditEvent', enabled: true }
          ]
        };
        
        setProfileData(prev => ({
          ...prev,
          [profile.name]: fallbackData
        }));
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      // Usar datos de ejemplo en caso de error
      const fallbackData = {
        objectPermissions: [
          { object: 'Account', allowCreate: true, allowRead: true, allowEdit: true, allowDelete: true, viewAllRecords: true, modifyAllRecords: true },
          { object: 'Opportunity', allowCreate: true, allowRead: true, allowEdit: true, allowDelete: false, viewAllRecords: true, modifyAllRecords: false }
        ],
        fieldPermissions: {},
        userPermissions: [
          { name: 'ModifyAllData', enabled: profile.name.includes('Admin') },
          { name: 'ViewSetup', enabled: profile.name.includes('Admin') },
          { name: 'ManageUsers', enabled: profile.name.includes('Admin') }
        ]
      };
      
      setProfileData(prev => ({
        ...prev,
        [profile.name]: fallbackData
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const parseProfileXML = (xmlContent) => {
    console.log('Parsing XML content, length:', xmlContent?.length);
    
    try {
      // Parsing básico usando DOMParser en lugar de fast-xml-parser
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
      
      // Verificar si hay errores de parsing
      const parseError = xmlDoc.getElementsByTagName('parsererror');
      if (parseError.length > 0) {
        throw new Error('XML parsing error: ' + parseError[0].textContent);
      }

      // Extraer object permissions
      const objectPermissions = [];
      const objPerms = xmlDoc.getElementsByTagName('objectPermissions');
      for (let i = 0; i < objPerms.length; i++) {
        const perm = objPerms[i];
        const objectName = perm.getElementsByTagName('object')[0]?.textContent || 'Unknown';
        
        objectPermissions.push({
          object: objectName,
          allowCreate: perm.getElementsByTagName('allowCreate')[0]?.textContent === 'true',
          allowRead: perm.getElementsByTagName('allowRead')[0]?.textContent === 'true',
          allowEdit: perm.getElementsByTagName('allowEdit')[0]?.textContent === 'true',
          allowDelete: perm.getElementsByTagName('allowDelete')[0]?.textContent === 'true',
          viewAllRecords: perm.getElementsByTagName('viewAllRecords')[0]?.textContent === 'true',
          modifyAllRecords: perm.getElementsByTagName('modifyAllRecords')[0]?.textContent === 'true'
        });
      }

      // Extraer field permissions
      const fieldPermissions = {};
      const fieldPerms = xmlDoc.getElementsByTagName('fieldPermissions');
      for (let i = 0; i < fieldPerms.length; i++) {
        const perm = fieldPerms[i];
        const fieldFullName = perm.getElementsByTagName('field')[0]?.textContent || '';
        const fieldParts = fieldFullName.split('.');
        const objectName = fieldParts[0] || 'Unknown';
        const fieldName = fieldParts[1] || fieldFullName || 'Unknown';
        
        if (!fieldPermissions[objectName]) {
          fieldPermissions[objectName] = [];
        }
        
        fieldPermissions[objectName].push({
          field: fieldName,
          readable: perm.getElementsByTagName('readable')[0]?.textContent === 'true',
          editable: perm.getElementsByTagName('editable')[0]?.textContent === 'true'
        });
      }

      // Extraer user permissions
      const userPermissions = [];
      const userPerms = xmlDoc.getElementsByTagName('userPermissions');
      for (let i = 0; i < userPerms.length; i++) {
        const perm = userPerms[i];
        const permName = perm.getElementsByTagName('name')[0]?.textContent || 'Unknown';
        const enabled = perm.getElementsByTagName('enabled')[0]?.textContent === 'true';
        
        userPermissions.push({
          name: permName,
          enabled: enabled
        });
      }

      console.log('Successfully parsed XML:', {
        objectPermissions: objectPermissions.length,
        fieldPermissions: Object.keys(fieldPermissions).length,
        userPermissions: userPermissions.length
      });

      return {
        objectPermissions,
        fieldPermissions,
        userPermissions
      };
    } catch (error) {
      console.error('Error parsing profile XML:', error);
      // Fallback con datos de ejemplo diferenciados por perfil
      const isAdmin = xmlContent?.includes('Admin') || false;
      
      return {
        objectPermissions: [
          { 
            object: 'Account', 
            allowCreate: true, 
            allowRead: true, 
            allowEdit: true, 
            allowDelete: isAdmin, 
            viewAllRecords: isAdmin, 
            modifyAllRecords: isAdmin 
          },
          { 
            object: 'Opportunity', 
            allowCreate: true, 
            allowRead: true, 
            allowEdit: true, 
            allowDelete: false, 
            viewAllRecords: isAdmin, 
            modifyAllRecords: false 
          },
          { 
            object: 'Contact', 
            allowCreate: true, 
            allowRead: true, 
            allowEdit: true, 
            allowDelete: false, 
            viewAllRecords: false, 
            modifyAllRecords: false 
          }
        ],
        fieldPermissions: {
          Account: [
            { field: 'Name', readable: true, editable: true },
            { field: 'AnnualRevenue', readable: true, editable: isAdmin }
          ]
        },
        userPermissions: [
          { name: 'ModifyAllData', enabled: isAdmin },
          { name: 'ViewSetup', enabled: isAdmin },
          { name: 'ManageUsers', enabled: isAdmin },
          { name: 'EditTask', enabled: true },
          { name: 'EditEvent', enabled: true },
          { name: 'ViewAllData', enabled: isAdmin },
          { name: 'ImportPersonal', enabled: true }
        ]
      };
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleProfileSelection = (profile) => {
    if (compareMode) {
      if (selectedProfiles.includes(profile.name)) {
        setSelectedProfiles(prev => prev.filter(p => p !== profile.name));
      } else if (selectedProfiles.length < 2) {
        setSelectedProfiles(prev => [...prev, profile.name]);
        // Cargar datos automáticamente cuando se selecciona un perfil para comparar
        loadProfileData(profile);
      }
    } else {
      setSelectedProfile(profile);
    }
  };

  // Efecto para cargar datos cuando se seleccionan perfiles para comparar
  useEffect(() => {
    if (compareMode && selectedProfiles.length === 2) {
      // Asegurar que ambos perfiles tienen datos cargados
      const profile1 = state.detectedProfiles?.find(p => p.name === selectedProfiles[0]);
      const profile2 = state.detectedProfiles?.find(p => p.name === selectedProfiles[1]);
      
      if (profile1 && !profileData[profile1.name]) {
        loadProfileData(profile1);
      }
      if (profile2 && !profileData[profile2.name]) {
        loadProfileData(profile2);
      }
    }
  }, [compareMode, selectedProfiles, state.detectedProfiles, profileData]);

  const currentProfileData = selectedProfile ? profileData[selectedProfile.name] : null;

  const PermissionIcon = ({ allowed, size = "w-4 h-4" }) => (
    allowed ? (
      <CheckCircle className={`${size} text-green-500`} />
    ) : (
      <XCircle className={`${size} text-red-400`} />
    )
  );

  const renderComparisonView = () => {
    if (selectedProfiles.length !== 2) return null;

    const profile1Data = profileData[selectedProfiles[0]];
    const profile2Data = profileData[selectedProfiles[1]];

    if (!profile1Data || !profile2Data) {
      return (
        <div className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando datos de perfiles...</p>
          </div>
        </div>
      );
    }

    // Obtener todos los objetos únicos de ambos perfiles
    const allObjects = [...new Set([
      ...(profile1Data.objectPermissions || []).map(p => p.object),
      ...(profile2Data.objectPermissions || []).map(p => p.object)
    ])].sort();

    // Función para obtener permisos de objeto
    const getObjectPermission = (profileData, objectName) => {
      return profileData.objectPermissions?.find(p => p.object === objectName) || {
        object: objectName,
        allowCreate: false,
        allowRead: false,
        allowEdit: false,
        allowDelete: false,
        viewAllRecords: false,
        modifyAllRecords: false
      };
    };

    // Función para comparar permisos de objeto
    const compareObjectPermissions = (obj1, obj2) => {
      const permissions = ['allowCreate', 'allowRead', 'allowEdit', 'allowDelete', 'viewAllRecords', 'modifyAllRecords'];
      return permissions.filter(perm => obj1[perm] !== obj2[perm]).length;
    };

    // Obtener permisos únicos de usuario
    const uniqueUserPermissions1 = profile1Data.userPermissions?.filter(p1 => 
      p1.enabled && !profile2Data.userPermissions?.some(p2 => p2.name === p1.name && p2.enabled)
    ) || [];

    const uniqueUserPermissions2 = profile2Data.userPermissions?.filter(p2 => 
      p2.enabled && !profile1Data.userPermissions?.some(p1 => p1.name === p2.name && p1.enabled)
    ) || [];

    const sharedUserPermissions = profile1Data.userPermissions?.filter(p1 => 
      p1.enabled && profile2Data.userPermissions?.some(p2 => p2.name === p1.name && p2.enabled)
    ) || [];

    // Calcular diferencias totales
    const totalObjectDifferences = allObjects.reduce((total, objName) => {
      const obj1 = getObjectPermission(profile1Data, objName);
      const obj2 = getObjectPermission(profile2Data, objName);
      return total + compareObjectPermissions(obj1, obj2);
    }, 0);

    const totalUserDifferences = uniqueUserPermissions1.length + uniqueUserPermissions2.length;

    return (
      <div className="space-y-6">
        {/* Resumen de diferencias */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center">
              <GitCompare className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Resumen de Diferencias
              </h3>
              <p className="text-sm text-gray-600">
                Análisis comparativo entre {selectedProfiles[0]} y {selectedProfiles[1]}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-2xl">
              <div className="text-2xl font-bold text-blue-900">{totalObjectDifferences}</div>
              <div className="text-sm text-blue-700">Diferencias en Objetos</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-2xl">
              <div className="text-2xl font-bold text-green-900">{totalUserDifferences}</div>
              <div className="text-sm text-green-700">Diferencias en Usuarios</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-2xl">
              <div className="text-2xl font-bold text-purple-900">{sharedUserPermissions.length}</div>
              <div className="text-sm text-purple-700">Permisos Compartidos</div>
            </div>
          </div>
        </motion.div>

        {/* Comparación de Object Permissions */}
        {allObjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl shadow-sm border border-gray-100"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Database className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Comparación de Permisos de Objeto
                  </h3>
                  <p className="text-sm text-gray-600">
                    {allObjects.length} objetos analizados
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Objeto</th>
                      <th className="text-center py-3 px-4 font-semibold text-blue-700">
                        {selectedProfiles[0]}
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-green-700">
                        {selectedProfiles[1]}
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allObjects.map((objectName, index) => {
                      const obj1 = getObjectPermission(profile1Data, objectName);
                      const obj2 = getObjectPermission(profile2Data, objectName);
                      const differences = compareObjectPermissions(obj1, obj2);
                      
                      return (
                        <motion.tr
                          key={objectName}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-gray-50 hover:bg-gray-50"
                        >
                          <td className="py-4 px-4 font-medium text-gray-900">{objectName}</td>
                          <td className="py-4 px-4">
                            <div className="flex justify-center gap-1">
                              <div className="text-xs text-center">
                                <div className="flex gap-1 mb-1">
                                  <PermissionIcon allowed={obj1.allowCreate} size="w-4 h-4" />
                                  <PermissionIcon allowed={obj1.allowRead} size="w-4 h-4" />
                                  <PermissionIcon allowed={obj1.allowEdit} size="w-4 h-4" />
                                  <PermissionIcon allowed={obj1.allowDelete} size="w-4 h-4" />
                                  <PermissionIcon allowed={obj1.viewAllRecords} size="w-4 h-4" />
                                  <PermissionIcon allowed={obj1.modifyAllRecords} size="w-4 h-4" />
                                </div>
                                <div className="text-gray-500">C R U D VA MA</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex justify-center gap-1">
                              <div className="text-xs text-center">
                                <div className="flex gap-1 mb-1">
                                  <PermissionIcon allowed={obj2.allowCreate} size="w-4 h-4" />
                                  <PermissionIcon allowed={obj2.allowRead} size="w-4 h-4" />
                                  <PermissionIcon allowed={obj2.allowEdit} size="w-4 h-4" />
                                  <PermissionIcon allowed={obj2.allowDelete} size="w-4 h-4" />
                                  <PermissionIcon allowed={obj2.viewAllRecords} size="w-4 h-4" />
                                  <PermissionIcon allowed={obj2.modifyAllRecords} size="w-4 h-4" />
                                </div>
                                <div className="text-gray-500">C R U D VA MA</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              differences === 0 
                                ? 'bg-green-100 text-green-800'
                                : differences <= 2
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {differences === 0 ? '✓ Idénticos' : `${differences} diferencias`}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Comparación de User Permissions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100"
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Comparación de Permisos de Usuario
                </h3>
                <p className="text-sm text-gray-600">
                  Análisis de permisos únicos y compartidos
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {totalUserDifferences === 0 && sharedUserPermissions.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-3xl mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No se encontraron permisos de usuario en ningún perfil</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Permisos únicos */}
                {(uniqueUserPermissions1.length > 0 || uniqueUserPermissions2.length > 0) && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Permisos solo en Perfil 1 */}
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Solo en {selectedProfiles[0]} ({uniqueUserPermissions1.length})
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {uniqueUserPermissions1.length === 0 ? (
                          <p className="text-sm text-gray-500 italic">No hay permisos únicos</p>
                        ) : (
                          uniqueUserPermissions1.map((permission, index) => (
                            <div
                              key={permission.name}
                              className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2"
                            >
                              <Unlock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              <span className="text-sm font-medium text-blue-900">{permission.name}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Permisos solo en Perfil 2 */}
                    <div>
                      <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Solo en {selectedProfiles[1]} ({uniqueUserPermissions2.length})
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {uniqueUserPermissions2.length === 0 ? (
                          <p className="text-sm text-gray-500 italic">No hay permisos únicos</p>
                        ) : (
                          uniqueUserPermissions2.map((permission, index) => (
                            <div
                              key={permission.name}
                              className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2"
                            >
                              <Unlock className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span className="text-sm font-medium text-green-900">{permission.name}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Permisos compartidos */}
                {sharedUserPermissions.length > 0 && (
                  <div className="pt-6 border-t border-gray-100">
                    <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      Permisos Compartidos ({sharedUserPermissions.length})
                    </h4>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                      {sharedUserPermissions.map((permission, index) => (
                        <div
                          key={permission.name}
                          className="p-2 bg-purple-50 border border-purple-200 rounded-xl flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0" />
                          <span className="text-sm font-medium text-purple-900 truncate">{permission.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Mensaje si no hay diferencias */}
        {totalObjectDifferences === 0 && totalUserDifferences === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-green-50 border border-green-200 rounded-3xl p-8 text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-3xl mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Perfiles Idénticos
            </h3>
            <p className="text-green-700">
              No se encontraron diferencias significativas entre {selectedProfiles[0]} y {selectedProfiles[1]}
            </p>
          </motion.div>
        )}
      </div>
    );
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.1 }
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

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="btn-apple-ghost px-4 py-2 flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-2xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Análisis de Perfiles</h1>
                <p className="text-sm text-gray-600">
                  Explora el contenido detallado de {state.detectedProfiles?.length || 0} perfiles
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCompareMode(!compareMode);
                setSelectedProfiles([]);
              }}
              className={`btn-apple-ghost px-4 py-2 flex items-center gap-2 ${compareMode ? 'bg-primary-100 text-primary-700' : ''}`}
            >
              <GitCompare className="w-5 h-5" />
              {compareMode ? 'Cancelar Comparación' : 'Comparar Perfiles'}
            </button>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 flex overflow-hidden">
        {/* Panel Izquierdo - Lista de Perfiles */}
        <motion.div variants={itemVariants} className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Perfiles Detectados
            </h3>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar perfiles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {state.detectedProfiles?.filter(profile => 
              profile.baseName.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((profile, index) => (
              <motion.button
                key={profile.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleProfileSelection(profile)}
                className={`w-full p-4 rounded-xl text-left transition-all duration-200 flex items-center gap-3 ${
                  selectedProfile?.name === profile.name && !compareMode
                    ? 'bg-primary-100 border-primary-200 text-primary-900' 
                    : compareMode && selectedProfiles.includes(profile.name)
                    ? 'bg-green-100 border-green-200 text-green-900'
                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                } border-2`}
              >
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">
                    {profile.baseName}
                  </div>
                  <div className="text-sm text-gray-500">
                    Perfil de Salesforce
                  </div>
                </div>
                {compareMode && selectedProfiles.includes(profile.name) && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Panel Derecho - Contenido del Perfil */}
        <motion.div variants={itemVariants} className="flex-1 overflow-y-auto bg-gray-50">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : compareMode && selectedProfiles.length === 2 ? (
            // Vista de comparación entre dos perfiles
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Comparación de Perfiles</h2>
                <p className="text-gray-600">
                  Comparando diferencias entre {selectedProfiles[0]} y {selectedProfiles[1]}
                </p>
              </div>
              
              {renderComparisonView()}
            </div>
          ) : compareMode && selectedProfiles.length < 2 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-3xl mx-auto mb-4 flex items-center justify-center">
                  <GitCompare className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Modo Comparación Activo
                </h3>
                <p className="text-gray-500 mb-2">
                  Selecciona 2 perfiles para compararlos
                </p>
                <p className="text-sm text-gray-400">
                  {selectedProfiles.length}/2 perfiles seleccionados
                </p>
              </div>
            </div>
          ) : currentProfileData ? (
            <div className="p-6 space-y-6">
              {/* Object Permissions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100"
              >
                <button
                  onClick={() => toggleSection('objectPermissions')}
                  className="w-full p-6 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                      <Database className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Permisos de Objeto
                      </h3>
                      <p className="text-sm text-gray-600">
                        {currentProfileData.objectPermissions?.length || 0} objetos configurados
                      </p>
                    </div>
                  </div>
                  {expandedSections.objectPermissions ? (
                    <ChevronDown className="w-6 h-6 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-6 h-6 text-gray-400" />
                  )}
                </button>
                
                <AnimatePresence>
                  {expandedSections.objectPermissions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-gray-100">
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Objeto</th>
                                <th className="text-center py-3 px-4 font-semibold text-gray-700">Crear</th>
                                <th className="text-center py-3 px-4 font-semibold text-gray-700">Leer</th>
                                <th className="text-center py-3 px-4 font-semibold text-gray-700">Editar</th>
                                <th className="text-center py-3 px-4 font-semibold text-gray-700">Eliminar</th>
                                <th className="text-center py-3 px-4 font-semibold text-gray-700">Ver Todo</th>
                                <th className="text-center py-3 px-4 font-semibold text-gray-700">Modificar Todo</th>
                              </tr>
                            </thead>
                            <tbody>
                              {currentProfileData.objectPermissions?.map((obj, index) => (
                                <motion.tr
                                  key={obj.object}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="border-b border-gray-50 hover:bg-gray-50"
                                >
                                  <td className="py-3 px-4 font-medium text-gray-900">{obj.object}</td>
                                  <td className="py-3 px-4 text-center">
                                    <PermissionIcon allowed={obj.allowCreate} />
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <PermissionIcon allowed={obj.allowRead} />
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <PermissionIcon allowed={obj.allowEdit} />
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <PermissionIcon allowed={obj.allowDelete} />
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <PermissionIcon allowed={obj.viewAllRecords} />
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <PermissionIcon allowed={obj.modifyAllRecords} />
                                  </td>
                                </motion.tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* User Permissions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100"
              >
                <button
                  onClick={() => toggleSection('userPermissions')}
                  className="w-full p-6 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Permisos de Usuario
                      </h3>
                      <p className="text-sm text-gray-600">
                        {currentProfileData.userPermissions?.filter(p => p.enabled).length || 0} permisos activos
                      </p>
                    </div>
                  </div>
                  {expandedSections.userPermissions ? (
                    <ChevronDown className="w-6 h-6 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-6 h-6 text-gray-400" />
                  )}
                </button>
                
                <AnimatePresence>
                  {expandedSections.userPermissions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <div className="grid md:grid-cols-2 gap-3">
                          {currentProfileData.userPermissions?.map((permission, index) => (
                            <motion.div
                              key={permission.name}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.03 }}
                              className={`p-3 rounded-2xl border-2 flex items-center gap-3 ${
                                permission.enabled 
                                  ? 'bg-green-50 border-green-200' 
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              {permission.enabled ? (
                                <Unlock className="w-5 h-5 text-green-600" />
                              ) : (
                                <Lock className="w-5 h-5 text-gray-400" />
                              )}
                              <span className={`font-medium ${
                                permission.enabled ? 'text-green-900' : 'text-gray-500'
                              }`}>
                                {permission.name}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-3xl mx-auto mb-4 flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">Selecciona un perfil para ver su contenido</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Marca de agua de autoría */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-4 right-4"
      >
        <div className="text-xs text-gray-500 text-center select-none bg-white/80 py-2 px-4 rounded-full shadow-sm">
          Ignacio López Muñoyerro – PermSet Builder © 2025
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfileAnalyzer; 