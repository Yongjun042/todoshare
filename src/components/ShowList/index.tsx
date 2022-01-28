import {
    useSession,
    CombinedDataProvider,
    Text,
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
  deleteSolidDataset,
  getSolidDataset,
  asUrl,
  Url,
  UrlString,
  deleteContainer,
  deleteFile,
} from "@inrupt/solid-client";
import {
  Table,
  TableColumn,
  useThing,
} from "@inrupt/solid-ui-react";
import{cal, rdf, space}from 'rdf-namespaces';
import { TextInput, Button } from "@mantine/core";
import "./index.scss";
import { checkExist } from "../../utils";
import { createIndexedAccessTypeNode } from "typescript";

const TEXT_PREDICATE = "http://schema.org/text";
const TODO_CLASS = cal.Vtodo;
const TYPE_PREDICATE = rdf.type;
const STORAGE_PREDICATE = space.storage;

interface listProps{
  list: SolidDataset & WithServerResourceInfo;
  setList: React.Dispatch<React.SetStateAction<SolidDataset & WithServerResourceInfo>>;
  todoList: SolidDataset & WithServerResourceInfo | null;
  setTodoList: React.Dispatch<React.SetStateAction<SolidDataset & WithServerResourceInfo|null>>;
}



function ShowList({list, setList,todoList, setTodoList}:listProps){
    const { fetch } = useSession();

  const listThings = list ? getThingAll(list) : [];

  function DeleteButton({ deleteTodo, urlt }: { deleteTodo: (todo: Thing) => void, urlt: UrlString }) {
    const {thing} = useThing(getSourceUrl(list),urlt);
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

  const deleteTodo = async (todo: Thing) => {
    const todosUrl = getSourceUrl(list);
    const updatedTodos = removeThing(list, todo);
    const storageUrl =getUrl(todo,STORAGE_PREDICATE);
    await deleteFile(storageUrl! + "index.ttl", {fetch: fetch});
    //await deleteContainer(storageUrl!, {fetch: fetch});
    await deleteSolidDataset(storageUrl!, {fetch});
    const updatedDataset = await saveSolidDatasetAt(todosUrl, updatedTodos, {
      fetch,
    });
    if(!todoList &&(getSourceUrl(todoList!) === storageUrl+ "index.ttl")){
      setTodoList(null);
    }
    setList(updatedDataset);
  };

  const selectTodo = async (todo: Thing) => {
    const storageUrl =getUrl(todo,STORAGE_PREDICATE);
    if(storageUrl)
    {
      const dataset= await getSolidDataset(storageUrl!+"index.ttl",{fetch});
      setTodoList(dataset);
    }
  };
  
  const thingsArray = listThings
  .filter((t) => getUrl(t, TYPE_PREDICATE) === STORAGE_PREDICATE)
  .map((t) => {
    return { dataset: list, thing: t };
  });
if (!thingsArray.length) return null;

  return(
      <ul>
          {thingsArray.map((thing) => (<li><div onClick = {()=>selectTodo(thing.thing)}><Text solidDataset={list} thing={thing.thing} property={TEXT_PREDICATE}/></div>
          <DeleteButton deleteTodo={deleteTodo} urlt = {asUrl(thing.thing)} /></li>))}
      </ul>
  )
}

export default ShowList;