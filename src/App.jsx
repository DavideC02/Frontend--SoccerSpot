import React, { useState, useEffect } from 'react';
import './App.css';
import AuthForm from './components/Authform';
import Campo from './components/Campo';
import Creacampo from './components/Creacampo';
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Footer from "./components/Footer";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
console.log("BASE_URL:", API_BASE_URL);

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoginView, setIsLoginView] = useState(true);
  const [campiTrovati, setCampiTrovati] = useState([]);
  const [erroreRicerca, setErroreRicerca] = useState('');
  const [pagina, setPagina] = useState('home');
  const [authError, setAuthError] = useState('');

  async function fetchProtettaConToken(endpoint, options = {}, onLogout) {
    let token = localStorage.getItem("tokenaccesso");

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(API_BASE_URL + endpoint, {
      ...options,
      headers,
      credentials: 'include'
    });

    if (res.status === 403) {
      const refreshRes = await fetch(API_BASE_URL + '/auth/refreshtoken', {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        const nuovoToken = data.tokenaccesso;

        if (nuovoToken) {
          localStorage.setItem('tokenaccesso', nuovoToken);
          return await fetchProtettaConToken(endpoint, options, onLogout);
        }
      }

      if (onLogout) onLogout();
      throw new Error('Token scaduto o non valido');
    }

    return res;
  }

  useEffect(() => {
    const loadInitialData = () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('tokenaccesso');

      try {
        if (storedUser && token) {
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Errore durante il caricamento iniziale:", e);
        if (storedUser && token && e.message.toLowerCase().includes("token")) {
          handleLogout(false);
        }
      }
    };

    loadInitialData();
  }, []);

  const handleAuthSubmit = async (credentials) => {
    const endpoint = isLoginView ? '/auth/login' : '/auth/registrazione';
    setAuthError('');

    try {
      const res = await fetch(API_BASE_URL + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Errore autenticazione');
      }

      if (isLoginView && data?.tokenaccesso) {
        localStorage.setItem('tokenaccesso', data.tokenaccesso);
        localStorage.setItem('user', JSON.stringify(data.user));
        setCurrentUser(data.user);
        setPagina('dashboard');
      } else if (!isLoginView) {
        setIsLoginView(true);
      }
    } catch (error) {
      console.error('Errore API per:', endpoint, error);
      setAuthError(error.message || 'Errore di autenticazione');
    }
  };

  const handleLogout = async (callapi = true) => {
    if (callapi) {
      try {
        await fetch(API_BASE_URL + '/auth/logout', {
          method: 'POST',
          credentials: 'include'
        });
      } catch (e) {
        console.error("Logout API fallito, procedo col logout");
      }
    }
    localStorage.removeItem('tokenaccesso');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setIsLoginView(true);
    setPagina('home');
  };

  const handleSearch = async (comune) => {
    try {
      const res = await fetch(`${API_BASE_URL}/campo/${encodeURIComponent(comune)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Errore durante la ricerca');
      }

      setCampiTrovati(data || []);
      setErroreRicerca('');
    } catch (err) {
      setCampiTrovati([]);
      setErroreRicerca('Errore nella ricerca del comune');
    }
  };

  async function handleCreateCampo(datiCampo) {
    try {
      const response = await fetchProtettaConToken(`/campo`, {
        method: 'POST',
        body: JSON.stringify(datiCampo)
      }, handleLogout);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Errore creazione campo');
      }

      const { campo: nuovoCampo } = await response.json();
      alert("Campo creato!");
      setCampiTrovati((campi) => [...campi, nuovoCampo]);
    } catch (err) {
      console.error('Errore creazione campo:', err.message);
      alert('Errore durante la creazione del campo.');
    }
  }

  async function handleDeleteCampo(campoId) {
    try {
      const response = await fetchProtettaConToken(`/campo/${campoId}`, {
        method: 'DELETE'
      }, handleLogout);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Errore eliminazione campo');
      }

      setCampiTrovati((campi) => campi.filter(c => c._id !== campoId));
    } catch (err) {
      console.error('Errore eliminazione:', err.message);
      alert('Errore durante l’eliminazione del campo.');
    }
  }

  async function handleUpdateCampo(campoId, indiceimg, nuovaImg, nuovoTelefono) {
    try {
      const response = await fetchProtettaConToken(`/campo/${campoId}`, {
        method: 'PUT',
        body: JSON.stringify({
          indiceimg,
          img: nuovaImg,
          numerotelefono: nuovoTelefono
        })
      }, handleLogout);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Errore aggiornamento campo');
      }

      const { campo: campoAggiornato } = await response.json();

      setCampiTrovati(campi =>
        campi.map(c => c._id === campoAggiornato._id ? campoAggiornato : c)
      );
    } catch (err) {
      console.error("Errore aggiornamento campo:", err.message);
      alert("Errore durante l'aggiornamento del campo.");
    }
  }

  async function handleLikeCampo(campoId) {
    try {
      const response = await fetchProtettaConToken(`/campo/${campoId}/like`, {
        method: 'PUT'
      }, handleLogout);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Errore nel like');
      }

      const { campo: campoAggiornato, message } = await response.json();

      setCampiTrovati((campi) =>
        campi.map((campo) => campo._id === campoAggiornato._id ? campoAggiornato : campo)
      );
      alert(message);
    } catch (err) {
      console.error('Errore like:', err.message);
      alert('Errore durante il like/dislike.');
    }
  }

  // ⬇️ NUOVO: crea prenotazione
  async function handleCreaPrenotazione(campoId, data, oraInizio, oraFine, note) {
    try {
      // compongo inizio/fine (locale) -> ISO
      const start = new Date(`${data}T${oraInizio}`);
      const end = new Date(`${data}T${oraFine}`);

      const response = await fetchProtettaConToken(`/prenotazioni`, {
        method: 'POST',
        body: JSON.stringify({
          campoid: campoId,
          inizio: start.toISOString(),
          fine: end.toISOString(),
          note: note || undefined
        })
      }, handleLogout);

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message || 'Errore creazione prenotazione');
      }

      alert('Prenotazione creata!');
      // Se vuoi, qui puoi aggiornare uno stato “mie prenotazioni”, oppure lasciare così.
    } catch (err) {
      console.error('Errore prenotazione:', err.message);
      alert(err.message || 'Errore durante la prenotazione.');
    }
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar
        user={currentUser}
        onLogin={() => {
          setAuthError('');
          setPagina('auth');
        }}
        onLogout={handleLogout}
        onCreaCampoClick={() => setPagina('creacampo')}
        onHome={() => setPagina('home')}
      />

      <div className="flex-grow-1">
        {pagina === 'home' && (
          <>
            <Home onSearch={handleSearch} />

            {campiTrovati.length === 0 && !erroreRicerca && (
              <div className="text-center mt-4 text-muted fw-semibold" style={{ fontSize: '1.2rem' }}>
                SELEZIONA LA CITTÀ PER VEDERE I CAMPI DISPONIBILI
              </div>
            )}

            {campiTrovati.length === 0 && erroreRicerca === '' && pagina === 'home' && (
              <div className="text-center mt-4 text-danger fw-semibold" style={{ fontSize: '1.2rem' }}>
                NESSUN CAMPO DISPONIBILE PER QUESTA CITTÀ
              </div>
            )}

            {erroreRicerca && (
              <div className="alert alert-danger text-center w-75 mx-auto mt-3" role="alert">
                {erroreRicerca}
              </div>
            )}

            {campiTrovati.length > 0 && (
              <div className="container mt-4">
                <div className="row">
                  {campiTrovati.map((campo) => (
                    <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4" key={`${campo._id}-home`}>
                      <Campo
                        campo={campo}
                        currentUser={currentUser}
                        onLike={handleLikeCampo}
                        onDelete={handleDeleteCampo}
                        onUpdate={handleUpdateCampo}
                        onPrenota={handleCreaPrenotazione}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {pagina === 'auth' && (
          <>
            <div className="container py-5">
              <div className="row justify-content-center">
                <div className="col-md-6 bg-white p-4 rounded shadow">
                  <AuthForm
                    onSubmit={handleAuthSubmit}
                    formType={isLoginView ? 'login' : 'register'}
                    errorMessage={authError}
                  />

                  <div className="d-flex justify-content-center mt-3 gap-3 flex-wrap">
                    <button
                      onClick={() => {
                        setAuthError('');
                        setPagina('home');
                      }}
                      className="btn btn-outline-success"
                    >
                      Torna alla Home
                    </button>

                    <button
                      onClick={() => {
                        setAuthError('');
                        setIsLoginView(!isLoginView);
                      }}
                      className="btn btn-outline-primary"
                    >
                      {isLoginView ? 'Non hai un account? Registrati' : 'Hai già un account? Login'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {pagina === 'creacampo' && currentUser?.ruolo === 'proprietario' && (
          <>
            <div className="container py-5">
              <div className="row justify-content-center">
                <div className="col-md-8 bg-white p-4 rounded shadow">
                  <Creacampo onCampoCreated={handleCreateCampo} />
                  <button
                    className="btn btn-outline-secondary mt-3"
                    onClick={() => setPagina('home')}
                  >
                    Torna alla Dashboard
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default App;