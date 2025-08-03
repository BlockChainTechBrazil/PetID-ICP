import React from 'react';
import { useAuth } from '../context/AuthContext';

interface WalletConnectICPProps {
  onConnectionChange?: (isConnected: boolean) => void;
}

const WalletConnectICP: React.FC<WalletConnectICPProps> = ({ onConnectionChange }) => {
  const { isAuthenticated, principal, login, logout, loading, error } = useAuth();

  React.useEffect(() => {
    if (onConnectionChange) {
      onConnectionChange(isAuthenticated);
    }
  }, [isAuthenticated, onConnectionChange]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (err) {
      console.error('Erro ao fazer login:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    }
  };

  const formatPrincipal = (principal: string) => {
    if (principal.length <= 10) return principal;
    return `${principal.slice(0, 6)}...${principal.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="wallet-connect">
        <button className="wallet-button loading" disabled>
          <div className="spinner"></div>
          Conectando...
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wallet-connect">
        <button className="wallet-button error" onClick={handleLogin}>
          Erro - Tentar Novamente
        </button>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (isAuthenticated && principal) {
    return (
      <div className="wallet-connect connected">
        <div className="wallet-info">
          <div className="connection-indicator"></div>
          <span className="wallet-address">
            {formatPrincipal(principal.toString())}
          </span>
        </div>
        <button className="wallet-button disconnect" onClick={handleLogout}>
          Desconectar
        </button>
      </div>
    );
  }

  return (
    <div className="wallet-connect">
      <button className="wallet-button connect" onClick={handleLogin}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L13.09 5.26L16 4L14.74 7.09L18 8L14.74 8.91L16 12L13.09 10.74L12 14L10.91 10.74L8 12L9.26 8.91L6 8L9.26 7.09L8 4L10.91 5.26L12 2Z"
            fill="currentColor"
          />
        </svg>
        Conectar com Internet Identity
      </button>
    </div>
  );
};

export default WalletConnectICP;
