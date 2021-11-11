export const isMac =
  typeof window !== 'undefined'
    ? navigator.userAgent.toUpperCase().indexOf('MAC') >= 0
    : false

export const getAbsoluteURL = (path = '') => {
  const baseURL = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'
  return baseURL + path
}
