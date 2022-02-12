import {
    useSession,
    CombinedDataProvider,
    } from "@inrupt/solid-ui-react"

import React, {useState,}from "react";

import{ Navbar,} from "@mantine/core";

import "./index.scss";
import {
  addStringNoLocale,
  createThing,
  getSourceUrl,
  saveSolidDatasetAt,
  setThing,
  addUrl,
  Thing,
  removeThing,
  getThingAll,
  getUrl,
  getStringNoLocale,
} from "@inrupt/solid-client";
import {
  useThing,
} from "@inrupt/solid-ui-react";
import{ rdf, space}from 'rdf-namespaces';
import { TextInput, Button } from "@mantine/core";
import { checkExist } from "../../utils";
import { SolidDataWithServer } from "../../types";
import "./index.scss";

const TEXT_PREDICATE = "http://schema.org/text";
const TYPE_PREDICATE = rdf.type;
const STORAGE_PREDICATE = space.storage;

interface listProps{
  list: SolidDataWithServer;
  setList: React.Dispatch<React.SetStateAction<SolidDataWithServer>>;
}

//마저 구현하기
function DeleteButton({ deleteTodo }: { deleteTodo: (todo: Thing) => void }) {
  const { thing } = useThing();
  return (
    <Button
      className="delete-button"
      variant="outline"
      style={{ margin: "4px" }}
      onClick={() => deleteTodo(thing as Thing)}
    >
      Delete
    </Button>
  );
}


function CNavbar({list, setList}:listProps) {
    const { session } = useSession();

  const [listText, setListText] = useState("");
  const listThings = list ? getThingAll(list) : [];

  const addTodo = async (text:string) => {
    const indexUrl = getSourceUrl(list);
    const todoWithText = addStringNoLocale(createThing(), TEXT_PREDICATE, text);
    let randomUrl = indexUrl + Math.random().toString(36).substring(2, 15);

    while(checkExist(randomUrl, session.fetch)){
      randomUrl = indexUrl + Math.random().toString(36).substring(2, 15);
    }

    const todoWithStorage = addUrl(todoWithText,STORAGE_PREDICATE, randomUrl);
    const todoWithType = addUrl(todoWithStorage, TYPE_PREDICATE, STORAGE_PREDICATE);
    const updatedList = setThing(list, todoWithType);
    const updatedDataset = await saveSolidDatasetAt(indexUrl, updatedList, {
      fetch: session.fetch,
    });
    setList(updatedDataset);
  };

  const handleSubmit =  async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addTodo(listText);
    setListText("");
  };

  const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    setListText(e.target.value);
  };

  const deleteTodo = async (todo: Thing) => {
    const todosUrl = getSourceUrl(list);
    const updatedTodos = removeThing(list, todo);
    const updatedDataset = await saveSolidDatasetAt(todosUrl, updatedTodos, {
      fetch,
    });
    setList(updatedDataset);
  };
  
  const thingsArray = listThings
  .filter((t) => getUrl(t, TYPE_PREDICATE) === STORAGE_PREDICATE)
  .map((t) => {
    return { dataset: list, thing: t };
  });
if (!thingsArray.length) return null;

  return (
    <Navbar width={{ base: 300 }} height={500} padding="xs">
      {session.info.isLoggedIn && session.info.webId ? (
        <CombinedDataProvider
          datasetUrl={session.info.webId}
          thingUrl={session.info.webId}
        >
          <Navbar.Section>
          <form className="todo-form" onSubmit={handleSubmit}>
          <TextInput
            id="todo-input"
            type="text"
            label="Create TodoList"
            value={listText}
            onChange={handleChange}
            rightSection={<Button className="add-button" type="submit">Add Todo</Button>}
            rightSectionWidth={100}
          />
      </form>
      </Navbar.Section>
          <Navbar.Section>
      <ul>
        {thingsArray.map((thing) => (<li>{getStringNoLocale(thing.thing,TEXT_PREDICATE)}<DeleteButton deleteTodo={deleteTodo} /></li>))}
      </ul>
      </Navbar.Section>
        </CombinedDataProvider>
      ) : (
        <div>
          <p>You are not logged in</p>
        </div>
      )}
    </Navbar>
  );
}

export default CNavbar;
