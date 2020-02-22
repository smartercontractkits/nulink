import { authenticate } from '../sessions'
import { Connection } from 'typeorm'
import { closeDbConnection, getDb } from '../database'
import { createNuLinkNode } from '../entity/NuLinkNode'
import { Session } from '../entity/Session'

describe('sessions', () => {
  let db: Connection
  beforeAll(async () => {
    db = await getDb()
  })
  afterAll(async () => {
    await closeDbConnection()
  })

  describe('authenticate', () => {
    it('creates a session record', async () => {
      const [nulinkNode, secret] = await createNuLinkNode(
        db,
        'valid-nulink-node',
      )
      const session = await authenticate(db, nulinkNode.accessKey, secret)
      expect(session).toBeDefined()
      expect(session.nulinkNodeId).toEqual(nulinkNode.id)

      let foundSession = await db.manager.findOne(Session)
      expect(foundSession.nulinkNodeId).toEqual(nulinkNode.id)
      expect(foundSession.finishedAt).toBeNull()

      await authenticate(db, nulinkNode.accessKey, secret)
      foundSession = await db.manager.findOne(Session, foundSession.id)
      expect(foundSession.finishedAt).toBeDefined()
    })

    it('returns null if no nulink node exists', async () => {
      const result = await authenticate(db, '', '')
      expect(result).toBeNull()
    })

    it('returns null if the secret is incorrect', async () => {
      const [nulinkNode] = await createNuLinkNode(
        db,
        'invalid-nulink-node',
      )
      const result = await authenticate(
        db,
        nulinkNode.accessKey,
        'wrong-secret',
      )
      expect(result).toBeNull()
    })
  })
})
