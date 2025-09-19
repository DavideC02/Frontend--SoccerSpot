import React, { useState } from 'react'; // Import di React e dell’hook useState per gestire lo stato locale del form

function Creacampo({ onCampoCreated }) { // Componente che espone un form per creare un nuovo campo; riceve la callback onCampoCreated dal genitore
    const [imgUrl, setimgUrl] = useState(''); // Stato: stringa con una o più URL immagini separate da virgola
    const [nome, setNome] = useState(''); // Stato: nome del campo
    const [comune, setComune] = useState(''); // Stato: comune selezionato
    const [indirizzo, setIndirizzo] = useState(''); // Stato: indirizzo testuale
    const [numerotelefono, setnumerotelefono] = useState(''); // Stato: numero di telefono

    const handleSubmit = (e) => { // Handler di submit del form
        e.preventDefault(); // Impedisce il refresh della pagina

        const immaginiArray = imgUrl.split(',').map(url => url.trim()); // Splitta la stringa per virgole e ripulisce gli spazi, ottenendo un array di URL

        onCampoCreated({ // Invoca la callback passata dal componente genitore
            imgUrl : immaginiArray, // Passa l’array di URL immagini, come atteso dal backend/controller
            nome, // Passa il nome inserito
            comune, // Passa il comune selezionato
            indirizzo, // Passa l’indirizzo inserito
            numerotelefono // Passa il numero di telefono inserito
        });

        setimgUrl(''); // Reset del campo URL immagini
        setNome(''); // Reset del campo nome
        setComune(''); // Reset del campo comune
        setIndirizzo(''); // Reset del campo indirizzo
        setnumerotelefono(''); // Reset del campo numero di telefono
    };

    return ( // Render del form di creazione campo
        <div className="mt-5"> {/* Contenitore con margine superiore */}

            <h2 className="text-center mb-4">Crea un nuovo campo</h2> {/* Titolo centrato del form */}

            <form onSubmit={handleSubmit}  // Collega l’handler di submit
                className="container mt-r" // Classi di layout; attenzione: "mt-r" non è classe Bootstrap standard (forse volevi "mt-3" o simili)
                style = {{maxWidth : "500px"}} // Limita la larghezza del form per una migliore leggibilità
            >

                <div className="form-floating mb-3"> {/* Wrapper Bootstrap per input con etichetta flottante */}
                     <input
                        type="text" // Campo testuale per una o più URL immagini separate da virgola
                        className="form-control" // Stile Bootstrap
                        value={imgUrl} // Valore controllato legato allo stato imgUrl
                        onChange={(e) => setimgUrl(e.target.value)} // Aggiorna lo stato a ogni digitazione
                        required // Campo obbligatorio lato client
                       />
                    <label htmlfor = "Url Immagini">URL Immagini</label> {/* Etichetta flottante; attenzione: l’attributo corretto in JSX è "htmlFor" */}
                </div>

                    <div className="form-floating mb-3"> {/* Campo per il nome del campo */}
                        <input
                            type="text" // Input testuale
                            className="form-control" // Stile Bootstrap
                            value={nome} // Valore controllato legato allo stato nome
                            onChange={(e) => setNome(e.target.value)} // Aggiornamento stato nome
                            required // Campo obbligatorio
                        />
                        <label htmlfor="Nome del Campo">Nome del Campo</label> {/* Etichetta flottante; usare "htmlFor" in JSX */}
                    </div>


                    <div className="form-floating mb-3"> {/* Selettore del comune */}
                        <select
                            type="text" // Attributo non necessario per <select>, ma non rompe; il tipo viene ignorato
                            className="form-control" // Stile input; per <select> si usa spesso "form-select" in Bootstrap 5
                            value={comune} // Valore controllato legato allo stato comune
                            onChange={(e) => setComune(e.target.value)} // Aggiorna lo stato comune
                            required // Campo obbligatorio
                        >
                            <option value = "" disable>Scegli il comune</option> {/* Opzione placeholder; "disable" dovrebbe essere "disabled" */}
                            <option value = "Roma">Roma</option> {/* Opzione Roma */}
                            <option value = "Milano">Milano</option> {/* Opzione Milano */}
                            <option value = "Bari">Bari</option> {/* Opzione Bari */}
                            <option value = "Palermo">Palermo</option> {/* Opzione Palermo */}
                            <option value = "Torino">Torino</option> {/* Opzione Torino */}
                        </select>
                    <label htmlfor="Comune">Comune</label> {/* Etichetta flottante; in JSX l’attributo è "htmlFor" */}
                    </div>

                    <div className="form-floating mb-3"> {/* Campo indirizzo */}
                        <input
                            type="text" // Input testuale
                            className="form-control" // Stile Bootstrap
                            value={indirizzo} // Valore controllato legato allo stato indirizzo
                            onChange={(e) => setIndirizzo(e.target.value)} // Aggiorna stato indirizzo
                            required // Campo obbligatorio
                        />
                        <label htmlfor="Indirizzo">Indirizzo</label> {/* Etichetta flottante; usare "htmlFor" */}
                    </div>

                    <div className="form-floating mb-3"> {/* Campo numero di telefono */}
                        <input
                            type="text" // Input testuale; se vuoi forzare numerico potresti usare type="tel"
                            className="form-control" // Stile Bootstrap
                            value={numerotelefono} // Valore controllato legato allo stato numerotelefono
                            onChange={(e) => setnumerotelefono(e.target.value)} // Aggiorna stato numerotelefono
                            required // Campo obbligatorio
                        />
                        <label htmlfor="Numero di Telefono">Numero di Telefono</label> {/* Etichetta flottante; usare "htmlFor" */}
                    </div>

                <div className="text-center"> {/* Contenitore del bottone di submit centrato */}
                    <button type="submit" className="btn btn-success btn-lg px-4"> {/* Pulsante invio form */}
                        Crea Campo {/* Testo del pulsante */}
                    </button>
                </div>
            </form>
        </div>
    ); // Fine render del componente
}

export default Creacampo; // Esporta il componente per l’uso in altre parti dell’app