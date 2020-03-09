import { MinLength } from 'class-validator'
import { randomBytes } from 'crypto'
import { sha256 } from 'js-sha256'
import {
  Column,
  Connection,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm'
import { JobRun } from './JobRun'
import { Session } from './Session'

export interface NuLinkNodePresenter {
  id: number
  name: string
}

@Entity()
@Unique(['name'])
export class NuLinkNode {
  public static build({
    name,
    url,
    secret,
  }: {
    name: string
    url?: string
    secret: string
  }): NuLinkNode {
    const cl = new NuLinkNode()
    cl.name = name
    cl.url = url
    cl.accessKey = generateRandomString(16)
    cl.salt = generateRandomString(32)
    cl.hashedSecret = hashCredentials(cl.accessKey, secret, cl.salt)
    return cl
  }

  @PrimaryGeneratedColumn()
  id: number

  @MinLength(3, { message: 'must be at least 3 characters' })
  @Column()
  name: string

  @Column({ nullable: true })
  url: string

  @Column()
  accessKey: string

  @Column()
  hashedSecret: string

  @Column()
  salt: string

  @Column()
  createdAt: Date

  @OneToMany(
    () => JobRun,
    jobRun => jobRun.nulinkNode,
    {
      onDelete: 'CASCADE',
    },
  )
  jobRuns: JobRun[]

  public present(): NuLinkNodePresenter {
    return {
      id: this.id,
      name: this.name,
    }
  }
}

function generateRandomString(size: number): string {
  return randomBytes(size)
    .toString('base64')
    .replace(/[/+=]/g, '')
    .substring(0, size)
}

export const buildNuLinkNode = (
  name: string,
  url?: string,
): [NuLinkNode, string] => {
  const secret = generateRandomString(64)
  const node = NuLinkNode.build({ name, url, secret })

  return [node, secret]
}

export const createNuLinkNode = async (
  db: Connection,
  name: string,
  url?: string,
): Promise<[NuLinkNode, string]> => {
  const secret = generateRandomString(64)
  const nulinkNode = NuLinkNode.build({ name, url, secret })
  return [await db.manager.save(nulinkNode), secret]
}

export const deleteNuLinkNode = async (db: Connection, name: string) => {
  return db.manager
    .createQueryBuilder()
    .delete()
    .from(NuLinkNode)
    .where('name = :name', {
      name,
    })
    .execute()
}

export function hashCredentials(
  accessKey: string,
  secret: string,
  salt: string,
): string {
  return sha256(`v0-${accessKey}-${secret}-${salt}`)
}

export async function find(db: Connection, id: number): Promise<NuLinkNode> {
  return db.getRepository(NuLinkNode).findOne({ id })
}

export interface JobCountReport {
  completed: number
  errored: number
  in_progress: number
  total: number
}

export async function jobCountReport(
  db: Connection,
  node: NuLinkNode | number,
): Promise<JobCountReport> {
  const id = node instanceof NuLinkNode ? node.id : node

  const initialReport: JobCountReport = {
    completed: 0,
    errored: 0,
    in_progress: 0, // eslint-disable-line
    total: 0,
  }

  const jobCountQueryResult = await db
    .getRepository(JobRun)
    .createQueryBuilder()
    .select('COUNT(*), status')
    .where({ nulinkNodeId: id })
    .groupBy('status')
    .getRawMany()

  const report = jobCountQueryResult.reduce((result, { count, status }) => {
    result[status] = parseInt(count)
    result.total = result.total + result[status]
    return result
  }, initialReport)

  return report
}

// calculating uptime by diffing createdAt and finishedAt columns
// using strategy described here: http://www.sqlines.com/postgresql/how-to/datediff
// typeORM missing UNION function, so must do in two separate queries or write entire
// query in raw SQL
export async function uptime(db: Connection, node: NuLinkNode | number) {
  const id = node instanceof NuLinkNode ? node.id : node
  return (await historicUptime(db, id)) + (await currentUptime(db, id))
}

// uptime from completed sessions
async function historicUptime(db: Connection, id: number): Promise<number> {
  const { seconds } = await db
    .createQueryBuilder()
    .select(
      `FLOOR(SUM(
        (31536000 * DATE_PART('year', session.finishedAt - session.createdAt)) +
        (86400 * DATE_PART('day', session.finishedAt - session.createdAt)) +
        (3600 * DATE_PART('hour', session.finishedAt - session.createdAt)) +
        (60 * DATE_PART('minute', session.finishedAt - session.createdAt)) +
        (DATE_PART('second', session.finishedAt - session.createdAt))
      )) as seconds`,
    )
    .from(Session, 'session')
    .where({ nulinkNodeId: id })
    .andWhere('session.finishedAt is not null')
    .getRawOne()
  return parseInt(seconds) || 0
}

// uptime from current open session
async function currentUptime(db: Connection, id: number): Promise<number> {
  const { seconds } = await db
    .createQueryBuilder()
    .select(
      `FLOOR(SUM(
        (31536000 * DATE_PART('year', now() - session.createdAt)) +
        (86400 * DATE_PART('day', now() - session.createdAt)) +
        (3600 * DATE_PART('hour', now() - session.createdAt)) +
        (60 * DATE_PART('minute', now() - session.createdAt)) +
        (DATE_PART('second', now() - session.createdAt))
      )) as seconds`,
    )
    .from(Session, 'session')
    .where({ nulinkNodeId: id })
    .andWhere('session.finishedAt is null')
    .getRawOne()
  return parseInt(seconds) || 0
}
