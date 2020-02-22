import { Connection } from 'typeorm'
import {
  NuLinkNode,
  createNuLinkNode,
  deleteNuLinkNode,
  hashCredentials,
  uptime,
} from '../../entity/NuLinkNode'
import { createSession, closeSession } from '../../entity/Session'
import { closeDbConnection, getDb } from '../../database'

async function wait(sec: number) {
  return new Promise(res => {
    setTimeout(() => {
      res()
    }, sec * 1000)
  })
}

let db: Connection

beforeAll(async () => {
  db = await getDb()
})

afterAll(async () => closeDbConnection())

describe('createNuLinkNode', () => {
  it('returns a valid NuLinkNode record', async () => {
    const [nulinkNode, secret] = await createNuLinkNode(
      db,
      'new-valid-nulink-node-record',
    )
    expect(nulinkNode.accessKey).toHaveLength(16)
    expect(nulinkNode.salt).toHaveLength(32)
    expect(nulinkNode.hashedSecret).toBeDefined()
    expect(secret).toHaveLength(64)
  })

  it('reject duplicate NuLinkNode names', async () => {
    await createNuLinkNode(db, 'identical')
    await expect(createNuLinkNode(db, 'identical')).rejects.toThrow()
  })
})

describe('deleteNuLinkNode', () => {
  it('deletes a NuLinkNode with the specified name', async () => {
    await createNuLinkNode(db, 'nulink-node-to-be-deleted')
    let count = await db.manager.count(NuLinkNode)
    expect(count).toBe(1)
    await deleteNuLinkNode(db, 'nulink-node-to-be-deleted')
    count = await db.manager.count(NuLinkNode)
    expect(count).toBe(0)
  })
})

describe('hashCredentials', () => {
  it('returns a sha256 signature', () => {
    expect(hashCredentials('a', 'b', 'c')).toHaveLength(64)
  })
})

describe('uptime', () => {
  it('returns 0 when no sessions exist', async () => {
    const [node] = await createNuLinkNode(db, 'nulink-node')
    const initialUptime = await uptime(db, node)
    expect(initialUptime).toEqual(0)
  })

  it('calculates uptime based on open and closed sessions', async () => {
    const [node] = await createNuLinkNode(db, 'nulink-node')
    const session = await createSession(db, node)
    await wait(1)
    await closeSession(db, session)
    const uptime1 = await uptime(db, node)
    expect(uptime1).toBeGreaterThan(0)
    expect(uptime1).toBeLessThan(3)
    await createSession(db, node)
    await wait(1)
    const uptime2 = await uptime(db, node)
    expect(uptime2).toBeGreaterThan(uptime1)
    expect(uptime2).toBeLessThan(4)
  })
})
