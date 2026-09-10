import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Product, BusinessArea } from '../types';
import {
  Package,
  PlusCircle,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  ArrowUpRight,
  TrendingDown,
  Filter,
  X,
  Plus,
  Minus,
  DollarSign,
  BookOpen,
  Save,
} from 'lucide-react';
import { formatCOP, getTodayDateString } from '../utils/formatters';

export const InventoryManager: React.FC = () => {
  const {
    products,
    inventoryEntries,
    saveProduct,
    deleteOrDeactivateProduct,
    addInventoryEntry,
    updateProductPrice,
    updateProductStock,
    persistInventoryChanges,
  } = useApp();

  // Notification Banner
  const [notificationBanner, setNotificationBanner] = useState<string | null>(null);

  // Filters
  const [filterArea, setFilterArea] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'out'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Quick Edit Price Modal
  const [quickPriceProduct, setQuickPriceProduct] = useState<Product | null>(null);
  const [newPriceInput, setNewPriceInput] = useState<string>('');

  // Quick Edit Stock Modal
  const [quickStockProduct, setQuickStockProduct] = useState<Product | null>(null);
  const [newStockInput, setNewStockInput] = useState<string>('');

  // Form State for + Entrada de Inventario (Item 13 in Prompt)
  const [entryAreaFilter, setEntryAreaFilter] = useState<string>('todos');
  const [entryProductId, setEntryProductId] = useState<string>('');
  const [entryQuantity, setEntryQuantity] = useState<string>('10');
  const [entryUnitCost, setEntryUnitCost] = useState<string>('');
  const [entrySupplier, setEntrySupplier] = useState<string>('');
  const [entryNotes, setEntryNotes] = useState<string>('');

  // Form State for Add/Edit Product
  const [prodName, setProdName] = useState('');
  const [prodArea, setProdArea] = useState<'gargueria' | 'papeleria'>('gargueria');
  const [prodCategory, setProdCategory] = useState('');
  const [prodPresentation, setProdPresentation] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCost, setProdCost] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodMinStock, setProdMinStock] = useState('5');
  const [prodTrackStock, setProdTrackStock] = useState(true);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Area filter
      if (filterArea === 'bebidas') {
        if (p.category !== 'Bebidas') return false;
      } else if (filterArea !== 'todos') {
        if (p.area !== filterArea) return false;
      }

      // Status filter
      if (filterStatus === 'low') {
        if (!p.trackStock || p.stock > p.minStock || p.stock <= 0) return false;
      } else if (filterStatus === 'out') {
        if (!p.trackStock || p.stock > 0) return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = p.name.toLowerCase().includes(query);
        const matchCat = p.category.toLowerCase().includes(query);
        const matchPres = p.presentation?.toLowerCase().includes(query);
        if (!matchName && !matchCat && !matchPres) return false;
      }

      return true;
    });
  }, [products, filterArea, filterStatus, searchTerm]);

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdArea(prod.area);
    setProdCategory(prod.category);
    setProdPresentation(prod.presentation || '');
    setProdPrice(String(prod.price));
    setProdCost(String(prod.cost));
    setProdStock(String(prod.stock));
    setProdMinStock(String(prod.minStock));
    setProdTrackStock(prod.trackStock);
    setShowProductModal(true);
  };

  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setProdName('');
    setProdArea('gargueria');
    setProdCategory('Paquetes');
    setProdPresentation('');
    setProdPrice('');
    setProdCost('');
    setProdStock('10');
    setProdMinStock('5');
    setProdTrackStock(true);
    setShowProductModal(true);
  };

  const handleSaveProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || !prodPrice) {
      alert('Por favor complete el nombre y precio de venta.');
      return;
    }

    const price = parseFloat(prodPrice.replace(/\D/g, '')) || 0;
    const cost = parseFloat(prodCost.replace(/\D/g, '')) || 0;
    const stock = parseInt(prodStock.replace(/\D/g, '')) || 0;
    const minStock = parseInt(prodMinStock.replace(/\D/g, '')) || 5;

    const newOrUpdated: Product = {
      id: editingProduct?.id || `prod-${Date.now()}`,
      name: prodName.trim(),
      area: prodArea,
      category: prodCategory.trim() || 'General',
      presentation: prodPresentation.trim() || undefined,
      price,
      cost,
      stock,
      minStock,
      isActive: editingProduct ? editingProduct.isActive : true,
      trackStock: prodTrackStock,
    };

    saveProduct(newOrUpdated);
    setShowProductModal(false);
    setNotificationBanner(`✓ ¡Cambios guardados con éxito! El producto "${newOrUpdated.name}" ha sido actualizado y persistido.`);
    setTimeout(() => {
      setNotificationBanner(null);
    }, 4500);
  };

  const handleExplicitSaveInventory = () => {
    const res = persistInventoryChanges();
    setNotificationBanner(`✓ ¡Cambios guardados con éxito en la base de datos local! Se aseguraron ${res.count} productos y el stock permanece sincronizado.`);
    setTimeout(() => {
      setNotificationBanner(null);
    }, 4500);
  };

  const handleSaveInventoryEntrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryProductId) {
      alert('Por favor seleccione un producto.');
      return;
    }
    const qty = parseInt(entryQuantity.replace(/\D/g, '')) || 0;
    const unitCost = parseFloat(entryUnitCost.replace(/\D/g, '')) || 0;

    if (qty <= 0) {
      alert('La cantidad a ingresar debe ser mayor a 0.');
      return;
    }

    addInventoryEntry({
      productId: entryProductId,
      quantity: qty,
      unitCost,
      supplier: entrySupplier.trim() || 'Proveedor General',
      notes: entryNotes.trim() || undefined,
    });

    setNotificationBanner('✓ ¡Entrada de mercadería guardada con éxito! El stock ha sido actualizado e impactado en la base de datos local.');
    setTimeout(() => {
      setNotificationBanner(null);
    }, 4500);

    setShowEntryModal(false);
    setEntryQuantity('10');
    setEntryUnitCost('');
    setEntrySupplier('');
    setEntryNotes('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Banner with Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Package className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Control de Inventario & Stock
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Garguería, Bebidas, Papelería y registro de compras
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* BOTÓN OBLIGATORIO: GUARDAR CAMBIOS */}
          <button
            id="btn-guardar-cambios-inventario"
            onClick={handleExplicitSaveInventory}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-black rounded-xl text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all border border-slate-700"
            title="Guardar y confirmar inmediatamente todos los cambios en la base de datos local"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            <span>Guardar cambios</span>
          </button>

          {/* + ENTRADA DE INVENTARIO (Item 13 in Prompt) */}
          <button
            id="btn-nueva-entrada-inventario"
            onClick={() => {
              if (products.length > 0 && !entryProductId) {
                setEntryProductId(products[0].id);
              }
              setShowEntryModal(true);
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-blue-900/20 flex items-center gap-2 cursor-pointer transition-all"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>+ Entrada de Inventario</span>
          </button>

          {/* + AGREGAR PRODUCTO (Item 8 in Prompt) */}
          <button
            id="btn-agregar-producto"
            onClick={handleOpenNewProduct}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-900/20 flex items-center gap-2 cursor-pointer transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Confirmation & Alert Toast Banner */}
      {notificationBanner && (
        <div className="bg-emerald-600 text-white p-3.5 rounded-2xl shadow-lg shadow-emerald-950/20 flex items-center justify-between text-xs sm:text-sm font-black animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-200" />
            <span>{notificationBanner}</span>
          </div>
          <button
            onClick={() => setNotificationBanner(null)}
            className="hover:bg-emerald-700 p-1.5 rounded-lg text-emerald-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por nombre, presentación o categoría..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Filter Area */}
          <div className="flex items-center gap-1 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setFilterArea('todos')}
              className={`px-3 py-2 rounded-lg cursor-pointer transition-colors whitespace-nowrap ${
                filterArea === 'todos' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({products.length})
            </button>
            <button
              onClick={() => setFilterArea('gargueria')}
              className={`px-3 py-2 rounded-lg cursor-pointer transition-colors whitespace-nowrap ${
                filterArea === 'gargueria' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🍔 Garguería
            </button>
            <button
              onClick={() => setFilterArea('bebidas')}
              className={`px-3 py-2 rounded-lg cursor-pointer transition-colors whitespace-nowrap ${
                filterArea === 'bebidas' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🥤 Bebidas
            </button>
            <button
              onClick={() => setFilterArea('papeleria')}
              className={`px-3 py-2 rounded-lg cursor-pointer transition-colors whitespace-nowrap ${
                filterArea === 'papeleria' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              📚 Papelería ({products.filter(p => p.area === 'papeleria').length})
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center justify-end gap-1.5 text-xs font-semibold">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1.5 rounded-md cursor-pointer ${
                filterStatus === 'all' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus('low')}
              className={`px-2.5 py-1.5 rounded-md cursor-pointer flex items-center gap-1 ${
                filterStatus === 'low' ? 'bg-amber-500 text-slate-950 font-black' : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Stock Bajo</span>
            </button>
            <button
              onClick={() => setFilterStatus('out')}
              className={`px-2.5 py-1.5 rounded-md cursor-pointer flex items-center gap-1 ${
                filterStatus === 'out' ? 'bg-rose-600 text-white font-black' : 'text-rose-600 hover:bg-rose-50'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Agotados</span>
            </button>
          </div>
        </div>

        {/* Papelería Special Guidance Banner */}
        {filterArea === 'papeleria' && (
          <div className="mt-3 p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-indigo-950">
              <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                <strong>Gestión de Inventario de Papelería:</strong> Puede modificar los precios directamente con el icono de lápiz (<Edit2 className="w-3 h-3 inline text-slate-600" />) y registrar compras o ajustar stock con los botones <strong>+</strong> y <strong>-</strong>.
              </span>
            </div>
            <button
              onClick={() => {
                setEntryAreaFilter('papeleria');
                const firstPap = products.find(p => p.area === 'papeleria');
                if (firstPap) setEntryProductId(firstPap.id);
                setShowEntryModal(true);
              }}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shrink-0 cursor-pointer shadow-2xs"
            >
              + Entrada Papelería
            </button>
          </div>
        )}
      </div>

      {/* Inventory Table (Item 12 in Prompt) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Producto</th>
                <th className="py-3 px-4">Área / Categoría</th>
                <th className="py-3 px-4 text-center">Stock Actual</th>
                <th className="py-3 px-4 text-center">Stock Mínimo</th>
                <th className="py-3 px-4 text-right">Precio Venta</th>
                <th className="py-3 px-4 text-right">Costo</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(p => {
                const isOutOfStock = p.trackStock && p.stock <= 0;
                const isLowStock = p.trackStock && p.stock > 0 && p.stock <= p.minStock;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <strong className="text-slate-900 block font-bold">
                          {p.name}
                        </strong>
                        {p.presentation && (
                          <span className="text-[11px] text-slate-500 font-medium">
                            Presentación: {p.presentation}
                          </span>
                        )}
                        {!p.isActive && (
                          <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded ml-1">
                            Inactivo
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-slate-700 font-medium block">
                        {p.area === 'gargueria' ? '🍔 Garguería' : '📚 Papelería'}
                      </span>
                      <span className="text-[11px] text-slate-400">{p.category}</span>
                    </td>

                    {/* Stock Column with Quick Increment/Decrement Buttons */}
                    <td className="py-3 px-4 text-center">
                      {p.trackStock ? (
                        <div className="inline-flex items-center justify-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                          <button
                            type="button"
                            onClick={() => updateProductStock(p.id, Math.max(0, p.stock - 1))}
                            title="Disminuir 1 unidad de stock"
                            className="w-5 h-5 rounded bg-white hover:bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center border border-slate-200 cursor-pointer active:scale-95"
                          >
                            -
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setQuickStockProduct(p);
                              setNewStockInput(String(p.stock));
                            }}
                            title="Haga clic para editar cantidad exacta de stock"
                            className={`font-black font-mono text-xs sm:text-sm px-1.5 py-0.5 rounded hover:bg-slate-200 cursor-pointer ${
                              isOutOfStock ? 'text-rose-600 font-black' : isLowStock ? 'text-amber-600 font-black' : 'text-slate-900'
                            }`}
                          >
                            {p.stock}
                          </button>
                          <button
                            type="button"
                            onClick={() => updateProductStock(p.id, p.stock + 1)}
                            title="Aumentar 1 unidad de stock"
                            className="w-5 h-5 rounded bg-white hover:bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center border border-slate-200 cursor-pointer active:scale-95"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs font-normal">Ilimitado</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center font-mono text-xs text-slate-500">
                      {p.trackStock ? p.minStock : '—'}
                    </td>

                    {/* Quick Price Adjustment Column */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setQuickPriceProduct(p);
                            setNewPriceInput(String(p.price));
                          }}
                          title="Haga clic para modificar precio de venta"
                          className="font-black font-mono text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer"
                        >
                          {formatCOP(p.price)}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setQuickPriceProduct(p);
                            setNewPriceInput(String(p.price));
                          }}
                          title="Modificar precio"
                          className="p-1 rounded bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-500 cursor-pointer transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right text-slate-500 text-xs font-medium">
                      {p.cost > 0 ? formatCOP(p.cost) : '—'}
                    </td>

                    {/* Estado badge (Prompt Section 12) */}
                    <td className="py-3 px-4 text-center">
                      {!p.trackStock ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                          Servicio
                        </span>
                      ) : isOutOfStock ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-rose-100 text-rose-800">
                          ❌ Agotado
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 animate-pulse">
                          ⚠️ Stock Bajo
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          ✅ Disponible
                        </span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditProduct(p)}
                          title="Editar producto"
                          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {p.isActive && (
                          <button
                            onClick={() => {
                              if (confirm(`¿Desactivar el producto "${p.name}"? No se eliminará del historial.`)) {
                                deleteOrDeactivateProduct(p.id);
                              }
                            }}
                            title="Desactivar producto"
                            className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: + ENTRADA DE INVENTARIO (Item 13 in Prompt) */}
      {showEntryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in">
            <div className="p-4 bg-blue-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5" />
                <h3 className="font-bold text-base sm:text-lg">+ Entrada de Inventario</h3>
              </div>
              <button
                onClick={() => setShowEntryModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-blue-700 text-white flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInventoryEntrySubmit} className="p-5 space-y-3.5">
              <p className="text-xs text-slate-500">
                Registrar mercancía adquirida. El stock del producto seleccionado se incrementará automáticamente.
              </p>

              {/* Producto */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Producto: *</label>
                  <div className="flex gap-1 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setEntryAreaFilter('todos')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${entryAreaFilter === 'todos' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}
                    >
                      Todos
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEntryAreaFilter('gargueria');
                        const f = products.find(p => p.area === 'gargueria');
                        if (f) setEntryProductId(f.id);
                      }}
                      className={`px-2 py-0.5 rounded cursor-pointer ${entryAreaFilter === 'gargueria' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                    >
                      🍔 Garguería
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEntryAreaFilter('papeleria');
                        const f = products.find(p => p.area === 'papeleria');
                        if (f) setEntryProductId(f.id);
                      }}
                      className={`px-2 py-0.5 rounded cursor-pointer ${entryAreaFilter === 'papeleria' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                    >
                      📚 Papelería
                    </button>
                  </div>
                </div>
                <select
                  value={entryProductId}
                  onChange={e => setEntryProductId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                >
                  {products
                    .filter(p => entryAreaFilter === 'todos' || p.area === entryAreaFilter)
                    .map(p => (
                      <option key={p.id} value={p.id}>
                        [{p.area === 'gargueria' ? 'Garguería' : 'Papelería'}] {p.name} {p.presentation ? `(${p.presentation})` : ''} — Stock actual: {p.stock}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Cantidad */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Cantidad a ingresar: *</label>
                  <input
                    type="number"
                    value={entryQuantity}
                    onChange={e => setEntryQuantity(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-sm font-black"
                  />
                </div>

                {/* Costo unitario */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Costo unitario ($):</label>
                  <input
                    type="number"
                    placeholder="Ej. 1800"
                    value={entryUnitCost}
                    onChange={e => setEntryUnitCost(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-sm font-bold"
                  />
                </div>
              </div>

              {/* Proveedor */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Proveedor / Distribuidor:</label>
                <input
                  type="text"
                  placeholder="Ej. Frito-Lay, Postobón, Dulcería Central..."
                  value={entrySupplier}
                  onChange={e => setEntrySupplier(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs"
                />
              </div>

              {/* Observación */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Observación:</label>
                <input
                  type="text"
                  placeholder="Ej. Factura #1829 / Compra semanal"
                  value={entryNotes}
                  onChange={e => setEntryNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEntryModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="btn-guardar-cambios-entrada"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black rounded-xl text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar cambios de entrada</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AGREGAR O EDITAR PRODUCTO */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in max-h-[90vh] flex flex-col">
            <div className="p-4 bg-emerald-700 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto en Catálogo'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-emerald-800 text-white flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductSubmit} className="p-5 space-y-3.5 overflow-y-auto flex-1">
              {/* Área */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Área: *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setProdArea('gargueria')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border cursor-pointer ${
                      prodArea === 'gargueria' ? 'bg-amber-100 border-amber-500 text-amber-900' : 'bg-slate-50'
                    }`}
                  >
                    🍔 Garguería / Bebidas
                  </button>
                  <button
                    type="button"
                    onClick={() => setProdArea('papeleria')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border cursor-pointer ${
                      prodArea === 'papeleria' ? 'bg-indigo-100 border-indigo-500 text-indigo-900' : 'bg-slate-50'
                    }`}
                  >
                    📚 Papelería
                  </button>
                </div>
              </div>

              {/* Nombre */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nombre del Producto: *</label>
                <input
                  type="text"
                  placeholder="Ej. Chocorramo, Coca-Cola, Cuaderno 100 Hojas..."
                  value={prodName}
                  onChange={e => setProdName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Categoría */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Categoría: *</label>
                  <input
                    type="text"
                    placeholder="Ej. Bebidas, Paquetes, Golosinas, Fotocopias"
                    value={prodCategory}
                    onChange={e => setProdCategory(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs"
                  />
                </div>

                {/* Presentación (especialmente bebidas: 400 ml, 1.5 L, etc) */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Presentación (ml/L/unidad):</label>
                  <input
                    type="text"
                    placeholder="Ej. 400 ml, 1.5 L, Bolsa..."
                    value={prodPresentation}
                    onChange={e => setProdPresentation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Precio venta */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Precio de Venta ($): *</label>
                  <input
                    type="number"
                    placeholder="Ej. 2500"
                    value={prodPrice}
                    onChange={e => setProdPrice(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-sm font-black"
                  />
                </div>

                {/* Costo */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Costo Unitario ($):</label>
                  <input
                    type="number"
                    placeholder="Ej. 1800"
                    value={prodCost}
                    onChange={e => setProdCost(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-sm font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Stock Inicial */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Stock Actual: *</label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={e => setProdStock(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-bold"
                  />
                </div>

                {/* Stock Mínimo */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Stock Mínimo (Alerta): *</label>
                  <input
                    type="number"
                    value={prodMinStock}
                    onChange={e => setProdMinStock(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-track-stock"
                  checked={prodTrackStock}
                  onChange={e => setProdTrackStock(e.target.checked)}
                  className="rounded text-emerald-600 w-4 h-4"
                />
                <label htmlFor="chk-track-stock" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Controlar existencias / inventario para este producto
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="btn-guardar-cambios-producto"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black rounded-xl text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MODIFICAR PRECIO RÁPIDO */}
      {quickPriceProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in">
            <div className="p-4 bg-emerald-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                <h3 className="font-bold text-base">Modificar Precio de Venta</h3>
              </div>
              <button
                onClick={() => setQuickPriceProduct(null)}
                className="w-8 h-8 rounded-lg hover:bg-emerald-700 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                const cleanPrice = parseFloat(newPriceInput.replace(/\D/g, '')) || 0;
                updateProductPrice(quickPriceProduct.id, cleanPrice);
                setNotificationBanner(`✓ ¡Precio de "${quickPriceProduct.name}" actualizado a ${formatCOP(cleanPrice)} y guardado con éxito!`);
                setTimeout(() => setNotificationBanner(null), 4500);
                setQuickPriceProduct(null);
              }}
              className="p-5 space-y-4"
            >
              <div>
                <span className="text-xs text-slate-500 block">Producto:</span>
                <strong className="text-sm text-slate-900 block font-bold">
                  {quickPriceProduct.name} {quickPriceProduct.presentation ? `(${quickPriceProduct.presentation})` : ''}
                </strong>
                <span className="text-xs text-indigo-600 font-semibold block capitalize">
                  Área: {quickPriceProduct.area === 'papeleria' ? 'Papelería' : 'Garguería'}
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nuevo Precio de Venta ($ COP):
                </label>
                <input
                  type="number"
                  autoFocus
                  value={newPriceInput}
                  onChange={e => setNewPriceInput(e.target.value)}
                  placeholder="Ej. 2500"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-lg font-black text-emerald-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Quick increment buttons */}
              <div className="flex flex-wrap gap-1.5 text-xs">
                {[500, 1000, 1500, 2000, 2500, 5000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setNewPriceInput(String(val))}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold cursor-pointer"
                  >
                    ${val}
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQuickPriceProduct(null)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="btn-guardar-cambios-precio"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black rounded-xl text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AJUSTAR STOCK RÁPIDO */}
      {quickStockProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in">
            <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                <h3 className="font-bold text-base">Ajustar Stock Disponible</h3>
              </div>
              <button
                onClick={() => setQuickStockProduct(null)}
                className="w-8 h-8 rounded-lg hover:bg-indigo-700 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                const cleanStock = parseInt(newStockInput.replace(/\D/g, '')) || 0;
                updateProductStock(quickStockProduct.id, cleanStock);
                setNotificationBanner(`✓ ¡Stock de "${quickStockProduct.name}" ajustado a ${cleanStock} unidades y guardado con éxito!`);
                setTimeout(() => setNotificationBanner(null), 4500);
                setQuickStockProduct(null);
              }}
              className="p-5 space-y-4"
            >
              <div>
                <span className="text-xs text-slate-500 block">Producto:</span>
                <strong className="text-sm text-slate-900 block font-bold">
                  {quickStockProduct.name} {quickStockProduct.presentation ? `(${quickStockProduct.presentation})` : ''}
                </strong>
                <span className="text-xs text-slate-500 block">
                  Stock actual en sistema: <span className="font-bold text-slate-900">{quickStockProduct.stock}</span>
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nueva Cantidad en Inventario:
                </label>
                <input
                  type="number"
                  autoFocus
                  value={newStockInput}
                  onChange={e => setNewStockInput(e.target.value)}
                  placeholder="Ej. 15"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-lg font-black text-indigo-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Quick stock shortcuts */}
              <div className="flex flex-wrap gap-1.5 text-xs">
                {[0, 5, 10, 15, 20, 30, 50, 100].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setNewStockInput(String(val))}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold cursor-pointer"
                  >
                    {val} uds
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQuickStockProduct(null)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="btn-guardar-cambios-stock"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-black rounded-xl text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
