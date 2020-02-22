import { Connection } from 'typeorm'
import { NuLinkNode, hashCredentials } from './entity/NuLinkNode'
import { createSession, Session } from './entity/Session'
import { timingSafeEqual } from 'crypto'

// authenticate looks up a nulink node by accessKey and attempts to verify the
// provided secret, if verification succeeds a Session is returned
export const authenticate = async (
  db: Connection,
  accessKey: string,
  secret: string,
): Promise<Session | null> => {
  return db.manager.transaction(async () => {
    const nulinkNode = await findNode(db, accessKey)
    if (nulinkNode != null) {
      if (authenticateSession(accessKey, secret, nulinkNode)) {
        return createSession(db, nulinkNode)
      }
    }

    return null
  })
}

function findNode(db: Connection, accessKey: string): Promise<NuLinkNode> {
  return db.getRepository(NuLinkNode).findOne({ accessKey })
}

function authenticateSession(
  accessKey: string,
  secret: string,
  node: NuLinkNode,
): boolean {
  const hash = hashCredentials(accessKey, secret, node.salt)
  return timingSafeEqual(Buffer.from(hash), Buffer.from(node.hashedSecret))
}
