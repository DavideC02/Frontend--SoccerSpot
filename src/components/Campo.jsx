import React, { useState } from 'react';

function Campo({ campo, currentUser, onLike, onDelete, onUpdate, onPrenota }) {
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [indiceImg, setIndiceImg] = useState('');
  const [nuovaImg, setNuovaImg] = useState('');
  const [nuovoTelefono, setNuovoTelefono] = useState('');
  const [showPrenota, setShowPrenota] = useState(false);
  const [data, setData] = useState('');
  const [oraInizio, setOraInizio] = useState('');
  const [oraFine, setOraFine] = useState(''); 
  const [note, setNote] = useState('');

  const isProp = currentUser && campo.proprietario === currentUser?.id;
  const hasLiked = currentUser && campo.likes?.includes(currentUser.id);

  const modalId = `prenota-${campo._id}`;

  const handleSubmitPrenota = async (e) => {
    e.preventDefault();
    if (!onPrenota) return;
    await onPrenota(campo._id, data, oraInizio, oraFine, note);
    // chiudo e pulisco
    setShowPrenota(false);
    setData('');
    setOraInizio('');
    setOraFine('');
    setNote('');
  };

  return (
    <div className="card m-2 shadow-sm border-0 rounded-4 overflow-hidden" style={{ width: '360px' }}>
      {/* Immagini / Carousel */}
      {campo.img?.length > 0 ? (
        <div id={`carousel-${campo._id}`} className="carousel slide" data-bs-ride="carousel">
          <div className="carousel-inner">
            {campo.img.map((url, index) => (
              <div className={`carousel-item ${index === 0 ? 'active' : ''}`} key={index}>
                <img
                  src={url}
                  className="d-block w-100"
                  alt={`Campo ${index}`}
                  style={{ height: '180px', objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
          {campo.img.length > 1 && (
            <>
              <button
                className="carousel-control-prev"
                type="button"
                data-bs-target={`#carousel-${campo._id}`}
                data-bs-slide="prev"
              >
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Precedente</span>
              </button>
              <button
                className="carousel-control-next"
                type="button"
                data-bs-target={`#carousel-${campo._id}`}
                data-bs-slide="next"
              >
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Successiva</span>
              </button>
            </>
          )}
        </div>
      ) : (
        <div
          className="card-img-top bg-light text-center d-flex align-items-center justify-content-center"
          style={{ height: '180px' }}
        >
          Nessuna immagine
        </div>
      )}

      <div className="card-body">
        <div className="d-flex align-items-start justify-content-between mb-2">
          <h5 className="card-title mb-0 fw-bold">{campo.nome}</h5>
          {campo.comune && (
            <span className="badge text-bg-success">{campo.comune}</span>
          )}
        </div>

        <p className="card-text mb-1">
          <strong>Indirizzo:</strong> {campo.indirizzo}
        </p>
        <p className="card-text mb-3">
          <strong>Telefono:</strong> {campo.numerotelefono}
        </p>

        {currentUser && (
          <>
            <button
              onClick={() => onLike(campo._id)}
              className="btn btn-sm btn-outline-primary w-100 mb-2"
            >
              {hasLiked ? 'Non mi piace' : 'Mi piace'} ({campo.likes?.length || 0})
            </button>

            <button
              className="btn btn-sm btn-success w-100 mb-2"
              onClick={() => setShowPrenota(true)}
            >
              Prenota
            </button>
          </>
        )}

        {isProp && (
          <>
            <button onClick={() => onDelete(campo._id)} className="btn btn-sm btn-danger w-100 mb-2">
              Elimina
            </button>
            <button
              onClick={() => setShowUpdateForm(!showUpdateForm)}
              className="btn btn-sm btn-secondary w-100 mb-2"
            >
              {showUpdateForm ? 'Annulla' : 'Modifica'}
            </button>
            {showUpdateForm && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onUpdate(campo._id, parseInt(indiceImg), nuovaImg, nuovoTelefono);
                  setShowUpdateForm(false);
                  setIndiceImg('');
                  setNuovaImg('');
                  setNuovoTelefono('');
                }}
              >
                <input
                  type="number"
                  value={indiceImg}
                  onChange={(e) => setIndiceImg(e.target.value)}
                  placeholder="Indice img"
                  className="form-control mb-1"
                  required
                />
                <input
                  type="text"
                  value={nuovaImg}
                  onChange={(e) => setNuovaImg(e.target.value)}
                  placeholder="Nuova URL img"
                  className="form-control mb-1"
                  required
                />
                <input
                  type="text"
                  value={nuovoTelefono}
                  onChange={(e) => setNuovoTelefono(e.target.value)}
                  placeholder="Nuovo Telefono"
                  className="form-control mb-2"
                  required
                />
                <button type="submit" className="btn btn-sm btn-success w-100">Aggiorna</button>
              </form>
            )}
          </>
        )}
      </div>

      {showPrenota && (
        <>
          <div className="modal fade show d-block" id={modalId} tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content rounded-4 shadow">
                <div className="modal-header">
                  <h5 className="modal-title">Prenota — {campo.nome}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowPrenota(false)} aria-label="Close"></button>
                </div>
                <form onSubmit={handleSubmitPrenota}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Data</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                      />
                    </div>

                    <div className="row">
                      <div className="col-6 mb-3">
                        <label className="form-label">Ora inizio</label>
                        <input
                          type="time"
                          className="form-control"
                          required
                          value={oraInizio}
                          onChange={(e) => setOraInizio(e.target.value)}
                        />
                      </div>
                      <div className="col-6 mb-3">
                        <label className="form-label">Ora fine</label>
                        <input
                          type="time"
                          className="form-control"
                          required
                          value={oraFine}
                          onChange={(e) => setOraFine(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="mb-2">
                      <label className="form-label">Note (opzionale)</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Es. partita tra amici"
                      />
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPrenota(false)}
                    >
                      Annulla
                    </button>
                    <button type="submit" className="btn btn-success">
                      Conferma prenotazione
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
}

export default Campo;