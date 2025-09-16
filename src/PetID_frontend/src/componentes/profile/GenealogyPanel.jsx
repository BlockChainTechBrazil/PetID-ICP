
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import Draggable from 'react-draggable';
import { 
  FiPlus, 
  FiX, 
  FiEdit3, 
  FiTrash2, 
  FiSave, 
  FiRotateCcw,
  FiZoomIn,
  FiZoomOut,
  FiMove,
  FiUsers,
  FiHeart
} from 'react-icons/fi';
import { GiPawPrint } from 'react-icons/gi';

// Componente de formulário de edição
const EditPetForm = ({ pet, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    nickname: pet.nickname || '',
    species: pet.species || '',
    gender: pet.gender || '',
    color: pet.color || '',
    birthDate: pet.birthDate || '',
    isLost: pet.isLost || false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
          Nome do Pet
        </label>
        <input
          type="text"
          value={formData.nickname}
          onChange={(e) => handleChange('nickname', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-surface-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-surface-75 dark:text-white"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Espécie
          </label>
          <select
            value={formData.species}
            onChange={(e) => handleChange('species', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-surface-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-surface-75 dark:text-white"
            required
          >
            <option value="">Selecionar</option>
            <option value="dog">Cachorro</option>
            <option value="cat">Gato</option>
            <option value="bird">Pássaro</option>
            <option value="snake">Cobra</option>
            <option value="hamster">Hamster</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Gênero
          </label>
          <select
            value={formData.gender}
            onChange={(e) => handleChange('gender', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-surface-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-surface-75 dark:text-white"
            required
          >
            <option value="">Selecionar</option>
            <option value="male">Macho</option>
            <option value="female">Fêmea</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Cor
          </label>
          <input
            type="text"
            value={formData.color}
            onChange={(e) => handleChange('color', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-surface-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-surface-75 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Data de Nascimento
          </label>
          <input
            type="date"
            value={formData.birthDate}
            onChange={(e) => handleChange('birthDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-surface-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-surface-75 dark:text-white"
            required
          />
        </div>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.isLost}
            onChange={(e) => handleChange('isLost', e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 dark:text-slate-300">Pet está perdido</span>
        </label>
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-surface-200 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-surface-75 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
        >
          <FiSave className="w-4 h-4" />
          <span>Salvar</span>
        </button>
      </div>
    </form>
  );
};

const GenealogyPanel = () => {
  const { t } = useTranslation();
  const { createBackendActor, isAuthenticated } = useAuth();
  
  // Estados principais com persistência
  const [pets, setPets] = useState([]);
  const [genealogyNodes, setGenealogyNodes] = useState(() => {
    try {
      const saved = localStorage.getItem('genealogyNodes');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Erro ao carregar nós do localStorage:', error);
      return [];
    }
  });
  const [connections, setConnections] = useState(() => {
    try {
      const saved = localStorage.getItem('genealogyConnections');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Erro ao carregar conexões do localStorage:', error);
      return [];
    }
  });
  const [selectedPet, setSelectedPet] = useState(null);
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [showPetSelector, setShowPetSelector] = useState(false);
  const [editingNode, setEditingNode] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Estados para conexões
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState(null);
  const [tempConnection, setTempConnection] = useState(null);
  const [showRelationshipModal, setShowRelationshipModal] = useState(false);
  const [pendingConnection, setPendingConnection] = useState(null);

  // Estados para o canvas
  const [canvasSize] = useState({ width: 2000, height: 1500 });
  const canvasRef = useRef(null);

  // Carregar pets do usuário
  useEffect(() => {
    if (isAuthenticated) {
      loadUserPets();
    }
  }, [isAuthenticated]);

  // Salvar estados no localStorage
  useEffect(() => {
    try {
      // Converter BigInt para string antes de salvar
      const serializableNodes = genealogyNodes.map(node => ({
        ...node,
        petData: {
          ...node.petData,
          id: node.petData.id?.toString(),
          createdAt: node.petData.createdAt?.toString()
        }
      }));
      localStorage.setItem('genealogyNodes', JSON.stringify(serializableNodes));
    } catch (error) {
      console.error('Erro ao salvar nós no localStorage:', error);
    }
  }, [genealogyNodes]);

  useEffect(() => {
    try {
      localStorage.setItem('genealogyConnections', JSON.stringify(connections));
    } catch (error) {
      console.error('Erro ao salvar conexões no localStorage:', error);
    }
  }, [connections]);

  // Função para carregar pets do usuário
  const loadUserPets = async () => {
    setLoading(true);
    try {
      const actor = await createBackendActor();
      if (actor) {
        console.log('🔄 Carregando pets do usuário...');
        const result = await actor.getMyPets();
        if ('ok' in result) {
          console.log('✅ Pets carregados do backend:', result.ok);
          console.log('📊 Estrutura do primeiro pet:', result.ok[0]);
          setPets(result.ok);
        } else {
          console.error('❌ Erro ao carregar pets:', result.err);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar pets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para adicionar um nó ao canvas
  const addNodeToCanvas = (pet, position = { x: 200, y: 200 }) => {
    // Converter BigInt para string para evitar erro de serialização
    const serializedPet = {
      ...pet,
      id: pet.id?.toString(),
      createdAt: pet.createdAt?.toString()
    };
    
    const newNode = {
      id: `node-${pet.id?.toString()}-${Date.now()}`,
      petId: pet.id?.toString(),
      petData: serializedPet,
      position: position,
      type: 'pet', // pode ser 'pet', 'father', 'mother', 'offspring'
      isSelected: false
    };
    
    console.log('Adicionando nó ao canvas:', newNode);
    setGenealogyNodes(prev => [...prev, newNode]);
    setShowPetSelector(false);
    setSelectedPet(null);
  };

  // Função para remover um nó
  const removeNode = (nodeId) => {
    setGenealogyNodes(prev => prev.filter(node => node.id !== nodeId));
    // Remover todas as conexões relacionadas a este nó
    setConnections(prev => prev.filter(conn => 
      conn.from !== nodeId && conn.to !== nodeId
    ));
  };

  // Função para iniciar conexão entre nós
  const startConnection = (nodeId) => {
    setIsConnecting(true);
    setConnectionStart(nodeId);
  };

  // Função para adicionar parentesco
  const addParentage = (nodeId) => {
    console.log('Função addParentage chamada com nodeId:', nodeId);
    
    if (!connectionStart) {
      // Primeira seleção para parentesco
      setConnectionStart(nodeId);
      setIsConnecting(true);
      
      console.log('Primeiro nó selecionado para conexão:', nodeId);
      
      // Mostrar feedback visual
      setGenealogyNodes(prev => prev.map(node => ({
        ...node,
        isSelected: node.id === nodeId
      })));
    } else if (connectionStart !== nodeId) {
      // Segunda seleção - mostrar modal de seleção de parentesco
      console.log('Segundo nó selecionado. Mostrando modal de parentesco');
      setPendingConnection({ from: connectionStart, to: nodeId });
      setShowRelationshipModal(true);
    } else {
      // Cancelar se clicar no mesmo nó
      console.log('Mesmo nó clicado. Cancelando conexão');
      setIsConnecting(false);
      setConnectionStart(null);
      setGenealogyNodes(prev => prev.map(node => ({
        ...node,
        isSelected: false
      })));
    }
  };

  // Função para editar nó
  const editNode = (nodeId) => {
    setEditingNode(nodeId);
  };

  // Função para salvar edições do nó
  const saveNodeEdit = async (nodeId, newData) => {
    try {
      const node = genealogyNodes.find(n => n.id === nodeId);
      if (!node) return;

      const actor = await createBackendActor();
      if (!actor) {
        console.error('Erro ao conectar com o backend');
        return;
      }

      // Preparar dados para o backend
      const payload = {
        photo: node.petData.photo || '', // Manter foto existente
        nickname: newData.nickname,
        birthDate: newData.birthDate,
        species: newData.species,
        gender: newData.gender,
        color: newData.color,
        isLost: newData.isLost
      };

      console.log('Atualizando pet:', node.petData.id, payload);

      // Atualizar no backend
      const result = await actor.updatePet(node.petData.id, payload);
      
      if ('ok' in result) {
        // Atualizar no estado local
        setGenealogyNodes(prev => prev.map(n => 
          n.id === nodeId 
            ? { ...n, petData: result.ok }
            : n
        ));
        
        // Atualizar também na lista de pets
        setPets(prev => prev.map(pet => 
          pet.id?.toString() === node.petData.id?.toString() ? result.ok : pet
        ));
        
        console.log('✅ Pet atualizado com sucesso:', result.ok);
        setEditingNode(null);
      } else {
        console.error('❌ Erro ao atualizar pet:', result.err);
        alert('Erro ao atualizar pet: ' + result.err);
      }
    } catch (error) {
      console.error('❌ Erro ao salvar edições:', error);
      alert('Erro ao salvar edições: ' + error.message);
    }
  };

  // Função para remover conexão
  const removeConnection = (connectionId) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId));
  };

  // Função para criar conexão de parentesco
  const createParentageConnection = (relationshipType) => {
    if (!pendingConnection) return;
    
    let connectionType = 'parent';
    let connectionLabel = 'Pai/Mãe';
    
    switch (relationshipType) {
      case 'parent':
        connectionType = 'parent';
        connectionLabel = 'Pai/Mãe';
        break;
      case 'offspring':
        connectionType = 'offspring';
        connectionLabel = 'Filho(a)';
        break;
      case 'sibling':
        connectionType = 'sibling';
        connectionLabel = 'Irmão(ã)';
        break;
    }
    
    const newConnection = {
      id: `conn-${Date.now()}`,
      from: pendingConnection.from,
      to: pendingConnection.to,
      type: connectionType,
      label: connectionLabel
    };
    
    console.log('Criando nova conexão:', newConnection);
    setConnections(prev => [...prev, newConnection]);
    
    // Limpar estados
    setIsConnecting(false);
    setConnectionStart(null);
    setPendingConnection(null);
    setShowRelationshipModal(false);
    
    // Remover seleção visual
    setGenealogyNodes(prev => prev.map(node => ({
      ...node,
      isSelected: false
    })));
  };

  // Função para cancelar conexão
  const cancelConnection = () => {
    setIsConnecting(false);
    setConnectionStart(null);
    setPendingConnection(null);
    setShowRelationshipModal(false);
    setGenealogyNodes(prev => prev.map(node => ({
      ...node,
      isSelected: false
    })));
  };

  // Função para finalizar conexão
  const finishConnection = (nodeId) => {
    if (connectionStart && connectionStart !== nodeId) {
      const newConnection = {
        id: `conn-${Date.now()}`,
        from: connectionStart,
        to: nodeId,
        type: 'parent-child', // ou 'partner'
        label: 'Filho(a) de'
      };
      
      setConnections(prev => [...prev, newConnection]);
    }
    
    setIsConnecting(false);
    setConnectionStart(null);
    setTempConnection(null);
  };

  // Função para atualizar posição do nó
  const updateNodePosition = (nodeId, newPosition) => {
    setGenealogyNodes(prev => prev.map(node =>
      node.id === nodeId 
        ? { ...node, position: newPosition }
        : node
    ));
  };

  // Componente do nó do pet
  const PetNode = ({ node }) => {
    const isSelected = connectionStart === node.id;
    const pet = node.petData;
    
    return (
      <Draggable
        position={node.position}
        onStop={(e, data) => updateNodePosition(node.id, { x: data.x, y: data.y })}
        bounds="parent"
        cancel=".no-drag" // Permite que elementos com classe no-drag não ativem o drag
      >
        <div
          className={`absolute cursor-move select-none ${
            isSelected ? 'ring-4 ring-blue-500' : ''
          }`}
          style={{ 
            transform: `translate(${node.position.x}px, ${node.position.y}px)`,
            zIndex: isSelected ? 10 : 1
          }}
        >
          <div className={`bg-gradient-to-br from-white to-gray-50 dark:from-surface-50 dark:to-surface-75 rounded-xl shadow-lg border-2 p-4 min-w-[280px] max-w-[320px] hover:shadow-xl transition-all duration-200 ${
            node.isSelected 
              ? 'border-green-400 shadow-green-200 scale-105' 
              : 'border-gray-200 dark:border-surface-200'
          }`}>
            {/* Header do cartão com status */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <GiPawPrint className="w-6 h-6 text-[#8A8BED]" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <span className="font-bold text-gray-800 dark:text-white text-base">
                    {pet.nickname}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    ID: #{pet.id}
                  </p>
                </div>
              </div>
              
              {/* Menu de ações */}
              <div className="flex space-x-1 no-drag">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log('Editando nó:', node.id);
                    setEditingNode(node.id);
                  }}
                  className="p-1.5 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer no-drag"
                  title="Editar informações"
                >
                  <FiEdit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log('Adicionando parentesco para:', node.id);
                    addParentage(node.id);
                  }}
                  className="p-1.5 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors cursor-pointer no-drag"
                  title="Adicionar parentesco"
                >
                  <FiHeart className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log('Removendo nó:', node.id);
                    removeNode(node.id);
                  }}
                  className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer no-drag"
                  title="Remover da árvore"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Foto do pet com melhor apresentação */}
            <div className="mb-4 relative">
              {pet.photo ? (
                <div className="relative group">
                  <img
                    src={`https://gateway.pinata.cloud/ipfs/${pet.photo}`}
                    alt={pet.nickname}
                    className="w-full h-32 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      console.log('Erro ao carregar imagem:', pet.photo);
                      e.target.parentElement.innerHTML = `
                        <div class="w-full h-32 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-surface-100 dark:to-surface-200 rounded-lg flex items-center justify-center">
                          <div class="text-center">
                            <div class="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto mb-2">
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                            </div>
                            <p class="text-xs text-gray-500 dark:text-slate-400">Erro ao carregar</p>
                          </div>
                        </div>
                      `;
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full px-2 py-1">
                    <span className="text-white text-xs font-medium">
                      {pet.species || 'N/A'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-32 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-surface-100 dark:to-surface-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <GiPawPrint className="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 dark:text-slate-400">Sem foto</p>
                  </div>
                </div>
              )}
            </div>

            {/* Informações detalhadas do pet */}
            <div className="space-y-2">
              <div className="bg-gray-50 dark:bg-surface-100 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-slate-300 block">Espécie:</span>
                    <span className="text-gray-600 dark:text-slate-400">{pet.species || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-slate-300 block">Gênero:</span>
                    <span className="text-gray-600 dark:text-slate-400">{pet.gender || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-slate-300 block">Cor:</span>
                    <span className="text-gray-600 dark:text-slate-400">{pet.color || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-slate-300 block">Nascimento:</span>
                    <span className="text-gray-600 dark:text-slate-400">{pet.birthDate || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-surface-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-slate-300 text-xs block">Status:</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${pet.isLost ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {pet.isLost ? 'Perdido' : 'Seguro'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-gray-700 dark:text-slate-300 text-xs block">ID Blockchain:</span>
                      <span className="text-gray-600 dark:text-slate-400 text-xs font-mono">#{pet.id}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botão de ação de conexão */}
            {isConnecting && connectionStart !== node.id && (
              <button
                onClick={() => finishConnection(node.id)}
                className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white text-xs py-1 px-2 rounded transition-colors"
              >
                Conectar como filho
              </button>
            )}
          </div>
        </div>
      </Draggable>
    );
  };

  // Componente para desenhar conexões
  const ConnectionLines = () => {
    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ width: canvasSize.width, height: canvasSize.height }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#8A8BED"
            />
          </marker>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {connections.map(connection => {
          const fromNode = genealogyNodes.find(n => n.id === connection.from);
          const toNode = genealogyNodes.find(n => n.id === connection.to);
          
          if (!fromNode || !toNode) return null;
          
          const fromX = fromNode.position.x + 140; // centro do nó expandido
          const fromY = fromNode.position.y + 100;
          const toX = toNode.position.x + 140;
          const toY = toNode.position.y + 100;
          
          // Calcular pontos de controle para curva
          const midX = (fromX + toX) / 2;
          const midY = (fromY + toY) / 2;
          const curvature = 50;
          
          const controlX1 = midX - curvature;
          const controlY1 = fromY;
          const controlX2 = midX + curvature;
          const controlY2 = toY;
          
          const pathData = `M ${fromX} ${fromY} Q ${controlX1} ${controlY1} ${midX} ${midY} Q ${controlX2} ${controlY2} ${toX} ${toY}`;
          
          // Definir cores e estilos por tipo de conexão
          const getConnectionStyle = (type) => {
            switch (type) {
              case 'parent':
                return {
                  stroke: '#10B981', // Verde para pais
                  strokeWidth: '3',
                  label: '👨‍👩‍👧‍👦 Pai/Mãe',
                  color: '#059669'
                };
              case 'offspring':
                return {
                  stroke: '#F59E0B', // Amarelo para filhos
                  strokeWidth: '3',
                  label: '👶 Filho(a)',
                  color: '#D97706'
                };
              case 'sibling':
                return {
                  stroke: '#8B5CF6', // Roxo para irmãos
                  strokeWidth: '2',
                  label: '👫 Irmão(ã)',
                  color: '#7C3AED'
                };
              default:
                return {
                  stroke: '#8A8BED',
                  strokeWidth: '2',
                  label: 'Relacionado',
                  color: '#6366F1'
                };
            }
          };
          
          const style = getConnectionStyle(connection.type);
          
          return (
            <g key={connection.id}>
              {/* Linha principal com curva */}
              <path
                d={pathData}
                stroke={style.stroke}
                strokeWidth={style.strokeWidth}
                fill="none"
                markerEnd="url(#arrowhead)"
                filter="url(#glow)"
                className="drop-shadow-sm"
              />
              
              {/* Background para o label */}
              <rect
                x={midX - 35}
                y={midY - 12}
                width="70"
                height="20"
                rx="10"
                fill="white"
                stroke={style.stroke}
                strokeWidth="1"
                className="drop-shadow-sm"
              />
              
              {/* Label da conexão */}
              <text
                x={midX}
                y={midY + 3}
                fill={style.color}
                fontSize="10"
                textAnchor="middle"
                fontWeight="600"
                className="font-semibold"
              >
                {style.label}
              </text>
              
              {/* Botão invisível para remover conexão */}
              <circle
                cx={midX + 25}
                cy={midY - 8}
                r="8"
                fill="#EF4444"
                className="cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                onClick={() => removeConnection(connection.id)}
              />
              <text
                x={midX + 25}
                y={midY - 5}
                fill="white"
                fontSize="10"
                textAnchor="middle"
                className="cursor-pointer opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
              >
                ×
              </text>
            </g>
          );
        })}
        
        {/* Linha temporária durante a criação de conexão */}
        {isConnecting && tempConnection && (
          <line
            x1={tempConnection.from.x}
            y1={tempConnection.from.y}
            x2={tempConnection.to.x}
            y2={tempConnection.to.y}
            stroke="#8A8BED"
            strokeWidth="2"
            strokeDasharray="10,5"
            opacity="0.7"
          />
        )}
      </svg>
    );
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-surface-100 bg-white/70 dark:bg-surface-75/80 backdrop-blur-xl p-6 h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center space-x-2">
          <FiUsers className="w-5 h-5 text-[#8A8BED]" />
          <span>Árvore Genealógica Interativa</span>
        </h3>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowPetSelector(true)}
            className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all text-sm font-medium"
          >
            <FiPlus className="w-4 h-4" />
            <span>Adicionar Pet</span>
          </button>
          
          <button
            onClick={() => {
              setGenealogyNodes([]);
              setConnections([]);
              setIsConnecting(false);
              setConnectionStart(null);
              // Limpar localStorage também
              localStorage.removeItem('genealogyNodes');
              localStorage.removeItem('genealogyConnections');
              console.log('Árvore genealógica limpa e localStorage removido');
            }}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
          >
            <FiRotateCcw className="w-4 h-4" />
            <span>Limpar</span>
          </button>
        </div>
      </div>

      {/* Instruções de uso */}
      {genealogyNodes.length === 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 mb-4 border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Como usar a árvore genealógica:
          </h4>
          <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <p>• <strong>Adicionar Pet:</strong> Clique em "Adicionar Pet" para selecionar um pet registrado</p>
            <p>• <strong>Criar Parentesco:</strong> Clique no ícone ❤️ em um pet, depois em outro para conectá-los</p>
            <p>• <strong>Editar Informações:</strong> Use o ícone ✏️ para editar dados do pet na árvore</p>
            <p>• <strong>Remover:</strong> Use o ícone 🗑️ para remover pets da árvore</p>
            <p>• <strong>Navegar:</strong> Arraste para mover, use o scroll para zoom</p>
          </div>
        </div>
      )}

      {/* Status de conexão */}
      {isConnecting && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mb-4 border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-800 dark:text-green-200 flex items-center">
            <div className="animate-pulse w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <strong>Modo Conexão:</strong> Selecione outro pet para criar o parentesco
            <button 
              onClick={() => {
                setIsConnecting(false);
                setConnectionStart(null);
                setGenealogyNodes(prev => prev.map(node => ({ ...node, isSelected: false })));
              }}
              className="ml-auto text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
            >
              <FiX className="w-4 h-4" />
            </button>
          </p>
        </div>
      )}

      {/* Canvas Principal */}
      <div className="flex-1 border border-gray-300 dark:border-surface-200 rounded-xl overflow-hidden bg-gray-50 dark:bg-surface-100 relative">
        <TransformWrapper
          initialScale={0.8}
          minScale={0.3}
          maxScale={2}
          limitToBounds={false}
          centerOnInit={true}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              {/* Controles de zoom */}
              <div className="absolute top-4 right-4 z-20 flex flex-col space-y-2">
                <button
                  onClick={() => zoomIn()}
                  className="p-2 bg-white dark:bg-surface-50 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <FiZoomIn className="w-4 h-4 text-gray-600 dark:text-slate-300" />
                </button>
                <button
                  onClick={() => zoomOut()}
                  className="p-2 bg-white dark:bg-surface-50 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <FiZoomOut className="w-4 h-4 text-gray-600 dark:text-slate-300" />
                </button>
                <button
                  onClick={() => resetTransform()}
                  className="p-2 bg-white dark:bg-surface-50 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <FiMove className="w-4 h-4 text-gray-600 dark:text-slate-300" />
                </button>
              </div>

              <TransformComponent
                wrapperClass="!w-full !h-full"
                contentClass="!w-full !h-full"
              >
                <div
                  ref={canvasRef}
                  className="relative bg-gradient-to-br from-blue-50 to-purple-50 dark:from-surface-75 dark:to-surface-100"
                  style={{ 
                    width: canvasSize.width, 
                    height: canvasSize.height,
                    backgroundImage: `
                      radial-gradient(circle at 20px 20px, rgba(138, 139, 237, 0.1) 1px, transparent 0),
                      radial-gradient(circle at 80px 80px, rgba(138, 139, 237, 0.05) 1px, transparent 0)
                    `,
                    backgroundSize: '100px 100px'
                  }}
                >
                  {/* Linhas de conexão */}
                  <ConnectionLines />
                  
                  {/* Nós dos pets */}
                  {genealogyNodes.map(node => (
                    <PetNode key={node.id} node={node} />
                  ))}
                  
                  {/* Área vazia para adicionar nós */}
                  {genealogyNodes.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-8 bg-white/80 dark:bg-surface-50/80 rounded-xl shadow-lg">
                        <GiPawPrint className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-600 dark:text-slate-300 mb-2">
                          Canvas Vazio
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
                          Adicione seus pets para começar a criar a árvore genealógica
                        </p>
                        <button
                          onClick={() => setShowPetSelector(true)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
                        >
                          Adicionar Primeiro Pet
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>

      {/* Status de conexão */}
      {isConnecting && (
        <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-center">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Selecione outro pet para criar uma conexão de parentesco
          </p>
          <button
            onClick={() => {
              setIsConnecting(false);
              setConnectionStart(null);
            }}
            className="mt-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Cancelar conexão
          </button>
        </div>
      )}

      {/* Modal Seletor de Pet */}
      {showPetSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-surface-50 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Selecionar Pet para Adicionar
                </h4>
                <button
                  onClick={() => setShowPetSelector(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-slate-300">Carregando seus pets...</p>
                </div>
              ) : pets.length === 0 ? (
                <div className="text-center py-8">
                  <GiPawPrint className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-slate-300 mb-4">
                    Você ainda não tem pets registrados.
                  </p>
                  <button
                    onClick={() => setShowPetSelector(false)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Registrar Primeiro Pet
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {pets.map(pet => (
                    <div
                      key={pet.id}
                      className="border border-gray-200 dark:border-surface-200 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-surface-75 cursor-pointer transition-colors"
                      onClick={() => addNodeToCanvas(pet)}
                    >
                      {pet.photo && (
                        <img
                          src={`https://gateway.pinata.cloud/ipfs/${pet.photo}`}
                          alt={pet.nickname}
                          className="w-full h-24 object-cover rounded-lg mb-3"
                          onError={(e) => {
                            console.log('Erro ao carregar imagem do pet:', pet.photo);
                            e.target.style.display = 'none';
                          }}
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
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        Cor: {pet.color}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        Nascimento: {pet.birthDate}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {editingNode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-surface-50 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
              Editar Informações do Pet
            </h3>
            
            {(() => {
              const node = genealogyNodes.find(n => n.id === editingNode);
              const pet = node?.petData;
              
              if (!pet) return null;
              
              return (
                <EditPetForm 
                  pet={pet}
                  onSave={(newData) => saveNodeEdit(editingNode, newData)}
                  onCancel={() => setEditingNode(null)}
                />
              );
            })()}
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
              Qual é a relação entre os pets selecionados?
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => createParentageConnection('parent')}
                className="w-full p-4 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-left transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">👨‍👩‍👧‍👦</span>
                  <div>
                    <h4 className="font-medium text-green-800 dark:text-green-200">Pai/Mãe</h4>
                    <p className="text-xs text-green-600 dark:text-green-300">Um é pai ou mãe do outro</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => createParentageConnection('offspring')}
                className="w-full p-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg text-left transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">👶</span>
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-200">Filho(a)</h4>
                    <p className="text-xs text-blue-600 dark:text-blue-300">Um é filho ou filha do outro</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => createParentageConnection('sibling')}
                className="w-full p-4 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg text-left transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">👫</span>
                  <div>
                    <h4 className="font-medium text-purple-800 dark:text-purple-200">Irmão(ã)</h4>
                    <p className="text-xs text-purple-600 dark:text-purple-300">São irmãos ou irmãs</p>
                  </div>
                </div>
              </button>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={cancelConnection}
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
