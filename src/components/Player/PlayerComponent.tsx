import React, { useCallback, useEffect, useRef } from 'react';
import SoundDriver from '../../util/SoundDriver';
import { Audio } from '../../pages/home';
import Loader from '../Loader/LoaderComponent';
import styles from './player.module.css';
import Toolbar from '../Toolbar/ToolbarComponent';
import { AudioActions, TrackChange } from '../../types';
import { usePlayerContext } from '../../context/PlayerContext';

export interface PlayerProps {
  audio: Audio | null;
  isPending: boolean;
  className: string;
  setLoading(val: boolean): void;
  changeTrack(direction: TrackChange): void;
}

const Player = ({ audio, className, changeTrack, isPending }: PlayerProps) => {
  const soundController = useRef<null | SoundDriver>(null);
  const { loading, setLoading } = usePlayerContext();

  const initUI = useCallback(async () => {
    if (!isPending && audio) {
      const soundInstance = new SoundDriver(audio.file);
      try {
        await soundInstance.init(document.getElementById('waveContainer'));
        soundController.current = soundInstance;
        soundController.current?.setOnEnd(() => {
          changeTrack('next');
        });
      } catch (err: unknown) {
        console.log(err);
      } finally {
        await soundInstance.drawChart();
        setLoading(false);
      }
    }
  }, [audio]);

  useEffect(() => {
    initUI();
    return () => {
      (async () => await soundController.current?.reset())();
    };
  }, [audio?.title, initUI]);

  const togglePlayer = useCallback(
    async (type: AudioActions) => {
      if (type === 'play') {
        soundController?.current?.play();
      } else if (type === 'stop') {
        soundController.current?.pause(true);
      } else if (type === 'next' || type === 'prev') {
        changeTrack(type);
      } else {
        soundController.current?.pause();
      }
    },
    [changeTrack]
  );

  const onVolumeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      soundController.current?.changeVolume(Number(event.target.value));
    },
    [soundController]
  );

  return (
    <div
      style={{ width: '100%', position: 'relative' }}
      className={`${className} ${styles.default}`}
    >
      {!loading && !soundController.current && !audio && (
        <div className={`${styles['player-decor']}`}>Audio Player</div>
      )}
      {loading && <Loader />}
      {audio && (
        <div
          className={styles['wave-container']}
          style={{ position: 'relative' }}
          id='waveContainer'
        />
      )}

      {audio && (
        <Toolbar
          key={audio.title}
          onVolumeChange={onVolumeChange}
          togglePlayer={togglePlayer}
        />
      )}
    </div>
  );
};

export default Player;
