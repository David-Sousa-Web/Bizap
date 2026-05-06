export function formatPhone(val: string | undefined | null): string {
  if (!val) return ""
  
  // Extract DDI and local number
  const match = val.match(/^(\+\d{1,3})(\d+)$/)
  if (!match) return val

  const [, ddi, number] = match

  if (ddi === "+55") {
    if (number.length === 11) {
      return `+55 (${number.slice(0, 2)}) ${number.slice(2, 7)}-${number.slice(7)}`
    } else if (number.length === 10) {
      return `+55 (${number.slice(0, 2)}) ${number.slice(2, 6)}-${number.slice(6)}`
    }
  }

  return `${ddi} ${number}`
}
