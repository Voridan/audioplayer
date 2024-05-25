import { useCallback, useState, useTransition } from 'react';
import AudioInput from '../components/AudioInput/AudioInputComponent.tsx';
import Player from '../components/Player/PlayerComponent.tsx';
import styles from './home.module.css';
import Sidebar from '../components/Sidebar/SidebarComponent.tsx';
import { TrackChange } from '../types.ts';
import { usePlayerContext } from '../context/PlayerContext.tsx';

export type Audio = { title: string; file: File };

export default function HomePage() {
  const [files, setFiles] = useState<Audio[]>([]);
  const { setLoading } = usePlayerContext();
  const [currentAudio, setCurrentAudio] = useState<Audio | null>(null);
  const [isPending, startTransition] = useTransition();

  const changeTrack = useCallback(
    (type: TrackChange, index?: number) => {
      if (currentAudio) {
        const currIndex = files.findIndex(
          (f) => f.title === currentAudio.title
        );
        let newTrack: Audio;
        switch (type) {
          case 'next':
            newTrack =
              currIndex < files.length - 1
                ? { ...files[currIndex + 1] }
                : { ...files[0] };
            break;
          case 'prev':
            newTrack =
              currIndex > 0
                ? { ...files[currIndex - 1] }
                : { ...files[files.length - 1] };
            break;
          case 'choose':
            if (index !== undefined) newTrack = { ...files[index] };
            break;
          default:
            alert('unexpected type value');
            return;
        }
        startTransition(() => {
          setLoading(true);
          setCurrentAudio(newTrack);
        });
      }
    },
    [files, currentAudio]
  );

  const removeAudio = useCallback((audio: string) => {
    setFiles((prev) => [...prev.filter((f) => f.title !== audio)]);
  }, []);

  const resetAudio = () => {
    setCurrentAudio(null);
  };

  const makeTypedAudio = (file: File) => ({ title: file.name, file });

  const uploadAudio = useCallback(
    async (inputFiles: FileList | null) => {
      if (!inputFiles?.length) {
        return null;
      }

      const filesArr = Array.from(inputFiles);
      const newAudios: Audio[] = filesArr
        .filter(
          (f) =>
            f.type.includes('audio') &&
            files.find((file) => file.title === f.name) === undefined
        )
        .map((f) => makeTypedAudio(f));

      if (newAudios.length > 0) {
        setLoading(true);
        const newAudio = newAudios[0];

        setFiles((prevFiles) => [
          ...newAudios,
          ...prevFiles.filter((f) => f.title !== newAudio.title),
        ]);

        setCurrentAudio({ ...newAudio });
      } else {
        setCurrentAudio(makeTypedAudio(filesArr[0]));
      }
    },
    [files]
  );

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
      }}
      className={`${styles.container}`}
    >
      <Player
        key={currentAudio?.title}
        isPending={isPending}
        changeTrack={changeTrack}
        className={`${styles.player}`}
        audio={files.length ? currentAudio : null}
        setLoading={setLoading}
      />
      <AudioInput
        uploadAudio={uploadAudio}
        className={`${styles.input}`}
      ></AudioInput>
      <Sidebar
        resetAudio={resetAudio}
        removeAudio={removeAudio}
        className={`${styles.aside}`}
        audios={files?.map((f) => f.title)}
        changeTrack={changeTrack}
        currentAudio={currentAudio?.title || ''}
      />
    </div>
  );
}
