import { matchers } from '@nulink/test-helpers'
import { NuLinkedFactory } from '../../ethers/v0.4/NuLinkedFactory'

const nulinkedFactory = new NuLinkedFactory()

describe('NuLinked', () => {
  it('has a limited public interface', async () => {
    matchers.publicAbi(nulinkedFactory, [])
  })
})
