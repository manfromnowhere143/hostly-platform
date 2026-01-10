import { nanoid } from 'nanoid'

// Generate prefixed IDs for different entity types
export function generateId(prefix: string): string {
  return `${prefix}_${nanoid(16)}`
}

export const ids = {
  organization: () => generateId('org'),
  user: () => generateId('user'),
  property: () => generateId('prop'),
  reservation: () => generateId('res'),
  guest: () => generateId('guest'),
  payment: () => generateId('pay'),
  quote: () => generateId('quote'),
  event: () => generateId('evt'),
  apiKey: () => generateId('key'),
  photo: () => generateId('photo'),
}

// Generate confirmation codes
export function generateConfirmationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'HOSTLY-'
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
