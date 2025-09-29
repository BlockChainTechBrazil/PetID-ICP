import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  MiniMap,
  Background,
  Panel,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useAuth } from '../../context/AuthContext';
import { createActor } from 'declarations/PetID_backend';
import { canisterId as backendCanisterId } from 'declarations/PetID_backend/index';
import { HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { useTranslation } from 'react-i18next';
import { GiPawPrint } from 'react-icons/gi';
import { FiUsers, FiPlus, FiHeart, FiEdit3, FiTrash2, FiX } from 'react-icons/fi';
import ICPImage from '../ICPImage';

// Componente Pet Node personalizado
const PetNode = ({ data, selected }) => {
  const { pet, onEdit, onConnect, onDelete, isConnecting, connectionStart, t, actor } = data;
  
  const isConnectionTarget = isConnecting && connectionStart !== pet.id;
  const isConnectionSource = connectionStart === pet.id;

  return (
    <div 
      className={`
        pet-node bg-white dark:bg-surface-50 rounded-xl shadow-lg border-2 
        min-w-[300px] max-w-[320px] transition-all duration-200
        ${selected ? 'border-blue-500 shadow-xl' : 'border-gray-200 dark:border-surface-200'}
        ${isConnectionTarget ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}
        ${isConnectionSource ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : ''}
        hover:shadow-xl
      `}
    >
      {/* Header do Pet */}
      <div className="p-4 border-b border-gray-100 dark:border-surface-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg text-gray-800 dark:text-white truncate">
            {pet.nickname || `Pet #${pet.id}`}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(pet.id)}
              className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title={t('genealogy.edit')}
            >
              <FiEdit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onConnect(pet.id)}
              className={`
                p-2 rounded-lg transition-colors
                ${isConnecting 
                  ? 'text-green-600 bg-green-100 dark:bg-green-900/20' 
                  : 'text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20'
                }
              `}
              title={isConnecting ? t('genealogy.connect') : t('genealogy.createRelationship')}
            >
              <FiHeart className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(pet.id)}
              className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title={t('genealogy.remove')}
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Status indicators */}
        {isConnectionSource && (
          <div className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20 px-2 py-1 rounded">
            🎯 Pet Selecionado
          </div>
        )}
        {isConnectionTarget && (
          <div className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded">
            ✅ Clique para Conectar
          </div>
        )}
      </div>

      {/* Foto do Pet */}
      {pet.photo && (
        <div className="px-4 pt-3">
          <ICPImage 
            assetId={pet.photo}
            altText={pet.nickname}
            className="w-full h-32 object-cover rounded-lg"
            actor={actor}
          />
        </div>
      )}

      {/* Informações do Pet */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="font-medium text-gray-600 dark:text-slate-300">Espécie:</span>
            <p className="text-gray-800 dark:text-white">{pet.species || 'N/A'}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600 dark:text-slate-300">Gênero:</span>
            <p className="text-gray-800 dark:text-white">{pet.gender || 'N/A'}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600 dark:text-slate-300">Cor:</span>
            <p className="text-gray-800 dark:text-white">{pet.color || 'N/A'}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600 dark:text-slate-300">ID:</span>
            <p className="text-gray-800 dark:text-white">#{pet.id}</p>
          </div>
        </div>
        
        {pet.birthDate && (
          <div className="mt-3 text-sm">
            <span className="font-medium text-gray-600 dark:text-slate-300">Nascimento:</span>
            <p className="text-gray-800 dark:text-white">{pet.birthDate}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Tipos de nós personalizados
const nodeTypes = {
  petNode: PetNode,
};

// Estilos de edges por tipo de relacionamento
const getEdgeStyle = (relationshipType, t) => {
  switch (relationshipType) {
    case 'parent':
      return {
        stroke: '#10B981',
        strokeWidth: 3,
        label: `👨‍👩‍👧‍👦 Pai/Mãe`,
        labelBgStyle: { fill: '#10B981', fillOpacity: 0.1 },
        labelStyle: { fill: '#059669', fontWeight: 600 }
      };
    case 'offspring':
      return {
        stroke: '#F59E0B',
        strokeWidth: 3,
        label: `👶 Filho/a`,
        labelBgStyle: { fill: '#F59E0B', fillOpacity: 0.1 },
        labelStyle: { fill: '#D97706', fontWeight: 600 }
      };
    case 'sibling':
      return {
        stroke: '#8B5CF6',
        strokeWidth: 2,
        label: `👫 Irmão/Irmã`,
        labelBgStyle: { fill: '#8B5CF6', fillOpacity: 0.1 },
        labelStyle: { fill: '#7C3AED', fontWeight: 600 }
      };
    default:
      return {
        stroke: '#6366F1',
        strokeWidth: 2,
        label: 'Relacionado',
        labelBgStyle: { fill: '#6366F1', fillOpacity: 0.1 },
        labelStyle: { fill: '#4F46E5', fontWeight: 600 }
      };
  }
};

const GenealogyPanel = () => {
  const { t } = useTranslation();
  const { isAuthenticated, authClient, login } = useAuth();
  const [actor, setActor] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para modais e interações
  const [showPetSelector, setShowPetSelector] = useState(false);
  const [showRelationshipModal, setShowRelationshipModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState(null);
  const [connectionTarget, setConnectionTarget] = useState(null);

  // Criar actor quando autenticado
  useEffect(() => {
    const createBackendActor = async () => {
      if (isAuthenticated && authClient) {
        try {
          const agent = new HttpAgent({
            identity: authClient.getIdentity(),
            host: process.env.NODE_ENV === 'development' ? 'http://localhost:4943' : 'https://ic0.app',
          });
          
          if (process.env.NODE_ENV === 'development') {
            await agent.fetchRootKey();
          }

          const backendActor = createActor(backendCanisterId, {
            agent,
          });

          setActor(backendActor);
        } catch (error) {
          console.error('Erro ao criar actor:', error);
        }
      }
    };
    createBackendActor();
  }, [isAuthenticated, authClient]);

  // Carregar pets do usuário do localStorage
  useEffect(() => {
    loadUserPets();
    loadGenealogyData();
  }, []);

  // Atualizar funções dos nós sempre que os estados mudarem
  useEffect(() => {
    if (nodes.length > 0) {
      setNodes(currentNodes => currentNodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          onEdit: handleEditPet,
          onConnect: handleConnectPet,
          onDelete: handleDeletePet,
          isConnecting,
          connectionStart,
          actor,
          t
        }
      })));
    }
  }, [isConnecting, connectionStart, actor]);

  const loadUserPets = async () => {
    try {
      setLoading(true);
      const localPets = localStorage.getItem('userPets');
      
      if (localPets) {
        try {
          const userPets = JSON.parse(localPets);
          setPets(userPets);
        } catch (e) {
          console.error('Erro ao parsear userPets:', e);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar pets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados salvos da genealogia
  const loadGenealogyData = () => {
    try {
      const savedNodes = JSON.parse(localStorage.getItem('genealogy_nodes_reactflow') || '[]');
      const savedEdges = JSON.parse(localStorage.getItem('genealogy_edges_reactflow') || '[]');
      
      if (savedNodes.length > 0) {
        const nodesWithCallbacks = savedNodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            onEdit: handleEditPet,
            onConnect: handleConnectPet,
            onDelete: handleDeletePet,
            isConnecting: false,
            connectionStart: null,
            actor: null,
            t
          }
        }));
        setNodes(nodesWithCallbacks);
      }
      if (savedEdges.length > 0) {
        setEdges(savedEdges);
      }
    } catch (error) {
      console.error('Erro ao carregar dados da genealogia:', error);
    }
  };

  // Salvar dados da genealogia
  const saveGenealogyData = useCallback((newNodes, newEdges) => {
    try {
      const cleanNodes = newNodes.map(node => ({
        ...node,
        data: { pet: node.data.pet }
      }));
      localStorage.setItem('genealogy_nodes_reactflow', JSON.stringify(cleanNodes));
      localStorage.setItem('genealogy_edges_reactflow', JSON.stringify(newEdges));
    } catch (error) {
      console.error('Erro ao salvar dados da genealogia:', error);
    }
  }, []);

  // Adicionar pet ao canvas
  const addPetToCanvas = (pet) => {
    const newNode = {
      id: `pet-${pet.id}`,
      type: 'petNode',
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: {
        pet,
        onEdit: handleEditPet,
        onConnect: handleConnectPet,
        onDelete: handleDeletePet,
        isConnecting,
        connectionStart,
        actor,
        t
      },
    };
    
    const newNodes = [...nodes, newNode];
    setNodes(newNodes);
    saveGenealogyData(newNodes, edges);
    setShowPetSelector(false);
  };

  // Sistema de conexões
  const handleConnectPet = (petId) => {
    if (!isConnecting) {
      setIsConnecting(true);
      setConnectionStart(petId);
      updateNodesConnectionState(petId, true);
    } else if (connectionStart === petId) {
      setIsConnecting(false);
      setConnectionStart(null);
      updateNodesConnectionState(null, false);
    } else {
      setConnectionTarget(petId);
      setShowRelationshipModal(true);
    }
  };

  const updateNodesConnectionState = (startId, connecting) => {
    const newNodes = nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        onEdit: handleEditPet,
        onConnect: handleConnectPet,
        onDelete: handleDeletePet,
        isConnecting: connecting,
        connectionStart: startId,
        actor,
        t
      }
    }));
    setNodes(newNodes);
  };

  const createConnection = (relationshipType) => {
    if (!connectionStart || !connectionTarget) return;

    const edgeStyle = getEdgeStyle(relationshipType, t);
    const newEdge = {
      id: `edge-${connectionStart}-${connectionTarget}-${Date.now()}`,
      source: `pet-${connectionStart}`,
      target: `pet-${connectionTarget}`,
      type: 'smoothstep',
      animated: true,
      label: edgeStyle.label,
      style: { 
        stroke: edgeStyle.stroke, 
        strokeWidth: edgeStyle.strokeWidth 
      },
      labelStyle: edgeStyle.labelStyle,
      labelBgStyle: edgeStyle.labelBgStyle,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: edgeStyle.stroke,
      },
      data: { relationshipType }
    };

    const newEdges = [...edges, newEdge];
    setEdges(newEdges);
    saveGenealogyData(nodes, newEdges);
    
    // Reset connection state
    setIsConnecting(false);
    setConnectionStart(null);
    setConnectionTarget(null);
    setShowRelationshipModal(false);
    updateNodesConnectionState(null, false);
  };

  // Handlers placeholder (implementar depois)
  const handleEditPet = (petId) => {
    console.log('Editar pet:', petId);
  };

  const handleDeletePet = (petId) => {
    const newNodes = nodes.filter(node => node.data.pet.id !== petId);
    const newEdges = edges.filter(edge => 
      !edge.source.includes(petId) && !edge.target.includes(petId)
    );
    
    setNodes(newNodes);
    setEdges(newEdges);
    saveGenealogyData(newNodes, newEdges);
  };

  // Handler para conexões automáticas
  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#6366F1', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed }
    }, eds));
  }, [setEdges]);

  // Pets disponíveis para adicionar
  const availablePets = pets.filter(pet => 
    !nodes.some(node => node.data.pet.id === pet.id)
  );

  return (
    <div className="p-6 max-w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center space-x-2">
            <FiUsers className="w-5 h-5 text-[#8A8BED]" />
            <span>Árvore Genealógica</span>
          </h3>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowPetSelector(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all flex items-center space-x-2"
            >
              <FiPlus className="w-4 h-4" />
              <span>Adicionar Pet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status de conexão */}
      {isConnecting && connectionStart && (
        <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                <FiHeart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-green-800 dark:text-green-200">
                  Modo Conexão Ativado
                </h4>
                <p className="text-sm text-green-600 dark:text-green-300">
                  Clique no coração de outro pet para conectar
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsConnecting(false);
                setConnectionStart(null);
                updateNodesConnectionState(null, false);
              }}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* React Flow Canvas */}
      <div className="h-96 border border-gray-300 dark:border-surface-200 rounded-xl overflow-hidden bg-gray-50 dark:bg-surface-100">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          snapToGrid
          snapGrid={[20, 20]}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          minZoom={0.3}
          maxZoom={2}
          attributionPosition="bottom-left"
        >
          <Background variant="dots" gap={20} size={1} color="#8B5CF6" />
          <Controls />
          <MiniMap 
            nodeColor="#8B5CF6"
            maskColor="rgba(139, 92, 246, 0.1)"
            style={{
              height: 120,
              backgroundColor: 'rgba(255, 255, 255, 0.8)'
            }}
          />
          
          {/* Panel superior com informações */}
          <Panel position="top-center">
            <div className="bg-white/90 dark:bg-surface-50/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-gray-200 dark:border-surface-200">
              <p className="text-sm text-gray-600 dark:text-slate-300">
                🐾 <strong>{nodes.length}</strong> pet(s) • 
                🔗 <strong>{edges.length}</strong> conexão(ões) • 
                ✨ Use scroll para zoom, arraste para mover
              </p>
            </div>
          </Panel>

          {/* Canvas vazio */}
          {nodes.length === 0 && (
            <Panel position="center">
              <div className="text-center p-8 bg-white/90 dark:bg-surface-50/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-surface-200">
                <GiPawPrint className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-600 dark:text-slate-300 mb-2">
                  Canvas Vazio
                </h4>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
                  Adicione pets para começar a criar sua árvore genealógica
                </p>
                <button
                  onClick={() => setShowPetSelector(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
                >
                  Adicionar Primeiro Pet
                </button>
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>

      {/* Modal Seletor de Pet */}
      {showPetSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-surface-50 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Selecionar Pet para Adicionar
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                    Clique em qualquer pet para adicioná-lo à árvore genealógica
                  </p>
                </div>
                <button
                  onClick={() => setShowPetSelector(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-slate-300">Carregando seus pets...</p>
                </div>
              ) : availablePets.length === 0 ? (
                <div className="text-center py-8">
                  <GiPawPrint className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-slate-300 mb-4">
                    {pets.length === 0 
                      ? 'Você ainda não tem pets registrados'
                      : 'Todos os seus pets já estão na árvore genealógica'
                    }
                  </p>
                  <button
                    onClick={() => setShowPetSelector(false)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {pets.length === 0 ? "Registrar Primeiro Pet" : "Fechar"}
                  </button>
                </div>
              ) : (
                <div>
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
                      🎯 <strong>{availablePets.length} pets disponíveis</strong>
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                    {availablePets.map(pet => (
                      <div
                        key={pet.id}
                        className="border-2 border-gray-200 dark:border-surface-200 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-all transform hover:scale-105 shadow-sm hover:shadow-lg"
                        onClick={() => addPetToCanvas(pet)}
                      >
                        {pet.photo && (
                          <ICPImage 
                            assetId={pet.photo}
                            altText={pet.nickname}
                            className="w-full h-24 object-cover rounded-lg mb-3"
                            actor={actor}
                          />
                        )}
                        <h5 className="font-medium text-gray-800 dark:text-white mb-1">
                          {pet.nickname}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-slate-300">
                          {pet.species} • {pet.gender}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                          ID: #{pet.id}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Seleção de Parentesco */}
      {showRelationshipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-surface-50 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <FiHeart className="w-5 h-5 mr-2 text-red-500" />
              Selecionar Tipo de Parentesco
            </h3>
            
            <p className="text-sm text-gray-600 dark:text-slate-300 mb-6">
              Que tipo de relacionamento existe entre estes pets?
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => createConnection('parent')}
                className="w-full p-4 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-left transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">👨‍👩‍👧‍👦</span>
                  <div>
                    <h4 className="font-medium text-green-800 dark:text-green-200">Pai/Mãe</h4>
                    <p className="text-xs text-green-600 dark:text-green-300">Relação de parentesco direto</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => createConnection('offspring')}
                className="w-full p-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg text-left transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">👶</span>
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-200">Filho/Filha</h4>
                    <p className="text-xs text-blue-600 dark:text-blue-300">Descendência direta</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => createConnection('sibling')}
                className="w-full p-4 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg text-left transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">👫</span>
                  <div>
                    <h4 className="font-medium text-purple-800 dark:text-purple-200">Irmão/Irmã</h4>
                    <p className="text-xs text-purple-600 dark:text-purple-300">Mesmos pais</p>
                  </div>
                </div>
              </button>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowRelationshipModal(false);
                  setIsConnecting(false);
                  setConnectionStart(null);
                  setConnectionTarget(null);
                  updateNodesConnectionState(null, false);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-surface-200 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-surface-75 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenealogyPanel;
