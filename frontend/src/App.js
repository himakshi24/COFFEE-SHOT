import {useEffect} from 'react';
import './App.css';
import Navbar from './Components/Navbar/Navbar';
import {BrowserRouter, Routes, Route, useLocation} from 'react-router-dom';
import Home from './Pages/Home';
import Login from './Pages/Login';
import Contact from './Pages/Contact';
import MenuPage from './Pages/MenuPage';
import OffersPage from './Pages/OffersPage';
import DescriptionPage from './Pages/DescriptionPage';
import EventsPage from './Pages/EventsPage';
import LaunchPage from './Pages/LaunchPage';

function AppLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return (
    <div>
      {pathname !== '/login' && <Navbar/>}
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='menu' element={<MenuPage />} />
        <Route path='offers' element={<OffersPage />} />
        <Route path='description' element={<DescriptionPage />} />
        <Route path='events' element={<EventsPage />} />
        <Route path='launch' element={<LaunchPage />} />
        <Route path='contact' element={<Contact />} />
        <Route path='/login' element={<Login />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
