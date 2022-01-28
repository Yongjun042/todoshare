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

export async function getOrCreateTodoStorageUri(session: any) {
  let profileDataset = await getSolidDataset(session.info.webId!, {
    fetch: session.fetch,
  });
  const STORAGE_PREDICATE = space.storage;
  const pTodo = session.info.webId.split("#")[0] + "#pTodo";
  const pTodoThing = getThing(profileDataset, pTodo);
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

export async function getOrCreateTodoList(
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


export async function checkExist(
  containerUri: string | URL,
  fetch: any
) {
  const indexUrl = `${containerUri}index.ttl`;
  try {
    const temp =await getSolidDataset(indexUrl, { fetch });
    return true;
  } catch (error: any) {
    if (error.statusCode === 404) {
      return false;
    }
    return false;
  }
}
