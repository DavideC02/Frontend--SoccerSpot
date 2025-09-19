import React, { useState } from 'react'; // Import di React e useState per gestire lo stato locale
import campoImg from '../assets/img/campo.jpg'; // Import immagine statica usata come background

function Home({ onSearch }) { // Definizione del componente Home, riceve onSearch come prop dal genitore (App.jsx)
  const [comune, setComune] = useState(''); // Stato locale per salvare il comune selezionato dall'utente

  const handleSubmit = (e) => { // Funzione che intercetta il submit del form
    e.preventDefault(); // Evita il refresh della pagina
    onSearch(comune);   // Invoca la funzione ricevuta come prop → manda al backend il comune selezionato
  };

  return ( // Render JSX del componente
    <div> 
      <div
        className="position-relative w-100 d-flex justify-content-center align-items-center text-center"
        style={{
          height: '50vh', // Altezza metà viewport
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${campoImg})`, 
          // Overlay scuro sopra immagine di sfondo
          backgroundSize: 'cover', // Immagine copre l'intero container
          backgroundPosition: 'center', // Immagine centrata
        }}
      >
        <div
          className="bg-white p-4 rounded-4 shadow"
          style={{
            maxWidth: '500px', // Limita larghezza
            width: '90%', // Responsivo
            backgroundColor: 'rgba(255, 255, 255, 0.95)', // Sfondo semitrasparente
            backdropFilter: 'blur(4px)', // Effetto blur dietro al box
          }}
        >
          <h1 className="fw-bold text-center mb-3"> {/* Titolo principale */}
            <span style={{ color: '#28a745' }}>Soccer</span> {/* Parte verde */}
            <span style={{ color: '#212529' }}>Spot</span> {/* Parte nera */}
          </h1>
          <p className="text-muted mb-4" style={{ fontSize: '1.1rem' }}>
            Trova e prenota i migliori campi vicino a te {/* Sottotitolo */}
          </p>

          <form onSubmit={handleSubmit}> {/* Al submit viene chiamato handleSubmit → invoca onSearch */}
            <div className="form-floating mb-3">
              <select
                id="comuneSelect"
                value={comune} // Valore collegato allo stato React
                required // Campo obbligatorio
                onChange={(e) => setComune(e.target.value)} // Aggiorna lo stato quando l'utente seleziona
                className="form-select"
              >
                <option value="">Scegli un comune</option> {/* Placeholder iniziale */}
                <option value="Roma">Roma</option> {/* Opzioni disponibili */}
                <option value="Milano">Milano</option>
                <option value="Bari">Bari</option>
                <option value="Palermo">Palermo</option>
                <option value="Torino">Torino</option>
              </select>
              <label htmlFor="comuneSelect">Comune</label> {/* Label floating bootstrap */}
            </div>

            <button
              type="submit"
              className="btn btn-success w-100 py-2 fw-semibold"
              style={{ transition: 'all 0.3s ease' }} // Transizione hover
              onMouseOver={(e) => (e.target.style.opacity = '0.9')} // Effetto hover manuale
              onMouseOut={(e) => (e.target.style.opacity = '1')} // Ripristina opacità
            >
              Cerca {/* Testo bottone */}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Home; // Esporta il componente per poterlo usare in App.jsx