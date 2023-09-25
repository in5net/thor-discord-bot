export const ascend = <T>(a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0);
export const descend = <T>(a: T, b: T) => (a < b ? 1 : a > b ? -1 : 0);
