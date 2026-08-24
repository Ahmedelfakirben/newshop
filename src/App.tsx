import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Categories from './pages/Categories';
import CategoryDetails from './pages/CategoryDetails';
import About from './pages/About';
import Contact from './pages/Contact';
import OrderDetails from './pages/OrderDetails';
import './App.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'categories',
        element: <Categories />,
      },
      {
        path: 'categories/:id',
        element: <CategoryDetails />,
      },
      {
        path: 'product/:id',
        element: <ProductDetails />,
      },
      {
        path: 'order/:id',
        element: <OrderDetails />,
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: 'contact',
        element: <Contact />,
      }
    ],
  },
]);

function App() {
  // Système de contrôle de versions pour forcer le nettoyage du cache client lors des déploiements
  useEffect(() => {
    const APP_VERSION = '1.0.2'; // Incrémenter pour forcer le rechargement propre
    const savedVersion = localStorage.getItem('app_version');
    
    if (savedVersion !== APP_VERSION) {
      console.log(`Nouvelle version détectée: ${APP_VERSION}. Nettoyage du cache...`);
      localStorage.setItem('app_version', APP_VERSION);
      
      // Si une version précédente existait, on vide le cache et on recharge
      if (savedVersion) {
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
          });
        }
        window.location.reload();
      }
    }
  }, []);

  return (
    <RouterProvider router={router} />
  );
}

export default App;
