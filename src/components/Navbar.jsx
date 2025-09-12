import React from 'react';

function Navbar({ user, onLogin, onLogout, onCreaCampoClick, onHome }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container-fluid px-4">

        <button
          type="button"
          onClick={onHome}
          className="navbar-brand fw-bold fs-3 btn btn-link text-decoration-none p-0"
          style={{ letterSpacing: '1px' }}
        >
          <span style={{ color: '#28a745' }}>Soccer</span>
          <span style={{ color: '#fff' }}>Spot</span>
        </button>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSoccer"
          aria-controls="navbarSoccer"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSoccer">
          <ul className="navbar-nav ms-auto align-items-center gap-2">

            {user && (
              <li className="nav-item text-white fw-semibold me-2">
                👋 Benvenuto, {user.nome}
              </li>
            )}

            {user?.ruolo === 'proprietario' && (
              <li className="nav-item">
                <button onClick={onCreaCampoClick} className="btn btn-outline-success px-3">
                  + Crea Campo
                </button>
              </li>
            )}

            {user ? (
              <li className="nav-item">
                <button onClick={onLogout} className="btn btn-outline-light px-3">
                  Logout
                </button>
              </li>
            ) : (
              <li className="nav-item">
                <button onClick={onLogin} className="btn btn-success px-4 fw-semibold">
                  Login
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;