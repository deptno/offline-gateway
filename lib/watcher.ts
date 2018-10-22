import {Express} from 'express'
import R from 'ramda'
import remove from 'express-unset-route'
import {toUpperDupe} from './to-upper-dupe'
import createWatcher from 'glob-watcher'
import glob from 'fast-glob'
import {resolve} from 'path'

export const watch: Watch = async (prefixes, bus, app?) => {
  const pattern = createPattern(prefixes)
  const watcher = createWatcher(pattern)
  const matches = await glob<string>(pattern)
  const onAdd = route => {
    const [method, ...paths] = route.split('.')
    const path = '/' + paths.slice(0, -1).join('/')
    const handler = require(resolve(route))

    bus(method, path, handler)
  }

  matches.forEach(onAdd)

  watcher.on('add', onAdd)
  watcher.on('change', (route, stat) => {
    const [method, ...paths] = route.split('.')
    const path = '/' + paths.slice(0, -1).join('/')
    const module = resolve(route)

    delete require.cache[module]

    try {
      const handler = require(require.resolve(module))
      console.log(`Reloaded: ${method.toUpperCase()}\t${path}`)
      if (app) {
        const removed = remove(app, path, method)
        if (removed) {
          console.log(`Unregistered legacy handler`)
        }
      }
      bus(method, path, handler)
    } catch (e) {
      console.error(e)
    }
  })
}

const createPattern = R.compose(R.append('!node_modules'), R.chain(R.concat(R.__, `.*.js`)), toUpperDupe)

interface Watch {
  (prefixes: string[], bus: (method: string, path: string, handler: () => void) => void, app?: Express): void
}

