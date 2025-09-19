import React, { useState, useEffect, useCallback } from 'react'; // Import di React e degli hook per stato/effetti/callback
import './App.css'; // Import foglio di stile principale dell'app
import AuthForm from './components/Authform'; // Componente form autenticazione (login/registrazione)
import Campo from './components/Campo'; // Componente card per singolo campo con azioni
import Creacampo from './components/Creacampo'; // Componente form creazione campo (solo proprietario)
import Navbar from "./components/Navbar"; // Componente barra di navigazione superiore
import Home from "./components/Home"; // Componente pagina Home con ricerca
import Footer from "./components/Footer"; // Componente footer
import Profilo from "./components/Profilo"; // Componente pagina Profilo (preferiti, update, ecc.)

// Base URL dell'API letta da variabile d'ambiente (build-time), altrimenti stringa vuota
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || ''; // Determina base URL API (es. "/api")
// Funzione che costruisce un URL completo evitando doppie slash
const buildUrl = (path) => `${API_BASE_URL.replace(/\/+$/, '')}${path}`; // Concatena base pulita e path

console.log("BASE_URL:", API_BASE_URL); // Log diagnostico per verificare la base URL

function App() { // Componente principale dell'applicazione
  const [currentUser, setCurrentUser] = useState(null); // Stato: utente attualmente loggato (oggetto o null)
  const [isLoginView, setIsLoginView] = useState(true); // Stato: mostrare vista login (true) o registrazione (false)

  const [campiTrovati, setCampiTrovati] = useState([]); // Stato: risultati ricerca campi per comune
  const [erroreRicerca, setErroreRicerca] = useState(''); // Stato: messaggio di errore per la ricerca
  const [haCercato, setHaCercato] = useState(false); // Stato: flag per sapere se è stata eseguita almeno una ricerca

  const [pagina, setPagina] = useState('home'); // Stato: pagina corrente (home, auth, profilo, creacampo)
  const [authError, setAuthError] = useState(''); // Stato: messaggio errore autenticazione

  const [campiPreferiti, setCampiPreferiti] = useState([]); // Stato: lista campi preferiti dell'utente
  const [loadingPreferiti, setLoadingPreferiti] = useState(false); // Stato: spinner caricamento preferiti
  const [errorePreferiti, setErrorePreferiti] = useState(''); // Stato: errore caricamento preferiti

  const [profiloMessaggio, setProfiloMessaggio] = useState(''); // Stato: messaggio di successo pagina profilo
  const [profiloErrore, setProfiloErrore] = useState(''); // Stato: messaggio di errore pagina profilo

  const clearProfiloFeedback = () => { // Funzione: azzera feedback (success/errore) del profilo
    setProfiloMessaggio(''); // Reset messaggio successo
    setProfiloErrore(''); // Reset messaggio errore
  };

  // -----------------------------
  // LOGOUT (dichiarato PRIMA di usarlo nelle deps)
  // -----------------------------
  const handleLogout = useCallback(async (callapi = true) => { // Funzione: esegue logout; se callapi, chiama API per invalidare refresh
    if (callapi) { // Se richiesto contattare il backend
      try { // Tenta chiamata logout
        await fetch(buildUrl('/auth/logout'), { // Richiesta POST logout al backend
          method: 'POST', // Metodo HTTP POST
          credentials: 'include' // Include cookie httpOnly (refresh token) per farlo cancellare server-side
        });
      } catch (e) { // In caso d'errore rete/API
        console.error("Logout API fallito, procedo col logout"); // Log e prosegue con logout locale
      }
    }
    localStorage.removeItem('tokenaccesso'); // Rimuove access token salvato localmente
    localStorage.removeItem('user'); // Rimuove dati utente salvati localmente
    setCurrentUser(null); // Aggiorna stato: nessun utente loggato
    setIsLoginView(true); // Torna alla vista login
    setCampiPreferiti([]); // Svuota preferiti in memoria
    setErrorePreferiti(''); // Resetta errore preferiti
    setProfiloMessaggio(''); // Resetta messaggio profilo
    setProfiloErrore(''); // Resetta errore profilo
    setLoadingPreferiti(false); // Resetta spinner preferiti
    setPagina('home'); // Ritorna alla pagina home
  }, []); // Dipendenze vuote: funzione stabile

  // -----------------------------
  // FETCH PROTETTA CON REFRESH TOKEN (fix Authorization + retry singolo)
  // -----------------------------
  const fetchProtettaConToken = useCallback( // Funzione: wrapper fetch con Authorization e gestione refresh token
    async (endpoint, options = {}, onLogout, _retry = false) => { // Parametri: endpoint, opzioni fetch, callback logout, flag retry
      const token = localStorage.getItem('tokenaccesso'); // Legge access token corrente da localStorage

      const headers = { // Prepara header HTTP
        ...(options.headers || {}) // Merge con header passati dall'esterno
      };

      // Se il body è una stringa (JSON), aggiunge Content-Type se assente
      if (typeof options.body === 'string' && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json'; // Imposta content type JSON
      }

      if (token) { // Se presente access token
        headers['Authorization'] = `Bearer ${token}`; // Aggiunge header Authorization richiesto dal backend
      }

      const res = await fetch(buildUrl(endpoint), { // Esegue la chiamata HTTP verso l'endpoint
        ...options, // Applica ulteriori opzioni (method, body, ecc.)
        headers, // Usa gli header preparati
        credentials: 'include' // Include cookie (necessario per refresh token su /auth/refreshtoken)
      });

      // Se il token è scaduto/non valido e non abbiamo già ritentato
      if (res.status === 403 && !_retry) { // Gestione 403: tentativo di refresh
        const refreshRes = await fetch(buildUrl('/auth/refreshtoken'), { // Chiama endpoint per ottenere nuovo access token
          method: 'POST', // Metodo POST
          credentials: 'include', // Invia cookie httpOnly del refresh token
        });

        if (refreshRes.ok) { // Se refresh ha successo
          const data = await refreshRes.json().catch(() => ({})); // Legge JSON della risposta
          const nuovoToken = data.tokenaccesso; // Estrae nuovo access token dal payload
          if (nuovoToken) { // Se c'è un nuovo token
            localStorage.setItem('tokenaccesso', nuovoToken); // Salva nuovo token in localStorage
            return await fetchProtettaConToken(endpoint, options, onLogout, true); // Riprova la chiamata originale una sola volta
          }
        }

        if (onLogout) onLogout(); // Se refresh fallisce, esegue logout (callback)
        throw new Error('Token scaduto o non valido'); // Propaga errore al chiamante
      }

      return res; // Ritorna la Response originale se ok o non rinfrescabile
    },
    [] // Dipendenze vuote: wrapper stabile
  );

  // -----------------------------
  // LOAD INITIAL DATA (dopo le funzioni; deps corrette)
  // -----------------------------
  useEffect(() => { // Effetto: al primo render tenta ripristino sessione da localStorage
    const loadInitialData = () => { // Funzione interna di caricamento
      const storedUser = localStorage.getItem('user'); // Legge stringa utente salvata
      const token = localStorage.getItem('tokenaccesso'); // Legge token salvato

      try { // Tenta parsing e ripristino
        if (storedUser && token) { // Se entrambi presenti
          setCurrentUser(JSON.parse(storedUser)); // Ripristina utente nello stato
        }
      } catch (e) { // In caso di JSON corrotto o altro
        console.error("Errore durante il caricamento iniziale:", e); // Log di errore
        if (storedUser && token && String(e.message || '').toLowerCase().includes("token")) { // Se errore correlato a token
          handleLogout(false); // Esegue logout locale senza chiamare API
        }
      }
    };

    loadInitialData(); // Invoca ripristino all'avvio
  }, [handleLogout]); // Dipende da handleLogout

  // -----------------------------
  // AUTH
  // -----------------------------
  const handleAuthSubmit = async (credentials) => { // Funzione: gestisce submit login/registrazione
    const endpoint = isLoginView ? '/auth/login' : '/auth/registrazione'; // Endpoint da colpire in base alla vista
    setAuthError(''); // Reset messaggio errore auth

    try { // Prova a chiamare l'API
      const res = await fetch(buildUrl(endpoint), { // Esegue POST verso endpoint auth
        method: 'POST', // Metodo HTTP POST
        headers: { 'Content-Type': 'application/json' }, // Content-Type JSON
        body: JSON.stringify(credentials) // Serializza credenziali nel body
      });
      const data = await res.json().catch(() => ({})); // Tenta parsing JSON della risposta

      if (!res.ok) { // Se status HTTP non OK
        throw new Error(data?.message || 'Errore autenticazione'); // Solleva errore con messaggio server o generico
      }

      if (isLoginView && data?.tokenaccesso) { // Caso login con token ritornato
        localStorage.setItem('tokenaccesso', data.tokenaccesso); // Salva access token in localStorage
        localStorage.setItem('user', JSON.stringify(data.user)); // Salva dati utente in localStorage
        setCurrentUser(data.user); // Aggiorna stato utente corrente
        setPagina('profilo'); // Naviga alla pagina profilo
      } else if (!isLoginView) { // Caso registrazione andata a buon fine
        setIsLoginView(true); // Torna alla vista login
      }
    } catch (error) { // Gestione errori generici
      console.error('Errore API per:', endpoint, error); // Log errore
      setAuthError(error.message || 'Errore di autenticazione'); // Mostra errore in UI
    }
  };

  // -----------------------------
  // PREFERITI
  // -----------------------------
  const caricaCampiPreferiti = useCallback(async () => { // Funzione: carica preferiti dell'utente loggato
    if (!currentUser) { // Se non loggato
      setCampiPreferiti([]); // Svuota lista
      return; // Esce
    }

    setLoadingPreferiti(true); // Attiva spinner
    setErrorePreferiti(''); // Reset errore
    try { // Tenta chiamata
      const res = await fetchProtettaConToken(`/campo/preferiti`, {}, handleLogout); // GET preferiti autenticata
      const payload = await res.json().catch(() => []); // Parsing JSON (array o vuoto)

      if (!res.ok) { // Se status non OK
        throw new Error((payload && payload.message) || 'Errore durante il caricamento dei preferiti'); // Solleva errore
      }

      setCampiPreferiti(Array.isArray(payload) ? payload : []); // Aggiorna lista preferiti
    } catch (err) { // In caso di errore
      setCampiPreferiti([]); // Svuota lista
      setErrorePreferiti(err.message || 'Errore durante il caricamento dei preferiti.'); // Salva messaggio errore
    } finally { // Sempre
      setLoadingPreferiti(false); // Disattiva spinner
    }
  }, [currentUser, fetchProtettaConToken, handleLogout]); // Dipendenze: utente, wrapper fetch, logout

  useEffect(() => { // Effetto: quando si entra in profilo e c'è utente, carica preferiti
    if (pagina === 'profilo' && currentUser) { // Controllo pagina e login
      caricaCampiPreferiti(); // Carica preferiti dal backend
    }
  }, [pagina, currentUser, caricaCampiPreferiti]); // Dipendenze effetto

  useEffect(() => { // Effetto: quando si cambia pagina
    if (pagina !== 'profilo') { // Se si esce dal profilo
      setProfiloMessaggio(''); // Reset messaggio profilo
      setProfiloErrore(''); // Reset errore profilo
    }
  }, [pagina]); // Dipende da pagina corrente

  async function handleAggiornaProfilo(datiProfilo) { // Funzione: invia aggiornamento dati profilo
    try { // Tenta richiesta
      setProfiloErrore(''); // Reset errore
      setProfiloMessaggio(''); // Reset messaggio

      const res = await fetchProtettaConToken(`/auth/profilo`, { // PUT profilo autenticata
        method: 'PUT', // Metodo PUT
        body: JSON.stringify(datiProfilo) // Body JSON con dati aggiornati
      }, handleLogout); // Passa logout per eventuale invalidazione

      const payload = await res.json().catch(() => ({})); // Parsing risposta JSON

      if (!res.ok) { // Se non OK
        throw new Error((payload && payload.message) || "Errore durante l'aggiornamento del profilo"); // Solleva errore
      }

      if (payload && payload.user) { // Se backend ritorna utente aggiornato
        setCurrentUser(payload.user); // Aggiorna utente in stato
        localStorage.setItem('user', JSON.stringify(payload.user)); // Aggiorna utente in localStorage
      }

      setProfiloMessaggio(payload.message || 'Profilo aggiornato'); // Mostra messaggio successo
      return { success: true }; // Ritorna esito positivo
    } catch (err) { // Gestione errore
      setProfiloErrore(err.message || "Errore durante l'aggiornamento del profilo"); // Mostra messaggio errore
      return { success: false }; // Ritorna esito negativo
    }
  }

  // -----------------------------
  // SEARCH
  // -----------------------------
  const handleSearch = async (comune) => { // Funzione: ricerca campi per comune (endpoint pubblico)
    setHaCercato(true); // Segna che è stata effettuata una ricerca
    try { // Tenta chiamata
      const res = await fetch(buildUrl(`/campo/${encodeURIComponent(comune)}`)); // GET campi per comune
      const data = await res.json().catch(() => []); // Parsing elenco campi

      if (!res.ok) { // Se non OK
        throw new Error(data.message || 'Errore durante la ricerca'); // Solleva errore
      }

      setCampiTrovati(Array.isArray(data) ? data : []); // Aggiorna stato risultati
      setErroreRicerca(''); // Pulisce eventuale errore precedente
    } catch (err) { // In caso di errore
      setCampiTrovati([]); // Svuota risultati
      setErroreRicerca('Errore nella ricerca del comune'); // Messaggio d'errore per UI
    }
  };

  // -----------------------------
  // CAMPI: CREATE / DELETE / UPDATE / LIKE
  // -----------------------------
  async function handleCreateCampo(datiCampo) { // Funzione: crea un nuovo campo (richiede autenticazione)
    try { // Tenta chiamata
      const response = await fetchProtettaConToken(`/campo`, { // POST crea campo
        method: 'POST', // Metodo POST
        body: JSON.stringify(datiCampo) // Body JSON con dati campo
      }, handleLogout); // Passa callback logout

      const payload = await response.json().catch(() => ({})); // Parsing JSON risposta

      if (!response.ok) { // Se non OK
        throw new Error(payload.message || 'Errore creazione campo'); // Solleva errore
      }

      const { campo: nuovoCampo } = payload; // Estrae campo creato dal payload
      alert("Campo creato!"); // Mostra feedback semplice all'utente
      setCampiTrovati((campi) => (nuovoCampo ? [...campi, nuovoCampo] : campi)); // Aggiunge nuovo campo alla lista mostrata
    } catch (err) { // In caso errore
      console.error('Errore creazione campo:', err.message); // Log errore
      alert('Errore durante la creazione del campo.'); // Feedback utente
    }
  }

  async function handleDeleteCampo(campoId) { // Funzione: elimina un campo (autenticazione + proprietario)
    try { // Tenta chiamata
      const response = await fetchProtettaConToken(`/campo/${campoId}`, { // DELETE campo per id
        method: 'DELETE' // Metodo DELETE
      }, handleLogout); // Passa callback logout

      if (!response.ok) { // Se non OK
        const error = await response.json().catch(() => ({})); // Prova a leggere messaggio server
        throw new Error(error.message || 'Errore eliminazione campo'); // Solleva errore
      }

      setCampiTrovati((campi) => campi.filter(c => c._id !== campoId)); // Rimuove campo dalla lista risultati
      setCampiPreferiti((campi) => Array.isArray(campi) ? campi.filter(c => c._id !== campoId) : campi); // Rimuove anche dai preferiti
    } catch (err) { // In caso errore
      console.error('Errore eliminazione:', err.message); // Log
      alert('Errore durante l’eliminazione del campo.'); // Feedback utente
    }
  }

  async function handleUpdateCampo(campoId, indiceimg, nuovaImg, nuovoTelefono) { // Funzione: aggiorna immagine/telefono di un campo
    try { // Tenta chiamata
      const response = await fetchProtettaConToken(`/campo/${campoId}`, { // PUT aggiornamento campo
        method: 'PUT', // Metodo PUT
        body: JSON.stringify({ // Body JSON con campi aggiornabili
          indiceimg, // Indice immagine da sostituire
          img: nuovaImg, // Nuova URL immagine
          numerotelefono: nuovoTelefono // Nuovo telefono
        })
      }, handleLogout); // Passa callback logout

      const payload = await response.json().catch(() => ({})); // Parsing risposta JSON

      if (!response.ok) { // Se non OK
        throw new Error(payload.message || 'Errore aggiornamento campo'); // Solleva errore
      }

      const { campo: campoAggiornato } = payload; // Estrae campo aggiornato

      setCampiTrovati(campi => // Sostituisce l'elemento aggiornato nell'elenco risultati
        campi.map(c => c._id === campoAggiornato._id ? campoAggiornato : c)
      );

      setCampiPreferiti(campi => // Aggiorna anche nell'elenco preferiti se presente
        Array.isArray(campi)
          ? campi.map(c => c._id === campoAggiornato._id ? campoAggiornato : c)
          : campi
      );
    } catch (err) { // In caso errore
      console.error("Errore aggiornamento campo:", err.message); // Log
      alert("Errore durante l'aggiornamento del campo."); // Feedback
    }
  }

  async function handleLikeCampo(campoId) { // Funzione: like/dislike di un campo (toggle preferiti)
    try { // Tenta chiamata
      const response = await fetchProtettaConToken(`/campo/${campoId}/like`, { // PUT like campo
        method: 'PUT' // Metodo PUT
      }, handleLogout); // Passa callback logout

      const payload = await response.json().catch(() => ({})); // Parsing risposta JSON

      if (!response.ok) { // Se non OK
        throw new Error(payload.message || 'Errore nel like'); // Solleva errore
      }

      const { campo: campoAggiornato, message } = payload; // Estrae campo aggiornato e messaggio server

      setCampiTrovati((campi) => // Aggiorna card nella lista risultati
        campi.map((campo) => campo._id === campoAggiornato._id ? campoAggiornato : campo)
      );

      setCampiPreferiti((campi) => { // Aggiorna lista preferiti coerentemente al messaggio
        if (!Array.isArray(campi)) return campi; // Se non è array, ritorna come è

        const messaggio = (message || '').toLowerCase(); // Normalizza messaggio per controllo

        if (messaggio.includes('aggiunto')) { // Se aggiunto ai preferiti
          const esiste = campi.some((c) => c._id === campoAggiornato._id); // Controlla se già presente
          if (esiste) { // Se già presente, sostituisci oggetto aggiornato
            return campi.map((c) => c._id === campoAggiornato._id ? campoAggiornato : c); // Rimpiazza
          }
          return [...campi, campoAggiornato]; // Altrimenti aggiungi in coda
        }

        if (messaggio.includes('rimosso')) { // Se rimosso dai preferiti
          return campi.filter((c) => c._id !== campoAggiornato._id); // Filtra fuori
        }

        return campi; // Se messaggio non riconosciuto, non modificare
      });

      if (payload.message) alert(payload.message); // Mostra feedback testuale se presente
    } catch (err) { // In caso errore
      console.error('Errore like:', err.message); // Log
      alert('Errore durante il like/dislike.'); // Feedback
    }
  }

  // -----------------------------
  // PRENOTAZIONI
  // -----------------------------
  async function handleCreaPrenotazione(campoId, data, oraInizio, oraFine, note) { // Funzione: crea prenotazione per un campo
    try { // Tenta chiamata
      const start = new Date(`${data}T${oraInizio}`); // Costruisce Date in locale dall'input (data + ora inizio)
      const end = new Date(`${data}T${oraFine}`); // Costruisce Date in locale (data + ora fine)

      const response = await fetchProtettaConToken(`/prenotazioni`, { // POST prenotazione al backend
        method: 'POST', // Metodo POST
        body: JSON.stringify({ // Body JSON con dati prenotazione
          campoid: campoId, // Id campo selezionato
          inizio: start.toISOString(), // Converte a ISO (UTC) per il backend
          fine: end.toISOString(), // Converte a ISO (UTC) per il backend
          note: note || undefined // Note opzionali
        })
      }, handleLogout); // Passa callback logout

      const payload = await response.json().catch(() => ({})); // Parsing risposta JSON
      if (!response.ok) { // Se non OK
        throw new Error(payload?.message || 'Errore creazione prenotazione'); // Solleva errore
      }

      alert('Prenotazione creata!'); // Feedback utente positivo
    } catch (err) { // In caso errore
      console.error('Errore prenotazione:', err.message); // Log
      alert(err.message || 'Errore durante la prenotazione.'); // Feedback utente
    }
  }

  // -----------------------------
  // RENDER
  // -----------------------------
  return ( // Render JSX dell'app
    <div className="d-flex flex-column min-vh-100"> {/* Layout flessibile: colonna e altezza min. intera viewport */}
      <Navbar
        user={currentUser} // Passa utente corrente al Navbar per mostrare azioni corrette
        onLogin={() => { // Handler click "Login" sul Navbar
          setAuthError(''); // Reset errori auth
          setPagina('auth'); // Naviga a pagina autenticazione
        }}
        onLogout={handleLogout} // Handler click "Logout" sul Navbar
        onCreaCampoClick={() => setPagina('creacampo')} // Naviga a pagina creazione campo
        onHome={() => setPagina('home')} // Naviga a home
        onProfile={() => { // Handler click "Profilo"
          if (currentUser) { // Se loggato
            clearProfiloFeedback(); // Pulisce feedback profilo
            setPagina('profilo'); // Naviga al profilo
          } else { // Se non loggato
            setAuthError(''); // Reset errori auth
            setPagina('auth'); // Vai a login
          }
        }}
      />

      <div className="flex-grow-1"> {/* Contenitore main che cresce per riempire spazio tra Navbar e Footer */}
        {pagina === 'home' && ( // Condizionale: se pagina è home
          <>
            <Home onSearch={handleSearch} /> {/* Componente Home con callback ricerca per comune */}

            {!haCercato && ( // Se non è stata fatta una ricerca, mostra suggerimento
              <div className="text-center mt-4 text-muted fw-semibold" style={{ fontSize: '1.2rem' }}>
                SELEZIONA LA CITTÀ PER VEDERE I CAMPI DISPONIBILI {/* Messaggio guida */}
              </div>
            )}

            {haCercato && campiTrovati.length === 0 && !erroreRicerca && ( // Se ricerca fatta ma nessun risultato e nessun errore
              <div className="text-center mt-4 text-danger fw-semibold" style={{ fontSize: '1.2rem' }}>
                NESSUN CAMPO DISPONIBILE PER QUESTA CITTÀ {/* Messaggio "no results" */}
              </div>
            )}

            {erroreRicerca && ( // Se si è verificato un errore nella ricerca
              <div className="alert alert-danger text-center w-75 mx-auto mt-3" role="alert">
                {erroreRicerca} {/* Mostra messaggio d'errore */}
              </div>
            )}

            {campiTrovati.length > 0 && ( // Se ci sono campi trovati
              <div className="container mt-4"> {/* Contenitore bootstrap */}
                <div className="row"> {/* Griglia a righe */}
                  {campiTrovati.map((campo) => ( // Mappa ogni campo nella sua colonna/card
                    <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4" key={`${campo._id}-home`}>
                      <Campo
                        campo={campo} // Dati del campo da mostrare
                        currentUser={currentUser} // Utente (per abilitare azioni)
                        onLike={handleLikeCampo} // Callback like/dislike
                        onDelete={handleDeleteCampo} // Callback elimina campo
                        onUpdate={handleUpdateCampo} // Callback aggiorna campo
                        onPrenota={handleCreaPrenotazione} // Callback prenota campo
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {pagina === 'auth' && ( // Condizionale: se pagina è autenticazione
          <div className="container py-5"> {/* Contenitore con padding superiore */}
            <div className="row justify-content-center"> {/* Riga centrata */}
              <div className="col-md-6 bg-white p-4 rounded shadow"> {/* Card centrale per il form */}
                <AuthForm
                  onSubmit={handleAuthSubmit} // Callback submit per login/registrazione
                  formType={isLoginView ? 'login' : 'register'} // Tipo form in base allo stato
                  errorMessage={authError} // Eventuale errore da mostrare
                />

                <div className="d-flex justify-content-center mt-3 gap-3 flex-wrap"> {/* Azioni sotto il form */}
                  <button
                    onClick={() => { // Handler "Torna alla Home"
                      setAuthError(''); // Pulisce errori auth
                      setPagina('home'); // Vai a home
                    }}
                    className="btn btn-outline-success" // Stile bottone
                  >
                    Torna alla Home {/* Testo bottone */}
                  </button>

                  <button
                    onClick={() => { // Handler toggle login/registrazione
                      setAuthError(''); // Pulisce errori auth
                      setIsLoginView(!isLoginView); // Inverte la vista
                    }}
                    className="btn btn-outline-primary" // Stile bottone
                  >
                    {isLoginView ? 'Non hai un account? Registrati' : 'Hai già un account? Login'} {/* Testo dinamico */}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {pagina === 'profilo' && ( // Condizionale: se pagina è profilo
          currentUser ? ( // Se utente è loggato
            <Profilo
              user={currentUser} // Passa utente corrente
              campiPreferiti={campiPreferiti} // Passa preferiti caricati
              loadingPreferiti={loadingPreferiti} // Passa stato di caricamento
              errorePreferiti={errorePreferiti} // Passa eventuale errore
              onReloadPreferiti={caricaCampiPreferiti} // Passa callback per ricaricare preferiti
              onAggiornaProfilo={handleAggiornaProfilo} // Passa callback per aggiornare profilo
              profiloMessaggio={profiloMessaggio} // Passa messaggio di successo
              profiloErrore={profiloErrore} // Passa messaggio di errore
              clearProfiloFeedback={clearProfiloFeedback} // Passa funzione per pulire feedback
              onLike={handleLikeCampo} // Abilita like dai preferiti
              onPrenota={handleCreaPrenotazione} // Abilita prenotazione dai preferiti
              onUpdate={handleUpdateCampo} // Abilita update campo dai preferiti
              onDelete={handleDeleteCampo} // Abilita delete campo dai preferiti
              onBack={() => setPagina('home')} // Callback per tornare alla home
            />
          ) : ( // Se utente NON è loggato
            <div className="container py-5"> {/* Contenitore messaggio login richiesto */}
              <div className="alert alert-warning text-center" role="alert">
                Devi effettuare il login per accedere al profilo. {/* Messaggio informativo */}
              </div>
              <div className="text-center"> {/* Contenitore bottone */}
                <button className="btn btn-primary" onClick={() => setPagina('auth')}>
                  Vai al login {/* Bottone che porta alla pagina auth */}
                </button>
              </div>
            </div>
          )
        )}

        {pagina === 'creacampo' && currentUser?.ruolo === 'proprietario' && ( // Condizionale: pagina creazione campo (solo proprietario)
          <div className="container py-5"> {/* Contenitore principale */}
            <div className="row justify-content-center"> {/* Riga centrata */}
              <div className="col-md-8 bg-white p-4 rounded shadow"> {/* Card per form creazione */}
                <Creacampo onCampoCreated={handleCreateCampo} /> {/* Form che invia POST per creare nuovo campo */}
                <button
                  className="btn btn-outline-secondary mt-3" // Stile bottone indietro
                  onClick={() => setPagina('home')} // Torna a home
                >
                  Torna alla Dashboard {/* Testo bottone */}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer /> {/* Footer sempre presente in fondo */}
    </div>
  ); // Fine JSX principale
} // Fine componente App

export default App; // Esporta il componente App come default