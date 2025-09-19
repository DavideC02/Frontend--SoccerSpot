import React, { useEffect, useState } from 'react'; // Import di React e degli hook useEffect/useState
import Campo from './Campo'; // Import del componente card Campo (riuso per mostrare i preferiti)

function Profilo({user,campiPreferiti,loadingPreferiti,errorePreferiti,onReloadPreferiti,onAggiornaProfilo,profiloMessaggio,profiloErrore,clearProfiloFeedback,onLike,onPrenota,onUpdate,onDelete,onBack}){ 
  // Componente Profilo: riceve l'utente e varie callback/stati gestiti dal genitore (App.jsx)

  const [formData, setFormData] = useState({ // Stato locale del form profilo
    nome: '', // Campo "nome"
    cognome: '', // Campo "cognome"
    email: '', // Campo "email"
    password: '' // Campo "password" (vuoto se non si cambia)
  });
  
  const [submitting, setSubmitting] = useState(false); // Stato: indica se il form sta inviando i dati

  useEffect(() => { // Effetto: all'aggiornamento di user, precarica i dati nel form
    if (user) { // Se esiste un utente loggato
      setFormData({ // Aggiorna lo stato del form con i dati dell'utente
        nome: user.nome || '', // Precompila nome
        cognome: user.cognome || '', // Precompila cognome
        email: user.email || '', // Precompila email
        password: '' // Password sempre vuota (per sicurezza)
      });
    }
  }, [user]); // Dipende da "user": quando cambia, riesegue l'effetto

  const handleChange = (event) => { // Handler generico per i cambi dei campi del form
    const { name, value } = event.target; // Estrae nome campo e valore dall'input
    if (clearProfiloFeedback) { // Se è stata passata la funzione di pulizia feedback
      clearProfiloFeedback(); // Pulisce messaggi di successo/errore prima di modificare
    }
    setFormData((prev) => ({ ...prev, [name]: value })); // Aggiorna solo il campo modificato nello stato del form
  };

  const handleSubmit = async (event) => { // Handler submit del form profilo
    event.preventDefault(); // Evita il refresh della pagina
    if (!onAggiornaProfilo) return; // Se non c’è callback, non fa nulla

    setSubmitting(true); // Imposta stato "invio in corso"
    const result = await onAggiornaProfilo({ // Chiama la callback del genitore (che farà la fetch PUT /auth/profilo)
      nome: formData.nome, // Passa il nome aggiornato
      cognome: formData.cognome, // Passa il cognome aggiornato
      email: formData.email, // Passa l'email aggiornata
      password: formData.password || undefined // Passa la password solo se presente (altrimenti undefined)
    });

    if (result?.success) { // Se l'aggiornamento è andato a buon fine
      setFormData((prev) => ({ // Ripulisce il campo password
        ...prev, // Mantiene gli altri campi invariati
        password: '' // Svuota password per non mantenerla in chiaro
      }));
    }

    setSubmitting(false); // Segnala fine invio
  };

  return ( // Render del layout del profilo
    <div className="container py-5"> {/* Container con padding verticale */}
      <div className="row g-4"> {/* Griglia Bootstrap con gutter (spazio) tra colonne */}
        <div className="col-12 col-lg-4"> {/* Colonna sinistra: form profilo */}
          <div className="card shadow-sm border-0 rounded-4"> {/* Card con ombra leggera e bordi arrotondati */}
            <div className="card-body"> {/* Corpo della card */}
              <div className="d-flex justify-content-between align-items-center mb-3"> {/* Titolo e pulsante "Torna" */}
                <h3 className="h5 mb-0">Il tuo profilo</h3> {/* Titolo sezione */}
                {onBack && ( // Se è stata passata la callback per tornare indietro
                  <button className="btn btn-outline-secondary btn-sm" onClick={onBack}> {/* Bottone "Torna" */}
                    Torna {/* Testo bottone */}
                  </button>
                )}
              </div>
              <form onSubmit={handleSubmit} className="d-grid gap-3"> {/* Form profilo con spaziatura tra campi */}
                <div> {/* Campo Nome */}
                  <label className="form-label">Nome</label> {/* Etichetta */}
                  <input
                    className="form-control" // Input Bootstrap
                    type="text" // Tipo testo
                    name="nome" // Nome del campo (usato da handleChange)
                    value={formData.nome} // Valore controllato
                    onChange={handleChange} // Aggiorna stato form
                    required // Obbligatorio
                  />
                </div>
                <div> {/* Campo Cognome */}
                  <label className="form-label">Cognome</label> {/* Etichetta */}
                  <input
                    className="form-control" // Stile
                    type="text" // Tipo
                    name="cognome" // Nome campo
                    value={formData.cognome} // Valore
                    onChange={handleChange} // Cambio valore
                    required // Obbligatorio
                  />
                </div>
                <div> {/* Campo Email */}
                  <label className="form-label">Email</label> {/* Etichetta */}
                  <input
                    className="form-control" // Stile
                    type="email" // Tipo email (validazione HTML5)
                    name="email" // Nome campo
                    value={formData.email} // Valore
                    onChange={handleChange} // Cambio valore
                    required // Obbligatorio
                  />
                </div>
                <div> {/* Campo Password */}
                  <label className="form-label">Nuova password</label> {/* Etichetta */}
                  <input
                    className="form-control" // Stile
                    type="password" // Tipo password
                    name="password" // Nome campo
                    value={formData.password} // Valore
                    onChange={handleChange} // Cambio valore
                    placeholder="Lascia vuoto per non cambiare" // Istruzione all'utente
                    minLength={8} // Lunghezza minima (coerente con backend)
                  />
                </div>

                {profiloErrore && ( // Se c’è un errore proveniente dal genitore
                  <div className="alert alert-danger py-2" role="alert"> {/* Alert rosso Bootstrap */}
                    {profiloErrore} {/* Testo errore */}
                  </div>
                )}

                {profiloMessaggio && ( // Se c’è un messaggio di successo dal genitore
                  <div className="alert alert-success py-2" role="alert"> {/* Alert verde Bootstrap */}
                    {profiloMessaggio} {/* Testo messaggio */}
                  </div>
                )}

                <button
                  type="submit" // Tipo submit
                  className="btn btn-success" // Stile bottone
                  disabled={submitting} // Disabilita durante l’invio
                >
                  {submitting ? 'Salvataggio...' : 'Salva modifiche'} {/* Testo dinamico in base allo stato */}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-8"> {/* Colonna destra: lista campi preferiti */}
          <div className="card shadow-sm border-0 rounded-4 h-100"> {/* Card che occupa l'altezza disponibile */}
            <div className="card-body d-flex flex-column"> {/* Corpo card con layout colonna */}
              <div className="d-flex justify-content-between align-items-center mb-3"> {/* Header sezione preferiti */}
                <h3 className="h5 mb-0">Campi preferiti</h3> {/* Titolo sezione */}
                {onReloadPreferiti && ( // Se presente la callback di ricarica
                  <button
                    onClick={onReloadPreferiti} // Al click, ricarica preferiti (chiama backend GET /campo/preferiti)
                    className="btn btn-outline-primary btn-sm" // Stile bottone
                    disabled={loadingPreferiti} // Disabilita durante il caricamento
                  >
                    {loadingPreferiti ? 'Aggiornamento...' : 'Ricarica'} {/* Testo dinamico */}
                  </button>
                )}
              </div>

              {errorePreferiti && ( // Se c’è un errore nei preferiti
                <div className="alert alert-danger py-2" role="alert"> {/* Alert errore */}
                  {errorePreferiti} {/* Messaggio errore */}
                </div>
              )}

              {loadingPreferiti ? ( // Se in caricamento, mostra placeholder
                <div className="text-center text-muted mt-4">Caricamento in corso...</div> // Testo informativo
              ) : campiPreferiti?.length > 0 ? ( // Altrimenti, se ci sono preferiti, li mostra
                <div className="row g-3"> {/* Griglia di card Campo */}
                  {campiPreferiti.map((campo) => ( // Mappa ogni campo preferito
                    <div className="col-12 col-md-6" key={`${campo._id}-preferito`}> {/* Colonna card */}
                      <Campo
                        campo={campo} // Passa i dati del campo alla card
                        currentUser={user} // Passa l’utente corrente (per like/elimina/modifica)
                        onLike={onLike} // Callback like/dislike (PUT /campo/:id/like)
                        onDelete={onDelete} // Callback delete (DELETE /campo/:id)
                        onUpdate={onUpdate} // Callback update (PUT /campo/:id)
                        onPrenota={onPrenota} // Callback prenota (POST /prenotazioni)
                      />
                    </div>
                  ))}
                </div>
              ) : ( // Se non ci sono preferiti e non sta caricando
                <div className="text-center text-muted mt-4"> {/* Messaggio "lista vuota" */}
                  Non hai ancora aggiunto campi ai preferiti. {/* Testo informativo */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  ); // Fine render del componente Profilo
}