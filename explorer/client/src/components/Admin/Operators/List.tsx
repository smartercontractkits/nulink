import React from 'react'
import Paper from '@material-ui/core/Paper'
import Hidden from '@material-ui/core/Hidden'
import { join } from 'path'
import Table, { ChangePageEvent } from '../../Table'
import { LinkColumn, TextColumn, TimeAgoColumn } from '../../Table/TableCell'
import { NuLinkNode } from 'explorer/models'

const HEADERS = ['Name', 'URL', 'Created At']
const LOADING_MSG = 'Loading operators...'
const EMPTY_MSG = 'There are no operators added to the Explorer yet.'

function buildNameCol(operator: NuLinkNode): UrlColumn {
  return {
    type: 'link',
    text: operator.name,
    to: join('/', 'admin', 'operators', operator.id.toString()),
  }
}

type UrlColumn = LinkColumn | TextColumn

function buildUrlCol(operator: NuLinkNode): UrlColumn {
  if (operator.url) {
    return {
      type: 'link',
      text: operator.url,
      to: operator.url,
    }
  }

  return { type: 'text', text: '-' }
}

function buildCreatedAtCol(operator: NuLinkNode): TimeAgoColumn {
  return {
    type: 'time_ago',
    text: operator.createdAt,
  }
}

function rows(
  operators?: NuLinkNode[],
): [UrlColumn, UrlColumn, TimeAgoColumn][] | undefined {
  return operators?.map(o => {
    return [buildNameCol(o), buildUrlCol(o), buildCreatedAtCol(o)]
  })
}

interface Props {
  currentPage: number
  onChangePage: (event: ChangePageEvent, page: number) => void
  operators?: NuLinkNode[]
  count?: number
  className?: string
}

const List: React.FC<Props> = ({
  operators,
  count,
  currentPage,
  className,
  onChangePage,
}) => {
  return (
    <Paper className={className}>
      <Hidden xsDown>
        <Table
          headers={HEADERS}
          currentPage={currentPage}
          rows={rows(operators)}
          count={count}
          onChangePage={onChangePage}
          loadingMsg={LOADING_MSG}
          emptyMsg={EMPTY_MSG}
        />
      </Hidden>
    </Paper>
  )
}

export default List
