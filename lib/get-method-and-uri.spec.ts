import {getMethodAndUri} from './get-method-and-uri'

describe('getMethodAndUri', () => {
  it('getMethodAndUri', () => {
    const expects = [
      {
        src     : 'ddb.dynamon.8000.default.js',
        expected: ['ddb', '/dynamon/8000/default']
      },
      {
        src     : 'ddb.dynamon.8000.includes.table..js',
        expected: ['ddb', '/dynamon/8000/includes.table.']
      }
    ]
    for (const {src, expected} of expects) {
      expect(getMethodAndUri(src)).toEqual(expected)
    }
  })
})