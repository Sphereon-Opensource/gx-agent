/**
 * @public
 */
import { readFileSync } from 'fs'
const schema = JSON.parse(readFileSync(new URL('../plugin.schema.json', import.meta.url)).toString())
// import schema from '../plugin.schema.json' assert { type: 'json' }
export { schema }
export * from './suites/index.js'
export * from './types/index.js'
export * from './agent/index.js'
export * from './utils/index.js'
