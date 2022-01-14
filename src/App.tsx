// App.js

import React, { useEffect, useState } from "react";
import {
  useSession,
  CombinedDataProvider,
} from "@inrupt/solid-ui-react";
import {
  getSolidDataset,
  getUrlAll,
  getThing,
  SolidDataset,
  WithServerResourceInfo,
  createThing,
  addUrl,
  setThing,
  saveSolidDatasetAt,
  getThingAll,
  addStringNoLocale,
} from "@inrupt/solid-client";
import AddTodo from "./components/AddTodo";
import TodoList from "./components/TodoList";
import { getOrCreateTodoStorageUri, getOrCreateTodoList } from "./utils";
import { space } from "rdf-namespaces";
import { AppShell,} from "@mantine/core";
import CHeader from "./components/CHeader";
import "./App.scss";

const STORAGE_PREDICATE = space.storage;


function App() {
  const { session } = useSession();
  const [todoList, setTodoList] = useState<
    SolidDataset & WithServerResourceInfo
  >();


  useEffect(() => {
    if (!session || !session.info.isLoggedIn) return;
    (async () => {
      const containerUri= await getOrCreateTodoStorageUri(session);
      const list = await getOrCreateTodoList(containerUri, session.fetch);
      setTodoList(list);
    })();
  }, [session, session.info.isLoggedIn]);

  return (
    <AppShell
      padding="md"
      header={
        <CHeader/>
      }
    >
      {session.info.isLoggedIn && session.info.webId ? (
        <CombinedDataProvider
          datasetUrl={session.info.webId}
          thingUrl={session.info.webId}
        >
          <section className="main-content">
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
