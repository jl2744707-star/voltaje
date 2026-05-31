import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import "../styles/orders.css";

const ROLES = {
  COMPRADOR: 1,
  SELLER: 2,
  ADMIN: 3,
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("Todos");

  // Determinar si es administrador o vendedor
  const isAdminOrSeller =
    user?.id_role === ROLES.ADMIN || user?.id_role === ROLES.SELLER;

  // Cargar las órdenes según el rol correspondiente
  const loadOrders = async () => {
    setLoading(true);
    try {
      if (isAdminOrSeller) {
        // GET /api/order/admin/all
        const res = await API.get("/order/admin/all");
        setOrders(res.data.body || []);
      } else {
        // GET /api/order/my-orders
        const res = await API.get("/order/my-orders");
        setOrders(res.data.body || []);
      }
    } catch (err) {
      console.error("Error al traer las órdenes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadOrders();
  }, [user]);

  // Cambiar el estado de un pedido (Solo Admin / Seller)
  const handleStatusChange = async (id_order, newStatus) => {
    try {
      // PUT /api/order/admin/status/:id
      await API.put(`/order/admin/status/${id_order}`, { status: newStatus });
      alert(`Pedido #${id_order} actualizado a "${newStatus}"`);

      // Actualizamos el estado de manera reactiva en la lista local
      setOrders((prev) =>
        prev.map((ord) =>
          ord.id_order === id_order ? { ...ord, status: newStatus } : ord,
        ),
      );
    } catch (err) {
      alert("No se pudo actualizar el estado del pedido.");
    }
  };

  // Filtrado de pedidos en pantalla
  const filteredOrders = orders.filter((ord) => {
    if (statusFilter === "Todos") return true;
    return ord.status === statusFilter;
  });

  if (loading)
    return <div className="loading-txt">Cargando gestión de pedidos...</div>;

  return (
    <div className="orders-page-container">
      <div className="orders-header-box">
        <h2>
          {isAdminOrSeller
            ? "Panel de Gestión: Pedidos Recibidos"
            : "Mi Historial de Compras"}
        </h2>
        <p className="orders-subtitle">
          {isAdminOrSeller
            ? "Revisá los comprobantes de envío, totales y despachá los productos vendidos."
            : "Seguí el estado de tus compras y envíos en tiempo real."}
        </p>
      </div>

      {/* 📊 FILTROS DE ESTADO */}
      <div className="orders-filter-bar">
        {["Todos", "Pendiente", "Enviado", "Entregado", "Cancelado"].map(
          (status) => (
            <button
              key={status}
              className={`filter-tab-btn ${statusFilter === status ? "active" : ""}`}
              onClick={() => setStatusFilter(status)}
            >
              {status} (
              {
                orders.filter((o) => status === "Todos" || o.status === status)
                  .length
              }
              )
            </button>
          ),
        )}
      </div>

      {/* 📦 LISTADO DE TARJETAS DE ÓRDENES */}
      {filteredOrders.length === 0 ? (
        <div className="no-orders-box">
          <p>
            No se encontraron pedidos con el estado:{" "}
            <strong>{statusFilter}</strong>
          </p>
        </div>
      ) : (
        <div className="orders-list-grid">
          {filteredOrders.map((order) => (
            <div
              key={order.id_order}
              className={`order-card status-border-${order.status}`}
            >
              <div className="order-card-header">
                <div>
                  <span className="order-number-tag">
                    Pedido #{order.id_order}
                  </span>
                  <p className="order-date-txt">
                    F. Compra: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Si es Admin muestra el selector dinámico, si es cliente un Badge fijo */}
                {isAdminOrSeller ? (
                  <select
                    className={`order-status-select select-${order.status}`}
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.id_order, e.target.value)
                    }
                  >
                    <option value="Pendiente">⏳ Pendiente</option>
                    <option value="Enviado">🚚 Enviado</option>
                    <option value="Entregado">✅ Entregado</option>
                    <option value="Cancelado">❌ Cancelado</option>
                  </select>
                ) : (
                  <span className={`order-status-badge status-${order.status}`}>
                    {order.status === "Pendiente" && "⏳ Pendiente"}
                    {order.status === "Enviado" && "🚚 Enviado"}
                    {order.status === "Entregado" && "✅ Entregado"}
                    {order.status === "Cancelado" && "❌ Cancelado"}
                  </span>
                )}
              </div>

              {/* 🏠 DIRECCIÓN DE ENVÍO */}
              <div className="order-shipping-section">
                <strong>📍 Dirección de Envío:</strong>
                <p>{order.shippingAddress || "Retira por sucursal"}</p>
              </div>

              {/* 📚 ÍTEMS ADQUIRIDOS (Detalle) */}
              <div className="order-items-detail-box">
                <h4>Productos solicitados:</h4>
                <div className="order-items-loop">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="order-single-item-row">
                      <div className="item-row-left">
                        {item.product?.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="order-item-img"
                          />
                        ) : (
                          <div className="order-item-no-img">📖</div>
                        )}
                        <div>
                          <p className="order-item-name">
                            {item.product?.name || "Producto sin nombre"}
                          </p>
                          <p className="order-item-brand">
                            {item.product?.brand || "Librería"}
                          </p>
                        </div>
                      </div>
                      <div className="item-row-right">
                        <span>{item.quantity} u.</span>
                        {/* Muestra el precio histórico de compra guardado por tu backend */}
                        <strong>
                          $
                          {parseFloat(
                            item.priceAtPurchase || item.product?.price || 0,
                          ).toLocaleString()}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 💰 TOTAL DE LA ORDEN */}
              <div className="order-card-footer">
                <span>Monto Total Cobrado:</span>
                <strong className="order-total-price-text">
                  ${parseFloat(order.totalPrice).toLocaleString()}
                </strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
