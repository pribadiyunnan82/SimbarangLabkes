import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  User,
  UserRole,
  Item,
  Category,
  UnitMeasure,
  StorageLocation,
  Supplier,
  Department,
  StockInTransaction,
  StockOutTransaction,
  StockAdjustment,
  StockOpname,
  AuditLog,
  StockCardEntry,
  OrderRequestLetter,
  PurchaseOrderLetter,
} from '../types/inventory';
import {
  INITIAL_USERS,
  INITIAL_CATEGORIES,
  INITIAL_UNITS,
  INITIAL_LOCATIONS,
  INITIAL_SUPPLIERS,
  INITIAL_DEPARTMENTS,
  INITIAL_ITEMS,
  INITIAL_STOCK_IN,
  INITIAL_STOCK_OUT,
  INITIAL_ADJUSTMENTS,
  INITIAL_STOCK_OPNAMES,
  INITIAL_AUDIT_LOGS,
  INITIAL_ORDER_REQUESTS,
  INITIAL_PURCHASE_ORDERS,
} from '../data/initialData';
import {
  googleSignIn,
  switchGoogleAccount,
  logoutFromGoogle,
  findCloudSyncFile,
  downloadCloudSyncFile,
  saveCloudSyncFile,
  getAccessToken,
  initAuth,
  getDeviceName,
  InventorySyncPayload,
} from '../services/googleDriveService';

interface InventoryContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  login: (username: string, password?: string) => { success: boolean; message?: string };
  logout: () => void;
  registerInitialAdmin: (data: {
    name: string;
    username: string;
    password: string;
    email?: string;
    phone?: string;
    department?: string;
  }) => { success: boolean; message?: string };
  registerUser: (data: {
    name: string;
    username: string;
    password: string;
    role: UserRole;
    email?: string;
    phone?: string;
    department?: string;
  }) => { success: boolean; message?: string };
  users: User[];
  items: Item[];
  categories: Category[];
  units: UnitMeasure[];
  locations: StorageLocation[];
  suppliers: Supplier[];
  departments: Department[];
  stockIns: StockInTransaction[];
  stockOuts: StockOutTransaction[];
  adjustments: StockAdjustment[];
  stockOpnames: StockOpname[];
  auditLogs: AuditLog[];
  orderRequests: OrderRequestLetter[];
  addOrderRequest: (data: Omit<OrderRequestLetter, 'id' | 'createdAt' | 'updatedAt'>) => { success: boolean; id: string; message?: string };
  updateOrderRequest: (id: string, data: Partial<OrderRequestLetter>) => { success: boolean; message?: string };
  deleteOrderRequest: (id: string) => { success: boolean; message?: string };
  purchaseOrders: PurchaseOrderLetter[];
  addPurchaseOrder: (data: Omit<PurchaseOrderLetter, 'id' | 'createdAt' | 'updatedAt'>) => { success: boolean; id: string; message?: string };
  updatePurchaseOrder: (id: string, data: Partial<PurchaseOrderLetter>) => { success: boolean; message?: string };
  deletePurchaseOrder: (id: string) => { success: boolean; message?: string };

  // Google Drive Cloud Sync & Multi-Device
  isGoogleConnected: boolean;
  googleUser: { email: string; displayName: string; photoURL?: string } | null;
  cloudSyncStatus: 'synced' | 'syncing' | 'error' | 'idle';
  lastCloudSyncTime: string | null;
  lastSyncedDevice: string | null;
  autoSyncEnabled: boolean;
  driveFileId: string | null;
  setAutoSyncEnabled: (enabled: boolean) => void;
  loginWithGoogleDrive: () => Promise<{ success: boolean; message: string; isNewDriveData?: boolean }>;
  switchGoogleDriveAccount: () => Promise<{ success: boolean; message: string; isNewDriveData?: boolean }>;
  syncToGoogleDrive: (forceOverwrite?: boolean) => Promise<{ success: boolean; message: string }>;
  syncFromGoogleDrive: (forceOverwrite?: boolean) => Promise<{ success: boolean; message: string }>;
  disconnectGoogleDrive: () => Promise<void>;
  // Master Actions
  addItem: (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => { success: boolean; message?: string };
  updateItem: (id: string, item: Partial<Item>) => { success: boolean; message?: string };
  deleteItem: (id: string) => { success: boolean; message?: string };

  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, cat: Partial<Category>) => void;
  deleteCategory: (id: string) => { success: boolean; message?: string };

  addUnit: (unit: Omit<UnitMeasure, 'id'>) => void;
  updateUnit: (id: string, unit: Partial<UnitMeasure>) => void;
  deleteUnit: (id: string) => { success: boolean; message?: string };

  addLocation: (loc: Omit<StorageLocation, 'id'>) => void;
  updateLocation: (id: string, loc: Partial<StorageLocation>) => void;
  deleteLocation: (id: string) => { success: boolean; message?: string };

  addSupplier: (sup: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, sup: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => { success: boolean; message?: string };

  addDepartment: (dep: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, dep: Partial<Department>) => void;
  deleteDepartment: (id: string) => { success: boolean; message?: string };

  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => { success: boolean; message?: string };

  // Transaction Actions
  addStockIn: (data: {
    date: string;
    supplierId: string;
    documentNumber: string;
    deliveryNote: string;
    description: string;
    details: Array<{
      itemId: string;
      quantity: number;
      price: number;
      batchNumber: string;
      productionDate?: string;
      expiryDate?: string;
      locationId: string;
      condition: 'Baik' | 'Rusak' | 'Segel Terbuka';
      notes?: string;
    }>;
  }) => { success: boolean; message?: string; transactionNumber?: string };

  addStockOut: (data: {
    date: string;
    departmentId: string;
    departmentName: string;
    requesterName: string;
    requestNumber: string;
    description: string;
    details: Array<{
      itemId: string;
      quantity: number;
      batchNumber?: string;
      locationId: string;
      notes?: string;
    }>;
  }) => { success: boolean; message?: string; transactionNumber?: string };

  addAdjustment: (data: {
    date: string;
    itemId: string;
    quantityAfter: number;
    reason: StockAdjustment['reason'];
    description: string;
  }) => { success: boolean; message?: string };

  addStockOpname: (data: {
    date: string;
    locationId: string;
    description: string;
    details: Array<{
      itemId: string;
      systemQuantity: number;
      physicalQuantity: number;
      reason: string;
      notes?: string;
    }>;
    applyAdjustmentNow?: boolean;
  }) => { success: boolean; message?: string };

  approveStockOpname: (id: string) => { success: boolean; message?: string };

  // Stock Card
  getItemStockCard: (itemId: string, startDate?: string, endDate?: string) => StockCardEntry[];

  // System
  logAudit: (activity: string, module: string, oldData?: string, newData?: string) => void;
  resetToDefaultData: () => void;
  exportDatabaseJSON: () => void;
  importDatabaseJSON: (jsonString: string) => { success: boolean; message?: string };
}

