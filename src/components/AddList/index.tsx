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
  SolidDataset ,
  WithServerResourceInfo,
  Thing,
  removeThing,
  getThingAll,
  getUrl,
  getStringNoLocale,
} from "@inrupt/solid-client";
import {
  Table,
  TableColumn,
  useThing,
} from "@inrupt/solid-ui-react";
import{cal, rdf, space}from 'rdf-namespaces';
import { TextInput, Button } from "@mantine/core";
import "./index.scss";
import { checkExist, getOrCreateTodoList } from "../../utils";

const TEXT_PREDICATE = "http://schema.org/text";
const TYPE_PREDICATE = rdf.type;
const STORAGE_PREDICATE = space.storage;

interface listProps{
  list: SolidDataset & WithServerResourceInfo;
  setList: React.Dispatch<React.SetStateAction<SolidDataset & WithServerResourceInfo>>;
}

function AddList({list, setList}:listProps){
    const { session } = useSession();

    const [listText, setListText] = useState("");

    const addTodo = async (text:string) => {
        const indexUrl = getSourceUrl(list);
        const todoWithText = addStringNoLocale(createThing(), TEXT_PREDICATE, text);
        
        let randomUrl = indexUrl.slice(0,indexUrl.lastIndexOf("/"))+"/" + Math.random().toString(36).substring(2, 15)+"/";
    
        let asdf = true;
        while(await checkExist(randomUrl, session.fetch)){
          asdf =await checkExist(randomUrl, session.fetch);
          randomUrl = indexUrl.slice(0,indexUrl.lastIndexOf("/"))+"/" + Math.random().toString(36).substring(2, 15)+"/";
        }
        await getOrCreateTodoList(randomUrl, session.fetch);

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
    

    return(
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
                rightSection={<Button className="add-button" type="submit">Create TodoList</Button>}
                rightSectionWidth={130}
              />
          </form>
          </CombinedDataProvider>) : null}
          </div>
    )

}

export default AddList;