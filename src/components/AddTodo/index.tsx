// components/AddTodo/index.jsx

import {
  addDatetime,
  addStringNoLocale,
  createThing,
  getSourceUrl,
  saveSolidDatasetAt,
  setThing,
  addUrl,
} from "@inrupt/solid-client";
import { cal, rdf } from "rdf-namespaces";
import { useSession } from "@inrupt/solid-ui-react";
import React, { useState } from "react";
import { TextInput, Button } from "@mantine/core";
import { SolidDataWithServer } from "../../types";
import "./index.scss";

const TEXT_PREDICATE = "http://schema.org/text";
const CREATED_PREDICATE = cal.created;
const TODO_CLASS = cal.Vtodo;
const TYPE_PREDICATE = rdf.type;

interface todoListProps {
  todoList: SolidDataWithServer;
  setTodoList: React.Dispatch<React.SetStateAction<SolidDataWithServer>>;
}

/**
 * 
 * @param todoList Dataset of todolist
 * @param setTodoList setter of todolist
 * @returns 
 */
function AddTodo({ todoList, setTodoList }: todoListProps) {
  const { session } = useSession();
  const [todoText, setTodoText] = useState("");
  //deactivate the button if todo is null
  let isTodoNull = false;
  if (todoList === null) {
    isTodoNull = true;
  } else {
    isTodoNull = false;
  }

  /**
   * create todo Thing
   * @param text text of todo
   */
  const addTodo = async (text: string) => {
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addTodo(todoText);
    setTodoText("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    setTodoText(e.target.value);
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <TextInput
        id="todo-input"
        type="text"
        label="Todo is..."
        value={todoText}
        onChange={handleChange}
        rightSection={
          <Button className="add-button" type="submit" disabled={isTodoNull}>
            Add Todo
          </Button>
        }
        rightSectionWidth={100}
      />
    </form>
  );
}

export default AddTodo;
