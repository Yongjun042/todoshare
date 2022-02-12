import {
  addStringNoLocale,
  addUrl,
  createSolidDataset,
  createThing,
  getSolidDataset,
  getThing,
  getUrlAll,
  saveSolidDatasetAt,
  setThing,
} from "@inrupt/solid-client";
import { SCHEMA_INRUPT } from "@inrupt/vocab-common-rdf";
import { space } from "rdf-namespaces";

/**
 * 
 * @param session Solid session
 * @returns Uri of the container of the todo list
 */
export async function getOrCreateTodoStorageUri(session: any) {
  let profileDataset = await getSolidDataset(session.info.webId!, {
    fetch: session.fetch,
  });
  const STORAGE_PREDICATE = space.storage;
  //Thing that have the storage predicate and Uri of storage
  // Sudo thing
  const pTodo = session.info.webId.split("#")[0] + "#pTodo";
  const pTodoThing = getThing(profileDataset, pTodo);
  //get the storage uri or create a new one if not exist
  if (pTodoThing) {
    const pTodoUrl = getUrlAll(pTodoThing, STORAGE_PREDICATE);
    return pTodoUrl[0];
  } else {
    const profileThing = getThing(profileDataset, session.info.webId!);
    const podsUrls = getUrlAll(profileThing!, STORAGE_PREDICATE);
    const pod = podsUrls[0];
    const containerUri = `${pod}todos/`;

    let todoLocation = createThing({ name: "pTodo" });
    todoLocation = addUrl(todoLocation, STORAGE_PREDICATE, containerUri);
    todoLocation = addStringNoLocale(
      todoLocation,
      SCHEMA_INRUPT.name,
      "pTodoUrl"
    );
    profileDataset = setThing(profileDataset, todoLocation);
    await saveSolidDatasetAt(session.info.webId!, profileDataset, {
      fetch: session.fetch,
    });
    return containerUri;
  }
}

/**
 * 
 * @param containerUri Uri of the container of the todo list
 * @param fetch Solid session
 * @returns Dataset
 */
export async function getOrCreateDataset(
  containerUri: string | URL,
  fetch: any
) {
  const indexUrl = `${containerUri}index.ttl`;
  try {
    const todoList = await getSolidDataset(indexUrl, { fetch });
    return todoList;
  } catch (error: any) {
    if (error.statusCode === 404) {
      const todoList = await saveSolidDatasetAt(
        indexUrl,
        createSolidDataset(),
        {
          fetch,
        }
      );
      return todoList;
    }
  }
}

/**
 * 
 * @param containerUri Uri of the container of solid storage
 * @param fetch Solid session
 * @returns that Uri exist
 */
export async function checkExist(
  containerUri: string | URL,
  fetch: any
) {
  const indexUrl = `${containerUri}index.ttl`;
  try {
    await getSolidDataset(indexUrl, { fetch });
    return true;
  } catch (error: any) {
    if (error.statusCode === 404) {
      return false;
    }
    return false;
  }
}
