export const isMac =
  typeof window !== 'undefined'
    ? navigator.platform.toUpperCase().indexOf('MAC') >= 0
    : false
