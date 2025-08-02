import { useState, useEffect } from 'react';
import { Principal } from '@dfinity/principal';
import { createActor } from '../declarations/petid_backend';
import { Pet, PetRegistration, _SERVICE } from '../declarations/petid_backend/petid_backend.did.d';
import { AuthClient } from '@dfinity/auth-client';

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

  useEffect(() => {
    if (isAuthenticated && principal) {
      initContract();
    } else {
      setContract(null);
    }
  }, [isAuthenticated, principal]);

  const initContract = async () => {
    try {
      setLoading(true);
      setError(null);

      const authClient = await AuthClient.create();
      const identity = authClient.getIdentity();

      // ID do canister (será substituído durante o build)
      const canisterId = import.meta.env.CANISTER_ID_PETID_BACKEND || 'be2us-64aaa-aaaaa-qaabq-cai';

      const actor = createActor(canisterId, {
        agentOptions: {
          identity,
          host: import.meta.env.DFX_NETWORK === 'local' ? 'http://localhost:4943' : 'https://ic0.app'
        }
      });

      setContract(actor);
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
      return result.length > 0 ? result[0] : null;
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
