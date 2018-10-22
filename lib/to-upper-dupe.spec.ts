import {toUpperDupe} from './to-upper-dupe'

describe('spec', () => {
  it('methods', () => {
    const methods = ['post', 'read', 'put', 'patch', 'delete']
    const expected = [
      ...methods,
      ...methods.map(m => m.toUpperCase())
    ]
    const actual = toUpperDupe(methods)
    expect(actual.length).toEqual(expected.length)
  })
})
