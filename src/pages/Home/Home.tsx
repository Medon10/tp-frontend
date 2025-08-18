// src/pages/Home.tsx
import './Home.css'
import React from 'react';

export const Home: React.FC = () => {
return (
    <>
    <main className="container">
        <section className="hero">
        <h1>Vacation Match</h1>
        <p>
            ingrese un presupuesto y te mostraremos las mejores opciones para tus
            vacaciones.
        </p>
        </section>

        <section className="budget-form">
        <form id="vacation-form">
            <div className="form-group">
            <label htmlFor="budget">¿Cuál es tu presupuesto? (USD)</label>
            <input
                type="number"
                id="budget"
                min="300"
                required
                placeholder="Ej: 1500"
            />
            </div>
            <div className="form-group">
            <label htmlFor="travelers">Número de personas</label>
            <select id="travelers" required>
                <option value="1">1 persona</option>
                <option value="2" selected>
                2 personas
                </option>
                <option value="3">3 personas</option>
                <option value="4">4 personas</option>
                <option value="5">5 o más personas</option>
            </select>
            </div>
            <div className="form-group">
            <label htmlFor="duration">Duración del viaje</label>
            <select id="duration" required>
                <option value="weekend">Fin de semana (2-3 días)</option>
                <option value="week" selected>
                Una semana
                </option>
                <option value="twoweeks">Dos semanas</option>
                <option value="month">Un mes</option>
            </select>
            </div>
            <button type="submit" className="btn btn-full">
            Encontrar mi Destino
        </button>
        </form>
        </section>

        <div className="loading" id="loading">
        <div className="loading-spinner"></div>
        <p>Buscando las mejores opciones para ti...</p>
        </div>

        <section className="results" id="results">
        <h2>Destinos recomendados para tu presupuesto</h2>
        <div className="packages" id="packages">
        </div>
        </section>

        <section className="features">
        <div className="feature">
            <i className="fas fa-globe"></i>
            <h3>Destinos Globales</h3>
            <p>
            Accede a más de 500 destinos en todo el mundo con un solo clic.
            </p>
        </div>
        <div className="feature">
            <i className="fas fa-hand-holding-usd"></i>
            <h3>Mejor Precio Garantizado</h3>
            <p>
            Encuentra los mejores precios para tu presupuesto sin comprometer
            calidad.
        </p>
        </div>
        <div className="feature">
            <i className="fas fa-box-open"></i>
            <h3>Paquetes Todo Incluido</h3>
            <p>
            Vuelos, hospedaje, transporte y actividades en un solo lugar.
        </p>
        </div>
        </section>
    </main>

    <div className="banner" id="banner">
        Destino añadido a favoritos
    </div>
    </>
);
};