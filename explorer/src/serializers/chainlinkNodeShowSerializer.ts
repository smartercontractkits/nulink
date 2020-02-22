import {
  Serializer as JSONAPISerializer,
  SerializerOptions,
} from 'jsonapi-serializer'
import { JobCountReport } from '../entity/NuLinkNode'

export const ATTRIBUTES: Array<string> = [
  'id',
  'name',
  'url',
  'createdAt',
  'jobCounts',
  'uptime',
]

interface NuLinkNodeShowData {
  id: number
  name: string
  url?: string
  createdAt: Date
  jobCounts: JobCountReport
  uptime: number
}

const nulinkNodeShowSerializer = (data: NuLinkNodeShowData) => {
  const opts = {
    attributes: ATTRIBUTES,
    keyForAttribute: 'camelCase',
    meta: {},
  } as SerializerOptions

  return new JSONAPISerializer('nulink_nodes', opts).serialize(data)
}

export default nulinkNodeShowSerializer
