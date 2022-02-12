import { useSession, Text } from "@inrupt/solid-ui-react";

import React from "react";

import "./index.scss";
import {
  getSourceUrl,
  saveSolidDatasetAt,
  Thing,
  removeThing,
  getThingAll,
  getUrl,
  deleteSolidDataset,
  getSolidDataset,
  asUrl,
  UrlString,
  deleteFile,
} from "@inrupt/solid-client";
import { useThing } from "@inrupt/solid-ui-react";
import { rdf, space } from "rdf-namespaces";
import { Button } from "@mantine/core";
import "./index.scss";
import { SolidDataWithServer } from "../../types";

const TEXT_PREDICATE = "http://schema.org/text";
const TYPE_PREDICATE = rdf.type;
const STORAGE_PREDICATE = space.storage;

interface listProps {
  list: SolidDataWithServer;
  setList: React.Dispatch<React.SetStateAction<SolidDataWithServer>>;
  todoList: SolidDataWithServer | null;
  setTodoList: React.Dispatch<React.SetStateAction<SolidDataWithServer | null>>;
}

function ShowList({ list, setList, todoList, setTodoList }: listProps) {
  const { fetch } = useSession();

  const listThings = list ? getThingAll(list) : [];

  function DeleteButton({
    deleteTodo,
    urlt,
  }: {
    deleteTodo: (todo: Thing) => void;
    urlt: UrlString;
  }) {
    const { thing } = useThing(getSourceUrl(list), urlt);
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

  /**
   * Delete Selected Thing
   * @param todo todo Thing to delete
   */
  const deleteTodo = async (todo: Thing) => {
    const todosUrl = getSourceUrl(list);
    const updatedTodos = removeThing(list, todo);
    const storageUrl = getUrl(todo, STORAGE_PREDICATE);
    await deleteFile(storageUrl! + "index.ttl", { fetch: fetch });
    await deleteSolidDataset(storageUrl!, { fetch });
    const updatedDataset = await saveSolidDatasetAt(todosUrl, updatedTodos, {
      fetch,
    });
    if (!todoList && getSourceUrl(todoList!) === storageUrl + "index.ttl") {
      setTodoList(null);
    }
    setList(updatedDataset);
  };

  /**
   * set selected todo
   * @param todo selected todo
   */
  const selectTodo = async (todo: Thing) => {
    const storageUrl = getUrl(todo, STORAGE_PREDICATE);
    if (storageUrl) {
      const dataset = await getSolidDataset(storageUrl! + "index.ttl", {
        fetch,
      });
      setTodoList(dataset);
    }
  };

  const thingsArray = listThings
    .filter((t) => getUrl(t, TYPE_PREDICATE) === STORAGE_PREDICATE)
    .map((t) => {
      return { dataset: list, thing: t };
    });
  if (!thingsArray.length) return null;

  return (
    <ul>
      {thingsArray.map((thing) => (
        <li>
          <div onClick={() => selectTodo(thing.thing)}>
            <Text
              solidDataset={list}
              thing={thing.thing}
              property={TEXT_PREDICATE}
            />
          </div>
          <DeleteButton deleteTodo={deleteTodo} urlt={asUrl(thing.thing)} />
        </li>
      ))}
    </ul>
  );
}

export default ShowList;
