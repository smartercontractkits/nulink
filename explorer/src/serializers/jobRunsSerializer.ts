import {
  Serializer as JSONAPISerializer,
  SerializerOptions,
} from 'jsonapi-serializer'
import { JobRun } from '../entity/JobRun'
import { BASE_ATTRIBUTES, nulinkNode } from './jobRunSerializer'

const jobRunsSerializer = (runs: JobRun[], runCount: number) => {
  const opts = {
    attributes: BASE_ATTRIBUTES,
    nulinkNode,
    keyForAttribute: 'camelCase',
    meta: { count: runCount },
  } as SerializerOptions

  return new JSONAPISerializer('job_runs', opts).serialize(runs)
}

export default jobRunsSerializer
