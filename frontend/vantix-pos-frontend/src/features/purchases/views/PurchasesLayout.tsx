import { Outlet } from 'react-router-dom';

export const PurchasesLayout = () => {
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-200">
      <Outlet />
    </div>
  );
};