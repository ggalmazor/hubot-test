type AnyRest = [...args: any[]];
type DefaultEventMap = [never];
export type EventMap<T> = Record<keyof T, any[]> | DefaultEventMap;
export type Args<K, T> = T extends DefaultEventMap ? AnyRest : (
  K extends keyof T ? T[K] : never
  );
export type Key<K, T> = T extends DefaultEventMap ? string | symbol : K | keyof T;