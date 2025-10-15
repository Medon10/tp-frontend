import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import { FavoritesProvider } from './context/FavoriteContext.tsx';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home/Home.tsx';
import { Login } from './pages/Login/Login.tsx';
import { Register } from './pages/Register/Register.tsx';
import { Destinos } from './pages/Destinos/Destinos.tsx';
import { DetalleDestino } from './pages/DetalleDestino/DetalleDestino.tsx';
import { ProtectedRoute } from './routes/ProtectedRoute.tsx';

// --- Componentes de Rutas Protegidas ---
import { Perfil } from './pages/Perfil/Perfil.tsx';
import { Favoritos } from './pages/Favoritos/Favoritos.tsx'; 
import { MisViajes } from './pages/MisViajes/Historial.tsx';
import { AdminVuelos } from './pages/Admin/AdminVuelos.tsx';


export default function App() {
  return (
  <AuthProvider>
    <FavoritesProvider>
    <Router>
      <>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"></link>
        
        <Header />
        
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/destinos" element={<Destinos />} />
          <Route path="/destinos/:id" element={<DetalleDestino />} />

          {/* Rutas Protegidas (requieren iniciar sesión) */}
          <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
          <Route path="/mis-viajes" element={<ProtectedRoute><MisViajes /></ProtectedRoute>} />
          <Route path="/favoritos" element={<ProtectedRoute><Favoritos /></ProtectedRoute>} />
          <Route path="/admin/flights" element={<ProtectedRoute><AdminVuelos /></ProtectedRoute>} />
          
        </Routes>
        
        <Footer />
      </>
    </Router>
    </FavoritesProvider>
  </AuthProvider>
  );
}