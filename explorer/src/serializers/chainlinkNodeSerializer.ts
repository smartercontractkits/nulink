import {
  Serializer as JSONAPISerializer,
  SerializerOptions,
} from 'jsonapi-serializer'
import { NuLinkNode } from '../entity/NuLinkNode'

export const BASE_ATTRIBUTES: Array<string> = ['id', 'name', 'url', 'createdAt']

const nulinkNodeSerializer = (nulinkNode: NuLinkNode) => {
  const opts = {
    attributes: BASE_ATTRIBUTES,
    keyForAttribute: 'camelCase',
    meta: {},
  } as SerializerOptions

  return new JSONAPISerializer('nulink_nodes', opts).serialize(nulinkNode)
}

export default nulinkNodeSerializer
