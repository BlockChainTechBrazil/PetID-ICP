import { useEffect, useState } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { useTranslation } from 'react-i18next';
import { auth, googleProvider } from '../firebaseConfig';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { createActor } from 'declarations/PetID_backend';
import { canisterId as backendCanisterId } from 'declarations/PetID_backend/index';
import { HttpAgent } from '@dfinity/agent';

/*
  Página de Perfil: gerencia identidade dupla (Internet Identity + Firebase Social Login) e NFTs (pets).
  Estratégia de unificação: se o usuário fizer login com ambos, exibimos dados combinados.
*/

const ProfilePage = () => {
  const { t } = useTranslation();
  const [iiAuthClient, setIiAuthClient] = useState(null);
  const [iiAuthenticated, setIiAuthenticated] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [actor, setActor] = useState(null);
  const [loadingPets, setLoadingPets] = useState(false);
  const [error, setError] = useState('');

  // Inicializa Internet Identity
  useEffect(() => {
    const init = async () => {
      const client = await AuthClient.create();
      setIiAuthClient(client);
      const isAuth = await client.isAuthenticated();
      setIiAuthenticated(isAuth);
      if (isAuth) {
        await initActor(client);
      }
    };
    init();
  }, []);

  // Inicializa listener do Firebase
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsub();
  }, []);

  // Cria ator autenticado para backend
  const initActor = async (client) => {
    try {
      const identity = client.getIdentity();
      const agent = new HttpAgent({
        identity,
        host: process.env.DFX_NETWORK === 'ic' ? 'https://ic0.app' : 'http://localhost:4943',
      });
      if (process.env.DFX_NETWORK !== 'ic') {
        await agent.fetchRootKey();
      }
      const a = createActor(backendCanisterId, { agent });
      setActor(a);
    } catch (e) {
      console.error(e);
    }
  };

  const loginII = async () => {
    const identityProvider = process.env.DFX_NETWORK === 'ic'
      ? 'https://identity.ic0.app/#authorize'
      : `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943`;
    await iiAuthClient?.login({
      identityProvider,
      onSuccess: async () => {
        setIiAuthenticated(true);
        await initActor(iiAuthClient);
        loadPets();
      },
      onError: (err) => console.error('II login error', err)
    });
  };

  const logoutII = async () => {
    await iiAuthClient?.logout();
    setIiAuthenticated(false);
    setActor(null);
    setPets([]);
  };

  const loginGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error(e);
    }
  };

  const logoutGoogle = async () => {
    await signOut(auth);
  };

  const loadPets = async () => {
    if (!actor) return;
    setLoadingPets(true);
    setError('');
    try {
      const res = await actor.getMyPets();
      if ('ok' in res) setPets(res.ok);
      else if ('err' in res) setError(res.err);
    } catch (e) {
      setError('Erro ao carregar pets');
    } finally {
      setLoadingPets(false);
    }
  };

  useEffect(() => { if (actor) loadPets(); }, [actor]);

  return (
    <section className="py-12 container mx-auto px-4 bg-white dark:bg-slate-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">{t('profile.title', 'Meu Perfil & NFTs')}</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="p-6 rounded-lg border bg-white dark:bg-slate-800/60 shadow-sm dark:border-slate-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Internet Identity</h2>
            {iiAuthenticated ? (
              <>
                <p className="text-sm text-green-600 dark:text-green-400 mb-2">Conectado ao Internet Identity.</p>
                <button onClick={logoutII} className="px-4 py-2 bg-gray-200 dark:bg-slate-700 dark:text-slate-100 rounded hover:bg-gray-300 dark:hover:bg-slate-600 text-sm">Logout II</button>
              </>
            ) : (
              <button onClick={loginII} className="px-4 py-2 bg-blue-500 dark:bg-indigo-600 text-white rounded hover:bg-blue-600 dark:hover:bg-indigo-500 text-sm">Conectar II</button>
            )}
          </div>
          <div className="p-6 rounded-lg border bg-white dark:bg-slate-800/60 shadow-sm dark:border-slate-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Social Login (Firebase)</h2>
            {firebaseUser ? (
              <>
                <p className="text-sm text-green-600 dark:text-green-400 mb-2">Logado como {firebaseUser.displayName || firebaseUser.email}</p>
                <button onClick={logoutGoogle} className="px-4 py-2 bg-gray-200 dark:bg-slate-700 dark:text-slate-100 rounded hover:bg-gray-300 dark:hover:bg-slate-600 text-sm">Logout Google</button>
              </>
            ) : (
              <button onClick={loginGoogle} className="px-4 py-2 bg-rose-500 dark:bg-rose-600 text-white rounded hover:bg-rose-600 dark:hover:bg-rose-500 text-sm">Login Google</button>
            )}
          </div>
        </div>

        <div className="p-6 rounded-lg border bg-white dark:bg-slate-800/60 shadow-sm dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Meus Pets (NFTs)</h2>
            <button onClick={loadPets} disabled={!actor || loadingPets} className="text-sm px-3 py-1 rounded bg-indigo-500 dark:bg-indigo-600 disabled:opacity-50 text-white">Atualizar</button>
          </div>
          {!iiAuthenticated && <p className="text-sm text-gray-600 dark:text-slate-400">Conecte-se com Internet Identity para ver seus pets.</p>}
          {loadingPets && <p>Carregando...</p>}
          {error && <p className="text-red-600 dark:text-red-400 text-sm mb-2">{error}</p>}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {pets.map(p => (
              <div key={p.id} className="border rounded p-3 bg-gray-50 dark:bg-slate-700/50 dark:border-slate-600">
                <div className="flex justify-between">
                  <h3 className="font-medium text-blue-600 dark:text-indigo-400">{p.name}</h3>
                  <span className="text-xs text-gray-500 dark:text-slate-400">{p.id}</span>
                </div>
                {p.nickname && <p className="text-xs text-gray-600 dark:text-slate-300">Apelido: {p.nickname}</p>}
                <p className="text-xs text-gray-600 dark:text-slate-300">Nascimento: {new Date(p.birthDate).toLocaleDateString()}</p>
              </div>
            ))}
            {iiAuthenticated && pets.length === 0 && !loadingPets && <p className="text-sm text-gray-500 dark:text-slate-400">Nenhum pet encontrado.</p>}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
