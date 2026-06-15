import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Buildings = lazy(() => import('./pages/Buildings'));
const Restaurants = lazy(() => import('./pages/Restaurants'));
const Menu = lazy(() => import('./pages/Menu'));
const Orders = lazy(() => import('./pages/Orders'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const DeliveryConfirmation = lazy(() => import('./pages/DeliveryConfirmation'));
const Users = lazy(() => import('./pages/Users'));

function PageLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
    </div>
  );
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Suspense fallback={<PageLoading />}><Login /></Suspense>} />
      <Route path="/register" element={<Suspense fallback={<PageLoading />}><Register /></Suspense>} />
      <Route path="/menu/:restaurantId" element={<Suspense fallback={<PageLoading />}><Menu /></Suspense>} />
      <Route path="/checkout/:restaurantId" element={<Suspense fallback={<PageLoading />}><Checkout /></Suspense>} />
      <Route path="/order-success/:orderId" element={<Suspense fallback={<PageLoading />}><OrderSuccess /></Suspense>} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Suspense fallback={<PageLoading />}><Dashboard /></Suspense>} />
        <Route path="buildings" element={<Suspense fallback={<PageLoading />}><Buildings /></Suspense>} />
        <Route path="buildings/:id" element={<Suspense fallback={<PageLoading />}><Buildings /></Suspense>} />
        <Route path="restaurants" element={<Suspense fallback={<PageLoading />}><Restaurants /></Suspense>} />
        <Route path="menu" element={<Suspense fallback={<PageLoading />}><Menu /></Suspense>} />
        <Route path="orders" element={<Suspense fallback={<PageLoading />}><Orders /></Suspense>} />
        <Route path="checkout" element={<Suspense fallback={<PageLoading />}><Checkout /></Suspense>} />
        <Route path="delivery-confirmation" element={<Suspense fallback={<PageLoading />}><DeliveryConfirmation /></Suspense>} />
        <Route path="users" element={<Suspense fallback={<PageLoading />}><Users /></Suspense>} />
      </Route>
    </Routes>
  );
}