import useSWRSubscription from "swr/subscription";
import { pb } from "../Login";
import useSWR from "swr";

export type RecordBase = {
  id?: string;
  created?: Date;
  updated?: Date;
};

export type RecordLocation = [string, string?];

export async function pbFetcher<T extends RecordBase>(
  location: RecordLocation
) {
  const [collection, id] = location;

  if (id === undefined) {
    return undefined;
  }

  return pb.collection(collection).getOne<T>(id);
}

export async function pbFetcherMany<T extends RecordBase>(collection: string) {
  return pb.collection(collection).getFullList<T>();
}

function pbSubscribe<T extends RecordBase>(
  location: RecordLocation,
  { next }: { next: (error: any, data: T) => void }
) {
  const [collection, id] = location;

  pb.collection(collection).getOne<T>(id ?? "").then((res) => {
    next(null, res);
  });

  pb.collection(collection).subscribe<T>(id ?? "", (res) => {
    next(null, res.record);
  });

  return () => pb.collection(collection).unsubscribe(id);
}

function pbSubscribeMany<T extends RecordBase>(
  collection: string,
  { next }: { next: (error: any, data: T[] | ((prev: T[] | undefined) => T[])) => void }
) {
  pb.collection(collection).getFullList<T>().then((res) => {
    next(null, res);
  });

  pb.collection(collection).subscribe<T>("*", (res) => {
    if (res.action === "delete") {
      next(null, (prev) => (prev ?? []).filter(item => item.id !== res.record.id));
    } else if (res.action === "update") {
      next(null, (prev) => (prev ?? []).map(item => item.id === res.record.id ? res.record : item));
    } else if (res.action === "create") {
      next(null, (prev) => (prev ?? []).concat(res.record));
    }
  });

  return () => pb.collection(collection).unsubscribe();
}

export function usePbRecord<T extends RecordBase>(collection: string, id: string | null) {
  // @ts-ignore
  const { data, error } = useSWRSubscription<T, any, RecordLocation>([collection, id ?? undefined], pbSubscribe);

  const updateRecord = async (record: Partial<T>) => {
    if (!id) {
      throw new Error("Record must have an ID to be updated");
    }

    const newRecord = await pb.collection(collection).update(id, { ...record, user: pb.authStore.model!.id });
    return newRecord;
  }

  return [data, updateRecord] as const;
}

export function usePbRecords<T extends RecordBase>(collection: string) {
  const { data, error } = useSWRSubscription<T[], any>(collection, pbSubscribeMany<T>);

  const createRecord = async (record: T) => {
    const newRecord = await pb.collection(collection).create({ ...record, user: pb.authStore.model!.id });
    return newRecord;
  }

  const updateRecord = async (record: T) => {
    const id = record.id;
    if (!id) {
      throw new Error("Record must have an ID to be updated");
    }

    const newRecord = await pb.collection(collection).update(id, { ...record, user: pb.authStore.model!.id });
    return newRecord;
  }

  return [data, createRecord, updateRecord] as const;
}


