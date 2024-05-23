const toolbarActions = {
  play: 'play',
  pause: 'pause',
  stop: 'stop',
  next: 'next',
  prev: 'prev',
} as const;

export type AudioActions = (typeof toolbarActions)[keyof typeof toolbarActions];
export type TrackChange = Extract<AudioActions, 'next' | 'prev'>;
