// App.js

import React, { useEffect, useState } from "react";
import {
  LoginButton,
  LogoutButton,
  Text,
  useSession,
  CombinedDataProvider
} from "@inrupt/solid-ui-react";
import { getSolidDataset, getUrlAll, getThing, SolidDataset, WithServerResourceInfo } from "@inrupt/solid-client";
import AddTodo from "./components/AddTodo";
import TodoList from "./components/TodoList";
import { getOrCreateTodoList } from "./utils";

const STORAGE_PREDICATE = "http://www.w3.org/ns/pim/space#storage";

const authOptions = {
  clientName: "Solid Todo App",
};

function App() {
  const { session } = useSession();
  const [todoList  , setTodoList] = useState<SolidDataset & WithServerResourceInfo>();
  const [oidcIssuer, setOidcIssuer] = useState("https://inrupt.net");

  const handleChange = (event:React.ChangeEvent<HTMLInputElement>) => {
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
    <div className="app-container">
      {(session.info.isLoggedIn && session.info.webId) ? (
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
          <section>
            <AddTodo todoList={todoList as SolidDataset & WithServerResourceInfo} setTodoList={setTodoList as React.Dispatch<React.SetStateAction<SolidDataset & WithServerResourceInfo>>} />
            <TodoList todoList={todoList as SolidDataset & WithServerResourceInfo} setTodoList={setTodoList as React.Dispatch<React.SetStateAction<SolidDataset & WithServerResourceInfo>>} />
          </section>
        </CombinedDataProvider>
      ) : (
        <div className="message">
          <span>You are not logged in. </span>
          <span>
            Log in with:
            <input
              className="oidc-issuer-input "
              type="text"
              name="oidcIssuer"
              list="providers"
              value={oidcIssuer}
              onChange={handleChange}
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
          />
        </div>
      )}
    </div>
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