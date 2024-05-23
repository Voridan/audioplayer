// import { createPortal } from 'react-dom';
import './loader.css';

const Loader = () => {
  const loaderContent = (
    <div className='loader'>
      <div className='spinner'></div>
    </div>
  );
  return loaderContent;
  // return createPortal(loaderContent, document.getElementById('loader')!);
};

export default Loader;
