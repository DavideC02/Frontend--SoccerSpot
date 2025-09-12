import React, { useState } from 'react';
import campoImg from '../assets/img/campo.jpg';

function Home({ onSearch }) {
  const [comune, setComune] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(comune);
  };

  return (
    <div>
      <div
        className="position-relative w-100 d-flex justify-content-center align-items-center text-center"
        style={{
          height: '50vh',
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${campoImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          className="bg-white p-4 rounded-4 shadow"
          style={{
            maxWidth: '500px',
            width: '90%',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <h1 className="fw-bold text-center mb-3">
            <span style={{ color: '#28a745' }}>Soccer</span>
            <span style={{ color: '#212529' }}>Spot</span>
          </h1>
          <p className="text-muted mb-4" style={{ fontSize: '1.1rem' }}>
            Trova e prenota i migliori campi vicino a te
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-floating mb-3">
              <select
                id="comuneSelect"
                value={comune}
                required
                onChange={(e) => setComune(e.target.value)}
                className="form-select"
              >
                <option value="">Scegli un comune</option>
                <option value="Roma">Roma</option>
                <option value="Milano">Milano</option>
                <option value="Bari">Bari</option>
                <option value="Palermo">Palermo</option>
                <option value="Torino">Torino</option>
              </select>
              <label htmlFor="comuneSelect">Comune</label>
            </div>

            <button
              type="submit"
              className="btn btn-success w-100 py-2 fw-semibold"
              style={{ transition: 'all 0.3s ease' }}
              onMouseOver={(e) => (e.target.style.opacity = '0.9')}
              onMouseOut={(e) => (e.target.style.opacity = '1')}
            >
              Cerca
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Home;