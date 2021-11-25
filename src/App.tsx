import React, { useState }  from 'react';
import { SessionProvider, LoginButton, LogoutButton } from "@inrupt/solid-ui-react";
import './App.css';
import Dashboard from './Dashboard';
const authOptions = {
  clientName: "Solid Todo App",
};

function App() {
  const [idp, setIdp] = useState("https://inrupt.net");

  const restoreCallback = (url: string) => {
    console.log(`Use this function to navigate back to ${url}`);
  };

  return (
    <SessionProvider
      onError={console.log}
      restorePreviousSession
      onSessionRestore={restoreCallback}
    >

      <input className="oidc-issuer-input " type="url"
              name="oidcIssuer"
              list="providers" value={idp} onChange={(e) => setIdp(e.target.value)} />

      <LoginButton
        oidcIssuer={idp}
        redirectUrl={window.location.href}
        onError={console.log}
        authOptions={authOptions}
      />

      <LogoutButton onError={console.log} />
      <Dashboard />
    </SessionProvider>
  );
}

export default App;
