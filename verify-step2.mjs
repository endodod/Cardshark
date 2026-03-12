import { initialState } from './src/lib/gameState.js'
import { MODIFIERS } from './src/constants/modifiers.js'
import { MACHINE_POOLS } from './src/constants/machinePools.js'

console.log('initialState:', JSON.stringify(initialState))
console.log('MODIFIERS.length:', MODIFIERS.length)
const hr = MACHINE_POOLS.highroller
console.log('highroller has curse:', hr.some(x => x.modifierId.startsWith('curse')))
