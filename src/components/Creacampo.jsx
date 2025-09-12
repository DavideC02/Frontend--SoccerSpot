import React, { useState } from 'react';

function Creacampo({ onCampoCreated }) {
    const [imgUrl, setimgUrl] = useState('');
    const [nome, setNome] = useState('');
    const [comune, setComune] = useState('');
    const [indirizzo, setIndirizzo] = useState('');
    const [numerotelefono, setnumerotelefono] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        const immaginiArray = imgUrl.split(',').map(url => url.trim());

        onCampoCreated({
            imgUrl : immaginiArray,
            nome,
            comune,
            indirizzo,
            numerotelefono
        });

        setimgUrl('');
        setNome('');
        setComune('');
        setIndirizzo('');
        setnumerotelefono('');
    };

    return (
        <div className="mt-5">

            <h2 className="text-center mb-4">Crea un nuovo campo</h2>

            <form onSubmit={handleSubmit} 
                className="container mt-r"
                style = {{maxWidth : "500px"}}
            >

                <div className="form-floating mb-3">
                     <input
                        type="text"
                        className="form-control"
                        value={imgUrl}
                        onChange={(e) => setimgUrl(e.target.value)}
                        required
                       />
                    <label htmlfor = "Url Immagini">URL Immagini</label>
                </div>

                    <div className="form-floating mb-3">
                        <input
                            type="text"
                            className="form-control"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            required
                        />
                        <label htmlfor="Nome del Campo">Nome del Campo</label>
                    </div>


                    <div className="form-floating mb-3">
                        <select
                            type="text"
                            className="form-control"
                            value={comune}
                            onChange={(e) => setComune(e.target.value)}
                            required
                        >
                            <option value = "" disable>Scegli il comune</option>
                            <option value = "Roma">Roma</option>
                            <option value = "Milano">Milano</option>
                            <option value = "Bari">Bari</option>
                            <option value = "Palermo">Palermo</option>
                            <option value = "Torino">Torino</option>
                        </select>
                    <label htmlfor="Comune">Comune</label>
                    </div>

                    <div className="form-floating mb-3">
                        <input
                            type="text"
                            className="form-control"
                            value={indirizzo}
                            onChange={(e) => setIndirizzo(e.target.value)}
                            required
                        />
                        <label htmlfor="Indirizzo">Indirizzo</label>
                    </div>

                    <div className="form-floating mb-3">
                        <input
                            type="text"
                            className="form-control"
                            value={numerotelefono}
                            onChange={(e) => setnumerotelefono(e.target.value)}
                            required
                        />
                        <label htmlfor="Numero di Telefono">Numero di Telefono</label>
                    </div>

                <div className="text-center">
                    <button type="submit" className="btn btn-success btn-lg px-4">
                        Crea Campo
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Creacampo;