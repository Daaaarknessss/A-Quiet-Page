// Every word on her page that isn't a poem or one of your lines lives here,
// so the whole experience can be re-voiced from one file.

export const FOR_HER = {
  /** Shown on the landing page door and in the browser tab. */
  doorTitle: 'For you',
  doorSubtitle: 'Something I wrote for you.',
  tabTitle: 'For you',

  // The first screen — one line and a quiet invitation to tap.
  threshold: 'I wrote you something.',
  thresholdHint: 'Tap when you’re ready',

  // After the lines finish, the room opens.
  roomEyebrow: 'Everything I wrote',
  roomTitle: 'thinking of you',

  closing: 'That’s all of them. So far.',
  signature: '— n.',

  replyPrompt: 'Write something back',
  replyPlaceholder: 'Anything at all…',
  replySend: 'Send it',
  replySent: 'It’s with me now.',

  replay: 'Begin again',
  skip: 'Skip',

  /**
   * Background song. Drop an mp3 at public/for-her.mp3 (or point
   * VITE_FOR_HER_SONG somewhere else). If the file isn't there, the page
   * simply stays silent and hides the sound toggle.
   */
  song: (import.meta.env.VITE_FOR_HER_SONG as string | undefined) ?? '/for-her.mp3',
  songVolume: 0.45,

  /**
   * Used only while the moments table is empty, so the page has something
   * to show in preview. Replace them from the studio's "For her" tab.
   */
  placeholderLines: [
    'Before anything else —',
    'I need you to know how long I waited for you.',
    'Not in a sad way.',
    'In the way you wait for morning when you already know it’s coming.',
    '…',
    'Every quiet page in here has you somewhere in it.',
    'So I wanted you to see them.',
  ],
} as const

/** How long a line stays on screen before it drifts away. */
export function holdMsFor(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  if (words === 0 || text.trim() === '…') return 1800
  return 1600 + words * 320
}

const SEEN_KEY = 'quiet-page-for-you-seen'

export function hasSeenLines(): boolean {
  try {
    return window.localStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}

export function markLinesSeen(): void {
  try {
    window.localStorage.setItem(SEEN_KEY, '1')
  } catch {
    // Private mode or blocked storage — she'll just see the lines again.
  }
}
