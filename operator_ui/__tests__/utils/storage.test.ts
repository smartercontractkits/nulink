import { getAuthentication, setAuthentication } from '../../src/utils/storage'

describe('utils/storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getAuthentication', () => {
    it('returns a JS object for JSON stored as "nulink.authentication" in localStorage', () => {
      localStorage.setItem('nulink.authentication', '{"allowed":true}')
      expect(getAuthentication()).toEqual({ allowed: true })
    })
  })

  describe('setAuthentication', () => {
    it('saves the JS object as JSON under the key "nulink.authentication" in localStorage', () => {
      setAuthentication({ allowed: true })
      expect(localStorage.getItem('nulink.authentication')).toEqual(
        '{"allowed":true}',
      )
    })
  })
})
