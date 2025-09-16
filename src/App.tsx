import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home/Home.tsx';
import { Login } from './pages/Login/Login.tsx';
import { Perfil } from './pages/Perfil/Perfil.tsx';
import { Register } from './pages/Register/Register.tsx';
// Importar otras páginas cuando las crees

export default function App() {
  return (
  <AuthProvider>
    <Router>
      <>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"></link>
        
        <Header />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/register" element={<Register />} />
          {/* Otras rutas irán aquí */}
        </Routes>
        
        <Footer />
      </>
    </Router>
  </AuthProvider>
  );
}