import { RefObject, useEffect, useRef, useState } from 'react';
import { AudioActions } from '../../types';
import styles from './toolbar.module.css';
import { usePlayerContext } from '../../context/PlayerContext';

export interface ToolbarProps {
  onVolumeChange(e: React.ChangeEvent<HTMLInputElement>): void;
  togglePlayer(actionType: AudioActions): void;
}

const pauseIcon = (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='40px'
    height='40px'
    viewBox='0 0 24 24'
    fill='none'
  >
    <path
      d='M11.97 22C17.4928 22 21.97 17.5228 21.97 12C21.97 6.47715 17.4928 2 11.97 2C6.44712 2 1.96997 6.47715 1.96997 12C1.96997 17.5228 6.44712 22 11.97 22Z'
      stroke='#fff'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M10.72 14.53V9.47005C10.72 8.99005 10.52 8.80005 10.01 8.80005H8.71C8.2 8.80005 8 8.99005 8 9.47005V14.53C8 15.01 8.2 15.2 8.71 15.2H10C10.52 15.2 10.72 15.01 10.72 14.53Z'
      stroke='#fff'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M16 14.53V9.47005C16 8.99005 15.8 8.80005 15.29 8.80005H14C13.49 8.80005 13.29 8.99005 13.29 9.47005V14.53C13.29 15.01 13.49 15.2 14 15.2H15.29C15.8 15.2 16 15.01 16 14.53Z'
      stroke='#fff'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

const playIcon = (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='40px'
    height='40px'
    viewBox='0 0 24 24'
    fill='none'
  >
    <path
      d='M13.8876 9.9348C14.9625 10.8117 15.5 11.2501 15.5 12C15.5 12.7499 14.9625 13.1883 13.8876 14.0652C13.5909 14.3073 13.2966 14.5352 13.0261 14.7251C12.7888 14.8917 12.5201 15.064 12.2419 15.2332C11.1695 15.8853 10.6333 16.2114 10.1524 15.8504C9.6715 15.4894 9.62779 14.7336 9.54038 13.2222C9.51566 12.7947 9.5 12.3757 9.5 12C9.5 11.6243 9.51566 11.2053 9.54038 10.7778C9.62779 9.26636 9.6715 8.51061 10.1524 8.1496C10.6333 7.78859 11.1695 8.11466 12.2419 8.76679C12.5201 8.93597 12.7888 9.10831 13.0261 9.27492C13.2966 9.46483 13.5909 9.69274 13.8876 9.9348Z'
      stroke='#fff'
      strokeWidth='1.5'
    />
    <path
      d='M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7'
      stroke='#fff'
      strokeWidth='1.5'
      strokeLinecap='round'
    />
  </svg>
);

const stopIcon = (
  <svg
    height='36px'
    width='36px'
    version='1.1'
    id='Capa_1'
    xmlns='http://www.w3.org/2000/svg'
    xmlnsXlink='http://www.w3.org/1999/xlink'
    viewBox='0 0 30.05 30.05'
    xmlSpace='preserve'
    fill='#ffffff'
    stroke='#ffffff'
    strokeWidth='0.00030050000000000004'
  >
    <g id='SVGRepo_bgCarrier' strokeWidth='0'></g>
    <g
      id='SVGRepo_tracerCarrier'
      strokeLinecap='round'
      strokeLinejoin='round'
    ></g>
    <g id='SVGRepo_iconCarrier'>
      <g>
        <path
          style={{ fill: '#ffffff' }}
          d='M18.993,10.688h-7.936c-0.19,0-0.346,0.149-0.346,0.342v8.022c0,0.189,0.155,0.344,0.346,0.344 h7.936c0.19,0,0.344-0.154,0.344-0.344V11.03C19.336,10.838,19.183,10.688,18.993,10.688z'
        ></path>
        <path
          style={{ fill: '#ffffff' }}
          d='M15.026,0C6.729,0,0.001,6.726,0.001,15.025S6.729,30.05,15.026,30.05 c8.298,0,15.023-6.726,15.023-15.025S23.324,0,15.026,0z M15.026,27.54c-6.912,0-12.516-5.604-12.516-12.515 c0-6.914,5.604-12.517,12.516-12.517c6.913,0,12.514,5.603,12.514,12.517C27.54,21.936,21.939,27.54,15.026,27.54z'
        ></path>
      </g>
    </g>
  </svg>
);

const getNavButton = (prev = true) => {
  const rotate = prev ? 'rotate(270)' : 'rotate(90)';
  return (
    <svg
      width='32px'
      height='32px'
      viewBox='0 0 16 16'
      version='1.1'
      xmlns='http://www.w3.org/2000/svg'
      xmlnsXlink='http://www.w3.org/1999/xlink'
      fill='#ffffff'
      transform={rotate}
      stroke='#ffffff'
    >
      <g id='SVGRepo_bgCarrier' strokeWidth='0'></g>
      <g
        id='SVGRepo_tracerCarrier'
        strokeLinecap='round'
        strokeLinejoin='round'
        stroke='#CCCCCC'
        strokeWidth='0.096'
      ></g>
      <g id='SVGRepo_iconCarrier'>
        <path fill='#000000' d='M13 14v-2l-5-5-5 5v2l5-5z'></path>
        <path fill='#000000' d='M13 9v-2l-5-5-5 5v2l5-5z'></path>
      </g>
    </svg>
  );
};

const Toolbar = ({ onVolumeChange, togglePlayer }: ToolbarProps) => {
  const [isPause, setIsPause] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const { loading } = usePlayerContext();

  useWheelVolume(inputRef);

  return (
    <div
      id='soundEditor'
      style={{
        opacity: loading ? 0.5 : 1,
        pointerEvents: loading ? 'none' : 'auto',
      }}
    >
      <div id='controllPanel' className={styles['controll-panel']}>
        <input
          ref={inputRef}
          className={styles['sound-controll']}
          type='range'
          onChange={onVolumeChange}
          defaultValue={1}
          min={-1}
          max={1}
          step={0.01}
        />
        <button
          className={styles['controll-button']}
          type='button'
          onClick={() => togglePlayer('prev')}
        >
          {getNavButton()}
        </button>
        <button
          className={styles['controll-button']}
          type='button'
          onClick={() => {
            const action = isPause ? 'play' : 'pause';
            setIsPause((prev) => !prev);
            togglePlayer(action);
          }}
        >
          {isPause ? playIcon : pauseIcon}
        </button>
        <button
          className={styles['controll-button']}
          type='button'
          onClick={() => togglePlayer('next')}
        >
          {getNavButton(false)}
        </button>
        <button
          className={styles['controll-button']}
          type='button'
          onClick={() => {
            setIsPause(true);
            togglePlayer('stop');
          }}
        >
          {stopIcon}
        </button>
      </div>
    </div>
  );
};

function useWheelVolume(volumeRef: RefObject<HTMLInputElement>) {
  useEffect(() => {
    const volumeInput = volumeRef.current;

    const handleWheel = (event: WheelEvent) => {
      if (volumeInput) {
        event.preventDefault();
        const step = 0.01;
        const newValue =
          parseFloat(volumeInput.value) + (event.deltaY > 0 ? step : -step);
        volumeInput.value = Math.min(Math.max(newValue, -1), 1).toString();
        const changeEvent = new Event('change');
        volumeInput.dispatchEvent(changeEvent);
      }
    };

    const addWheelListener = () => {
      if (volumeInput) {
        volumeInput.addEventListener('wheel', handleWheel);
      }
    };

    const removeWheelListener = () => {
      if (volumeInput) {
        volumeInput.removeEventListener('wheel', handleWheel);
      }
    };

    if (volumeInput) {
      volumeInput.addEventListener('mouseenter', addWheelListener);
      volumeInput.addEventListener('mouseleave', removeWheelListener);
    }

    return () => {
      if (volumeInput) {
        volumeInput.removeEventListener('mouseenter', addWheelListener);
        volumeInput.removeEventListener('mouseleave', removeWheelListener);
        volumeInput.removeEventListener('wheel', handleWheel);
      }
    };
  }, [volumeRef]);
}

export default Toolbar;
