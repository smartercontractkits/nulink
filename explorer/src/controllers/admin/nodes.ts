import { validate } from 'class-validator'
import { Router } from 'express'
import httpStatus from 'http-status-codes'
import { Connection, getCustomRepository } from 'typeorm'
import { getDb } from '../../database'
import {
  buildNuLinkNode,
  NuLinkNode,
  jobCountReport,
  uptime as nodeUptime,
} from '../../entity/NuLinkNode'
import { NuLinkNodeRepository } from '../../repositories/NuLinkNodeRepository'
import nulinkNodeShowSerializer from '../../serializers/nulinkNodeShowSerializer'
import nulinkNodesSerializer from '../../serializers/nulinkNodesSerializer'
import { PostgresErrorCode } from '../../utils/constants'
import { isPostgresError } from '../../utils/errors'
import { parseParams } from '../../utils/pagination'

const router = Router()

router.get('/nodes', async (req, res) => {
  const params = parseParams(req.query)
  const db = await getDb()
  const nulinkNodeRepository = getCustomRepository(
    NuLinkNodeRepository,
    db.name,
  )
  const nulinkNodes = await nulinkNodeRepository.all(params)
  const nodeCount = await nulinkNodeRepository.count()
  const json = nulinkNodesSerializer(nulinkNodes, nodeCount)

  return res.send(json)
})

router.post('/nodes', async (req, res) => {
  const name = req.body.name
  const url = req.body.url
  const db = await getDb()
  const [node, secret] = buildNuLinkNode(name, url)
  const errors = await validate(node)

  if (errors.length === 0) {
    try {
      const savedNode = await db.manager.save(node)

      return res.status(httpStatus.CREATED).json({
        id: savedNode.id,
        accessKey: savedNode.accessKey,
        secret,
      })
    } catch (e) {
      if (
        isPostgresError(e) &&
        e.code === PostgresErrorCode.UNIQUE_CONSTRAINT_VIOLATION
      ) {
        return res.sendStatus(httpStatus.CONFLICT)
      }

      console.error(e)
      return res.sendStatus(httpStatus.BAD_REQUEST)
    }
  }

  const jsonApiErrors = errors.reduce(
    (acc, e) => ({ ...acc, [e.property]: e.constraints }),
    {},
  )

  return res
    .status(httpStatus.UNPROCESSABLE_ENTITY)
    .send({ errors: jsonApiErrors })
})

router.get('/nodes/:id', async (req, res) => {
  const { id } = req.params
  const db = await getDb()
  const node = await db.getRepository(NuLinkNode).findOne(id)
  const uptime = await nodeUptime(db, node)
  const jobCounts = await jobCountReport(db, node)

  const data = {
    id: node.id,
    name: node.name,
    url: node.url,
    createdAt: node.createdAt,
    jobCounts,
    uptime,
  }

  const json = nulinkNodeShowSerializer(data)
  return res.send(json)
})

router.delete('/nodes/:name', async (req, res) => {
  const db: Connection = await getDb()

  await db.getRepository(NuLinkNode).delete({ name: req.params.name })

  return res.sendStatus(httpStatus.OK)
})

export default router
