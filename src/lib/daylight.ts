export type Daylight = 'dawn' | 'day' | 'dusk' | 'night'

/** Which light the room is in at this hour. */
export function daylightAt(date = new Date()): Daylight {
  const hour = date.getHours()
  if (hour >= 5 && hour < 9) return 'dawn'
  if (hour >= 9 && hour < 17) return 'day'
  if (hour >= 17 && hour < 20) return 'dusk'
  return 'night'
}
