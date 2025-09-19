import React from 'react'; // Import di React (necessario per definire un componente)

function Footer() { // Definizione del componente funzionale Footer
  return ( // Render JSX del footer
    <footer className="bg-dark text-white text-center py-3 mt-auto"> 
      {/* Tag <footer> con classi Bootstrap:
          - bg-dark → sfondo scuro
          - text-white → testo bianco
          - text-center → testo centrato
          - py-3 → padding verticale
          - mt-auto → spinge il footer in fondo alla pagina se si usa flexbox con min-vh-100 */}
      
      <div className="container"> {/* Contenitore Bootstrap per allineare e dare margini orizzontali */}
        <p className="mb-0"> {/* Paragrafo con margine inferiore rimosso (mb-0) */}
          &copy; {new Date().getFullYear()} SoccerSpot — Tutti i diritti riservati
          {/* &copy; → simbolo © 
              new Date().getFullYear() → calcola dinamicamente l’anno corrente 
              Testo statico "SoccerSpot — Tutti i diritti riservati" */}
        </p>
      </div>
    </footer>
  );
}

export default Footer; // Esporta il componente per l'uso (import Footer in App.jsx, ad esempio)