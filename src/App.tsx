import React from 'react';

export default function App() {
  return (
    <main className="platinum-era-root">
      <iframe
        className="platinum-era-game"
        title="Platinum Era — Music Superstar Simulator"
        src={`${import.meta.env.BASE_URL}Platinum%20Era.html`}
        allow="fullscreen"
      />
    </main>
  );
}
