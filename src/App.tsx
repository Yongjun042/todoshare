// App.js

import React, { useEffect, useState } from "react";
import { useSession, CombinedDataProvider } from "@inrupt/solid-ui-react";
import AddTodo from "./components/AddTodo";
import TodoList from "./components/TodoList";
import { getOrCreateTodoStorageUri, getOrCreateDataset } from "./utils";
import { AppShell, Navbar } from "@mantine/core";
import CHeader from "./components/CHeader";
import "./App.scss";
import ShowList from "./components/ShowList";
import AddList from "./components/AddList";
import { SolidDataWithServer } from "./types";

function App() {
  const { session } = useSession();

  const [todoList, setTodoList] = useState<SolidDataWithServer | null>(null);
  const [list, setList] = useState<SolidDataWithServer>();

  useEffect(() => {
    if (!session || !session.info.isLoggedIn) return;
    (async () => {
      //initialize the storage and get the dataset of the list of todoList
      const containerUri = await getOrCreateTodoStorageUri(session);
      const listUri = await getOrCreateDataset(containerUri, session.fetch);
      setTodoList(null);
      setList(listUri);
    })();
  }, [session, session.info.isLoggedIn]);

  return (
    <AppShell
      padding="md"
      header={<CHeader />}
      navbar={
        <Navbar width={{ base: 300 }} height={500} padding="xs">
          <Navbar.Section>
            <AddList
              list={list as SolidDataWithServer}
              setList={
                setList as React.Dispatch<
                  React.SetStateAction<SolidDataWithServer>
                >
              }
            />
          </Navbar.Section>
          <Navbar.Section>
            <ShowList
              list={list as SolidDataWithServer}
              setList={
                setList as React.Dispatch<
                  React.SetStateAction<SolidDataWithServer>
                >
              }
              todoList={todoList as SolidDataWithServer}
              setTodoList={
                setTodoList as React.Dispatch<
                  React.SetStateAction<SolidDataWithServer | null>
                >
              }
            />
          </Navbar.Section>
        </Navbar>
      }
    >
      {session.info.isLoggedIn && session.info.webId ? (
        <CombinedDataProvider
          datasetUrl={session.info.webId}
          thingUrl={session.info.webId}
        >
          <section className="main-content">
            <AddTodo
              todoList={todoList as SolidDataWithServer}
              setTodoList={
                setTodoList as React.Dispatch<
                  React.SetStateAction<SolidDataWithServer>
                >
              }
            />
            <TodoList
              todoList={todoList as SolidDataWithServer}
              setTodoList={
                setTodoList as React.Dispatch<
                  React.SetStateAction<SolidDataWithServer>
                >
              }
            />
          </section>
        </CombinedDataProvider>
      ) : (
        <div>You are not logged in</div>
      )}
    </AppShell>
  );
}

export default App;