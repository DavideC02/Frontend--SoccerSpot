import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import AuthForm from './components/Authform';
import Campo from './components/Campo';
import Creacampo from './components/Creacampo';
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Footer from "./components/Footer";
import Profilo from "./components/Profilo";

// Base URL dell'API (build-time). Fallback a stringa vuota.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
const buildUrl = (path) => `${API_BASE_URL.replace(/\/+$/, '')}${path}`;

console.log("BASE_URL:", API_BASE_URL);

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoginView, setIsLoginView] = useState(true);

  const [campiTrovati, setCampiTrovati] = useState([]);
  const [erroreRicerca, setErroreRicerca] = useState('');
  const [haCercato, setHaCercato] = useState(false); // per mostrare messaggi corretti in home

  const [pagina, setPagina] = useState('home');
  const [authError, setAuthError] = useState('');

  const [campiPreferiti, setCampiPreferiti] = useState([]);
  const [loadingPreferiti, setLoadingPreferiti] = useState(false);
  const [errorePreferiti, setErrorePreferiti] = useState('');

  const [profiloMessaggio, setProfiloMessaggio] = useState('');
  const [profiloErrore, setProfiloErrore] = useState('');

  const clearProfiloFeedback = () => {
    setProfiloMessaggio('');
    setProfiloErrore('');
  };

  // -----------------------------
  // LOGOUT (dichiarato PRIMA di usarlo nelle deps)
  // -----------------------------
  const handleLogout = useCallback(async (callapi = true) => {
    if (callapi) {
      try {
        await fetch(buildUrl('/auth/logout'), {
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
    setCampiPreferiti([]);
    setErrorePreferiti('');
    setProfiloMessaggio('');
    setProfiloErrore('');
    setLoadingPreferiti(false);
    setPagina('home');
  }, []);

  // -----------------------------
  // FETCH PROTETTA CON REFRESH TOKEN (fix Authorization + retry singolo)
  // -----------------------------
  const fetchProtettaConToken = useCallback(
    async (endpoint, options = {}, onLogout, _retry = false) => {
      const token = localStorage.getItem('tokenaccesso');

      const headers = {
        ...(options.headers || {})
      };

      // Imposta Content-Type se stai mandando JSON stringificato
      if (typeof options.body === 'string' && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`; // <-- FIX qui
      }

      const res = await fetch(buildUrl(endpoint), {
        ...options,
        headers,
        credentials: 'include'
      });

      // Se 403, prova UNA SOLA volta a fare refresh
      if (res.status === 403 && !_retry) {
        const refreshRes = await fetch(buildUrl('/auth/refreshtoken'), {
          method: 'POST',
          credentials: 'include',
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json().catch(() => ({}));
          const nuovoToken = data.tokenaccesso;
          if (nuovoToken) {
            localStorage.setItem('tokenaccesso', nuovoToken);
            return await fetchProtettaConToken(endpoint, options, onLogout, true);
          }
        }

        if (onLogout) onLogout();
        throw new Error('Token scaduto o non valido');
      }

      return res;
    },
    []
  );

  // -----------------------------
  // LOAD INITIAL DATA (dopo le funzioni; deps corrette)
  // -----------------------------
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
        if (storedUser && token && String(e.message || '').toLowerCase().includes("token")) {
          handleLogout(false);
        }
      }
    };

    loadInitialData();
  }, [handleLogout]);

  // -----------------------------
  // AUTH
  // -----------------------------
  const handleAuthSubmit = async (credentials) => {
    const endpoint = isLoginView ? '/auth/login' : '/auth/registrazione';
    setAuthError('');

    try {
      const res = await fetch(buildUrl(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || 'Errore autenticazione');
      }

      if (isLoginView && data?.tokenaccesso) {
        localStorage.setItem('tokenaccesso', data.tokenaccesso);
        localStorage.setItem('user', JSON.stringify(data.user));
        setCurrentUser(data.user);
        setPagina('profilo');
      } else if (!isLoginView) {
        setIsLoginView(true);
      }
    } catch (error) {
      console.error('Errore API per:', endpoint, error);
      setAuthError(error.message || 'Errore di autenticazione');
    }
  };

  // -----------------------------
  // PREFERITI
  // -----------------------------
  const caricaCampiPreferiti = useCallback(async () => {
    if (!currentUser) {
      setCampiPreferiti([]);
      return;
    }

    setLoadingPreferiti(true);
    setErrorePreferiti('');
    try {
      const res = await fetchProtettaConToken(`/campo/preferiti`, {}, handleLogout);
      const payload = await res.json().catch(() => []);

      if (!res.ok) {
        throw new Error((payload && payload.message) || 'Errore durante il caricamento dei preferiti');
      }

      setCampiPreferiti(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setCampiPreferiti([]);
      setErrorePreferiti(err.message || 'Errore durante il caricamento dei preferiti.');
    } finally {
      setLoadingPreferiti(false);
    }
  }, [currentUser, fetchProtettaConToken, handleLogout]);

  useEffect(() => {
    if (pagina === 'profilo' && currentUser) {
      caricaCampiPreferiti();
    }
  }, [pagina, currentUser, caricaCampiPreferiti]);

  useEffect(() => {
    if (pagina !== 'profilo') {
      setProfiloMessaggio('');
      setProfiloErrore('');
    }
  }, [pagina]);

  async function handleAggiornaProfilo(datiProfilo) {
    try {
      setProfiloErrore('');
      setProfiloMessaggio('');

      const res = await fetchProtettaConToken(`/auth/profilo`, {
        method: 'PUT',
        body: JSON.stringify(datiProfilo)
      }, handleLogout);

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error((payload && payload.message) || "Errore durante l'aggiornamento del profilo");
      }

      if (payload && payload.user) {
        setCurrentUser(payload.user);
        localStorage.setItem('user', JSON.stringify(payload.user));
      }

      setProfiloMessaggio(payload.message || 'Profilo aggiornato');
      return { success: true };
    } catch (err) {
      setProfiloErrore(err.message || "Errore durante l'aggiornamento del profilo");
      return { success: false };
    }
  }

  // -----------------------------
  // SEARCH
  // -----------------------------
  const handleSearch = async (comune) => {
    setHaCercato(true);
    try {
      const res = await fetch(buildUrl(`/campo/${encodeURIComponent(comune)}`));
      const data = await res.json().catch(() => []);

      if (!res.ok) {
        throw new Error(data.message || 'Errore durante la ricerca');
      }

      setCampiTrovati(Array.isArray(data) ? data : []);
      setErroreRicerca('');
    } catch (err) {
      setCampiTrovati([]);
      setErroreRicerca('Errore nella ricerca del comune');
    }
  };

  // -----------------------------
  // CAMPI: CREATE / DELETE / UPDATE / LIKE
  // -----------------------------
  async function handleCreateCampo(datiCampo) {
    try {
      const response = await fetchProtettaConToken(`/campo`, {
        method: 'POST',
        body: JSON.stringify(datiCampo)
      }, handleLogout);

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message || 'Errore creazione campo');
      }

      const { campo: nuovoCampo } = payload;
      alert("Campo creato!");
      setCampiTrovati((campi) => (nuovoCampo ? [...campi, nuovoCampo] : campi));
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
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Errore eliminazione campo');
      }

      setCampiTrovati((campi) => campi.filter(c => c._id !== campoId));
      setCampiPreferiti((campi) => Array.isArray(campi) ? campi.filter(c => c._id !== campoId) : campi);
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

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message || 'Errore aggiornamento campo');
      }

      const { campo: campoAggiornato } = payload;

      setCampiTrovati(campi =>
        campi.map(c => c._id === campoAggiornato._id ? campoAggiornato : c)
      );

      setCampiPreferiti(campi =>
        Array.isArray(campi)
          ? campi.map(c => c._id === campoAggiornato._id ? campoAggiornato : c)
          : campi
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

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message || 'Errore nel like');
      }

      const { campo: campoAggiornato, message } = payload;

      setCampiTrovati((campi) =>
        campi.map((campo) => campo._id === campoAggiornato._id ? campoAggiornato : campo)
      );

      setCampiPreferiti((campi) => {
        if (!Array.isArray(campi)) return campi;

        const messaggio = (message || '').toLowerCase();

        if (messaggio.includes('aggiunto')) {
          const esiste = campi.some((c) => c._id === campoAggiornato._id);
          if (esiste) {
            return campi.map((c) => c._id === campoAggiornato._id ? campoAggiornato : c);
          }
          return [...campi, campoAggiornato];
        }

        if (messaggio.includes('rimosso')) {
          return campi.filter((c) => c._id !== campoAggiornato._id);
        }

        return campi;
      });

      if (payload.message) alert(payload.message);
    } catch (err) {
      console.error('Errore like:', err.message);
      alert('Errore durante il like/dislike.');
    }
  }

  // -----------------------------
  // PRENOTAZIONI
  // -----------------------------
  async function handleCreaPrenotazione(campoId, data, oraInizio, oraFine, note) {
    try {
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

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || 'Errore creazione prenotazione');
      }

      alert('Prenotazione creata!');
    } catch (err) {
      console.error('Errore prenotazione:', err.message);
      alert(err.message || 'Errore durante la prenotazione.');
    }
  }

  // -----------------------------
  // RENDER
  // -----------------------------
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
        onProfile={() => {
          if (currentUser) {
            clearProfiloFeedback();
            setPagina('profilo');
          } else {
            setAuthError('');
            setPagina('auth');
          }
        }}
      />

      <div className="flex-grow-1">
        {pagina === 'home' && (
          <>
            <Home onSearch={handleSearch} />

            {!haCercato && (
              <div className="text-center mt-4 text-muted fw-semibold" style={{ fontSize: '1.2rem' }}>
                SELEZIONA LA CITTÀ PER VEDERE I CAMPI DISPONIBILI
              </div>
            )}

            {haCercato && campiTrovati.length === 0 && !erroreRicerca && (
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
        )}

        {pagina === 'profilo' && (
          currentUser ? (
            <Profilo
              user={currentUser}
              campiPreferiti={campiPreferiti}
              loadingPreferiti={loadingPreferiti}
              errorePreferiti={errorePreferiti}
              onReloadPreferiti={caricaCampiPreferiti}
              onAggiornaProfilo={handleAggiornaProfilo}
              profiloMessaggio={profiloMessaggio}
              profiloErrore={profiloErrore}
              clearProfiloFeedback={clearProfiloFeedback}
              onLike={handleLikeCampo}
              onPrenota={handleCreaPrenotazione}
              onUpdate={handleUpdateCampo}
              onDelete={handleDeleteCampo}
              onBack={() => setPagina('home')}
            />
          ) : (
            <div className="container py-5">
              <div className="alert alert-warning text-center" role="alert">
                Devi effettuare il login per accedere al profilo.
              </div>
              <div className="text-center">
                <button className="btn btn-primary" onClick={() => setPagina('auth')}>
                  Vai al login
                </button>
              </div>
            </div>
          )
        )}

        {pagina === 'creacampo' && currentUser?.ruolo === 'proprietario' && (
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
        )}
      </div>

      <Footer />
    </div>
  );
}

export default App;