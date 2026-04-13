/**
 * Find the first parameter of a given kind.
 */
export function findParam<T extends { kind: string }>(
  params: T[],
  kind: T['kind'],
): T | undefined {
  return params.find((p) => p.kind === kind)
}

/**
 * Returns true if at least one parameter of the given kind is present.
 */
export function hasParam<T extends { kind: string }>(
  params: T[],
  kind: T['kind'],
): boolean {
  return params.some((p) => p.kind === kind)
}
