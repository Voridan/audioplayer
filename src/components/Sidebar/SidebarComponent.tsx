import { usePlayerContext } from '../../context/PlayerContext';
import styles from './sidebar.module.css';
import { TrackChange } from '../../types.ts';
export interface SidebarProps {
  audios: string[];
  changeTrack(direction: TrackChange, index?: number): void;
  removeAudio(audio: string): void;
  resetAudio(): void;
  className?: string;
  currentAudio: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  audios,
  changeTrack,
  className,
  currentAudio,
  removeAudio,
  resetAudio,
}): React.ReactNode => {
  const { loading } = usePlayerContext();

  return (
    <aside
      className={`${className} ${styles.content}`}
      style={{
        textAlign: 'center',
        pointerEvents: loading ? 'none' : 'unset',
        opacity: loading ? 0.5 : 1,
      }}
    >
      <p className={styles.label}>Recent Uploads</p>
      <div className={styles.list}>
        {audios.length ? (
          audios.map((audio, idx) => (
            <button
              type='button'
              className={`${
                currentAudio === audio
                  ? styles['list-item_active']
                  : styles['list-item']
              }`}
              onClick={() =>
                currentAudio !== audio && changeTrack('choose', idx)
              }
              key={audio}
            >
              {audio}
              <span
                onClick={(e: React.MouseEvent<HTMLSpanElement>) => {
                  e.stopPropagation();
                  removeAudio(audio);
                  if (audio === currentAudio) {
                    resetAudio();
                  }
                }}
              >
                X
              </span>
            </button>
          ))
        ) : (
          <p>No audio</p>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
