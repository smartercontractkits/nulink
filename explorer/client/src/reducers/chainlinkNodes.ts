import { Actions } from './actions'
import { Reducer } from 'redux'
import { NuLinkNode } from 'explorer/models'

export interface State {
  items?: Record<number, NuLinkNode>
}

const INITIAL_STATE: State = { items: undefined }

export const nulinkNodesReducer: Reducer<State, Actions> = (
  state = INITIAL_STATE,
  action,
) => {
  switch (action.type) {
    case 'FETCH_JOB_RUNS_SUCCEEDED':
      return { items: { ...action.data.nulinkNodes } }
    case 'FETCH_JOB_RUN_SUCCEEDED':
      return { items: { ...action.data.nulinkNodes } }
    default:
      return state
  }
}

export default nulinkNodesReducer
