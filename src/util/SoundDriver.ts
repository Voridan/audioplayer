import Drawer, { EventType } from './Drawer';

class SoundDriver {
  private readonly audiFile;

  private drawer?: Drawer;

  private context: AudioContext;

  private gainNode?: GainNode = undefined; // sound volume controller

  private audioBuffer?: AudioBuffer = undefined;

  private bufferSource?: AudioBufferSourceNode = undefined; // audio buffer source, to play the sound

  private analyser?: AnalyserNode = undefined;

  private startedAt = 0;

  private pausedAt = 0;

  private isRunning = false;

  private currentPlaybackInterval: number = 0;

  private fftSize = 256;

  public onEnd!: () => void;

  constructor(audioFile: Blob) {
    this.audiFile = audioFile; // https://developer.mozilla.org/en-US/docs/Web/API/AudioParam
    this.context = new AudioContext(); // https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
  }

  public setOnEnd = (cb: () => void) => {
    this.onEnd = cb;
  };

  static showError(error: string) {
    alert(
      'SoundParser constructor error. Can not read audio file as ArrayBuffer'
    );
    return error;
  }

  public init(parent: HTMLElement | null) {
    return new Promise((resolve, reject) => {
      if (!parent) {
        reject(new Error('Parent element not found'));
        return;
      }

      const reader = new FileReader();
      reader.readAsArrayBuffer(this.audiFile);
      reader.onload = (event: ProgressEvent<FileReader>) =>
        this.loadSound(event).then((buffer) => {
          this.audioBuffer = buffer;
          this.drawer = new Drawer(buffer, parent);
          this.setUpCursorHandlers(this.drawer);
          resolve(undefined);
        });
      reader.onerror = reject;
    });
  }

  private setUpCursorHandlers = (drawer: Drawer) => {
    if (drawer) {
      drawer.subscribe(EventType.DRAG_CURSOR, () => {
        if (this.bufferSource) {
          this.bufferSource.playbackRate.value = 2;
        }
      });

      drawer.subscribe<number>(
        EventType.DRAG_CURSOR_END,
        (timePoint: number) => {
          this.replay(timePoint);
        }
      );
    }
  };

  private replay = (startAt: number) => {
    if (this.bufferSource) {
      this.bufferSource.onended = null;
      this.bufferSource.stop();
      this.bufferSource.disconnect();
      this.gainNode?.disconnect();
    }

    this.bufferSource = this.context.createBufferSource();
    this.bufferSource.buffer = this.audioBuffer!;
    this.bufferSource.onended = () => {
      this.onEnd && this.onEnd();
    };
    this.gainNode = this.context.createGain();

    this.bufferSource.connect(this.gainNode);
    this.gainNode.connect(this.context.destination);

    this.bufferSource.connect(this.analyser!);
    this.analyser?.connect(this.context.destination);
    this.analyser!.fftSize = this.fftSize;
    this.pausedAt = Math.max(startAt, 0);

    if (this.isRunning) {
      this.startedAt = this.context.currentTime - this.pausedAt;
      this.bufferSource.start(0, startAt);
      this.animateAudio();
    }
  };

  public animateAudio() {
    if (!this.bufferSource || !this.analyser) {
      throw Error('Source is not defined');
    }

    this.drawer?.animateAudio(this.analyser);
  }

  private loadSound(readerEvent: ProgressEvent<FileReader>) {
    if (!readerEvent?.target?.result) {
      throw new Error('Can not read file');
    }

    return this.context.decodeAudioData(
      readerEvent.target.result as ArrayBuffer
    );
  }

  public reset = async () => {
    this.bufferSource?.disconnect();
    this.gainNode?.disconnect();
    await this.context.close();
    this.drawer?.clearBars();
    clearInterval(this.drawer?.animationId);
  };

  private handleCursor = (
    stop: boolean = false,
    reset: boolean = false,
    shift: number = 1
  ) => {
    if (stop) {
      clearInterval(this.currentPlaybackInterval);
      this.drawer?.moveCursor(0, 0, { drag: false, reset });
      return;
    }
    this.currentPlaybackInterval = setInterval(
      () => this.drawer?.moveCursor(shift),
      1000
    );
  };

  public async play() {
    if (!this.audioBuffer) {
      throw new Error(
        'Play error. Audio buffer is not exists. Try to call loadSound before Play.'
      );
    }

    if (this.isRunning) {
      return;
    }

    this.bufferSource = this.context.createBufferSource();
    this.bufferSource.buffer = this.audioBuffer;
    this.gainNode = this.context.createGain();

    this.bufferSource.connect(this.gainNode);
    this.gainNode.connect(this.context.destination);

    this.bufferSource.onended = () => {
      this.onEnd && this.onEnd();
    };

    this.analyser = this.context.createAnalyser();
    this.bufferSource.connect(this.analyser);
    this.analyser.connect(this.context.destination);
    this.analyser.fftSize = this.fftSize;

    await this.context.resume();
    this.bufferSource.start(0, this.pausedAt);

    this.handleCursor();

    this.startedAt = this.context.currentTime - this.pausedAt;
    this.pausedAt = 0;

    this.isRunning = true;
    this.animateAudio();
  }

  public async pause(reset?: boolean) {
    if (!this.bufferSource || !this.gainNode || !this.analyser) {
      throw new Error(
        'Pause - bufferSource is not exists. Maybe you forgot to call Play before?'
      );
    }

    await this.context.suspend();
    cancelAnimationFrame(this.drawer!.animationId);
    this.handleCursor(true, !!reset);
    reset && this.drawer?.clearBars();
    this.pausedAt = reset ? 0 : this.context.currentTime - this.startedAt;
    this.bufferSource.stop(this.pausedAt);
    this.bufferSource.onended = null;
    this.bufferSource.disconnect();
    this.gainNode.disconnect();
    this.analyser.disconnect();

    this.isRunning = false;
  }

  public changeVolume(volume: number) {
    if (!this.gainNode) {
      return;
    }

    this.gainNode.gain.value = volume;
    console.log(this.gainNode.gain.value);
  }

  public async drawChart() {
    await this.drawer?.init();
  }
}

export default SoundDriver;
