import { useState } from 'react';
import styles from './audio-input.module.css';
import { usePlayerContext } from '../../context/PlayerContext';

export interface AudioInputProps {
  uploadAudio(file: FileList | null): void;
  className: string;
}

const AudioInput: React.FC<AudioInputProps> = function ({
  uploadAudio,
  className,
}) {
  const [drag, setDrag] = useState(false);
  const { loading } = usePlayerContext();

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDrag(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDrag(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    uploadAudio(event.dataTransfer.files);
    setDrag(false);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    uploadAudio(files);
  };

  return (
    <div
      onDragOver={handleDragStart}
      onDragStart={handleDragStart}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`${className} ${drag ? styles['body-drag'] : styles['body']}`}
      style={{
        pointerEvents: loading ? 'none' : 'initial',
        cursor: loading ? 'not-allowed' : 'initial',
        opacity: loading ? 0.5 : 1,
      }}
    >
      <label htmlFor='fileInput' className={styles['choose-file']}>
        <input
          type='file'
          multiple
          name='sound'
          onChange={onChange}
          accept='audio/*'
          id='fileInput'
          hidden
          disabled={!!loading}
        />
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          fill='currentColor'
          className='bi bi-file-earmark-arrow-up'
          viewBox='0 0 16 16'
        >
          <path d='M8.5 11.5a.5.5 0 0 1-1 0V7.707L6.354 8.854a.5.5 0 1 1-.708-.708l2-2a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 7.707z' />
          <path d='M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z' />
        </svg>
        <span>Choose a sound</span>
      </label>
      or Drag It here.
    </div>
  );
};

export default AudioInput;