const STORAGE_KEY_PREFIX = 'sim_inv_v4_';

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [units, setUnits] = useState<UnitMeasure[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'units');
    return saved ? JSON.parse(saved) : INITIAL_UNITS;
  });

  const [locations, setLocations] = useState<StorageLocation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'locations');
    return saved ? JSON.parse(saved) : INITIAL_LOCATIONS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'departments');
    return saved ? JSON.parse(saved) : INITIAL_DEPARTMENTS;
  });

  const [items, setItems] = useState<Item[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'items');
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  const [stockIns, setStockIns] = useState<StockInTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'stock_in');
    return saved ? JSON.parse(saved) : INITIAL_STOCK_IN;
  });

  const [stockOuts, setStockOuts] = useState<StockOutTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'stock_out');
    return saved ? JSON.parse(saved) : INITIAL_STOCK_OUT;
  });

  const [adjustments, setAdjustments] = useState<StockAdjustment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'adjustments');
    return saved ? JSON.parse(saved) : INITIAL_ADJUSTMENTS;
  });

  const [stockOpnames, setStockOpnames] = useState<StockOpname[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'stock_opnames');
    return saved ? JSON.parse(saved) : INITIAL_STOCK_OPNAMES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [orderRequests, setOrderRequests] = useState<OrderRequestLetter[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'order_requests');
    return saved ? JSON.parse(saved) : INITIAL_ORDER_REQUESTS;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderLetter[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'purchase_orders');
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_ORDERS;
  });

  // Google Drive Cloud Sync State
  const [isGoogleConnected, setIsGoogleConnected] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_PREFIX + 'gdrive_connected') === 'true';
  });
  const [googleUser, setGoogleUser] = useState<{ email: string; displayName: string; photoURL?: string } | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'gdrive_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'idle'>('idle');
  const [lastCloudSyncTime, setLastCloudSyncTime] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY_PREFIX + 'gdrive_last_sync') || null;
  });
  const [lastSyncedDevice, setLastSyncedDevice] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY_PREFIX + 'gdrive_last_device') || null;
  });
  const [autoSyncEnabled, setAutoSyncEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'gdrive_auto_sync');
    return saved !== null ? saved === 'true' : true;
  });
  const [driveFileId, setDriveFileId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY_PREFIX + 'gdrive_file_id') || null;
  });

  const setAutoSyncEnabled = (enabled: boolean) => {
    setAutoSyncEnabledState(enabled);
    localStorage.setItem(STORAGE_KEY_PREFIX + 'gdrive_auto_sync', String(enabled));
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'gdrive_connected', String(isGoogleConnected));
  }, [isGoogleConnected]);
  useEffect(() => {
    if (googleUser) {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'gdrive_user', JSON.stringify(googleUser));
    } else {
      localStorage.removeItem(STORAGE_KEY_PREFIX + 'gdrive_user');
    }
  }, [googleUser]);
  useEffect(() => {
    if (lastCloudSyncTime) {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'gdrive_last_sync', lastCloudSyncTime);
    }
  }, [lastCloudSyncTime]);
  useEffect(() => {
    if (lastSyncedDevice) {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'gdrive_last_device', lastSyncedDevice);
    }
  }, [lastSyncedDevice]);
  useEffect(() => {
    if (driveFileId) {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'gdrive_file_id', driveFileId);
    } else {
      localStorage.removeItem(STORAGE_KEY_PREFIX + 'gdrive_file_id');
    }
  }, [driveFileId]);

  // Auth listener for Google Session
  useEffect(() => {
    const unsubscribe = initAuth(
      (fbUser) => {
        setIsGoogleConnected(true);
        setGoogleUser({
          email: fbUser.email || '',
          displayName: fbUser.displayName || fbUser.email || '',
          photoURL: fbUser.photoURL || undefined,
        });
      },
      () => {
        // Auth state changed
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'users', JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY_PREFIX + 'current_user');
    }
  }, [currentUser]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'categories', JSON.stringify(categories));
  }, [categories]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'units', JSON.stringify(units));
  }, [units]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'locations', JSON.stringify(locations));
  }, [locations]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'suppliers', JSON.stringify(suppliers));
  }, [suppliers]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'departments', JSON.stringify(departments));
  }, [departments]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'items', JSON.stringify(items));
  }, [items]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'stock_in', JSON.stringify(stockIns));
  }, [stockIns]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'stock_out', JSON.stringify(stockOuts));
  }, [stockOuts]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'adjustments', JSON.stringify(adjustments));
  }, [adjustments]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'stock_opnames', JSON.stringify(stockOpnames));
  }, [stockOpnames]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'order_requests', JSON.stringify(orderRequests));
  }, [orderRequests]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'purchase_orders', JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  const logAudit = (activity: string, module: string, oldData?: string, newData?: string) => {
    const newLog: AuditLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      userId: currentUser?.id || 'usr-system',
      userName: currentUser?.name || 'Sistem',
      role: currentUser?.role || 'admin',
      activity,
      module,
      oldData,
      newData,
      ipAddress: '192.168.1.' + Math.floor(Math.random() * 80 + 10),
      createdAt: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Master Items
  const addItem = (newItemData: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Validate uniqueness of item code
    if (items.some((i) => i.code.trim().toUpperCase() === newItemData.code.trim().toUpperCase())) {
      return { success: false, message: `Kode barang "${newItemData.code}" sudah terdaftar!` };
    }

    const now = new Date().toISOString();
    const newItem: Item = {
      ...newItemData,
      id: 'itm-' + Date.now(),
      status: newItemData.currentStock <= 0 ? 'Habis' : newItemData.status || 'Aktif',
      createdAt: now,
      updatedAt: now,
    };

    setItems((prev) => [newItem, ...prev]);
    logAudit(
      `Menambahkan master barang baru: ${newItem.code} - ${newItem.name}`,
      'Master Barang',
      undefined,
      `Stok: ${newItem.currentStock}, Min: ${newItem.minimumStock}, Harga: ${newItem.price}`
    );
    return { success: true };
  };

  const updateItem = (id: string, updatedFields: Partial<Item>) => {
    const existing = items.find((i) => i.id === id);
    if (!existing) return { success: false, message: 'Barang tidak ditemukan' };

    if (
      updatedFields.code &&
      updatedFields.code.trim().toUpperCase() !== existing.code.trim().toUpperCase() &&
      items.some((i) => i.id !== id && i.code.trim().toUpperCase() === updatedFields.code!.trim().toUpperCase())
    ) {
      return { success: false, message: `Kode barang "${updatedFields.code}" sudah digunakan barang lain!` };
    }

    const updatedItem: Item = {
      ...existing,
      ...updatedFields,
      updatedAt: new Date().toISOString(),
    };

    // Recalculate status if current stock changed
    if (typeof updatedItem.currentStock === 'number') {
      if (updatedItem.currentStock <= 0) {
        updatedItem.status = 'Habis';
      } else if (updatedItem.status === 'Habis' && updatedItem.currentStock > 0) {
        updatedItem.status = 'Aktif';
      }
    }

    setItems((prev) => prev.map((item) => (item.id === id ? updatedItem : item)));
    logAudit(
      `Mengubah data master barang: ${existing.code}`,
      'Master Barang',
      `Nama: ${existing.name}, Stok: ${existing.currentStock}`,
      `Nama: ${updatedItem.name}, Stok: ${updatedItem.currentStock}`
    );
    return { success: true };
  };

  const deleteItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return { success: false, message: 'Barang tidak ditemukan' };

    // Check if referenced in transactions
    const inStockIn = stockIns.some((tr) => tr.details.some((d) => d.itemId === id));
    const inStockOut = stockOuts.some((tr) => tr.details.some((d) => d.itemId === id));
    if (inStockIn || inStockOut) {
      return {
        success: false,
        message: 'Barang ini tidak dapat dihapus karena sudah memiliki riwayat transaksi masuk/keluar. Anda dapat mengubah statusnya menjadi Tidak Aktif.',
      };
    }

    setItems((prev) => prev.filter((i) => i.id !== id));
    logAudit(`Menghapus master barang: ${item.code} (${item.name})`, 'Master Barang', `ID: ${item.id}`, undefined);
    return { success: true };
  };

  // Categories
  const addCategory = (catData: Omit<Category, 'id'>) => {
    const newCat: Category = { ...catData, id: 'cat-' + Date.now() };
    setCategories((prev) => [...prev, newCat]);
    logAudit(`Menambahkan kategori: ${newCat.name}`, 'Kategori', undefined, `Kode: ${newCat.code}`);
  };

  const updateCategory = (id: string, catData: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...catData } : c)));
    logAudit(`Mengubah kategori ID: ${id}`, 'Kategori');
  };

  const deleteCategory = (id: string) => {
    if (items.some((i) => i.categoryId === id)) {
      return { success: false, message: 'Kategori sedang digunakan oleh data barang dan tidak dapat dihapus.' };
    }
    const cat = categories.find((c) => c.id === id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    logAudit(`Menghapus kategori: ${cat?.name || id}`, 'Kategori');
    return { success: true };
  };

  // Units
  const addUnit = (unitData: Omit<UnitMeasure, 'id'>) => {
    const newUnit: UnitMeasure = { ...unitData, id: 'unt-' + Date.now() };
    setUnits((prev) => [...prev, newUnit]);
    logAudit(`Menambahkan satuan: ${newUnit.name} (${newUnit.symbol})`, 'Satuan');
  };

  const updateUnit = (id: string, unitData: Partial<UnitMeasure>) => {
    setUnits((prev) => prev.map((u) => (u.id === id ? { ...u, ...unitData } : u)));
    logAudit(`Mengubah satuan ID: ${id}`, 'Satuan');
  };

  const deleteUnit = (id: string) => {
    if (items.some((i) => i.unitId === id)) {
      return { success: false, message: 'Satuan sedang digunakan oleh barang dan tidak dapat dihapus.' };
    }
    const u = units.find((x) => x.id === id);
    setUnits((prev) => prev.filter((x) => x.id !== id));
    logAudit(`Menghapus satuan: ${u?.name || id}`, 'Satuan');
    return { success: true };
  };

  // Locations
  const addLocation = (locData: Omit<StorageLocation, 'id'>) => {
    const newLoc: StorageLocation = { ...locData, id: 'loc-' + Date.now() };
    setLocations((prev) => [...prev, newLoc]);
    logAudit(`Menambahkan lokasi: ${newLoc.name}`, 'Lokasi');
  };

  const updateLocation = (id: string, locData: Partial<StorageLocation>) => {
    setLocations((prev) => prev.map((l) => (l.id === id ? { ...l, ...locData } : l)));
    logAudit(`Mengubah lokasi ID: ${id}`, 'Lokasi');
  };

  const deleteLocation = (id: string) => {
    if (items.some((i) => i.locationId === id)) {
      return { success: false, message: 'Lokasi sedang digunakan oleh barang dan tidak dapat dihapus.' };
    }
    const loc = locations.find((l) => l.id === id);
    setLocations((prev) => prev.filter((l) => l.id !== id));
    logAudit(`Menghapus lokasi: ${loc?.name || id}`, 'Lokasi');
    return { success: true };
  };

  // Suppliers
  const addSupplier = (supData: Omit<Supplier, 'id'>) => {
    const newSup: Supplier = { ...supData, id: 'sup-' + Date.now() };
    setSuppliers((prev) => [...prev, newSup]);
    logAudit(`Menambahkan supplier: ${newSup.name}`, 'Supplier');
  };

  const updateSupplier = (id: string, supData: Partial<Supplier>) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...supData } : s)));
    logAudit(`Mengubah supplier ID: ${id}`, 'Supplier');
  };

  const deleteSupplier = (id: string) => {
    if (items.some((i) => i.supplierId === id)) {
      return { success: false, message: 'Supplier terhubung dengan master barang dan tidak dapat dihapus.' };
    }
    const s = suppliers.find((x) => x.id === id);
    setSuppliers((prev) => prev.filter((x) => x.id !== id));
    logAudit(`Menghapus supplier: ${s?.name || id}`, 'Supplier');
    return { success: true };
  };

  // Departments
  const addDepartment = (depData: Omit<Department, 'id'>) => {
    const newDep: Department = { ...depData, id: 'dep-' + Date.now() };
    setDepartments((prev) => [...prev, newDep]);
    logAudit(`Menambahkan unit pemakai: ${newDep.name}`, 'Unit Pemakai');
  };

  const updateDepartment = (id: string, depData: Partial<Department>) => {
    setDepartments((prev) => prev.map((d) => (d.id === id ? { ...d, ...depData } : d)));
    logAudit(`Mengubah unit pemakai ID: ${id}`, 'Unit Pemakai');
  };

  const deleteDepartment = (id: string) => {
    const d = departments.find((x) => x.id === id);
    setDepartments((prev) => prev.filter((x) => x.id !== id));
    logAudit(`Menghapus unit pemakai: ${d?.name || id}`, 'Unit Pemakai');
    return { success: true };
  };

  // Users & Auth
  const login = (usernameInput: string, passwordInput?: string) => {
    const trimmed = usernameInput.trim().toLowerCase();
    const pwd = (passwordInput || '').trim();

    if (!trimmed) {
      return { success: false, message: 'ID / Username wajib diisi!' };
    }

    const found = users.find(
      (u) => u.username.toLowerCase() === trimmed || u.id.toLowerCase() === trimmed
    );

    if (!found) {
      return { success: false, message: 'ID Username tidak ditemukan dalam sistem.' };
    }

    if (found.status === 'inactive') {
      return { success: false, message: 'Akun pengguna ini dinonaktifkan. Hubungi Administrator.' };
    }

    if (found.password && found.password !== pwd) {
      return { success: false, message: 'Password salah. Periksa huruf besar/kecil Anda.' };
    }

    setCurrentUser(found);
    logAudit(`Pengguna "${found.name}" berhasil login`, 'Autentikasi', undefined, `Role: ${found.role}`);
    return { success: true };
  };

  const logout = () => {
    if (currentUser) {
      logAudit(`Pengguna "${currentUser.name}" keluar (logout)`, 'Autentikasi');
    }
    setCurrentUser(null);
  };

  const registerInitialAdmin = (data: {
    name: string;
    username: string;
    password: string;
    email?: string;
    phone?: string;
    department?: string;
  }) => {
    const trimmedUser = data.username.trim().toLowerCase();
    if (!trimmedUser || !data.name.trim() || !data.password) {
      return { success: false, message: 'Nama Lengkap, Username, dan Password wajib diisi!' };
    }

    if (users.some((u) => u.username.toLowerCase() === trimmedUser)) {
      return { success: false, message: 'Username sudah digunakan oleh akun lain.' };
    }

    const newAdmin: User = {
      id: 'usr-' + Date.now(),
      name: data.name.trim(),
      username: trimmedUser,
      password: data.password,
      role: 'admin',
      status: 'active',
      email: data.email?.trim() || `${trimmedUser}@inventaris.id`,
      phone: data.phone?.trim() || '',
      department: data.department?.trim() || 'Gudang & Lab Pusat',
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...users, newAdmin];
    setUsers(updatedUsers);
    setCurrentUser(newAdmin);
    logAudit(`Inisialisasi Administrator Utama: ${newAdmin.name} (@${newAdmin.username})`, 'Autentikasi');
    return { success: true };
  };

  const registerUser = (data: {
    name: string;
    username: string;
    password: string;
    role: UserRole;
    email?: string;
    phone?: string;
    department?: string;
  }) => {
    const trimmedUser = data.username.trim().toLowerCase();
    if (!trimmedUser || !data.name.trim() || !data.password) {
      return { success: false, message: 'Nama Lengkap, ID Username, dan Password wajib diisi!' };
    }

    if (users.some((u) => u.username.toLowerCase() === trimmedUser)) {
      return { success: false, message: `Username "${trimmedUser}" sudah terdaftar! Silakan pilih ID Username lain.` };
    }

    const newUser: User = {
      id: 'usr-' + Date.now(),
      name: data.name.trim(),
      username: trimmedUser,
      password: data.password,
      role: data.role || 'petugas',
      status: 'active',
      email: data.email?.trim() || `${trimmedUser}@inventaris.local`,
      phone: data.phone?.trim() || '',
      department: data.department?.trim() || 'Logistik & Gudang',
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    logAudit(`Pendaftaran akun pengguna baru: ${newUser.name} (@${newUser.username}) [${newUser.role}]`, 'Autentikasi');
    return { success: true };
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: 'usr-' + Date.now(),
      password: userData.password?.trim() || '123456',
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    logAudit(`Menambahkan pengguna baru: ${newUser.username} (${newUser.role})`, 'User Management');
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...userData } : u)));
    if (currentUser && currentUser.id === id) {
      setCurrentUser((prev) => (prev ? { ...prev, ...userData } : null));
    }
    logAudit(`Mengubah pengguna ID: ${id}`, 'User Management');
  };

  const deleteUser = (id: string) => {
    if (currentUser && currentUser.id === id) {
      return { success: false, message: 'Anda tidak dapat menghapus akun yang sedang aktif digunakan.' };
    }
    const u = users.find((x) => x.id === id);
    setUsers((prev) => prev.filter((x) => x.id !== id));
    logAudit(`Menghapus pengguna: ${u?.username || id}`, 'User Management');
    return { success: true };
  };

  // Transaction: Stock In
  const addStockIn = (data: {
    date: string;
    supplierId: string;
    documentNumber: string;
    deliveryNote: string;
    description: string;
    details: Array<{
      itemId: string;
      quantity: number;
      price: number;
      batchNumber: string;
      productionDate?: string;
      expiryDate?: string;
      locationId: string;
      condition: 'Baik' | 'Rusak' | 'Segel Terbuka';
      notes?: string;
    }>;
  }) => {
    if (data.details.length === 0) {
      return { success: false, message: 'Daftar rincian barang masuk tidak boleh kosong.' };
    }

    const prefix = 'BM-' + data.date.replace(/-/g, '').substring(0, 6);
    const countToday = stockIns.filter((s) => s.transactionNumber.startsWith(prefix)).length + 1;
    const transactionNumber = `${prefix}-${String(countToday).padStart(3, '0')}`;

    const newStockIn: StockInTransaction = {
      id: 'tr-in-' + Date.now(),
      transactionNumber,
      date: data.date,
      supplierId: data.supplierId,
      documentNumber: data.documentNumber,
      deliveryNote: data.deliveryNote,
      userId: currentUser?.id || 'usr-system',
      userName: currentUser?.name || 'Sistem',
      description: data.description,
      createdAt: new Date().toISOString(),
      details: data.details.map((d, index) => ({
        ...d,
        id: `det-in-${Date.now()}-${index}`,
      })),
    };

    // Update Items Stock & Lab specifics
    setItems((prevItems) => {
      const updated = [...prevItems];
      data.details.forEach((d) => {
        const itemIdx = updated.findIndex((i) => i.id === d.itemId);
        if (itemIdx >= 0) {
          const item = updated[itemIdx];
          const newQty = item.currentStock + Number(d.quantity);
          updated[itemIdx] = {
            ...item,
            currentStock: newQty,
            status: newQty > 0 && item.status === 'Habis' ? 'Aktif' : item.status,
            price: d.price > 0 ? d.price : item.price,
            batchNumber: d.batchNumber || item.batchNumber,
            expiryDate: d.expiryDate || item.expiryDate,
            productionDate: d.productionDate || item.productionDate,
            locationId: d.locationId || item.locationId,
            updatedAt: new Date().toISOString(),
          };
        }
      });
      return updated;
    });

    setStockIns((prev) => [newStockIn, ...prev]);

    const supplierName = suppliers.find((s) => s.id === data.supplierId)?.name || 'Supplier';
    logAudit(
      `Barang Masuk ${transactionNumber}`,
      'Barang Masuk',
      undefined,
      `Pemasok: ${supplierName}, Jumlah item: ${data.details.length}, No Dokumen: ${data.documentNumber}`
    );

    return { success: true, transactionNumber };
  };

  // Transaction: Stock Out (With strict non-negative stock validation)
  const addStockOut = (data: {
    date: string;
    departmentId: string;
    departmentName: string;
    requesterName: string;
    requestNumber: string;
    description: string;
    details: Array<{
      itemId: string;
      quantity: number;
      batchNumber?: string;
      locationId: string;
      notes?: string;
    }>;
  }) => {
    if (data.details.length === 0) {
      return { success: false, message: 'Rincian barang keluar tidak boleh kosong.' };
    }

    // STRICT VALIDATION (PRD Section 12 & 22.4):
    // Sistem tidak boleh mengizinkan barang keluar apabila jumlah yang diminta lebih besar daripada stok yang tersedia.
    for (const d of data.details) {
      const item = items.find((i) => i.id === d.itemId);
      if (!item) {
        return { success: false, message: 'Barang tidak valid dalam daftar.' };
      }
      if (Number(d.quantity) <= 0) {
        return { success: false, message: `Jumlah pengeluaran untuk ${item.name} harus lebih besar dari 0.` };
      }
      if (d.quantity > item.currentStock) {
        return {
          success: false,
          message: `Stok tidak mencukupi untuk "${item.name}". Stok tersedia: ${item.currentStock}. Permintaan: ${d.quantity}.`,
        };
      }
    }

    const prefix = 'BK-' + data.date.replace(/-/g, '').substring(0, 6);
    const countToday = stockOuts.filter((s) => s.transactionNumber.startsWith(prefix)).length + 1;
    const transactionNumber = `${prefix}-${String(countToday).padStart(3, '0')}`;

    const newStockOut: StockOutTransaction = {
      id: 'tr-out-' + Date.now(),
      transactionNumber,
      date: data.date,
      departmentId: data.departmentId,
      departmentName: data.departmentName,
      requesterName: data.requesterName,
      requestNumber: data.requestNumber,
      userId: currentUser?.id || 'usr-system',
      userName: currentUser?.name || 'Sistem',
      description: data.description,
      createdAt: new Date().toISOString(),
      details: data.details.map((d, index) => ({
        ...d,
        id: `det-out-${Date.now()}-${index}`,
      })),
    };

    // Update Items Stock
    setItems((prevItems) => {
      const updated = [...prevItems];
      data.details.forEach((d) => {
        const itemIdx = updated.findIndex((i) => i.id === d.itemId);
        if (itemIdx >= 0) {
          const item = updated[itemIdx];
          const newQty = Math.max(0, item.currentStock - Number(d.quantity));
          updated[itemIdx] = {
            ...item,
            currentStock: newQty,
            status: newQty === 0 ? 'Habis' : item.status,
            updatedAt: new Date().toISOString(),
          };
        }
      });
      return updated;
    });

    setStockOuts((prev) => [newStockOut, ...prev]);

    logAudit(
      `Barang Keluar ${transactionNumber}`,
      'Barang Keluar',
      undefined,
      `Unit: ${data.departmentName}, Pemohon: ${data.requesterName}, Total item: ${data.details.length}`
    );

    return { success: true, transactionNumber };
  };

  // Stock Adjustment (Admin only)
  const addAdjustment = (data: {
    date: string;
    itemId: string;
    quantityAfter: number;
    reason: StockAdjustment['reason'];
    description: string;
  }) => {
    const item = items.find((i) => i.id === data.itemId);
    if (!item) return { success: false, message: 'Barang tidak ditemukan' };

    if (data.quantityAfter < 0) {
      return { success: false, message: 'Stok hasil penyesuaian tidak boleh bernilai negatif.' };
    }

    const prefix = 'ADJ-' + data.date.replace(/-/g, '').substring(0, 6);
    const countToday = adjustments.filter((a) => a.adjustmentNumber.startsWith(prefix)).length + 1;
    const adjustmentNumber = `${prefix}-${String(countToday).padStart(3, '0')}`;

    const diff = Number(data.quantityAfter) - item.currentStock;

    const newAdj: StockAdjustment = {
      id: 'adj-' + Date.now(),
      adjustmentNumber,
      date: data.date,
      itemId: data.itemId,
      quantityBefore: item.currentStock,
      quantityAfter: Number(data.quantityAfter),
      difference: diff,
      reason: data.reason,
      userId: currentUser?.id || 'usr-system',
      userName: currentUser?.name || 'Sistem',
      description: data.description,
      createdAt: new Date().toISOString(),
    };

    setItems((prev) =>
      prev.map((i) =>
        i.id === data.itemId
          ? {
              ...i,
              currentStock: Number(data.quantityAfter),
              status: Number(data.quantityAfter) <= 0 ? 'Habis' : i.status === 'Habis' ? 'Aktif' : i.status,
              updatedAt: new Date().toISOString(),
            }
          : i
      )
    );

    setAdjustments((prev) => [newAdj, ...prev]);

    logAudit(
      `Penyesuaian Stok ${adjustmentNumber}`,
      'Penyesuaian Stok',
      `Barang: ${item.code}, Stok Lama: ${item.currentStock}`,
      `Stok Baru: ${data.quantityAfter}, Selisih: ${diff}, Alasan: ${data.reason}`
    );

    return { success: true };
  };

  // Stock Opname
  const addStockOpname = (data: {
    date: string;
    locationId: string;
    description: string;
    details: Array<{
      itemId: string;
      systemQuantity: number;
      physicalQuantity: number;
      reason: string;
      notes?: string;
    }>;
    applyAdjustmentNow?: boolean;
  }) => {
    const prefix = 'SO-' + data.date.replace(/-/g, '').substring(0, 6);
    const countToday = stockOpnames.filter((s) => s.opnameNumber.startsWith(prefix)).length + 1;
    const opnameNumber = `${prefix}-${String(countToday).padStart(3, '0')}`;

    const newSO: StockOpname = {
      id: 'so-' + Date.now(),
      opnameNumber,
      date: data.date,
      locationId: data.locationId,
      userId: currentUser?.id || 'usr-system',
      userName: currentUser?.name || 'Sistem',
      description: data.description,
      status: data.applyAdjustmentNow ? 'approved' : 'draft',
      createdAt: new Date().toISOString(),
      details: data.details.map((d, index) => ({
        ...d,
        difference: Number(d.physicalQuantity) - Number(d.systemQuantity),
        id: `sod-${Date.now()}-${index}`,
      })),
    };

    setStockOpnames((prev) => [newSO, ...prev]);

    // If apply adjustment now was requested
    if (data.applyAdjustmentNow) {
      data.details.forEach((d) => {
        const diff = Number(d.physicalQuantity) - Number(d.systemQuantity);
        if (diff !== 0) {
          addAdjustment({
            date: data.date,
            itemId: d.itemId,
            quantityAfter: Number(d.physicalQuantity),
            reason: (d.reason as StockAdjustment['reason']) || 'Kesalahan pencatatan',
            description: `Penyesuaian otomatis dari Stock Opname ${opnameNumber}: ${d.notes || ''}`,
          });
        }
      });
    }

    logAudit(
      `Stock Opname ${opnameNumber} (${data.applyAdjustmentNow ? 'Disetujui' : 'Draft'})`,
      'Stock Opname',
      undefined,
      `Total item diperiksa: ${data.details.length}`
    );

    return { success: true };
  };

  const approveStockOpname = (id: string) => {
    const so = stockOpnames.find((s) => s.id === id);
    if (!so) return { success: false, message: 'Stock opname tidak ditemukan.' };
    if (so.status === 'approved') return { success: false, message: 'Stock opname sudah disetujui sebelumnya.' };

    // Apply adjustments for items with difference
    so.details.forEach((d) => {
      const diff = Number(d.physicalQuantity) - Number(d.systemQuantity);
      if (diff !== 0) {
        addAdjustment({
          date: so.date,
          itemId: d.itemId,
          quantityAfter: Number(d.physicalQuantity),
          reason: (d.reason as StockAdjustment['reason']) || 'Kesalahan pencatatan',
          description: `Penyesuaian dari persetujuan Stock Opname ${so.opnameNumber}: ${d.notes || ''}`,
        });
      }
    });

    setStockOpnames((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'approved' } : s)));
    logAudit(`Menyetujui Stock Opname ${so.opnameNumber}`, 'Stock Opname', 'Status: draft', 'Status: approved');

    return { success: true };
  };

  // Stock Card (Dynamic chronological ledger)
  const getItemStockCard = (itemId: string, startDate?: string, endDate?: string): StockCardEntry[] => {
    const targetItem = items.find((i) => i.id === itemId);
    if (!targetItem) return [];

    const rawMovements: Array<{
      date: string;
      transactionNumber: string;
      type: StockCardEntry['type'];
      inQty: number;
      outQty: number;
      adjustmentQty: number;
      officer: string;
      notes: string;
      batchNumber?: string;
      createdAt: string;
    }> = [];

    // 1. Stock In
    stockIns.forEach((tr) => {
      tr.details.forEach((d) => {
        if (d.itemId === itemId) {
          rawMovements.push({
            date: tr.date,
            transactionNumber: tr.transactionNumber,
            type: 'Barang Masuk',
            inQty: Number(d.quantity),
            outQty: 0,
            adjustmentQty: 0,
            officer: tr.userName,
            notes: `Dari: ${suppliers.find((s) => s.id === tr.supplierId)?.name || 'Supplier'} (SJ: ${tr.deliveryNote})`,
            batchNumber: d.batchNumber,
            createdAt: tr.createdAt,
          });
        }
      });
    });

    // 2. Stock Out
    stockOuts.forEach((tr) => {
      tr.details.forEach((d) => {
        if (d.itemId === itemId) {
          rawMovements.push({
            date: tr.date,
            transactionNumber: tr.transactionNumber,
            type: 'Barang Keluar',
            inQty: 0,
            outQty: Number(d.quantity),
            adjustmentQty: 0,
            officer: tr.userName,
            notes: `Ke: ${tr.departmentName} (Pemohon: ${tr.requesterName})`,
            batchNumber: d.batchNumber,
            createdAt: tr.createdAt,
          });
        }
      });
    });

    // 3. Adjustments
    adjustments.forEach((adj) => {
      if (adj.itemId === itemId) {
        rawMovements.push({
          date: adj.date,
          transactionNumber: adj.adjustmentNumber,
          type: 'Penyesuaian',
          inQty: adj.difference > 0 ? adj.difference : 0,
          outQty: adj.difference < 0 ? Math.abs(adj.difference) : 0,
          adjustmentQty: adj.difference,
          officer: adj.userName,
          notes: `Alasan: ${adj.reason}. ${adj.description}`,
          batchNumber: undefined,
          createdAt: adj.createdAt,
        });
      }
    });

    // Sort chronologically (oldest to newest)
    rawMovements.sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date);
      if (dateCmp !== 0) return dateCmp;
      return a.createdAt.localeCompare(b.createdAt);
    });

    // Calculate initial baseline balance so current balance matches targetItem.currentStock
    const totalIn = rawMovements.reduce((sum, m) => sum + m.inQty, 0);
    const totalOut = rawMovements.reduce((sum, m) => sum + m.outQty, 0);
    const netFromTransactions = totalIn - totalOut;

    let initialBalance = targetItem.currentStock - netFromTransactions;
    if (initialBalance < 0) initialBalance = 0;

    let runningBalance = initialBalance;

    const fullCardEntries: StockCardEntry[] = [
      {
        id: 'sc-init',
        date: targetItem.createdAt.split('T')[0] || '2026-01-01',
        transactionNumber: 'SALDO-AWAL',
        type: 'Saldo Awal',
        inQty: 0,
        outQty: 0,
        adjustmentQty: 0,
        balance: initialBalance,
        officer: 'System',
        notes: 'Saldo Awal Registrasi Barang',
      },
    ];

    rawMovements.forEach((m, idx) => {
      runningBalance = runningBalance + m.inQty - m.outQty;
      fullCardEntries.push({
        id: `sc-mov-${idx}`,
        date: m.date,
        transactionNumber: m.transactionNumber,
        type: m.type,
        inQty: m.inQty,
        outQty: m.outQty,
        adjustmentQty: m.adjustmentQty,
        balance: runningBalance,
        officer: m.officer,
        notes: m.notes,
        batchNumber: m.batchNumber,
      });
    });

    // Filter by dates if provided
    let filtered = fullCardEntries;
    if (startDate) {
      filtered = filtered.filter((e) => e.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter((e) => e.date <= endDate);
    }

    return filtered;
  };

  // Reset database to initial sample data
  const resetToDefaultData = () => {
    setUsers(INITIAL_USERS);
    setCurrentUser(null);
    setCategories(INITIAL_CATEGORIES);
    setUnits(INITIAL_UNITS);
    setLocations(INITIAL_LOCATIONS);
    setSuppliers(INITIAL_SUPPLIERS);
    setDepartments(INITIAL_DEPARTMENTS);
    setItems(INITIAL_ITEMS);
    setStockIns(INITIAL_STOCK_IN);
    setStockOuts(INITIAL_STOCK_OUT);
    setAdjustments(INITIAL_ADJUSTMENTS);
    setStockOpnames(INITIAL_STOCK_OPNAMES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setOrderRequests(INITIAL_ORDER_REQUESTS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);

    Object.keys(localStorage)
      .filter((k) => k.startsWith(STORAGE_KEY_PREFIX))
      .forEach((k) => localStorage.removeItem(k));

    logAudit('Melakukan reset database ke data awal bersih', 'Pengaturan');
  };

  // Export database JSON
  const exportDatabaseJSON = () => {
    const backup = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      users,
      categories,
      units,
      locations,
      suppliers,
      departments,
      items,
      stockIns,
      stockOuts,
      adjustments,
      stockOpnames,
      auditLogs,
      orderRequests,
      purchaseOrders,
    };
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_inventaris_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    logAudit('Mengunduh file cadangan database (JSON)', 'Pengaturan');
  };

  // Import database JSON
  const importDatabaseJSON = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (!data.items || !data.categories) {
        return { success: false, message: 'Format file JSON cadangan tidak valid.' };
      }
      if (data.users) setUsers(data.users);
      if (data.categories) setCategories(data.categories);
      if (data.units) setUnits(data.units);
      if (data.locations) setLocations(data.locations);
      if (data.suppliers) setSuppliers(data.suppliers);
      if (data.departments) setDepartments(data.departments);
      if (data.items) setItems(data.items);
      if (data.stockIns) setStockIns(data.stockIns);
      if (data.stockOuts) setStockOuts(data.stockOuts);
      if (data.adjustments) setAdjustments(data.adjustments);
      if (data.stockOpnames) setStockOpnames(data.stockOpnames);
      if (data.auditLogs) setAuditLogs(data.auditLogs);
      if (data.orderRequests) setOrderRequests(data.orderRequests);
      if (data.purchaseOrders) setPurchaseOrders(data.purchaseOrders);

      logAudit('Memulihkan database dari file cadangan JSON', 'Pengaturan');
      return { success: true };
    } catch {
      return { success: false, message: 'Gagal membaca berkas JSON. Format tidak valid.' };
    }
  };

  // Order Request Letter CRUD
  const addOrderRequest = (
    data: Omit<OrderRequestLetter, 'id' | 'createdAt' | 'updatedAt'>
  ): { success: boolean; id: string; message?: string } => {
    const newId = 'req-' + Date.now();
    const now = new Date().toISOString();
    const newLetter: OrderRequestLetter = {
      ...data,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };
    setOrderRequests((prev) => [newLetter, ...prev]);
    logAudit(
      `Membuat Surat Pengajuan Pesanan No. ${newLetter.nomor} (${newLetter.perihal}) untuk ${newLetter.items.length} bahan`,
      'Surat Pengajuan'
    );
    return {
      success: true,
      id: newId,
      message: `Surat Pengajuan Pesanan No. ${newLetter.nomor} berhasil disimpan!`,
    };
  };

  const updateOrderRequest = (
    id: string,
    data: Partial<OrderRequestLetter>
  ): { success: boolean; message?: string } => {
    const now = new Date().toISOString();
    setOrderRequests((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data, updatedAt: now } : item))
    );
    logAudit(`Memperbarui Surat Pengajuan Pesanan ID ${id}`, 'Surat Pengajuan');
    return { success: true, message: 'Surat Pengajuan Pesanan berhasil diperbarui.' };
  };

  const deleteOrderRequest = (id: string): { success: boolean; message?: string } => {
    setOrderRequests((prev) => prev.filter((item) => item.id !== id));
    logAudit(`Menghapus Surat Pengajuan Pesanan ID ${id}`, 'Surat Pengajuan');
    return { success: true, message: 'Surat Pengajuan Pesanan berhasil dihapus.' };
  };

  // Purchase Order Letter CRUD
  const addPurchaseOrder = (
    data: Omit<PurchaseOrderLetter, 'id' | 'createdAt' | 'updatedAt'>
  ): { success: boolean; id: string; message?: string } => {
    const newId = 'po-' + Date.now();
    const now = new Date().toISOString();
    const newPO: PurchaseOrderLetter = {
      ...data,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };
    setPurchaseOrders((prev) => [newPO, ...prev]);
    logAudit(
      `Membuat Surat Pesanan No. ${newPO.nomorSurat} kepada ${newPO.namaSupplier || newPO.supplierName || 'Pemasok'} (${newPO.items.length} barang)`,
      'Surat Pesanan'
    );
    return {
      success: true,
      id: newId,
      message: `Surat Pesanan No. ${newPO.nomorSurat} berhasil disimpan!`,
    };
  };

  const updatePurchaseOrder = (
    id: string,
    data: Partial<PurchaseOrderLetter>
  ): { success: boolean; message?: string } => {
    const now = new Date().toISOString();
    setPurchaseOrders((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...data, updatedAt: now } : item))
    );
    logAudit(`Memperbarui Surat Pesanan ID ${id}`, 'Surat Pesanan');
    return { success: true, message: 'Surat Pesanan berhasil diperbarui.' };
  };

  const deletePurchaseOrder = (id: string): { success: boolean; message?: string } => {
    setPurchaseOrders((prev) => prev.filter((item) => item.id !== id));
    logAudit(`Menghapus Surat Pesanan ID ${id}`, 'Surat Pesanan');
    return { success: true, message: 'Surat Pesanan berhasil dihapus.' };
  };

  // Google Drive Multi-Device Sync methods
  const isFirstMount = useRef(true);
  const autoSyncTimer = useRef<any>(null);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (!isGoogleConnected || !autoSyncEnabled) return;

    if (autoSyncTimer.current) {
      clearTimeout(autoSyncTimer.current);
    }

    autoSyncTimer.current = setTimeout(async () => {
      try {
        const token = await getAccessToken();
        if (!token) return;
        const payload: InventorySyncPayload = {
          appName: 'SIM_INVENTORY',
          appVersion: '1.0',
          schemaVersion: 1,
          lastUpdated: new Date().toISOString(),
          updatedBy: currentUser?.name || googleUser?.displayName || 'Pengguna',
          userEmail: googleUser?.email || '',
          device: getDeviceName(),
          data: {
            users,
            categories,
            units,
            locations,
            suppliers,
            departments,
            items,
            stockIns,
            stockOuts,
            adjustments,
            stockOpnames,
            auditLogs,
            orderRequests,
            purchaseOrders,
          },
        };
        const res = await saveCloudSyncFile(payload, token, driveFileId);
        setDriveFileId(res.fileId);
        setLastCloudSyncTime(res.modifiedTime);
        setLastSyncedDevice(getDeviceName());
        setCloudSyncStatus('synced');
      } catch (err) {
        console.warn('Auto-sync to Google Drive deferred:', err);
      }
    }, 4000);

    return () => {
      if (autoSyncTimer.current) clearTimeout(autoSyncTimer.current);
    };
  }, [
    items,
    stockIns,
    stockOuts,
    adjustments,
    stockOpnames,
    categories,
    units,
    locations,
    suppliers,
    departments,
    users,
    orderRequests,
    purchaseOrders,
    isGoogleConnected,
    autoSyncEnabled,
  ]);

  const loginWithGoogleDrive = async (): Promise<{
    success: boolean;
    message: string;
    isNewDriveData?: boolean;
  }> => {
    try {
      setCloudSyncStatus('syncing');
      const { user, accessToken } = await googleSignIn();
      const gUser = {
        email: user.email || '',
        displayName: user.displayName || user.email || 'Pengguna Google',
        photoURL: user.photoURL || undefined,
      };
      setIsGoogleConnected(true);
      setGoogleUser(gUser);

      // Search for cloud sync file on user's Google Drive
      const cloudFile = await findCloudSyncFile(accessToken);
      if (cloudFile) {
        // File exists on Drive! Download and restore snapshot across devices
        const payload = await downloadCloudSyncFile(cloudFile.id, accessToken);
        setDriveFileId(cloudFile.id);
        const modTime = cloudFile.modifiedTime || new Date().toISOString();
        setLastCloudSyncTime(modTime);
        setLastSyncedDevice(payload.device || 'Perangkat Lain');

        if (payload.data) {
          if (payload.data.users) setUsers(payload.data.users);
          if (payload.data.categories) setCategories(payload.data.categories);
          if (payload.data.units) setUnits(payload.data.units);
          if (payload.data.locations) setLocations(payload.data.locations);
          if (payload.data.suppliers) setSuppliers(payload.data.suppliers);
          if (payload.data.departments) setDepartments(payload.data.departments);
          if (payload.data.items) setItems(payload.data.items);
          if (payload.data.stockIns) setStockIns(payload.data.stockIns);
          if (payload.data.stockOuts) setStockOuts(payload.data.stockOuts);
          if (payload.data.adjustments) setAdjustments(payload.data.adjustments);
          if (payload.data.stockOpnames) setStockOpnames(payload.data.stockOpnames);
          if (payload.data.auditLogs) setAuditLogs(payload.data.auditLogs);
          if (payload.data.orderRequests) setOrderRequests(payload.data.orderRequests);
          if (payload.data.purchaseOrders) setPurchaseOrders(payload.data.purchaseOrders);
        }

        // Match or create session user
        const targetList = payload.data?.users || users;
        let targetUser = targetList.find(
          (u: User) => u.email && u.email.toLowerCase() === (user.email || '').toLowerCase()
        );
        if (!targetUser) {
          targetUser = targetList.find((u: User) => u.role === 'admin') || targetList[0];
        }
        if (!targetUser) {
          targetUser = {
            id: 'usr-google-' + user.uid.substring(0, 8),
            name: user.displayName || user.email?.split('@')[0] || 'Admin Google',
            username: (user.email?.split('@')[0] || 'admin').toLowerCase().replace(/[^a-z0-9_]/g, '_'),
            role: 'admin',
            status: 'active',
            email: user.email || '',
            avatar: user.photoURL || undefined,
            department: 'Kantor Pusat / Cloud Sync',
            createdAt: new Date().toISOString(),
          };
          setUsers((prev) => [...prev, targetUser!]);
        }

        setCurrentUser(targetUser);
        setCloudSyncStatus('synced');
        logAudit(
          `Masuk multi-perangkat via Google Drive (${gUser.email}) dan menyinkronkan ${payload.data?.items?.length || 0} barang`,
          'Autentikasi'
        );

        return {
          success: true,
          message: `Berhasil login! Data inventaris (${payload.data?.items?.length || 0} barang) berhasil disinkronkan dari Google Drive ke perangkat ini.`,
          isNewDriveData: false,
        };
      } else {
        // File does not exist on Drive yet. Upload current local inventory as cloud master.
        const payload: InventorySyncPayload = {
          appName: 'SIM_INVENTORY',
          appVersion: '1.0',
          schemaVersion: 1,
          lastUpdated: new Date().toISOString(),
          updatedBy: gUser.displayName,
          userEmail: gUser.email,
          device: getDeviceName(),
          data: {
            users,
            categories,
            units,
            locations,
            suppliers,
            departments,
            items,
            stockIns,
            stockOuts,
            adjustments,
            stockOpnames,
            auditLogs,
            orderRequests,
            purchaseOrders,
          },
        };
        const saved = await saveCloudSyncFile(payload, accessToken, null);
        setDriveFileId(saved.fileId);
        setLastCloudSyncTime(saved.modifiedTime);
        setLastSyncedDevice(getDeviceName());

        let targetUser = users.find(
          (u) => u.email && u.email.toLowerCase() === (user.email || '').toLowerCase()
        ) || users.find((u) => u.role === 'admin') || users[0];

        if (!targetUser) {
          targetUser = {
            id: 'usr-google-' + user.uid.substring(0, 8),
            name: user.displayName || user.email?.split('@')[0] || 'Admin Google',
            username: (user.email?.split('@')[0] || 'admin').toLowerCase().replace(/[^a-z0-9_]/g, '_'),
            role: 'admin',
            status: 'active',
            email: user.email || '',
            avatar: user.photoURL || undefined,
            department: 'Kantor Pusat / Cloud Sync',
            createdAt: new Date().toISOString(),
          };
          setUsers([targetUser]);
        }

        setCurrentUser(targetUser);
        setCloudSyncStatus('synced');
        logAudit(
          `Inisialisasi file database cloud di Google Drive (${gUser.email}) untuk sinkronisasi multi-perangkat`,
          'Autentikasi'
        );

        return {
          success: true,
          message: 'Berhasil login! Database inventaris baru telah dibuat di Google Drive Anda. Anda sekarang dapat masuk di perangkat lain (laptop, HP, tablet) menggunakan akun ini untuk menyinkronkan data secara otomatis.',
          isNewDriveData: true,
        };
      }
    } catch (err: any) {
      console.error('Login with Google Drive failed:', err);
      setCloudSyncStatus('error');
      return {
        success: false,
        message: err.message || 'Gagal login dengan Google Drive. Pastikan izin akses Google Drive disetujui.',
      };
    }
  };

  const switchGoogleDriveAccount = async (): Promise<{
    success: boolean;
    message: string;
    isNewDriveData?: boolean;
  }> => {
    try {
      setCloudSyncStatus('syncing');
      const { user, accessToken } = await switchGoogleAccount();
      const gUser = {
        email: user.email || '',
        displayName: user.displayName || user.email || 'Pengguna Google',
        photoURL: user.photoURL || undefined,
      };
      setIsGoogleConnected(true);
      setGoogleUser(gUser);
      localStorage.setItem(STORAGE_KEY_PREFIX + 'gdrive_connected', 'true');
      localStorage.setItem(STORAGE_KEY_PREFIX + 'gdrive_user', JSON.stringify(gUser));

      // Search for cloud sync file on the new user's Google Drive
      const cloudFile = await findCloudSyncFile(accessToken);
      if (cloudFile) {
        // File exists on the new Drive! Sync from new Drive
        const payload = await downloadCloudSyncFile(cloudFile.id, accessToken);
        setDriveFileId(cloudFile.id);
        const modTime = cloudFile.modifiedTime || new Date().toISOString();
        setLastCloudSyncTime(modTime);
        setLastSyncedDevice(payload.device || 'Perangkat Lain');
        localStorage.setItem(STORAGE_KEY_PREFIX + 'gdrive_file_id', cloudFile.id);
        localStorage.setItem(STORAGE_KEY_PREFIX + 'gdrive_last_sync', modTime);
        localStorage.setItem(STORAGE_KEY_PREFIX + 'gdrive_last_device', payload.device || 'Perangkat Lain');

        if (payload.data) {
          if (payload.data.users) setUsers(payload.data.users);
          if (payload.data.categories) setCategories(payload.data.categories);
          if (payload.data.units) setUnits(payload.data.units);
          if (payload.data.locations) setLocations(payload.data.locations);
          if (payload.data.suppliers) setSuppliers(payload.data.suppliers);
          if (payload.data.departments) setDepartments(payload.data.departments);
          if (payload.data.items) setItems(payload.data.items);
          if (payload.data.stockIns) setStockIns(payload.data.stockIns);
          if (payload.data.stockOuts) setStockOuts(payload.data.stockOuts);
          if (payload.data.adjustments) setAdjustments(payload.data.adjustments);
          if (payload.data.stockOpnames) setStockOpnames(payload.data.stockOpnames);
          if (payload.data.auditLogs) setAuditLogs(payload.data.auditLogs);
          if (payload.data.orderRequests) setOrderRequests(payload.data.orderRequests);
          if (payload.data.purchaseOrders) setPurchaseOrders(payload.data.purchaseOrders);
        }

        // Match or create session user for this Google account
        const targetList = payload.data?.users || users;
        let targetUser = targetList.find(
          (u: User) => u.email && u.email.toLowerCase() === (user.email || '').toLowerCase()
        );
        if (!targetUser) {
          targetUser = targetList.find((u: User) => u.role === 'admin') || targetList[0];
        }
        if (targetUser) {
          setCurrentUser(targetUser);
        }

        setCloudSyncStatus('synced');
        logAudit(
          `Beralih ke akun Google Drive baru (${gUser.email}) dan menyinkronkan ${payload.data?.items?.length || 0} barang`,
          'Cloud Sync'
        );

        return {
          success: true,
          message: `Berhasil beralih ke akun Google Drive: ${gUser.email}! Data inventaris dari akun baru berhasil disinkronkan (${payload.data?.items?.length || 0} barang).`,
          isNewDriveData: false,
        };
      } else {
        // New account does not have a backup file yet. Upload current snapshot to initialize
        const payload: InventorySyncPayload = {
          appName: 'SIM_INVENTORY',
          appVersion: '1.0',
          schemaVersion: 1,
          lastUpdated: new Date().toISOString(),
          updatedBy: gUser.displayName,
          userEmail: gUser.email,
          device: getDeviceName(),
          data: {
            users,
            categories,
            units,
            locations,
            suppliers,
            departments,
            items,
            stockIns,
            stockOuts,
            adjustments,
            stockOpnames,
            auditLogs,
            orderRequests,
            purchaseOrders,
          },
        };

        const res = await saveCloudSyncFile(payload, accessToken, null);
        setDriveFileId(res.fileId);
        setLastCloudSyncTime(res.modifiedTime);
        setLastSyncedDevice(getDeviceName());
        localStorage.setItem(STORAGE_KEY_PREFIX + 'gdrive_file_id', res.fileId);
        localStorage.setItem(STORAGE_KEY_PREFIX + 'gdrive_last_sync', res.modifiedTime);
        localStorage.setItem(STORAGE_KEY_PREFIX + 'gdrive_last_device', getDeviceName());

        setCloudSyncStatus('synced');
        logAudit(
          `Beralih ke akun Google Drive baru (${gUser.email}) dan membuat cadangan awan baru`,
          'Cloud Sync'
        );

        return {
          success: true,
          message: `Berhasil beralih ke akun Google Drive: ${gUser.email}! Cadangan inventaris awal telah berhasil diunggah ke Google Drive akun baru.`,
          isNewDriveData: true,
        };
      }
    } catch (err: any) {
      console.error('Switch Google Drive account failed:', err);
      setCloudSyncStatus('error');
      return {
        success: false,
        message: err.message || 'Gagal beralih akun Google Drive.',
      };
    }
  };

  const syncToGoogleDrive = async (forceOverwrite = false): Promise<{ success: boolean; message: string }> => {
    try {
      setCloudSyncStatus('syncing');
      let token = await getAccessToken();
      if (!token) {
        const creds = await googleSignIn();
        token = creds.accessToken;
      }

      const payload: InventorySyncPayload = {
        appName: 'SIM_INVENTORY',
        appVersion: '1.0',
        schemaVersion: 1,
        lastUpdated: new Date().toISOString(),
        updatedBy: currentUser?.name || googleUser?.displayName || 'Pengguna',
        userEmail: googleUser?.email || '',
        device: getDeviceName(),
        data: {
          users,
          categories,
          units,
          locations,
          suppliers,
          departments,
          items,
          stockIns,
          stockOuts,
          adjustments,
          stockOpnames,
          auditLogs,
          orderRequests,
          purchaseOrders,
        },
      };

      const result = await saveCloudSyncFile(payload, token, driveFileId);
      setDriveFileId(result.fileId);
      setLastCloudSyncTime(result.modifiedTime);
      setLastSyncedDevice(getDeviceName());
      setCloudSyncStatus('synced');
      logAudit('Menyimpan cadangan & sinkronisasi data ke Google Drive', 'Cloud Sync');
      return { success: true, message: 'Data inventaris berhasil diunggah ke Google Drive!' };
    } catch (err: any) {
      setCloudSyncStatus('error');
      return { success: false, message: err.message || 'Gagal menyinkronkan data ke Google Drive.' };
    }
  };

  const syncFromGoogleDrive = async (forceOverwrite = false): Promise<{ success: boolean; message: string }> => {
    try {
      setCloudSyncStatus('syncing');
      let token = await getAccessToken();
      if (!token) {
        const creds = await googleSignIn();
        token = creds.accessToken;
      }

      let fileId = driveFileId;
      if (!fileId) {
        const found = await findCloudSyncFile(token);
        if (!found) {
          throw new Error('Tidak ditemukan berkas sinkronisasi SIM Inventaris di Google Drive Anda.');
        }
        fileId = found.id;
        setDriveFileId(fileId);
      }

      const payload = await downloadCloudSyncFile(fileId, token);
      if (!payload.data) {
        throw new Error('Format berkas di Google Drive tidak valid.');
      }

      if (payload.data.users) setUsers(payload.data.users);
      if (payload.data.categories) setCategories(payload.data.categories);
      if (payload.data.units) setUnits(payload.data.units);
      if (payload.data.locations) setLocations(payload.data.locations);
      if (payload.data.suppliers) setSuppliers(payload.data.suppliers);
      if (payload.data.departments) setDepartments(payload.data.departments);
      if (payload.data.items) setItems(payload.data.items);
      if (payload.data.stockIns) setStockIns(payload.data.stockIns);
      if (payload.data.stockOuts) setStockOuts(payload.data.stockOuts);
      if (payload.data.adjustments) setAdjustments(payload.data.adjustments);
      if (payload.data.stockOpnames) setStockOpnames(payload.data.stockOpnames);
      if (payload.data.auditLogs) setAuditLogs(payload.data.auditLogs);
      if (payload.data.orderRequests) setOrderRequests(payload.data.orderRequests);
      if (payload.data.purchaseOrders) setPurchaseOrders(payload.data.purchaseOrders);

      setLastCloudSyncTime(payload.lastUpdated || new Date().toISOString());
      setLastSyncedDevice(payload.device || 'Perangkat Lain');
      setCloudSyncStatus('synced');
      logAudit(
        `Memuat pembaruan data dari Google Drive (Terakhir disimpan oleh ${payload.updatedBy} di ${payload.device})`,
        'Cloud Sync'
      );
      return {
        success: true,
        message: `Data berhasil disinkronkan dari Google Drive! Diperbarui oleh ${payload.updatedBy} (${payload.device}).`,
      };
    } catch (err: any) {
      setCloudSyncStatus('error');
      return { success: false, message: err.message || 'Gagal mengunduh data dari Google Drive.' };
    }
  };

  const disconnectGoogleDrive = async () => {
    await logoutFromGoogle();
    setIsGoogleConnected(false);
    setGoogleUser(null);
    setDriveFileId(null);
    setCloudSyncStatus('idle');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'gdrive_connected');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'gdrive_user');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'gdrive_file_id');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'gdrive_last_sync');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'gdrive_last_device');
    logAudit('Memutuskan koneksi akun Google Drive', 'Cloud Sync');
  };

  return (
    <InventoryContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        login,
        logout,
        registerInitialAdmin,
        registerUser,
        users,
        items,
        categories,
        units,
        locations,
        suppliers,
        departments,
        stockIns,
        stockOuts,
        adjustments,
        stockOpnames,
        auditLogs,
        orderRequests,
        addOrderRequest,
        updateOrderRequest,
        deleteOrderRequest,
        purchaseOrders,
        addPurchaseOrder,
        updatePurchaseOrder,
        deletePurchaseOrder,
        addItem,
        updateItem,
        deleteItem,
        addCategory,
        updateCategory,
        deleteCategory,
        addUnit,
        updateUnit,
        deleteUnit,
        addLocation,
        updateLocation,
        deleteLocation,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        addUser,
        updateUser,
        deleteUser,
        addStockIn,
        addStockOut,
        addAdjustment,
        addStockOpname,
        approveStockOpname,
        getItemStockCard,
        logAudit,
        resetToDefaultData,
        exportDatabaseJSON,
        importDatabaseJSON,
        isGoogleConnected,
        googleUser,
        cloudSyncStatus,
        lastCloudSyncTime,
        lastSyncedDevice,
        autoSyncEnabled,
        driveFileId,
        setAutoSyncEnabled,
        loginWithGoogleDrive,
        switchGoogleDriveAccount,
        syncToGoogleDrive,
        syncFromGoogleDrive,
        disconnectGoogleDrive,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
