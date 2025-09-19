import React, { useState } from 'react'; // Import di React e dell'hook useState per gestire lo stato locale del form

function Authform({ onSubmit, formType, errorMessage }) { // Definizione del componente; riceve onSubmit (callback al parent), formType ('login'|'register'), errorMessage
  const [email, setEmail] = useState(''); // Stato controllato per il campo email
  const [password, setPassword] = useState(''); // Stato controllato per il campo password
  const [nome, setNome] = useState(''); // Stato controllato per il campo nome (solo registrazione)
  const [cognome, setCognome] = useState(''); // Stato controllato per il campo cognome (solo registrazione)
  const [ruolo, setruolo] = useState(''); // Stato controllato per il select del ruolo (solo registrazione)
  const [passwordError, setPasswordError] = useState(''); // Stato per messaggio di errore specifico sulla password

  const handlesubmit = (e) => { // Handler di submit del form (invocato al click su "Invia")
    e.preventDefault(); // Previene il comportamento di submit nativo del browser (no refresh pagina)

    if (password.length < 8) { // Validazione lato client: password almeno 8 caratteri
      setPasswordError('La password deve essere di almeno 8 caratteri'); // Mostra messaggio di errore sotto il campo password
      return; // Interrompe il submit se la password è troppo corta
    }

    setPasswordError('');  // Ripulisce l’errore password se la validazione è superata

    if (formType === 'login') { // Se il form è in modalità login
      onSubmit({ email, password }); // Passa i dati al parent; il parent chiamerà l’API /auth/login (Frontend → Backend)
    } else { // Altrimenti siamo in modalità registrazione
      onSubmit({ nome, cognome, email, password, ruolo }); // Passa tutti i campi; il parent chiamerà /auth/registrazione
    }
  };

  return ( // Render JSX del componente form
    <div className="mt-5"> {/* Contenitore con margine superiore */}
      <form
        onSubmit={handlesubmit} // Collega l’handler di submit definito sopra
        className="container mt-5" // Classi Bootstrap per layout
        style={{ maxWidth: '500px' }} // Limita la larghezza massima del form
      >
        <h2 className="text-center mb-4 fw-bold"> {/* Titolo del form centrato */}
          {formType === 'login' ? 'Login' : 'Registrazione'} {/* Testo dinamico in base alla modalità */}
        </h2>

        {errorMessage && ( // Se il parent ha passato un errore generico (es. credenziali errate lato server)
          <div className="alert alert-danger text-center fw-semibold"> {/* Alert Bootstrap rosso */}
            {errorMessage} {/* Mostra il messaggio di errore dal parent */}
          </div>
        )}

        {formType === 'register' && ( // Se siamo in modalità registrazione, mostra i campi extra
          <> {/* Frammento React per raggruppare più nodi */}
            <div className="form-floating mb-3"> {/* Wrapper Bootstrap "form-floating" per label flottante */}
              <input
                type="text" // Campo di testo per il nome
                className="form-control" // Classe Bootstrap per input
                id="nome" // ID usato dalla label associata
                placeholder="Nome" // Placeholder richiesto dal layout "floating"
                value={nome} // Valore controllato proveniente dallo stato
                required // Campo obbligatorio lato client
                onChange={(e) => setNome(e.target.value)} // Aggiorna lo stato nome a ogni digitazione
              />
              <label htmlFor="nome">Nome</label> {/* Label flottante legata all’id del campo */}
            </div>

            <div className="form-floating mb-3"> {/* Campo cognome con stesso pattern del nome */}
              <input
                type="text"
                className="form-control"
                id="cognome"
                placeholder="Cognome"
                value={cognome}
                required
                onChange={(e) => setCognome(e.target.value)} // Aggiorna lo stato cognome
              />
              <label htmlFor="cognome">Cognome</label>
            </div>

            <div className="form-floating mb-3"> {/* Select per la scelta del ruolo */}
              <select
                className="form-select" // Classe Bootstrap per select
                id="ruolo" // ID per la label
                value={ruolo} // Valore controllato dello stato
                required // Reso obbligatorio (devi scegliere un ruolo)
                onChange={(e) => setruolo(e.target.value)} // Aggiorna lo stato ruolo
              >
                <option value="" disabled> {/* Opzione placeholder non selezionabile */}
                  Seleziona un ruolo
                </option>
                <option value="utente">Utente</option> {/* Ruolo base (prenota/like) */}
                <option value="proprietario">Proprietario</option> {/* Ruolo con permessi di gestione campo */}
              </select>
              <label htmlFor="ruolo">Ruolo</label> {/* Label flottante per la select */}
            </div>
          </>
        )}

        <div className="form-floating mb-3"> {/* Campo email (mostrato in entrambe le modalità) */}
          <input
            type="email" // Tipo email (attiva validazione HTML5 di base)
            className="form-control" // Classe Bootstrap
            id="email" // ID per label
            placeholder="Email" // Placeholder per floating label
            value={email} // Valore controllato dello stato email
            required // Campo obbligatorio
            onChange={(e) => setEmail(e.target.value)} // Aggiorna stato email
          />
          <label htmlFor="email">Email</label> {/* Label flottante */}
        </div>

        <div className="form-floating mb-1"> {/* Campo password con validazione visiva */}
          <input
            type="password" // Tipo password (testo nascosto)
            className={`form-control ${passwordError ? 'is-invalid' : ''}`} // Se c’è errore mostra bordo rosso Bootstrap
            id="password" // ID per label
            placeholder="Password" // Placeholder per floating label
            value={password} // Valore controllato dello stato password
            required // Campo obbligatorio
            onChange={(e) => setPassword(e.target.value)} // Aggiorna stato password a ogni digitazione
          />
          <label htmlFor="password">Password</label> {/* Label flottante */}
        </div>

        {passwordError && ( // Se esiste un errore di password (es. lunghezza minima)
          <div className="text-danger mb-3" style={{ fontSize: '0.9rem' }}> {/* Testo di errore sotto al campo */}
            {passwordError} {/* Messaggio di errore password */}
          </div>
        )}

        <div className="d-grid mt-3"> {/* Contenitore che rende il bottone largo quanto il contenitore */}
          <button type="submit" className="btn btn-success btn-lg"> {/* Bottone submit stile Bootstrap */}
            Invia {/* Testo del bottone; scatena handlesubmit */}
          </button>
        </div>
      </form>
    </div>
  ); // Fine render
}

export default Authform; // Esporta il componente per l'import in App.jsx