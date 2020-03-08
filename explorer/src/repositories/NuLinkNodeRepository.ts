import { EntityRepository, EntityManager } from 'typeorm'
import { NuLinkNode } from '../entity/NuLinkNode'
import { PaginationParams } from '../utils/pagination'

@EntityRepository()
export class NuLinkNodeRepository {
  constructor(private manager: EntityManager) {}

  /**
   * Get a page of NuLinkNode's sorted by their index in ascending order
   */
  public all(params: PaginationParams): Promise<NuLinkNode[]> {
    let query = this.manager
      .createQueryBuilder(NuLinkNode, 'nulinkNode')
      .orderBy('nulinkNode.createdAt', 'ASC')

    if (params.limit != null) {
      query = query.limit(params.limit)
    }

    if (params.page !== undefined) {
      const offset = (params.page - 1) * params.limit
      query = query.offset(offset)
    }

    return query.getMany()
  }

  /**
   *
   * Return the total count of NuLinkNode's
   */
  public count(): Promise<number> {
    return this.manager
      .createQueryBuilder(NuLinkNode, 'nulinkNode')
      .getCount()
  }
}
