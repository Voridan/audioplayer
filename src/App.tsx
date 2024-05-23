import './App.css';
import { PlayerProvider } from './context/PlayerContext';
import HomePage from './pages/home';

function App() {
  return (
    <PlayerProvider>
      <HomePage></HomePage>
    </PlayerProvider>
  );
}

export default App;
