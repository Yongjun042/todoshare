// App.js

import React, { useEffect, useState } from "react";
import {
  LoginButton,
  LogoutButton,
  Text,
  useSession,
  CombinedDataProvider,
} from "@inrupt/solid-ui-react";
import {
  getSolidDataset,
  getUrlAll,
  getThing,
  SolidDataset,
  WithServerResourceInfo,
} from "@inrupt/solid-client";
import AddTodo from "./components/AddTodo";
import TodoList from "./components/TodoList";
import { getOrCreateTodoList } from "./utils";
import { space } from "rdf-namespaces";
import { AppShell, Header , Input, Button} from "@mantine/core";

const STORAGE_PREDICATE = space.storage;

const authOptions = {
  clientName: "Solid Todo App",
};

function App() {
  const { session } = useSession();
  const [todoList, setTodoList] = useState<
    SolidDataset & WithServerResourceInfo
  >();
  const [oidcIssuer, setOidcIssuer] = useState("https://inrupt.net");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOidcIssuer(event.target.value);
  };

  useEffect(() => {
    if (!session || !session.info.isLoggedIn) return;
    (async () => {
      const profileDataset = await getSolidDataset(session.info.webId!, {
        fetch: session.fetch,
      });
      const profileThing = getThing(profileDataset, session.info.webId!);
      const podsUrls = getUrlAll(profileThing!, STORAGE_PREDICATE);
      const pod = podsUrls[0];
      const containerUri = `${pod}todos/`;
      const list = await getOrCreateTodoList(containerUri, session.fetch);
      setTodoList(list);
    })();
  }, [session, session.info.isLoggedIn]);

  return (
    <AppShell
      padding="md"
      header={
        <Header height={60} padding="xs" >
          {session.info.isLoggedIn && session.info.webId ? (
            <CombinedDataProvider
              datasetUrl={session.info.webId}
              thingUrl={session.info.webId}
            >
              <div className="message logged-in">
                <span>You are logged in as: </span>
                <Text
                  properties={[
                    "http://xmlns.com/foaf/0.1/name",
                    "http://www.w3.org/2006/vcard/ns#fn",
                  ]}
                />
                <LogoutButton />
              </div>
            </CombinedDataProvider>
          ) : (
            <div className="message" style={{display: "table"}}>
              <span style={{display:"table-cell"}}>
                IDP:
                <Input
                  className="oidc-issuer-input "
                  type="text"
                  name="oidcIssuer"
                  list="providers"
                  value={oidcIssuer}
                  onChange={handleChange}
                  style={{ width: "200px" ,display: "inline-block" }}
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
                <Button variant='filled'
                style={{display: "inline-block"}}>Log in</Button>
              </LoginButton>
            </div>
          )}
        </Header>
      }
    >
      {session.info.isLoggedIn && session.info.webId ? (
        <CombinedDataProvider
          datasetUrl={session.info.webId}
          thingUrl={session.info.webId}
        >
          <section>
            <AddTodo
              todoList={todoList as SolidDataset & WithServerResourceInfo}
              setTodoList={
                setTodoList as React.Dispatch<
                  React.SetStateAction<SolidDataset & WithServerResourceInfo>
                >
              }
            />
            <TodoList
              todoList={todoList as SolidDataset & WithServerResourceInfo}
              setTodoList={
                setTodoList as React.Dispatch<
                  React.SetStateAction<SolidDataset & WithServerResourceInfo>
                >
              }
            />
          </section>
        </CombinedDataProvider>
      ) : <div>You are not logged in</div>}
    </AppShell>
  );
}

export default App;

/*
            <span>Your nickname: </span>
            <Text
              properties={[
                "http://www.w3.org/2006/vcard/ns#fn",
                "http://xmlns.com/foaf/0.1/name",
              ]}
            />
            <div className="message logged-in">
              <span>You are logged in as: </span>
              <Text
                properties={[
                  "http://xmlns.com/foaf/0.1/name",
                  "http://www.w3.org/2006/vcard/ns#fn",
                ]}
              />
              */
