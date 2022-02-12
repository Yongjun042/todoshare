import { useSession, CombinedDataProvider } from "@inrupt/solid-ui-react";

import React, { useState } from "react";

import "./index.scss";
import {
  addStringNoLocale,
  createThing,
  getSourceUrl,
  saveSolidDatasetAt,
  setThing,
  addUrl,
} from "@inrupt/solid-client";
import { rdf, space } from "rdf-namespaces";
import { TextInput, Button } from "@mantine/core";
import { checkExist, getOrCreateDataset } from "../../utils";
import { SolidDataWithServer } from "../../types";
import "./index.scss";

const TEXT_PREDICATE = "http://schema.org/text";
const TYPE_PREDICATE = rdf.type;
const STORAGE_PREDICATE = space.storage;

interface listProps {
  list: SolidDataWithServer;
  setList: React.Dispatch<React.SetStateAction<SolidDataWithServer>>;
}

function AddList({ list, setList }: listProps) {
  const { session } = useSession();

  const [listText, setListText] = useState("");

  /**
   * create list
   * @param text Name of the list
   */
  const addList = async (text: string) => {
    const indexUrl = getSourceUrl(list);
    const todoWithText = addStringNoLocale(createThing(), TEXT_PREDICATE, text);

    //generate the url of the list with random id
    let randomUrl =
      indexUrl.slice(0, indexUrl.lastIndexOf("/")) +
      "/" +
      Math.random().toString(36).substring(2, 15) +
      "/";

    while (await checkExist(randomUrl, session.fetch)) {
      randomUrl =
        indexUrl.slice(0, indexUrl.lastIndexOf("/")) +
        "/" +
        Math.random().toString(36).substring(2, 15) +
        "/";
    }
    await getOrCreateDataset(randomUrl, session.fetch);

    //create Thing that contains information about the list
    const todoWithStorage = addUrl(todoWithText, STORAGE_PREDICATE, randomUrl);
    const todoWithType = addUrl(
      todoWithStorage,
      TYPE_PREDICATE,
      STORAGE_PREDICATE
    );
    const updatedList = setThing(list, todoWithType);
    const updatedDataset = await saveSolidDatasetAt(indexUrl, updatedList, {
      fetch: session.fetch,
    });
    setList(updatedDataset);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addList(listText);
    setListText("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    setListText(e.target.value);
  };

  return (
    <div>
      {session.info.isLoggedIn && session.info.webId ? (
        <CombinedDataProvider
          datasetUrl={session.info.webId}
          thingUrl={session.info.webId}
        >
          <form className="todo-form" onSubmit={handleSubmit}>
            <TextInput
              id="todo-input"
              type="text"
              label="Create TodoList"
              value={listText}
              onChange={handleChange}
              rightSection={
                <Button className="add-button" type="submit">
                  Create TodoList
                </Button>
              }
              rightSectionWidth={130}
            />
          </form>
        </CombinedDataProvider>
      ) : null}
    </div>
  );
}

export default AddList;
