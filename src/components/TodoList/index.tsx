import {
  addDatetime,
  getDatetime,
  getSourceUrl,
  getThingAll,
  getUrl,
  removeDatetime,
  removeThing,
  saveSolidDatasetAt,
  setThing,
  SolidDataset,
  WithServerResourceInfo,
  Thing,
} from "@inrupt/solid-client";
import {
  Table,
  TableColumn,
  useThing,
  useSession,
} from "@inrupt/solid-ui-react";
import { cal, rdf } from "rdf-namespaces";
import React from "react";
import "./index.scss";
import { Text, Checkbox, Button } from "@mantine/core";

const TEXT_PREDICATE = "http://schema.org/text";
const CREATED_PREDICATE = cal.created;
const COMPLETED_PREDICATE = cal.completed;
const TODO_CLASS = cal.Vtodo;
const TYPE_PREDICATE = rdf.type;

interface todoListProps {
  todoList: SolidDataset & WithServerResourceInfo;
  setTodoList: React.Dispatch<
    React.SetStateAction<SolidDataset & WithServerResourceInfo>
  >;
}

interface dateBind {
  value: Date;
}

function CompletedBody({
  checked,
  handleCheck,
}: {
  checked: boolean;
  handleCheck: (thing: Thing, checked: boolean) => void;
}) {
  const { thing } = useThing();
  return (
    <Checkbox
      checked={checked}
      style={{ textAlign: "center", display: "flex", justifyContent: "center", width: "auto" }}
      onChange={() => handleCheck(thing as Thing, checked)}
    />
  );
}

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

function TodoList({ todoList, setTodoList }: todoListProps) {
  const todoThings = todoList ? getThingAll(todoList) : [];
  // todoThings.sort((a: Thing, b: Thing): number => {
  //   if (
  //     (getDatetime(a, COMPLETED_PREDICATE) !== null) && (getDatetime(b, COMPLETED_PREDICATE) === null))
  //    {
  //     return 1;
  //   }
  //   if (
  //     (getDatetime(a, COMPLETED_PREDICATE) === null) && (getDatetime(b, COMPLETED_PREDICATE)  !== null))
  //    {
  //     return -1;
  //   }
  //   if (
  //     getDatetime(a, CREATED_PREDICATE)! > getDatetime(b, CREATED_PREDICATE)!
  //   ) {
  //     return -1;
  //   }
  //   if (
  //     getDatetime(a, CREATED_PREDICATE)! < getDatetime(b, CREATED_PREDICATE)!
  //   ) {
  //     return 1;
  //   }
  //   return 0;
  // });

  const { fetch } = useSession();

  const handleCheck = async (todo: Thing, checked: boolean) => {
    const todosUrl = getSourceUrl(todoList);
    let updatedTodos;
    if (!checked) {
      const date = new Date();
      const doneTodo = addDatetime(todo, COMPLETED_PREDICATE, date);
      updatedTodos = setThing(todoList, doneTodo);
    } else {
      const date = getDatetime(todo, COMPLETED_PREDICATE);
      const undoneTodo = removeDatetime(todo, COMPLETED_PREDICATE, date!);
      updatedTodos = setThing(todoList, undoneTodo);
    }
    const updatedList = await saveSolidDatasetAt(todosUrl, updatedTodos, {
      fetch,
    });
    setTodoList(updatedList);
  };

  const deleteTodo = async (todo: Thing) => {
    const todosUrl = getSourceUrl(todoList);
    const updatedTodos = removeThing(todoList, todo);
    const updatedDataset = await saveSolidDatasetAt(todosUrl, updatedTodos, {
      fetch,
    });
    setTodoList(updatedDataset);
  };

  const thingsArray = todoThings
    .filter((t) => getUrl(t, TYPE_PREDICATE) === TODO_CLASS)
    .map((t) => {
      return { dataset: todoList, thing: t };
    });
  if (!thingsArray.length) return null;

  return (
    <div className="table-container">
      <span className="tasks-message">
        Your to-do list has {thingsArray.length} items
      </span>
      <Table className="table" things={thingsArray}>
        <TableColumn property={TEXT_PREDICATE} header="To Do" sortable />
        <TableColumn
          property={CREATED_PREDICATE}
          dataType="datetime"
          header="Created At"
          body={({ value }: dateBind) => <Text>{value.toDateString()}</Text>}
          sortable
        />
        <TableColumn
          property={COMPLETED_PREDICATE}
          dataType="datetime"
          header="Done"
          body={({ value }: dateBind) => (
            <CompletedBody checked={Boolean(value)} handleCheck={handleCheck} />
          )}
          sortable
        />
        <TableColumn
          property={TEXT_PREDICATE}
          header=""
          body={() => <DeleteButton deleteTodo={deleteTodo} />}
          
        />
      </Table>
    </div>
  );
}

export default TodoList;
