import {
    useSession,
    LoginButton,
    LogoutButton,
    CombinedDataProvider,
    Text,} from "@inrupt/solid-ui-react"

import React, {useState,}from "react";

import{ Header , TextInput, Button,} from "@mantine/core";

import "./index.scss";


function CHeader() {
    const { session } = useSession();

    const authOptions = {
        clientName: "Solid Todo App",
      };
    
  const [oidcIssuer, setOidcIssuer] = useState("https://inrupt.net");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOidcIssuer(event.target.value);
  };
  return (
    <Header height={60} padding="xs">
      {session.info.isLoggedIn && session.info.webId ? (
        <CombinedDataProvider
          datasetUrl={session.info.webId}
          thingUrl={session.info.webId}
        >
          <div className="logged-in" style={{display:"inline-blockz"}}>
            <span>You are logged in as: </span>
            <Text
              properties={[
                "http://xmlns.com/foaf/0.1/name",
                "http://www.w3.org/2006/vcard/ns#fn",
              ]}
            />
            <LogoutButton>
            <Button variant="light" >
              Log out
            </Button>
                </LogoutButton>
          </div>
        </CombinedDataProvider>
      ) : (
        <div className="message" style={{ display: "table" }}>
          <span style={{ display: "table-cell" }}>
            IDP:
            <TextInput
              className="oidc-issuer-input "
              type="text"
              name="oidcIssuer"
              list="providers"
              value={oidcIssuer}
              onChange={handleChange}
              style={{ width: "200px", display: "inline-block" }}
            />
          </span>
          <datalist id="providers">
            <option value="https://broker.pod.inrupt.com/" />
            <option value="https://inrupt.net/" />
          </datalist>
          <LoginButton
            oidcIssuer={oidcIssuer}
            redirectUrl={window.location.href}
            authOptions={authOptions}
          >
            <Button variant="filled" style={{ display: "inline-block" }}>
              Log in
            </Button>
          </LoginButton>
        </div>
      )}
    </Header>
  );
}

export default CHeader;
