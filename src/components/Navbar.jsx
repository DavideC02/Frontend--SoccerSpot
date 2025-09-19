import React from 'react'; // Import di React per definire il componente

function Navbar({ user, onLogin, onLogout, onCreaCampoClick, onHome, onProfile }) { 
  // Navbar riceve dal padre (App.jsx) alcune funzioni di callback:
  // - user → utente loggato (o null)
  // - onLogin → apre la vista login
  // - onLogout → effettua logout (chiama backend POST /logout e reset stato FE)
  // - onCreaCampoClick → naviga al form per creare un campo (solo proprietari)
  // - onHome → torna alla homepage
  // - onProfile → apre la pagina profilo

  return ( 
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      {/* Barra di navigazione Bootstrap:
          - navbar-expand-lg → si espande da schermi grandi in su
          - navbar-dark bg-dark → tema scuro
          - shadow-sm → leggera ombra sotto la navbar */}
      
      <div className="container-fluid px-4"> {/* Contenitore fluido con padding orizzontale */}

        <button
          type="button"
          onClick={onHome} // Al click richiama la funzione passata dal genitore → setPagina('home')
          className="navbar-brand fw-bold fs-3 btn btn-link text-decoration-none p-0"
          style={{ letterSpacing: '1px' }}
        >
          {/* Logo testuale SoccerSpot che funge da "Home" */}
          <span style={{ color: '#28a745' }}>Soccer</span>
          <span style={{ color: '#fff' }}>Spot</span>
        </button>

        {/* Bottone toggle visibile solo su dispositivi piccoli (hamburger menu) */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse" // Bootstrap gestisce apertura/chiusura
          data-bs-target="#navbarSoccer" // Target della sezione collapsable
          aria-controls="navbarSoccer"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span> {/* Icona hamburger */}
        </button>

        <div className="collapse navbar-collapse" id="navbarSoccer">
          <ul className="navbar-nav ms-auto align-items-center gap-2">
            {/* ms-auto → spinge a destra gli elementi
                align-items-center → allinea verticalmente
                gap-2 → spazio tra elementi */}

            {user && ( // Se utente loggato → mostra messaggio di benvenuto
              <li className="nav-item text-white fw-semibold me-2">
                👋 Benvenuto, {user.nome}
              </li>
            )}

            {user?.ruolo === 'proprietario' && ( // Se l'utente è "proprietario" → pulsante per creare campo
              <li className="nav-item">
                <button onClick={onCreaCampoClick} className="btn btn-outline-success px-3">
                  + Crea Campo
                </button>
              </li>
            )}

            {user && ( // Se loggato → pulsante per aprire pagina profilo
              <li className="nav-item">
                <button onClick={onProfile} className="btn btn-outline-info px-3">
                  Profilo
                </button>
              </li>
            )}

            {user ? ( // Se loggato → pulsante Logout
              <li className="nav-item">
                <button onClick={onLogout} className="btn btn-outline-light px-3">
                  Logout
                </button>
              </li>
            ) : ( // Se NON loggato → pulsante Login
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

export default Navbar; // Esporta il componente per usarlo in App.jsx