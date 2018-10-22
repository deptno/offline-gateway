export const toUpperDupe = (src) => {
  return [
    ...src,
    ...src.map(s => s.toUpperCase())
  ]
}
