import fetch from 'node-fetch'
import httpStatus from 'http-status-codes'
import {
  ADMIN_USERNAME_HEADER,
  ADMIN_PASSWORD_HEADER,
} from '../utils/constants'

const EXPLORER_BASE_URL =
  process.env.EXPLORER_BASE_URL || 'https://explorer.chain.link'
const EXPLORER_ADMIN_USERNAME = process.env.EXPLORER_ADMIN_USERNAME
const EXPLORER_ADMIN_PASSWORD = process.env.EXPLORER_ADMIN_PASSWORD

interface CreateNuLinkNode {
  name: string
  url?: string
}

interface CreateNuLinkNodeOk {
  id: string
  accessKey: string
  secret: string
}

function logError(msg: string) {
  console.error(msg)
}

function logUnauthorized() {
  logError(
    'Invalid admin credentials. Please ensure the you have provided the correct admin username and password.',
  )
}

function logNotFound() {
  logError(
    `Error creating nulink node. API endpoint not found. Have you set the correct EXPLORER_BASE_URL?`,
  )
}

export const add = async (name: string, url?: string) => {
  const createNodeUrl = `${EXPLORER_BASE_URL}/api/v1/admin/nodes`
  const data: CreateNuLinkNode = { name, url }
  const response = await fetch(createNodeUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      [ADMIN_USERNAME_HEADER]: EXPLORER_ADMIN_USERNAME,
      [ADMIN_PASSWORD_HEADER]: EXPLORER_ADMIN_PASSWORD,
    },
    body: JSON.stringify(data),
  })

  switch (response.status) {
    case httpStatus.CREATED: {
      const nulinkNode: CreateNuLinkNodeOk = await response.json()
      console.log('Created new nulink node with id %s', nulinkNode.id)
      console.log('AccessKey', nulinkNode.accessKey)
      console.log('Secret', nulinkNode.secret)
      break
    }
    case httpStatus.NOT_FOUND:
      logNotFound()
      break
    case httpStatus.UNAUTHORIZED:
      logUnauthorized()
      break
    case httpStatus.CONFLICT:
      console.error(
        `Error creating nulink node. A node with the name: "${name}" already exists.`,
      )
      break
    default:
      console.error(`Unhandled error. HTTP status: ${response.status}`)
      break
  }
}

export const remove = async (name: string) => {
  const deleteNodeUrl = `${EXPLORER_BASE_URL}/api/v1/admin/nodes/${name}`
  const response = await fetch(deleteNodeUrl, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      [ADMIN_USERNAME_HEADER]: EXPLORER_ADMIN_USERNAME,
      [ADMIN_PASSWORD_HEADER]: EXPLORER_ADMIN_PASSWORD,
    },
  })

  switch (response.status) {
    case httpStatus.OK:
      console.log('Successfully deleted nulink node with name %s', name)
      break
    case httpStatus.NOT_FOUND:
      logNotFound()
      break
    case httpStatus.UNAUTHORIZED:
      logUnauthorized()
      break
    default:
      console.error(`Unhandled error. HTTP status: ${response.status}`)
      break
  }
}
