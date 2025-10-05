import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home/Home.tsx';
import { Login } from './pages/Login/Login.tsx';
import { Perfil } from './pages/Perfil/Perfil.tsx';
import { Register } from './pages/Register/Register.tsx';
import { Destinos } from './pages/Destinos/Destinos.tsx';
import { DetalleDestino } from './pages/DetalleDestino/DetalleDestino.tsx';


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
          <Route path="/destinos" element={<Destinos />} />
          <Route path="/destinos/:id" element={<DetalleDestino />} />
          {/* Otras rutas irán aquí */}
        </Routes>
        
        <Footer />
      </>
    </Router>
  </AuthProvider>
  );
}