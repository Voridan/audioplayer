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

  const handleAudioChoice = (audio: string | null) => {
    const chosenAudio = files?.find((file) => file.title === audio);
    if (chosenAudio) {
      setLoading(true);
      setCurrentAudio({ ...chosenAudio });
    }
  };

  const changeTrack = useCallback(
    (direction: TrackChange) => {
      if (currentAudio) {
        const currIndex = files.findIndex(
          (f) => f.title === currentAudio.title
        );
        let newTrack: Audio;
        if (direction === 'next') {
          newTrack =
            currIndex < files.length - 1
              ? { ...files[currIndex + 1] }
              : { ...files[0] };
        } else {
          newTrack =
            currIndex > 0
              ? { ...files[currIndex - 1] }
              : { ...files[files.length - 1] };
        }
        startTransition(() => {
          // setLoading(true);
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
        handleAudioChoice={handleAudioChoice}
        currentAudio={currentAudio?.title || ''}
      />
    </div>
  );
}
