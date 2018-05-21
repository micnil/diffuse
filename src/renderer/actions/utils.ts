import { ActionCreatorsMapObject } from 'redux';

export interface Action<T extends string> {
	type: T;
}

export interface ActionWithPayload<T extends string, P> extends Action<T> {
	payload: P;
}
export function createAction<T extends string>(type: T): Action<T>;
export function createAction<T extends string, P>(type: T, payload: P): ActionWithPayload<T, P>;
export function createAction<T extends string, P>(type: T, payload?: P) {
	return payload ? {type, payload} : { type };
}

export type ActionsUnion<A extends ActionCreatorsMapObject> = ReturnType<A[keyof A]>;
