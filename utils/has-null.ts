export function hasNullValue(obj: any) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key]
      if (value === null) {
        return true
      }
      if (typeof value === 'object' && value !== null) {
        if (hasNullValue(value)) {
          return true
        }
      }
    }
  }
  return false
}
