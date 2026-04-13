export function toUiScale(value: number): number {
  return Math.round(value / 2)
}

export function fromUiScale(value: number): number {
  return value * 2
}
