/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { LoginView } from './components/auth/LoginView';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { MasterItemsView } from './components/master/MasterItemsView';
import { MasterCategoriesView } from './components/master/MasterCategoriesView';
import { MasterUnitsView } from './components/master/MasterUnitsView';
import { MasterLocationsView } from './components/master/MasterLocationsView';
import { MasterSuppliersView } from './components/master/MasterSuppliersView';
import { MasterDepartmentsView } from './components/master/MasterDepartmentsView';
import { StockInView } from './components/transactions/StockInView';
import { StockOutView } from './components/transactions/StockOutView';
import { StockAdjustmentView } from './components/transactions/StockAdjustmentView';
import { RealtimeStockView } from './components/stock/RealtimeStockView';
import { StockCardView } from './components/stock/StockCardView';
import { StockOpnameView } from './components/stock/StockOpnameView';
import { ExpiredMonitoringView } from './components/stock/ExpiredMonitoringView';
import { ReportsView } from './components/reports/ReportsView';
import { UserManagementView } from './components/users/UserManagementView';
import { AuditTrailView } from './components/audit/AuditTrailView';
import { OrderRequestLetterView } from './components/orders/OrderRequestLetterView';
import { PurchaseOrderView } from './components/orders/PurchaseOrderView';

const InventoryAppContent: React.FC = () => {
  const { currentUser } = useInventory();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedStockCardItemId, setSelectedStockCardItemId] = useState<string | undefined>(undefined);

  if (!currentUser) {
    return <LoginView />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={(tabId) => setActiveTab(tabId)} />;
      case 'master-barang':
        return <MasterItemsView />;
      case 'master-kategori':
        return <MasterCategoriesView />;
      case 'master-satuan':
        return <MasterUnitsView />;
      case 'master-lokasi':
        return <MasterLocationsView />;
      case 'master-supplier':
        return <MasterSuppliersView />;
      case 'master-departemen':
        return <MasterDepartmentsView />;
      case 'barang-masuk':
        return <StockInView />;
      case 'barang-keluar':
        return <StockOutView />;
      case 'penyesuaian-stok':
        return <StockAdjustmentView />;
      case 'surat-pengajuan':
        return <OrderRequestLetterView />;
      case 'surat-pesanan':
        return <PurchaseOrderView />;
      case 'stok':
        return (
          <RealtimeStockView
            onOpenStockCard={(itemId) => {
              setSelectedStockCardItemId(itemId);
              setActiveTab('kartu-stok');
            }}
          />
        );
      case 'kartu-stok':
        return <StockCardView initialItemId={selectedStockCardItemId} />;
      case 'stock-opname':
        return <StockOpnameView />;
      case 'monitoring-expired':
        return <ExpiredMonitoringView />;
      case 'laporan':
        return <ReportsView />;
      case 'users':
        return <UserManagementView />;
      case 'audit':
        return <AuditTrailView />;
      default:
        return <DashboardView onNavigate={(tabId) => setActiveTab(tabId)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased">
      <Navbar onNavigate={(tabId) => setActiveTab(tabId)} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} onSelectTab={(tabId) => setActiveTab(tabId)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <InventoryProvider>
      <InventoryAppContent />
    </InventoryProvider>
  );
}
