import { SetStateAction, createContext, useContext, useState } from 'react';

interface PlayerContextType {
  loading: boolean | null;
  setLoading: React.Dispatch<SetStateAction<boolean | null>>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayerContext = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('useTrackContext must be used within a TrackProvider');
  }
  return context;
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [loading, setLoading] = useState<boolean | null>(null);

  return (
    <PlayerContext.Provider value={{ loading, setLoading }}>
      {children}
    </PlayerContext.Provider>
  );
};
