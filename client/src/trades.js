// The trades (= service categories). Same values as the Trade enum on the server.
export const TRADES = [
  { value: 'plumbing', label: 'Plumbing', icon: '🚰' },
  { value: 'electrical', label: 'Electrical', icon: '💡' },
  { value: 'ac', label: 'AC', icon: '❄️' },
  { value: 'carpentry', label: 'Carpentry', icon: '🪚' },
  { value: 'painting', label: 'Painting', icon: '🎨' },
]

export function tradeLabel(value) {
  return TRADES.find((t) => t.value === value)?.label || value
}
