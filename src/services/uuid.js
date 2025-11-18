// Tiny UUIDv4 generator
export function v4() {
  // RFC4122 version 4 compliant
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

export { v4 as uuidv4 }
