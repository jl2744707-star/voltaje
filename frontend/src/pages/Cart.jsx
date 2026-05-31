import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import axios from "axios"; // 🚀 Usamos axios común para las peticiones externas a la API del gobierno
import "../styles/cart.css";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  //  Direcciones del usuario guardadas en tu backend
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // 📝 Estados para el Formulario Modal de Nueva Dirección
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddressData, setNewAddressData] = useState({
    street: "",
    number: "", // Se ingresa como string en el input, se parsea a int al enviar
    floor: "",
    apartment: "",
    postalCode: "",
    city: "",
    province: "",
    description: "",
    isDefault: false,
  });

  // 🇦🇷 Estados para la API Geográfica del Gobierno Argentino
  const [provincias, setProvincias] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [loadingProvincias, setLoadingProvincias] = useState(false);
  const [loadingLocalidades, setLoadingLocalidades] = useState(false);

  const navigate = useNavigate();

  // 📥 Cargar el Carrito y las Direcciones de tu Base de Datos
  const fetchCartAndAddresses = async () => {
    try {
      const cartRes = await API.get("/cart");
      const itemsDelCarrito = cartRes.data.body?.items || [];
      setCartItems(itemsDelCarrito);

      const addressRes = await API.get("/address");
      const listaDirecciones = addressRes.data.body || [];
      setAddresses(listaDirecciones);

      if (listaDirecciones.length > 0) {
        setSelectedAddress(listaDirecciones[0].id_address);
      }
    } catch (err) {
      console.error(err);
      setError("No se pudo inicializar la pantalla del carrito.");
    } finally {
      setLoading(false);
    }
  };

  // 🇦🇷 Cargar Provincias desde la API del Gobierno al montar el componente
  // 🇦🇷 Cargar Provincias desde el endpoint dinámico de Georef
  const cargarProvinciasArgentinas = async () => {
    setLoadingProvincias(true);
    try {
      // 🚀 Usamos el endpoint API georef en lugar del archivo JSON estático
      const res = await axios.get(
        "https://apis.datos.gob.ar/georef/api/provincias?campos=id,nombre",
      );

      // La API nos devuelve la lista dentro de res.data.provincias
      const listaOrdenada = (res.data.provincias || []).sort((a, b) =>
        a.nombre.localeCompare(b.nombre),
      );

      setProvincias(listaOrdenada);
    } catch (err) {
      console.error(
        "Error al traer provincias de la API de datos públicos:",
        err,
      );

      // 🔔 PLAN DE BACKUP: Si la API del gobierno llegara a estar caída,
      // te inyecto las provincias hardcodeadas para que NUNCA se te rompa el entorno de desarrollo:
      const backupProvincias = [
        { id: "02", nombre: "Ciudad Autónoma de Buenos Aires" },
        { id: "06", nombre: "Buenos Aires" },
        { id: "10", nombre: "Catamarca" },
        { id: "14", nombre: "Córdoba" },
        { id: "18", nombre: "Corrientes" },
        { id: "22", nombre: "Chaco" },
        { id: "26", nombre: "Chubut" },
        { id: "30", nombre: "Entre Ríos" },
        { id: "34", nombre: "Formosa" },
        { id: "38", nombre: "Jujuy" },
        { id: "42", nombre: "La Pampa" },
        { id: "46", nombre: "La Rioja" },
        { id: "50", nombre: "Mendoza" },
        { id: "54", nombre: "Misiones" },
        { id: "58", nombre: "Neuquén" },
        { id: "62", nombre: "Río Negro" },
        { id: "66", nombre: "Salta" },
        { id: "70", nombre: "San Juan" },
        { id: "74", nombre: "San Luis" },
        { id: "78", nombre: "Santa Cruz" },
        { id: "82", fontSize: "10px", nombre: "Santa Fe" },
        { id: "86", nombre: "Santiago del Estero" },
        { id: "90", nombre: "Tucumán" },
        {
          id: "94",
          nombre: "Tierra del Fuego, Antártida e Islas del Atlántico Sur",
        },
      ];
      setProvincias(backupProvincias);
    } finally {
      setLoadingProvincias(false);
    }
  };

  useEffect(() => {
    fetchCartAndAddresses();
    cargarProvinciasArgentinas();
  }, []);

  // 🔄 Cargar Localidades/Municipios cada vez que cambia la provincia seleccionada
  useEffect(() => {
    if (!newAddressData.province) {
      setLocalidades([]);
      return;
    }

    const cargarLocalidades = async () => {
      setLoadingLocalidades(true);
      try {
        // Buscamos los municipios pertenecientes a la provincia elegida
        const res = await axios.get(
          `https://apis.datos.gob.ar/georef/api/municipios?provincia=${encodeURIComponent(newAddressData.province)}&max=500`,
        );
        const listaLoc = (res.data.municipios || []).sort((a, b) =>
          a.nombre.localeCompare(b.nombre),
        );
        setLocalidades(listaLoc);
      } catch (err) {
        console.error("Error al traer las localidades:", err);
      } finally {
        setLoadingLocalidades(false);
      }
    };

    cargarLocalidades();
  }, [newAddressData.province]);

  // 🔄 Cambiar cantidad del carrito
  const handleUpdateQuantity = async (id_product, targetQty, maxStock) => {
    if (targetQty <= 0) return;
    if (targetQty > maxStock) {
      alert(
        `Lo sentimos, solo quedan ${maxStock} unidades disponibles de este producto.`,
      );
      return;
    }
    try {
      await API.put(`/cart/${id_product}`, { quantity: targetQty });
      setCartItems((prev) =>
        prev.map((item) =>
          item.id_product === id_product
            ? { ...item, quantity: targetQty }
            : item,
        ),
      );
    } catch (err) {
      alert("Error al actualizar la cantidad.");
    }
  };

  // ❌ Eliminar ítem
  const handleRemoveItem = async (id_product) => {
    try {
      await API.delete(`/cart/${id_product}`);
      setCartItems((prev) =>
        prev.filter((item) => item.id_product !== id_product),
      );
    } catch (err) {
      alert("Error al eliminar el producto.");
    }
  };

  // 🧮 Calcular Total
  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => {
      const price = parseFloat(item.product?.price || "0");
      return acc + price * item.quantity;
    }, 0);
  };

  // 💾 GUARDAR DIRECCIÓN (Aquí arreglamos el tipo de dato de 'number' para Zod)
  const handleSaveAddress = async (e) => {
    e.preventDefault();

    // 💡 SOLUCIÓN: Convertimos el string del input a un Número Entero puro
    const numeroParseado = parseInt(newAddressData.number, 10);
    if (isNaN(numeroParseado)) {
      alert("Por favor, ingresá un número de calle válido.");
      return;
    }

    const payloadFinal = {
      ...newAddressData,
      number: numeroParseado, // Ahora viaja como un 'number' real, Zod no va a chillar
    };

    try {
      const res = await API.post("/address", payloadFinal);
      const createdAddress = res.data.body;

      alert("Dirección agregada exitosamente.");

      setAddresses((prev) => [...prev, createdAddress]);
      setSelectedAddress(createdAddress.id_address);

      setShowAddressModal(false);
      setNewAddressData({
        street: "",
        number: "",
        floor: "",
        apartment: "",
        postalCode: "",
        city: "",
        province: "",
        description: "",
        isDefault: false,
      });
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.error ||
        "Error al guardar la dirección. Revisá los campos obligatorios.";
      alert(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  };

  // 🛍️ Procesar la compra final
  const handleCheckout = async () => {
    if (!selectedAddress) {
      alert(
        "Por favor, selecciona una dirección de envío para confirmar la compra.",
      );
      return;
    }

    setCheckoutLoading(true);
    try {
      await API.post("/order", { id_address: parseInt(selectedAddress, 10) });
      alert(
        "¡Compra procesada con éxito! Se descontó el stock de los productos.",
      );
      setCartItems([]);
      navigate("/orders");
    } catch (err) {
      console.error(err);
      const serverMessage =
        err.response?.data?.message ||
        "No se pudo procesar la orden de compra.";
      alert(serverMessage);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading)
    return <div className="loading-text">Cargando tu carrito...</div>;
  if (error) return <div className="error-banner">{error}</div>;

  return (
    <div className="cart-container">
      <h2>Tu Carrito de Compras</h2>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Tu carrito está vacío. ¡Date una vuelta por el catálogo!</p>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-list">
            {cartItems.map((item) => {
              const product = item.product;
              const itemName = product?.name || "Producto sin nombre";
              const itemPrice = product?.price ? parseFloat(product.price) : 0;
              const itemImg = product?.imageUrl || null;
              const maxStock = product?.stock || 0;

              return (
                <div key={item.id_product} className="cart-item">
                  {itemImg && (
                    <img
                      src={itemImg}
                      alt={itemName}
                      className="cart-item-img"
                    />
                  )}
                  <div className="cart-item-details">
                    <h3>{itemName}</h3>
                    <p className="cart-item-price">
                      ${itemPrice.toLocaleString("es-AR")}
                    </p>
                    <p className="cart-item-stock-info">
                      Disponibles: {maxStock}
                    </p>
                  </div>

                  <div className="cart-item-actions">
                    <div className="quantity-controls">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(
                            item.id_product,
                            item.quantity - 1,
                            maxStock,
                          )
                        }
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>

                      <input
                        type="number"
                        value={item.quantity}
                        className="quantity-input"
                        min="1"
                        max={maxStock}
                        onChange={(e) => {
                          const value = parseInt(e.target.value, 10);
                          if (!isNaN(value))
                            handleUpdateQuantity(
                              item.id_product,
                              value,
                              maxStock,
                            );
                        }}
                      />

                      <button
                        onClick={() =>
                          handleUpdateQuantity(
                            item.id_product,
                            item.quantity + 1,
                            maxStock,
                          )
                        }
                        disabled={item.quantity >= maxStock}
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="btn-delete-item"
                      onClick={() => handleRemoveItem(item.id_product)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cart-summary">
            <h3>Resumen del Pedido</h3>
            <hr />

            <div className="address-checkout-wrapper">
              <div className="address-header-row">
                <label>
                  <strong>📍 Dirección de Entrega:</strong>
                </label>
                <button
                  type="button"
                  className="btn-add-address-quick"
                  onClick={() => setShowAddressModal(true)}
                >
                  + Nueva
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="no-address-banner">
                  <p>
                    No tenés direcciones cargadas en tu cuenta para realizar el
                    envío.
                  </p>
                </div>
              ) : (
                <select
                  className="address-select-dropdown"
                  value={selectedAddress}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                >
                  {addresses.map((addr) => (
                    <option key={addr.id_address} value={addr.id_address}>
                      {addr.street} {addr.number} ({addr.city} - {addr.province}
                      ) {addr.isDefault ? "⭐" : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <hr />
            <div className="summary-row">
              <span className="total-label">
                Productos ({cartItems.length}):
              </span>
              <span>${calculateTotal().toLocaleString("es-AR")}</span>
            </div>
            <div className="summary-row total">
              <span className="total-label">Total:</span>
              <span>${calculateTotal().toLocaleString("es-AR")}</span>
            </div>

            <button
              className="btn-checkout"
              onClick={handleCheckout}
              disabled={
                checkoutLoading || cartItems.length === 0 || !selectedAddress
              }
            >
              {checkoutLoading
                ? "Procesando Transacción..."
                : "Confirmar Compra"}
            </button>
          </div>
        </div>
      )}

      {/* 🏙️ MODAL FLOTANTE DE DIRECCIÓN REESTRUCTURADO */}
      {showAddressModal && (
        <div className="modal-overlay">
          <div className="address-modal-card">
            <h3> Registrar nueva dirección de envío</h3>
            <form onSubmit={handleSaveAddress}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Calle *</label>
                  <input
                    type="text"
                    required
                    value={newAddressData.street}
                    onChange={(e) =>
                      setNewAddressData({
                        ...newAddressData,
                        street: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Número de Calle *</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={newAddressData.number}
                    onChange={(e) =>
                      setNewAddressData({
                        ...newAddressData,
                        number: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label>Piso</label>
                  <input
                    type="text"
                    value={newAddressData.floor}
                    onChange={(e) =>
                      setNewAddressData({
                        ...newAddressData,
                        floor: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Depto</label>
                  <input
                    type="text"
                    value={newAddressData.apartment}
                    onChange={(e) =>
                      setNewAddressData({
                        ...newAddressData,
                        apartment: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Cód. Postal *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    value={newAddressData.postalCode}
                    onChange={(e) =>
                      setNewAddressData({
                        ...newAddressData,
                        postalCode: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* 🔄 SELECTORES DE PROVINCIA Y CIUDAD ANTEPUESTOS */}
              <div className="form-grid-2">
                {/* 1. Selector de Provincia */}
                <div className="form-group">
                  <label>Provincia * {loadingProvincias && "⏳"}</label>
                  <select
                    required
                    className="address-select-dropdown"
                    value={newAddressData.province}
                    onChange={(e) =>
                      setNewAddressData({
                        ...newAddressData,
                        province: e.target.value,
                        city: "", // Resetea la ciudad elegida anteriormente al cambiar de provincia
                      })
                    }
                  >
                    <option value="">-- Selecciona Provincia --</option>
                    {provincias.map((p) => (
                      <option key={p.id} value={p.nombre}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Selector de Ciudad/Localidad Dinámico */}
                <div className="form-group">
                  <label>
                    Ciudad / Localidad * {loadingLocalidades && "⏳"}
                  </label>
                  <select
                    required
                    className="address-select-dropdown"
                    value={newAddressData.city}
                    disabled={
                      !newAddressData.province || localidades.length === 0
                    }
                    onChange={(e) =>
                      setNewAddressData({
                        ...newAddressData,
                        city: e.target.value,
                      })
                    }
                  >
                    <option value="">
                      {!newAddressData.province
                        ? "Elegí una provincia primero"
                        : localidades.length === 0
                          ? "Cargando localidades..."
                          : "-- Selecciona Localidad --"}
                    </option>
                    {localidades.map((loc) => (
                      <option key={loc.id} value={loc.nombre}>
                        {loc.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Descripción / Aclaración (Ej: Entre calles X e Y)</label>
                <input
                  type="text"
                  value={newAddressData.description}
                  onChange={(e) =>
                    setNewAddressData({
                      ...newAddressData,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group-checkbox">
                <input
                  type="checkbox"
                  id="default-check"
                  checked={newAddressData.isDefault}
                  onChange={(e) =>
                    setNewAddressData({
                      ...newAddressData,
                      isDefault: e.target.checked,
                    })
                  }
                />
                <label htmlFor="default-check">
                  Establecer como dirección predeterminada
                </label>
              </div>

              <div className="modal-actions-buttons">
                <button
                  type="button"
                  className="btn-cancel-modal"
                  onClick={() => setShowAddressModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-submit-modal">
                  Guardar Dirección
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
