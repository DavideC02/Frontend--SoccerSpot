import React, { useState } from 'react'; // Import di React e hook per gestire lo stato locale

function Campo({ campo, currentUser, onLike, onDelete, onUpdate, onPrenota }) { // Componente card di un campo; riceve dati e callback dal genitore
  const [showUpdateForm, setShowUpdateForm] = useState(false); // Stato: mostra/nasconde il form di modifica
  const [indiceImg, setIndiceImg] = useState(''); // Stato: indice dell'immagine da sostituire
  const [nuovaImg, setNuovaImg] = useState(''); // Stato: nuova URL immagine
  const [nuovoTelefono, setNuovoTelefono] = useState(''); // Stato: nuovo numero di telefono
  const [showPrenota, setShowPrenota] = useState(false); // Stato: mostra/nasconde modale prenotazione
  const [data, setData] = useState(''); // Stato: data prenotazione (YYYY-MM-DD)
  const [oraInizio, setOraInizio] = useState(''); // Stato: ora inizio prenotazione (HH:mm)
  const [oraFine, setOraFine] = useState('');  // Stato: ora fine prenotazione (HH:mm)
  const [note, setNote] = useState(''); // Stato: note opzionali per la prenotazione

  const isProp = currentUser && campo.proprietario === currentUser?.id; // True se l'utente loggato è il proprietario del campo
  // NOTE: se `campo.proprietario` arriva come ObjectId/stringa diversa, può servire `.toString()` lato backend o inviare id normalizzato nel payload.
  const hasLiked = currentUser && campo.likes?.includes(currentUser.id); // True se l'utente ha messo "mi piace" al campo
  // NOTE: assicurarsi che `likes` sia un array di stringhe id; se è di ObjectId, convertire lato backend o normalizzare nel fetch.

  const modalId = `prenota-${campo._id}`; // Id univoco per la modale (utile se usi Bootstrap JS, qui è modale "finta" controllata da stato)

  const handleSubmitPrenota = async (e) => { // Handler submit della modale prenotazione
    e.preventDefault(); // Evita reload pagina
    if (!onPrenota) return; // Se non è stata passata la callback, non fare nulla
    await onPrenota(campo._id, data, oraInizio, oraFine, note); // Invoca la callback: il genitore chiamerà l'API
    // chiudo e pulisco
    setShowPrenota(false); // Nasconde la modale
    setData(''); // Reset data
    setOraInizio(''); // Reset ora inizio
    setOraFine(''); // Reset ora fine
    setNote(''); // Reset note
  };

  return ( // Render della card del campo
    <div className="card m-2 shadow-sm border-0 rounded-4 overflow-hidden" style={{ width: '360px' }}> {/* Contenitore card con stile */}
      {campo.img?.length > 0 ? ( // Se ci sono immagini, mostra il carosello
        <div id={`carousel-${campo._id}`} className="carousel slide" data-bs-ride="carousel"> {/* Carosello Bootstrap */}
          <div className="carousel-inner"> {/* Wrapper elementi del carosello */}
            {campo.img.map((url, index) => ( // Mappa ogni URL immagine
              <div className={`carousel-item ${index === 0 ? 'active' : ''}`} key={index}> {/* Attiva la prima slide */}
                <img
                  src={url} // Sorgente immagine
                  className="d-block w-100" // Stile immagine
                  alt={`Campo ${index}`} // Testo alternativo
                  style={{ height: '180px', objectFit: 'cover' }} // Altezza fissa e crop centrato
                />
              </div>
            ))}
          </div>
          {campo.img.length > 1 && ( // Se più di una immagine, mostra i controlli di navigazione
            <>
              <button
                className="carousel-control-prev" // Bottone slide precedente
                type="button"
                data-bs-target={`#carousel-${campo._id}`} // Target del carosello
                data-bs-slide="prev" // Azione: vai alla precedente
              >
                <span className="carousel-control-prev-icon" aria-hidden="true"></span> {/* Icona Bootstrap */}
                <span className="visually-hidden">Precedente</span> {/* Testo accessibilità */}
              </button>
              <button
                className="carousel-control-next" // Bottone slide successiva
                type="button"
                data-bs-target={`#carousel-${campo._id}`} // Target del carosello
                data-bs-slide="next" // Azione: vai alla successiva
              >
                <span className="carousel-control-next-icon" aria-hidden="true"></span> {/* Icona Bootstrap */}
                <span className="visually-hidden">Successiva</span> {/* Testo accessibilità */}
              </button>
            </>
          )}
        </div>
      ) : ( // Se non ci sono immagini, mostra un placeholder
        <div
          className="card-img-top bg-light text-center d-flex align-items-center justify-content-center" // Box grigio centrato
          style={{ height: '180px' }} // Altezza fissa
        >
          Nessuna immagine {/* Testo placeholder */}
        </div>
      )}

      <div className="card-body"> {/* Corpo della card */}
        <div className="d-flex align-items-start justify-content-between mb-2"> {/* Titolo + badge comune */}
          <h5 className="card-title mb-0 fw-bold">{campo.nome}</h5> {/* Nome del campo */}
          {campo.comune && ( // Se presente il comune, mostra badge
            <span className="badge text-bg-success">{campo.comune}</span> // Badge con nome comune
          )}
        </div>

        <p className="card-text mb-1"> {/* Riga indirizzo */}
          <strong>Indirizzo:</strong> {campo.indirizzo} {/* Indirizzo completo */}
        </p>
        <p className="card-text mb-3"> {/* Riga telefono */}
          <strong>Telefono:</strong> {campo.numerotelefono} {/* Numero di telefono */}
        </p>

        {currentUser && ( // Se c'è un utente loggato, mostra azioni like e prenota
          <>
            <button
              onClick={() => onLike(campo._id)} // Click like/dislike: invoca callback (il genitore chiamerà l'API)
              className="btn btn-sm btn-outline-primary w-100 mb-2" // Stile bottone
            >
              {hasLiked ? 'Non mi piace' : 'Mi piace'} ({campo.likes?.length || 0}) {/* Testo dinamico + conteggio likes */}
            </button>

            <button
              className="btn btn-sm btn-success w-100 mb-2" // Bottone prenota
              onClick={() => setShowPrenota(true)} // Apre modale prenotazione
            >
              Prenota {/* Testo bottone */}
            </button>
          </>
        )}

        {isProp && ( // Se l'utente è proprietario del campo, mostra azioni amministrative
          <>
            <button onClick={() => onDelete(campo._id)} className="btn btn-sm btn-danger w-100 mb-2"> {/* Elimina campo */}
              Elimina
            </button>
            <button
              onClick={() => setShowUpdateForm(!showUpdateForm)} // Toggle mostra/nascondi form aggiornamento
              className="btn btn-sm btn-secondary w-100 mb-2" // Stile bottone
            >
              {showUpdateForm ? 'Annulla' : 'Modifica'} {/* Testo dinamico */}
            </button>
            {showUpdateForm && ( // Form aggiornamento visibile se showUpdateForm è true
              <form
                onSubmit={(e) => { // Submit aggiornamento
                  e.preventDefault(); // Evita reload
                  onUpdate(campo._id, parseInt(indiceImg), nuovaImg, nuovoTelefono); // Invoca callback con i valori
                  setShowUpdateForm(false); // Nasconde form
                  setIndiceImg(''); // Reset indice
                  setNuovaImg(''); // Reset immagine
                  setNuovoTelefono(''); // Reset telefono
                }}
              >
                <input
                  type="number" // Input numerico per indice immagine
                  value={indiceImg} // Valore controllato
                  onChange={(e) => setIndiceImg(e.target.value)} // Aggiorna stato
                  placeholder="Indice img" // Placeholder
                  className="form-control mb-1" // Stile Bootstrap
                  required // Campo obbligatorio
                />
                <input
                  type="text" // Input testuale per URL immagine
                  value={nuovaImg} // Valore controllato
                  onChange={(e) => setNuovaImg(e.target.value)} // Aggiorna stato
                  placeholder="Nuova URL img" // Placeholder
                  className="form-control mb-1" // Stile Bootstrap
                  required // Campo obbligatorio
                />
                <input
                  type="text" // Input testuale per telefono
                  value={nuovoTelefono} // Valore controllato
                  onChange={(e) => setNuovoTelefono(e.target.value)} // Aggiorna stato
                  placeholder="Nuovo Telefono" // Placeholder
                  className="form-control mb-2" // Stile Bootstrap
                  required // Campo obbligatorio
                />
                <button type="submit" className="btn btn-sm btn-success w-100">Aggiorna</button> {/* Conferma aggiornamento */}
              </form>
            )}
          </>
        )}
      </div>

      {showPrenota && ( // Se stato modale prenotazione è true, renderizza modale "controllata"
        <>
          <div className="modal fade show d-block" id={modalId} tabIndex="-1" role="dialog" aria-modal="true"> {/* Wrapper modale (visibile) */}
            <div className="modal-dialog modal-dialog-centered" role="document"> {/* Dialog centrato */}
              <div className="modal-content rounded-4 shadow"> {/* Contenuto modale */}
                <div className="modal-header"> {/* Header modale */}
                  <h5 className="modal-title">Prenota — {campo.nome}</h5> {/* Titolo modale */}
                  <button type="button" className="btn-close" onClick={() => setShowPrenota(false)} aria-label="Close"></button> {/* Chiudi */}
                </div>
                <form onSubmit={handleSubmitPrenota}> {/* Form prenotazione (submit gestito) */}
                  <div className="modal-body"> {/* Corpo modale */}
                    <div className="mb-3"> {/* Campo data */}
                      <label className="form-label">Data</label> {/* Etichetta */}
                      <input
                        type="date" // Input data
                        className="form-control" // Stile Bootstrap
                        required // Obbligatorio
                        value={data} // Valore controllato
                        onChange={(e) => setData(e.target.value)} // Aggiorna stato
                      />
                    </div>

                    <div className="row"> {/* Riga per orari */}
                      <div className="col-6 mb-3"> {/* Colonna ora inizio */}
                        <label className="form-label">Ora inizio</label> {/* Etichetta */}
                        <input
                          type="time" // Input orario
                          className="form-control" // Stile
                          required // Obbligatorio
                          value={oraInizio} // Valore controllato
                          onChange={(e) => setOraInizio(e.target.value)} // Aggiorna stato
                        />
                      </div>
                      <div className="col-6 mb-3"> {/* Colonna ora fine */}
                        <label className="form-label">Ora fine</label> {/* Etichetta */}
                        <input
                          type="time" // Input orario
                          className="form-control" // Stile
                          required // Obbligatorio
                          value={oraFine} // Valore controllato
                          onChange={(e) => setOraFine(e.target.value)} // Aggiorna stato
                        />
                      </div>
                    </div>

                    <div className="mb-2"> {/* Campo note */}
                      <label className="form-label">Note (opzionale)</label> {/* Etichetta */}
                      <textarea
                        className="form-control" // Stile
                        rows="2" // Altezza 2 righe
                        value={note} // Valore controllato
                        onChange={(e) => setNote(e.target.value)} // Aggiorna stato
                        placeholder="Es. partita tra amici" // Placeholder
                      />
                    </div>
                  </div>

                  <div className="modal-footer"> {/* Footer modale con pulsanti azione */}
                    <button
                      type="button" // Bottone non-submit
                      className="btn btn-outline-secondary" // Stile
                      onClick={() => setShowPrenota(false)} // Chiudi modale
                    >
                      Annulla {/* Testo bottone */}
                    </button>
                    <button type="submit" className="btn btn-success"> {/* Bottone submit prenotazione */}
                      Conferma prenotazione {/* Testo bottone */}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div> {/* Sfondo scuro dietro la modale */}
        </>
      )}
    </div>
  ); // Fine render card campo
}

export default Campo; // Esporta il componente per l'uso nel resto dell'app