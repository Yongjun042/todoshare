// App.js

import React, { useEffect, useState } from "react";
import {
  useSession,
  CombinedDataProvider,
} from "@inrupt/solid-ui-react";
import {
  SolidDataset,
  WithServerResourceInfo,
} from "@inrupt/solid-client";
import AddTodo from "./components/AddTodo";
import TodoList from "./components/TodoList";
import { getOrCreateTodoStorageUri, getOrCreateTodoList } from "./utils";
import { AppShell, Navbar} from "@mantine/core";
import CHeader from "./components/CHeader";
import "./App.scss";
import ShowList from "./components/ShowList";
import AddList from "./components/AddList";


function App() {
  const { session } = useSession();

  const [todoList, setTodoList] = useState<
    SolidDataset & WithServerResourceInfo | null
  >(null);
  const [list, setList] = useState<
  SolidDataset & WithServerResourceInfo
>();


  useEffect(() => {
    if (!session || !session.info.isLoggedIn) return;
    (async () => {
      const containerUri= await getOrCreateTodoStorageUri(session);
      const listUri = await getOrCreateTodoList(containerUri, session.fetch);
      setTodoList(null);
      setList(listUri);
    })();
  }, [session, session.info.isLoggedIn]);

  return (
    <AppShell
      padding="md"
      header={
        <CHeader/>
      }
      navbar={<Navbar width={{ base: 300 }} height={500} padding="xs">
        <Navbar.Section>
        <AddList
        list={list as SolidDataset & WithServerResourceInfo}
        setList={
          setList as React.Dispatch<
            React.SetStateAction<SolidDataset & WithServerResourceInfo>
          >
        }/>
        </Navbar.Section>
        <Navbar.Section>
        <ShowList
        list={list as SolidDataset & WithServerResourceInfo}
        setList={
          setList as React.Dispatch<
            React.SetStateAction<SolidDataset & WithServerResourceInfo>
          >}
        todoList={todoList as SolidDataset & WithServerResourceInfo}
        setTodoList={
          setTodoList as React.Dispatch<
            React.SetStateAction<SolidDataset & WithServerResourceInfo|null>
          >
        }/>
        </Navbar.Section>
      </Navbar>}
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
