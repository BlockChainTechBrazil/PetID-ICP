// Import do backend removido porque não é usado neste componente e causava 404 se bindings ainda não gerados.
import NavBar from './componentes/NavBar';
// Componentes agregados agora em HomePage
import HomePage from './pages/HomePage';
import Footer from './componentes/Footer';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProfilePage from './componentes/ProfilePage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/perfil" element={<ProfilePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
