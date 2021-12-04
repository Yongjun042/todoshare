// components/AddTodo/index.jsx

import {
  addDatetime,
  addStringNoLocale,
  createThing,
  getSourceUrl,
  saveSolidDatasetAt,
  setThing,
  addUrl,
  SolidDataset ,
  WithServerResourceInfo,
} from "@inrupt/solid-client";
import{cal, rdf}from 'rdf-namespaces';
import { useSession } from "@inrupt/solid-ui-react";
import React, { useState } from "react";

const TEXT_PREDICATE = "http://schema.org/text";
const CREATED_PREDICATE = cal.created;
const TODO_CLASS = cal.Vtodo;
const TYPE_PREDICATE = rdf.type;

interface todoListProps{
  todoList: SolidDataset & WithServerResourceInfo;
  setTodoList: React.Dispatch<React.SetStateAction<SolidDataset & WithServerResourceInfo>>;
}

function AddTodo( {todoList, setTodoList}: todoListProps) {
  const { session } = useSession();
  const [todoText, setTodoText] = useState("");

  const addTodo = async (text:string) => {
    const indexUrl = getSourceUrl(todoList);
    const todoWithText = addStringNoLocale(createThing(), TEXT_PREDICATE, text);
    const todoWithDate = addDatetime(
      todoWithText,
      CREATED_PREDICATE,
      new Date()
    );
    const todoWithType = addUrl(todoWithDate, TYPE_PREDICATE, TODO_CLASS);
    const updatedTodoList = setThing(todoList, todoWithType);
    const updatedDataset = await saveSolidDatasetAt(indexUrl, updatedTodoList, {
      fetch: session.fetch,
    });
    setTodoList(updatedDataset);
  };

  const handleSubmit =  async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addTodo(todoText);
    setTodoText("");
  };

  const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    setTodoText(e.target.value);
  };

  return (
      <form className="todo-form" onSubmit={handleSubmit}>
        <label htmlFor="todo-input">
          <input
            id="todo-input"
            type="text"
            value={todoText}
            onChange={handleChange}
          />
        </label>
        <button className="add-button" type="submit">Add Todo</button>
      </form>
  );
}

export default AddTodo;