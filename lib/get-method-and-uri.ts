export const getMethodAndUri = (route) => {
  const [method, ...paths] = route.split('.').slice(0, -1)
  const [region, port, ...table] = paths
  const path = '/' + [region, port, table.join('.')].join('/')

  return [method, path]
}