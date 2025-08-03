import { useState, useEffect } from 'react';
import { Principal } from '@dfinity/principal';
import { createActor } from '../declarations/petid_backend';
import { Pet, PetRegistration, _SERVICE } from '../declarations/petid_backend/petid_backend.did.d';
import { useAuth } from '../context/AuthContext';
import { HttpAgent } from '@dfinity/agent';

export interface PetIDContractICP {
  contract: _SERVICE | null;
  registerPet: (petData: PetRegistration) => Promise<{ success: boolean; petId?: bigint; error?: string }>;
  transferPet: (petId: bigint, newOwner: Principal) => Promise<{ success: boolean; error?: string }>;
  updatePetData: (petId: bigint, ipfsHash: string) => Promise<{ success: boolean; error?: string }>;
  getPet: (petId: bigint) => Promise<Pet | null>;
  getOwnerPets: (owner?: Principal) => Promise<Pet[]>;
  isPetOwner: (petId: bigint, owner: Principal) => Promise<boolean>;
  getContractInfo: () => Promise<{ totalPets: bigint; nextPetId: bigint } | null>;
  loading: boolean;
  error: string | null;
}

export const usePetIDContractICP = (isAuthenticated: boolean, principal: Principal | null): PetIDContractICP => {
  const [contract, setContract] = useState<_SERVICE | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { authClient } = useAuth();

  useEffect(() => {
    if (isAuthenticated && principal && authClient) {
      initContract();
    } else {
      setContract(null);
    }
  }, [isAuthenticated, principal, authClient]);

  const initContract = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!authClient) {
        throw new Error('AuthClient não está disponível');
      }

      const identity = authClient.getIdentity();

      // ID do canister a partir das variáveis de ambiente
      const canisterId = import.meta.env.VITE_CANISTER_ID_PETID_BACKEND || 'uxrrr-q7777-77774-qaaaq-cai';
      // Certifique-se de que a URL do host tenha o formato correto
      const host = import.meta.env.VITE_HOST
        ? (import.meta.env.VITE_HOST.startsWith('http') ? import.meta.env.VITE_HOST : `http://${import.meta.env.VITE_HOST}`)
        : 'http://localhost:4943';

      console.log('Inicializando contrato:', {
        canisterId,
        host,
        network: import.meta.env.VITE_DFX_NETWORK,
        principal: identity.getPrincipal().toString()
      });

      // Criar agente HTTP com configurações específicas para desenvolvimento híbrido
      const agent = new HttpAgent({
        identity,
        host,
      });

      // Para desenvolvimento local, desabilitar TODAS as verificações de certificado
      if (import.meta.env.VITE_DFX_NETWORK === 'local') {
        console.log('Ambiente de desenvolvimento local - desativando verificações de segurança');

        // Usar abordagem segura para configurar o agente
        try {
          // Desabilitar verificação de assinatura usando indexação para contornar erros de tipagem
          (agent as any).verifyQuerySignatures = false;

          // Substituir fetchRootKey para evitar problemas com CBOR
          agent.fetchRootKey = async () => {
            console.log('Usando chave raiz fictícia para desenvolvimento local');
            // Retorna um ArrayBuffer compatível
            return new Uint8Array(32).fill(1).buffer;
          };

          // Executar fetchRootKey para garantir que tudo esteja configurado
          await agent.fetchRootKey().catch(e => {
            console.warn("Erro ao buscar root key, mas continuando...", e);
          });

          console.log('Configuração do agente para desenvolvimento local concluída');
        } catch (agentError) {
          console.warn('Erro ao configurar o agente, mas continuando:', agentError);
        }
      }

      // Passar o agente já configurado para o createActor
      const actor = createActor(canisterId, {
        agent,
        // Não passar agentOptions quando já temos um agent configurado
      });

      setContract(actor);
      console.log('Contrato inicializado com sucesso');
    } catch (err) {
      console.error('Erro ao inicializar contrato:', err);
      setError('Erro ao conectar com o contrato');
    } finally {
      setLoading(false);
    }
  };

  const registerPet = async (petData: PetRegistration): Promise<{ success: boolean; petId?: bigint; error?: string }> => {
    if (!contract) {
      return { success: false, error: 'Contrato não inicializado' };
    }

    try {
      setLoading(true);
      setError(null);

      const result = await contract.registerPet(petData);

      if ('ok' in result) {
        return { success: true, petId: result.ok };
      } else {
        return { success: false, error: result.err };
      }
    } catch (err) {
      console.error('Erro ao registrar pet:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao registrar pet';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const transferPet = async (petId: bigint, newOwner: Principal): Promise<{ success: boolean; error?: string }> => {
    if (!contract) {
      return { success: false, error: 'Contrato não inicializado' };
    }

    try {
      setLoading(true);
      setError(null);

      const result = await contract.transferPet(petId, newOwner);

      if ('ok' in result) {
        return { success: true };
      } else {
        return { success: false, error: result.err };
      }
    } catch (err) {
      console.error('Erro ao transferir pet:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao transferir pet';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updatePetData = async (petId: bigint, ipfsHash: string): Promise<{ success: boolean; error?: string }> => {
    if (!contract) {
      return { success: false, error: 'Contrato não inicializado' };
    }

    try {
      setLoading(true);
      setError(null);

      const result = await contract.updatePetData(petId, ipfsHash);

      if ('ok' in result) {
        return { success: true };
      } else {
        return { success: false, error: result.err };
      }
    } catch (err) {
      console.error('Erro ao atualizar dados do pet:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao atualizar pet';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getPet = async (petId: bigint): Promise<Pet | null> => {
    if (!contract) {
      console.warn('Contrato não inicializado');
      return null;
    }

    try {
      const result = await contract.getPet(petId);
      return result.length > 0 ? (result[0] || null) : null;
    } catch (err) {
      console.error('Erro ao buscar pet:', err);
      return null;
    }
  };

  const getOwnerPets = async (owner?: Principal): Promise<Pet[]> => {
    if (!contract) {
      console.warn('Contrato não inicializado');
      return [];
    }

    try {
      const targetOwner = owner || principal;
      if (!targetOwner) {
        console.warn('Nenhum principal fornecido');
        return [];
      }

      const pets = await contract.getOwnerPets(targetOwner);
      return pets;
    } catch (err) {
      console.error('Erro ao buscar pets do dono:', err);
      return [];
    }
  };

  const isPetOwner = async (petId: bigint, owner: Principal): Promise<boolean> => {
    if (!contract) {
      console.warn('Contrato não inicializado');
      return false;
    }

    try {
      return await contract.isPetOwner(petId, owner);
    } catch (err) {
      console.error('Erro ao verificar propriedade do pet:', err);
      return false;
    }
  };

  const getContractInfo = async (): Promise<{ totalPets: bigint; nextPetId: bigint } | null> => {
    if (!contract) {
      console.warn('Contrato não inicializado');
      return null;
    }

    try {
      return await contract.getContractInfo();
    } catch (err) {
      console.error('Erro ao buscar informações do contrato:', err);
      return null;
    }
  };

  return {
    contract,
    registerPet,
    transferPet,
    updatePetData,
    getPet,
    getOwnerPets,
    isPetOwner,
    getContractInfo,
    loading,
    error
  };
};
