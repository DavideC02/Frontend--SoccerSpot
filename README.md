# Frontend

Applicazione frontend realizzata con React e Bootstrap.
Permette di cercare campi sportivi per comune, visualizzarli in card e — se autenticati — prenotarli tramite un form calendario.

🚀 Tecnologie usate

React come framework principale, Bootstrap per lo stile, Fetch API per le chiamate HTTP, JWT (token gestiti via localStorage) per l’autenticazione.

📂 Struttura progetto

La cartella src contiene i componenti React (Authform, Campo, Navbar, ecc.), il file App.jsx come componente principale e index.js come entrypoint.
La cartella public contiene index.html e asset statici.
Il file package.json gestisce le dipendenze e gli script.

⚙️ Installazione

Clona la repository ed entra nella cartella del frontend, poi esegui l’installazione delle dipendenze con npm install.

🔑 Variabili d’ambiente

Crea un file .env (non incluso nel repo).
Puoi usare .env.example come riferimento.
È importante che tutte le variabili in React inizino con REACT_APP_.
Un esempio tipico è la variabile REACT_APP_API_BASE_URL che definisce l’URL base del backend (per esempio http://localhost:3000/api).

▶️ Avvio in sviluppo

Per avviare l’applicazione in modalità sviluppo utilizza npm start.
Di default sarà disponibile su http://localhost:3000.

📌 Funzionalità principali

Ricerca dei campi tramite barra di ricerca, filtrati per comune, con la lista visualizzata sotto la barra.

Visualizzazione dei campi in card con carosello immagini, dettagli come indirizzo e telefono, gestione like/unlike e gestione dedicata al proprietario.

Autenticazione con login e registrazione utente (ruolo utente o proprietario).

Prenotazioni: se autenticato, un bottone “Prenota” apre un form con calendario e orario di inizio e fine.

Gestione campi: il proprietario può creare, modificare ed eliminare campi.

Like: gli utenti possono mettere o togliere il like ai campi.

🧪 Note sviluppo

I token JWT vengono salvati in localStorage (chiave tokenaccesso).
Le prenotazioni vengono inviate al backend come stringhe ISO generate con toISOString().
L’interfaccia utilizza componenti e classi Bootstrap per card, form e modalshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
