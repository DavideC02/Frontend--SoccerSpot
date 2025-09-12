import React, { useState } from 'react';

function Authform({ onSubmit, formType, errorMessage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [ruolo, setruolo] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handlesubmit = (e) => {
    e.preventDefault();

    if (password.length < 8) {
      setPasswordError('La password deve essere di almeno 8 caratteri');
      return;
    }

    setPasswordError(''); 

    if (formType === 'login') {
      onSubmit({ email, password });
    } else {
      onSubmit({ nome, cognome, email, password, ruolo });
    }
  };

  return (
    <div className="mt-5">
      <form
        onSubmit={handlesubmit}
        className="container mt-5"
        style={{ maxWidth: '500px' }}
      >
        <h2 className="text-center mb-4 fw-bold">
          {formType === 'login' ? 'Login' : 'Registrazione'}
        </h2>

        {errorMessage && (
          <div className="alert alert-danger text-center fw-semibold">
            {errorMessage}
          </div>
        )}

        {formType === 'register' && (
          <>
            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="nome"
                placeholder="Nome"
                value={nome}
                required
                onChange={(e) => setNome(e.target.value)}
              />
              <label htmlFor="nome">Nome</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="cognome"
                placeholder="Cognome"
                value={cognome}
                required
                onChange={(e) => setCognome(e.target.value)}
              />
              <label htmlFor="cognome">Cognome</label>
            </div>

            <div className="form-floating mb-3">
              <select
                className="form-select"
                id="ruolo"
                value={ruolo}
                required
                onChange={(e) => setruolo(e.target.value)}
              >
                <option value="" disabled>
                  Seleziona un ruolo
                </option>
                <option value="utente">Utente</option>
                <option value="proprietario">Proprietario</option>
              </select>
              <label htmlFor="ruolo">Ruolo</label>
            </div>
          </>
        )}

        <div className="form-floating mb-3">
          <input
            type="email"
            className="form-control"
            id="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="email">Email</label>
        </div>

        <div className="form-floating mb-1">
          <input
            type="password"
            className={`form-control ${passwordError ? 'is-invalid' : ''}`}
            id="password"
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <label htmlFor="password">Password</label>
        </div>

        {passwordError && (
          <div className="text-danger mb-3" style={{ fontSize: '0.9rem' }}>
            {passwordError}
          </div>
        )}

        <div className="d-grid mt-3">
          <button type="submit" className="btn btn-success btn-lg">
            Invia
          </button>
        </div>
      </form>
    </div>
  );
}

export default Authform;