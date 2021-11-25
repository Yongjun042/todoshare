import React,{ReactElement, useContext} from 'react';

import {  SessionContext, CombinedDataProvider, Text} from "@inrupt/solid-ui-react";

function Dashboard(): ReactElement {
    const { session, sessionRequestInProgress } = useContext(SessionContext);
  
    const sessionRequestText = sessionRequestInProgress
      ? "Session request is in progress"
      : "No session request is in progress";
  
    return (
      <div>
        <h1>Current Session:</h1>
        <h2>{session.info.webId || "logged out"}</h2>
  
        <h1>Session Request:</h1>
        <h2>{sessionRequestText}</h2>
  
        {session.info.webId ? (
          <CombinedDataProvider
            datasetUrl={session.info.webId}
            thingUrl={session.info.webId}
          >
            Profile name:
            <Text property="http://www.w3.org/2006/vcard/ns#fn" autosave edit />
          </CombinedDataProvider>
        ) : null}
      </div>
    );
  }

  export default Dashboard;