const playerActions = {
  play: 'play',
  pause: 'pause',
  stop: 'stop',
  next: 'next',
  prev: 'prev',
  choose: 'choose',
} as const;

export type AudioActions = (typeof playerActions)[keyof typeof playerActions];
export type TrackChange = Extract<AudioActions, 'next' | 'prev' | 'choose'>;
