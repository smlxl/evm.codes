// import React from 'react'
import { useCallback, useReducer } from 'react'

export type GenericReducerState = {
  [key: string]: GenericReducerState
}

export type GenericReducerAction = {
  [key: string]:
    | GenericReducerAction
    | ((state: any, action: any, key: string, root: any) => GenericReducerState)
    | object
    | any
}

export function genericReducer(
  root: GenericReducerState,
  action: GenericReducerAction,
  state: GenericReducerState | undefined = undefined,
): GenericReducerState {
  if (state === undefined) {
    // optimization: reducer compares state by ref and will not update simple `return state`
    // it requires to clone via `{ ...state }` but only need to clone the root state once
    // the rest will be modified in-place
    state = { ...root }
  }

  for (const key in action) {
    const value = action[key]
    if (typeof value == 'function') {
      // this function must mutate state directly
      // (for example to allow deleting values from state or modifying multiple props)
      value(state, action, key, root)
    } else if (typeof value == 'object' && !Array.isArray(value)) {
      state[key] = genericReducer(
        root,
        value,
        // TODO: what to do if state[key] is not an object?
        (state[key] || {}) as GenericReducerState,
      )
    } else {
      state[key] = value
    }
  }

  return state
}

export function convertShortpath(action: GenericReducerAction) {
  const newAction: GenericReducerAction = {}
  for (const key in action) {
    const parts = key.split('.')
    let obj = action[key]
    while (parts.length > 1) {
      const part = parts.pop() as string
      obj = { [part]: obj }
    }

    newAction[parts.pop() as string] = obj
  }

  return newAction
}

// export function setReducerProp(dispatcher, key, value) {
//   const action = convertShortpath({ [key]: value })
//   dispatcher(action)
// }

// export function useReducerProp(
//   reducer: ReturnType<typeof useReducer>,
//   key: string,
//   defaultValue = {},
// ) {
//   // ensure key is string
//   key = key.toString()

//   const [state, dispatch] = reducer
//   let innerState = state
//   for (const part of key.split('.')) {
//     if (!innerState) {
//       break
//     }

//     innerState = innerState[part]
//   }

//   if (!innerState) {
//     innerState = defaultValue
//   }

//   // console.log('inner state', state, innerState, key)

//   return [
//     innerState,
//     useCallback(
//       (action: GenericReducerAction) => {
//         const newAction = convertShortpath({ [key]: action })
//         return dispatch(newAction)
//       },
//       [state, dispatch],
//     ),
//   ]
// }

export default function useGenericReducer<T>(
  initState: any,
  shortpath: boolean,
): [T, (action: GenericReducerAction) => void] {
  const reducer = useReducer(genericReducer, initState)
  const [state, dispatch] = reducer
  if (!shortpath) {
    return [state as T, dispatch]
  }

  return [
    state as T,
    (action: GenericReducerAction) => {
      const newAction = convertShortpath(action)
      // console.log('old action', action, 'new action', newAction)
      return dispatch(newAction)
    },
  ]
}
