import { MACHINE_POOLS } from '../constants/machinePools.js'
import { getModifierById } from '../constants/modifiers.js'

function weightedRandom(pool) {
  const total = pool.reduce((sum, entry) => sum + entry.weight, 0)
  let rand = Math.random() * total
  for (const entry of pool) {
    rand -= entry.weight
    if (rand <= 0) return entry.modifierId
  }
  return pool[pool.length - 1].modifierId
}

export function spinMachine(machineId) {
  const pool = MACHINE_POOLS[machineId]
  if (!pool) throw new Error(`Unknown machine: ${machineId}`)
  const modifierId = weightedRandom(pool)
  return getModifierById(modifierId)
}
