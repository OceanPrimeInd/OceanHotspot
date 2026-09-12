"use client";

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import {
  loadProfileList,
  saveProfileList,
  type ProfileListColumn,
} from "@/lib/profileBuyerLists";

type UseProfileListSyncOptions<T> = {
  userId: string | undefined;
  column: ProfileListColumn;
  items: T[];
  setItems: Dispatch<SetStateAction<T[]>>;
  storageReady: boolean;
  merge: (local: T[], remote: T[]) => T[];
};

/**
 * On login: load cloud list, merge with local, then debounce saves on change.
 */
export function useProfileListSync<T>({
  userId,
  column,
  items,
  setItems,
  storageReady,
  merge,
}: UseProfileListSyncOptions<T>) {
  const [cloudSyncReady, setCloudSyncReady] = useState(false);
  const mergeStartedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    mergeStartedRef.current = false;
    setCloudSyncReady(false);
  }, [userId]);

  useEffect(() => {
    if (!storageReady || !userId || mergeStartedRef.current) return;

    mergeStartedRef.current = true;
    let cancelled = false;

    (async () => {
      const remote = await loadProfileList<T>(userId, column);
      if (cancelled) return;

      setItems((local) => merge(local, remote));
      setCloudSyncReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [storageReady, userId, column, merge, setItems]);

  useEffect(() => {
    if (!storageReady || !userId || !cloudSyncReady) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      void saveProfileList(userId, column, items);
    }, 500);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [items, userId, column, storageReady, cloudSyncReady]);
}
