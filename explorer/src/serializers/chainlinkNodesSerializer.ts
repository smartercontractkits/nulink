import {
  Serializer as JSONAPISerializer,
  SerializerOptions,
} from 'jsonapi-serializer'
import { NuLinkNode } from '../entity/NuLinkNode'
import { BASE_ATTRIBUTES } from './nulinkNodeSerializer'

const nulinkNodesSerializer = (
  nulinkNodes: NuLinkNode[],
  count: number,
) => {
  const opts = {
    attributes: BASE_ATTRIBUTES,
    keyForAttribute: 'camelCase',
    meta: { count },
  } as SerializerOptions

  return new JSONAPISerializer('nulink_nodes', opts).serialize(
    nulinkNodes,
  )
}

export default nulinkNodesSerializer
