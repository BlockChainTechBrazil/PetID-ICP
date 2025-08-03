import { useTranslation } from 'react-i18next'
// @ts-ignore
import logo from '../assets/logo/petID-logo.png'
import LanguageSelector from './LanguageSelector'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { t } = useTranslation()
  const { isAuthenticated, login, logout, loading } = useAuth()

  const handleWalletAction = async () => {
    if (isAuthenticated) {
      await logout()
    } else {
      await login()
    }
  }

  return (
    <nav className="sticky top-0 z-50 py-3 bg-background/80 backdrop-blur-lg border-b border-primary/30 shadow-lg">
      <div className="container px-4 mx-auto relative lg:text-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center flex-shrink-0">
            <img className="h-10 w-10 mr-2 rounded-xl shadow-md" src={logo} alt="Logo" />
            <span className="text-2xl font-bold tracking-tight text-black">PetID</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleWalletAction}
              disabled={loading}
              className="px-5 py-2 rounded-2xl bg-blue-400 hover:bg-accent text-black font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? t('walletConnect.connectingButton')
                : isAuthenticated
                  ? t('navbar.walletConnected')
                  : t('navbar.connectWallet')
              }
            </button>
            <LanguageSelector />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
