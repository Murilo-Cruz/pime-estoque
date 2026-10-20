import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

export default function MainLayout() {
  return (
    <div className="layout">
      <Header />
      <div className="layout-body">
        <Sidebar />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}