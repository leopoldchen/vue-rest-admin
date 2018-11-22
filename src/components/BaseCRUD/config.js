// query param name
export const QUERY = {
  page: 'x-page',
  perPage: 'x-per-page',
  order: 'x-order'
}

// query key, default with sequelize
export const queryKey = (attr, op) => {
  return attr + '-' + op
}

export const FORMAT = {
  date: 'YYYY-MM-DD HH:mm'
}

export default {
  QUERY,
  FORMAT,
  queryKey
}
