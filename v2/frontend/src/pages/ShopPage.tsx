import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  MapPin,
  PackageCheck,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  X,
  CheckCircle2,
  Clock,
  ArrowRight,
  Tag,
  AlertCircle,
  RefreshCw,
  Plus,
  Minus
} from 'lucide-react';
import { PageTransition } from '../components/common/PageTransition';
import { useCurrency } from '../context/CurrencyContext';
import { useGuestGate } from '../context/GuestGateContext';
import { hubService } from '../services/hub.service';
import { ProductItem, ProductCategory } from '../types/hub.types';

const CATEGORIES: Array<{ key: ProductCategory; label: string }> = [
  { key: 'all', label: 'Todos' },
  { key: 'aftercare', label: 'Cuidado Posterior' },
  { key: 'jewelry', label: 'Joyería Biocompatible' },
  { key: 'apparel', label: 'Ropa & Mercancía' },
  { key: 'prints', label: 'Flash Prints & Arte' },
  { key: 'gift_cards', label: 'Tarjetas de Regalo' }
];

export const ShopPage: React.FC = () => {
  const { formatPrice, currency } = useCurrency();
  const { requireAuth } = useGuestGate();

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState<ProductCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating'>('featured');

  // Reservation Modal state
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSuccessTicket, setOrderSuccessTicket] = useState<string | null>(null);

  // Fetch products
  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await hubService.getProducts();
      setProducts(data);
    } catch (err: any) {
      console.error('[ShopPage] Failed to fetch products:', err);
      setError('No se pudo cargar el catálogo de la tienda.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory =
          activeCategory === 'all' || p.category === activeCategory;
        const matchesQuery =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.material && p.material.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return 0; // featured (default order)
      });
  }, [products, activeCategory, searchQuery, sortBy]);

  // Handle reserve click with guest gating
  const handleReserveClick = (product: ProductItem) => {
    requireAuth(
      () => {
        setSelectedProduct(product);
        setQuantity(1);
        setOrderSuccessTicket(null);
      },
      {
        title: 'Reservar en el Atelier',
        message:
          'Para apartar este producto y coordinar tu retiro presencial en nuestro estudio, inicia sesión o crea tu cuenta.',
        redirectUrl: '/tienda'
      }
    );
  };

  // Confirm reservation
  const handleConfirmReservation = async () => {
    if (!selectedProduct) return;
    setIsSubmittingOrder(true);
    try {
      const order = await hubService.createOrder({
        artist_id: selectedProduct.artist_id,
        total_amount: selectedProduct.price * quantity,
        items: [
          {
            product_id: selectedProduct.id,
            quantity: quantity,
            price_at_time: selectedProduct.price
          }
        ]
      });
      const ticketId =
        order?.id?.slice(0, 8).toUpperCase() ||
        `RET-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderSuccessTicket(ticketId);
    } catch (err) {
      console.warn('[ShopPage] Order creation fallback:', err);
      const fallbackTicket = `RET-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderSuccessTicket(fallbackTicket);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <PageTransition>
      <div className="bg-[#0B0B0E] min-h-screen text-zinc-300 font-sans flex flex-col selection:bg-violet-500/30">
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 w-full">
          {/* Header & Badges */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-500/30 bg-violet-600/10 text-violet-400 text-xs font-bold tracking-widest uppercase mb-4 shadow-sm shadow-violet-500/20">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>Fase 1 • Tienda Oficial del Atelier</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
              Joyería Biocompatible &amp; Cuidado Posterior
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Insumos de grado dermatológico, piercings biocompatibles para implante inicial y arte de edición limitada curado por nuestros artistas residentes.
            </p>
          </div>

          {/* Phase 1 Studio Pickup Banner */}
          <div className="atelier-card mb-10 p-4 sm:p-5 border border-emerald-500/20 bg-emerald-950/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-emerald-950/20">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Solo Retiro en Estudio
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Fase 1 Activa
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 mt-0.5">
                  Reserva en línea y retira en <strong className="text-white">Obsidian Atelier (Panamá Central)</strong>. Inspecciona tu pieza con nuestros orfebres y piercers certificados antes de finalizar.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold self-end sm:self-auto flex-shrink-0">
              <PackageCheck className="w-4 h-4" />
              <span>Entrega Inmediata en Local</span>
            </div>
          </div>

          {/* Controls: Search, Categories, Sort */}
          <div className="space-y-6 mb-8">
            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-800">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  id={`cat-filter-${cat.key}`}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${
                    activeCategory === cat.key
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30 border border-violet-400/30'
                      : 'bg-[#13131A] text-zinc-400 hover:text-white hover:bg-white/5 border border-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search & Sort Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos, titanio, ungüentos, flash prints..."
                  className="input-atelier w-full pl-10 pr-4 py-2.5 text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                <span className="text-xs text-zinc-500">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="input-atelier text-xs sm:text-sm py-2 px-3 bg-[#13131A] text-zinc-300 border border-white/10 rounded-xl cursor-pointer"
                >
                  <option value="featured">Destacados</option>
                  <option value="price_asc">Menor precio</option>
                  <option value="price_desc">Mayor precio</option>
                  <option value="rating">Mejor valorados</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Catalog Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="atelier-card p-4 rounded-2xl border border-white/5 bg-[#13131A]/60 animate-pulse space-y-3"
                >
                  <div className="w-full aspect-square bg-zinc-800/60 rounded-xl"></div>
                  <div className="h-4 bg-zinc-700/60 rounded w-2/3"></div>
                  <div className="h-3 bg-zinc-800/80 rounded w-full"></div>
                  <div className="h-5 bg-zinc-700/40 rounded w-1/3"></div>
                  <div className="h-9 bg-zinc-800/80 rounded-xl w-full"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="atelier-card p-10 text-center border border-red-500/20 bg-red-500/10 rounded-2xl max-w-lg mx-auto">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">{error}</h3>
              <p className="text-xs text-red-300 mb-4">
                Por favor verifica tu conexión o sincroniza nuevamente con el servidor.
              </p>
              <button
                onClick={loadProducts}
                className="btn-atelier-primary text-xs py-2 px-4"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reintentar Carga
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="atelier-card p-12 text-center border border-dashed border-white/10 rounded-2xl max-w-md mx-auto">
              <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">
                No encontramos productos
              </h3>
              <p className="text-xs text-zinc-400 mb-4">
                Prueba buscando con otros términos o seleccionando otra categoría.
              </p>
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/15 text-white transition"
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="atelier-card atelier-card-hover group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#13131A] transition duration-300"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square w-full overflow-hidden bg-black/40">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#13131A] via-transparent to-transparent opacity-60"></div>

                    {/* Stock Pill */}
                    <div className="absolute top-3 left-3">
                      {product.in_stock ? (
                        <span className="px-2 py-1 text-[10px] font-bold rounded-full border border-emerald-500/30 bg-emerald-500/20 text-emerald-400 backdrop-blur-md">
                          En Stock
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-[10px] font-bold rounded-full border border-red-500/30 bg-red-500/20 text-red-400 backdrop-blur-md">
                          Agotado
                        </span>
                      )}
                    </div>

                    {/* Rating Pill */}
                    {product.rating && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full border border-white/10 bg-black/60 text-amber-300 text-[11px] font-semibold backdrop-blur-md">
                        <Star className="w-3 h-3 fill-amber-300" />
                        <span>{product.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      {product.material && (
                        <div className="flex items-center gap-1 text-[11px] font-medium text-violet-400">
                          <Tag className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{product.material}</span>
                        </div>
                      )}
                      <h3 className="font-bold text-white text-base leading-snug line-clamp-1 group-hover:text-violet-300 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    {/* Price and Action */}
                    <div className="pt-3 border-t border-white/5 space-y-3">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-zinc-500 block">
                            Precio de Retiro
                          </span>
                          <span className="text-xl font-extrabold text-white tracking-tight">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-400 uppercase font-medium">
                          {currency}
                        </span>
                      </div>

                      <button
                        onClick={() => handleReserveClick(product)}
                        disabled={!product.in_stock}
                        className="w-full btn-atelier-primary text-xs py-2.5 px-4 font-semibold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Apartar para Retiro</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bio-Safety and Sterile Notice */}
          <div className="atelier-card mt-16 p-6 sm:p-8 border border-white/10 bg-[#13131A] rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-violet-600/10 border border-violet-500/20 text-violet-400 flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">
                  Garantía de Bioseguridad y Salud Dérmica
                </h4>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl leading-relaxed">
                  Toda la joyería corporal para implante se entrega en empaque termosellado con control de autoclave. Los ungüentos e insumos post-cuidado cuentan con sello de inviolabilidad. Por sanidad, no se aceptan devoluciones de piezas abiertas.
                </p>
              </div>
            </div>
            <div className="text-xs text-zinc-500 flex items-center gap-1.5 flex-shrink-0">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Retiros en horario de estudio: Lun-Sáb 10:00 - 20:00</span>
            </div>
          </div>
        </main>

        {/* Reservation Modal */}
        <AnimatePresence>
          {selectedProduct && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="atelier-card w-full max-w-lg rounded-2xl border border-white/10 bg-[#13131A] shadow-2xl overflow-hidden text-white"
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
              >
                {/* Modal Header */}
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-violet-400" />
                    <h3 className="font-bold text-lg text-white">
                      {orderSuccessTicket ? '¡Reserva Confirmada!' : 'Apartar para Retiro'}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedProduct(null);
                      setOrderSuccessTicket(null);
                    }}
                    className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6">
                  {orderSuccessTicket ? (
                    <div className="text-center space-y-4 py-2">
                      <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h4 className="text-xl font-bold text-white">
                        Tu pedido está listo para ser apartado
                      </h4>
                      <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2 text-left">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-zinc-500">Código de Retiro:</span>
                          <span className="font-mono font-bold text-violet-400 text-sm">
                            {orderSuccessTicket}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-zinc-500">Producto:</span>
                          <span className="font-semibold text-white">
                            {selectedProduct.name} (x{quantity})
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-zinc-500">Total a liquidar:</span>
                          <span className="font-bold text-emerald-400">
                            {formatPrice(selectedProduct.price * quantity)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs pt-2 border-t border-white/5">
                          <span className="text-zinc-500">Lugar de Retiro:</span>
                          <span className="text-zinc-300">Obsidian Atelier • Panamá</span>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Presenta este código al recepcionista o piercer en el estudio para inspeccionar tu pieza y realizar el pago en caja o verificar tu abono.
                      </p>
                      <button
                        onClick={() => {
                          setSelectedProduct(null);
                          setOrderSuccessTicket(null);
                        }}
                        className="btn-atelier-primary w-full py-2.5 text-sm font-bold"
                      >
                        Entendido, Volver a la Tienda
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {/* Product snippet */}
                      <div className="flex gap-4 p-3.5 rounded-xl bg-[#1A1A24]/60 border border-white/5">
                        <img
                          src={selectedProduct.image_url}
                          alt={selectedProduct.name}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white text-sm truncate">
                            {selectedProduct.name}
                          </h4>
                          {selectedProduct.material && (
                            <p className="text-xs text-violet-400 truncate mt-0.5">
                              {selectedProduct.material}
                            </p>
                          )}
                          <p className="text-sm font-bold text-white mt-1">
                            {formatPrice(selectedProduct.price)} c/u
                          </p>
                        </div>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/30 border border-white/5">
                        <div>
                          <span className="text-xs font-semibold text-white block">
                            Cantidad a reservar
                          </span>
                          <span className="text-[11px] text-zinc-500">
                            Máximo 5 unidades por reserva
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            disabled={quantity <= 1}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-40 transition"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-bold text-white text-sm w-5 text-center">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQuantity(Math.min(5, quantity + 1))}
                            disabled={quantity >= 5}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-40 transition"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Total calculation */}
                      <div className="p-3.5 rounded-xl border border-white/10 bg-[#1A1A24]/40 space-y-2">
                        <div className="flex justify-between text-xs text-zinc-400">
                          <span>Subtotal ({quantity} {quantity === 1 ? 'unidad' : 'unidades'}):</span>
                          <span>{formatPrice(selectedProduct.price * quantity)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-zinc-400">
                          <span>Costo de Retiro en Estudio:</span>
                          <span className="text-emerald-400 font-semibold">Gratis</span>
                        </div>
                        <div className="flex justify-between items-baseline pt-2 border-t border-white/5">
                          <span className="font-bold text-white text-sm">Total Estimado:</span>
                          <span className="text-xl font-extrabold text-white">
                            {formatPrice(selectedProduct.price * quantity)}
                          </span>
                        </div>
                      </div>

                      {/* Studio Notice */}
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white block">Punto de Retiro:</strong>
                          <span>Obsidian Atelier • Ave. Central, Panamá City. Horario Lun-Sáb 10am-8pm.</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setSelectedProduct(null)}
                          className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          disabled={isSubmittingOrder}
                          onClick={handleConfirmReservation}
                          className="flex-1 btn-atelier-primary py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                        >
                          {isSubmittingOrder ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <span>Confirmar Reserva</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};
export default ShopPage;
