import {useState} from 'react';
import Login from './pages/Login.jsx';

function App() {
  const [name, setName] = useState('');

  return (
    <>
      <div className="app">
        <Login/>
      </div>
    </>
  )
}

export default App
