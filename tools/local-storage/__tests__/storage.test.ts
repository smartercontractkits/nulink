import storage from 'local-storage-fallback'
import { get, set, remove, getJson, setJson } from '../src/storage'

beforeEach(() => {
  storage.clear()
})

describe('get', () => {
  it('returns a string keyed under "nulink." in localStorage', () => {
    storage.setItem('nulink.foo', 'FOO')
    expect(get('foo')).toEqual('FOO')
  })

  it('returns null when the key does not exist', () => {
    expect(get('foo')).toEqual(null)
  })
})

describe('set', () => {
  it('saves the string keyed under "nulink." in localStorage', () => {
    set('foo', 'FOO')

    const stored = storage.getItem('nulink.foo')
    expect(stored).toEqual('FOO')
  })
})

describe('remove', () => {
  it('deletes the nulink key', () => {
    storage.setItem('nulink.foo', 'FOO')
    expect(storage.getItem('nulink.foo')).toEqual('FOO')

    remove('foo')
    expect(storage.getItem('nulink.foo')).toEqual(null)
  })
})

describe('getJson', () => {
  it('returns a JS object for JSON keyed under "nulink." in localStorage', () => {
    storage.setItem('nulink.foo', '{"foo":"FOO"}')
    expect(getJson('foo')).toEqual({ foo: 'FOO' })
  })

  it('returns an empty JS object when it retrieves invalid JSON from storage', () => {
    storage.setItem('nulink.foo', '{"foo"}')
    expect(getJson('foo')).toEqual({})
  })

  it('returns an empty JS object when the key does not exist', () => {
    expect(getJson('foo')).toEqual({})
  })
})

describe('setJson', () => {
  it('saves the JS object as JSON keyed under "nulink." in localStorage', () => {
    setJson('foo', { foo: 'FOO' })

    const stored = storage.getItem('nulink.foo')
    expect(stored).toEqual('{"foo":"FOO"}')
  })
})
