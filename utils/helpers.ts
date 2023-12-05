export const shortFormOfLink = (link?: string) => {
  if (!link) {
    return ''
  }
  return link.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '')
}

export const simpleTime = (time: number) => {
  const date = new Date(time)
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const seconds = date.getSeconds()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const hours12 = hours % 12 || 12
  const minutes12 = minutes < 10 ? `0${minutes}` : minutes
  const seconds12 = seconds < 10 ? `0${seconds}` : seconds
  return `${hours12}:${minutes12}:${seconds12} ${ampm}`
}

export const timeAgo = (time: number) => {
  const now = new Date().getTime()
  const diff = now - time
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  }
  if (seconds > 0) {
    return `${seconds} second${seconds > 1 ? 's' : ''} ago`
  }
  return 'just now'
}