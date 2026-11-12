export interface InventoryUnit {
  label: string
  group?: string
}

export interface ItemUnitConfig {
  unitType: string
  units: InventoryUnit[]
}

const units = (label: string, count: number, group?: string): InventoryUnit[] =>
  Array.from({ length: count }, (_, index) => ({
    label: `${label}${index + 1}`,
    ...(group ? { group } : {}),
  }))

export const ITEM_UNITS: Record<string, ItemUnitConfig> = {
  premium: { unitType: 'room', units: units('Room ', 4) },
  deluxe: { unitType: 'room', units: units('Room ', 6) },
  solo: { unitType: 'room', units: units('Room ', 8) },
  family: { unitType: 'room', units: units('Room ', 3) },
  couple: { unitType: 'room', units: units('Room ', 4) },
  'premium-cottage': { unitType: 'cottage', units: units('Cottage ', 3) },
  'open-deluxe': { unitType: 'cottage', units: units('Cottage ', 4) },
  'deluxe-cottage': { unitType: 'cottage', units: units('Cottage ', 5) },
  'solo-cottage': { unitType: 'cottage', units: units('Cottage ', 6) },
  'family-cottage': { unitType: 'cottage', units: units('Cottage ', 3) },
  'couple-cottage': { unitType: 'cottage', units: units('Cottage ', 4) },
  breakfast: {
    unitType: 'table',
    units: [
      ...units('Table S-', 4, 'Solo'),
      ...units('Table D-', 3, 'Duo'),
      ...units('Table Q-', 2, 'Squad'),
    ],
  },
  lunch: {
    unitType: 'table',
    units: [
      ...units('Table S-', 4, 'Solo'),
      ...units('Table D-', 3, 'Duo'),
      ...units('Table Q-', 2, 'Squad'),
    ],
  },
  dinner: {
    unitType: 'table',
    units: [
      ...units('Table S-', 4, 'Solo'),
      ...units('Table D-', 3, 'Duo'),
      ...units('Table Q-', 2, 'Squad'),
    ],
  },
  'open-space': { unitType: 'venue', units: [{ label: 'Open Lawn' }] },
  'covered-hall': { unitType: 'hall', units: [{ label: 'Hall A' }, { label: 'Hall B' }] },
  'sports-center': { unitType: 'court', units: units('Court ', 3) },
  'sports-field': { unitType: 'field', units: units('Field ', 3) },
}
