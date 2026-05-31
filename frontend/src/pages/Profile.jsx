import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import "../styles/profile.css";
import AddressBook from "../components/AddressBook";

const ROLES = {
  COMPRADOR: 1,
  SELLER: 2,
  ADMIN: 3,
};

export default function Profile() {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  // 📝 Estados Datos de Perfil
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    user: "",
    password: "",
    currentPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  // 👥 Estados Administración de Usuarios (Solo Admin)
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchUserQuery, setSearchUserQuery] = useState("");

  // 📦 Estados Productos/Ofertas (Seller & Admin)
  const [productsList, setProductsList] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchProductQuery, setSearchProductQuery] = useState("");

  // 📑 Estados para el Modal de Crear/Editar Producto
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // Si es null estamos Creando, si tiene datos Editando
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    brand: "",
    category: "",
    price: "",
    stock: "",
  });
  const [productImage, setProductImage] = useState(null);

  // 1. Cargar datos del perfil propio
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await API.get("/user-management/profile");
        const data = res.data.body;
        setFormData((prev) => ({
          ...prev,
          name: data.name || "",
          surname: data.surname || "",
          email: data.email || "",
          user: data.user || "",
        }));
      } catch (err) {
        setMessage({ type: "error", text: "No se pudieron cargar los datos." });
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  // 2. Cargar lista completa de usuarios (Solo Admin)
  useEffect(() => {
    if (activeTab === "admin-sellers" && user?.id_role === ROLES.ADMIN) {
      const fetchAllUsers = async () => {
        setLoadingUsers(true);
        try {
          const res = await API.get("/user-management/admin/all");
          setUsersList(res.data.body || []);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingUsers(false);
        }
      };
      fetchAllUsers();
    }
  }, [activeTab, user]);

  // 3. Cargar todos los productos para el panel (incluye activos y pausados)
  // OJO: por ahora usamos el GET /product que devuelve solo status=active (público).
  // Luego vamos a reemplazarlo por un endpoint privado si existe.
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      // Para que el ADMIN pueda ver y activar/pausar publicaciones,
      // necesitamos traer también las que estén en status="paused".
      // (Tu GET /product público solo trae status="active".)
      const res =
        user?.id_role === ROLES.ADMIN
          ? await API.get("/product/admin-all")
          : await API.get("/product/by-user");

      const list = res.data.body || [];
      setProductsList(list);
    } catch (err) {
      console.error("Error cargando productos", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (activeTab === "my-products") {
      fetchProducts();
    }
  }, [activeTab, user]);

  // Manejadores de cambios simples
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "securityQuestionId" ? parseInt(value, 10) : value,
    });
  };
  const handleProductChange = (e) =>
    setProductForm({ ...productForm, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setProductImage(e.target.files[0]);

  // Guardar Cambios de Perfil
  const handleSubmitProfile = async (e) => {
    e.preventDefault();

    const payload = { ...formData };

    // --- Contraseña (opcional) ---
    const shouldChangePassword = !!payload.password;
    if (!shouldChangePassword) {
      delete payload.password;
      delete payload.currentPassword;
    }

    // --- Seguridad (opcional) ---
    // Si no se está cambiando pregunta/respuesta, no mandamos nada de seguridad.
    const shouldChangeSecurity =
      payload.securityQuestionId !== "" && payload.securityAnswer !== "";

    if (!shouldChangeSecurity) {
      delete payload.securityQuestionId;
      delete payload.securityAnswer;
      delete payload.currentSecurityAnswer;
    }

    try {
      const res = await API.put("/user-management/profile", payload);
      if (setUser) setUser(res.data.body);
      alert("¡Perfil actualizado!");
      window.location.reload();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.body || "Error al actualizar.",
      });
    }
  };

  // Cambiar rol de Seller (Solo Admin)
  const handleRoleChange = async (id_user, currentRole) => {
    const nuevoRol =
      currentRole === ROLES.SELLER ? ROLES.COMPRADOR : ROLES.SELLER;
    if (!window.confirm(`¿Modificar rol de este usuario?`)) return;
    try {
      await API.put(`/user-management/admin/role/${id_user}`, {
        id_role: nuevoRol,
      });
      setUsersList((prev) =>
        prev.map((u) =>
          u.id_user === id_user ? { ...u, id_role: nuevoRol } : u,
        ),
      );
    } catch (err) {
      alert("Error al cambiar rol");
    }
  };

  // 📂 ABRIR MODAL PARA CREAR O EDITAR
  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description || "",
        brand: product.brand,
        category: product.category,
        price: product.price,
        stock: product.stock,
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: "",
        description: "",
        brand: "",
        category: "",
        price: "",
        stock: "",
      });
    }
    setProductImage(null);
    setIsModalOpen(true);
  };

  // 💾 GUARDAR / ACTUALIZAR PRODUCTO (Form Data para Multer)
  const handleSaveProduct = async (e) => {
    e.preventDefault();

    // Al subir archivos (imágenes) hay que usar FormData obligatoriamente
    const data = new FormData();
    data.append("name", productForm.name);
    data.append("description", productForm.description);
    data.append("brand", productForm.brand);
    data.append("category", productForm.category);
    data.append("price", productForm.price);
    data.append("stock", productForm.stock);
    if (productImage) {
      data.append("image", productImage); // Vinculado a uploadImage.single("image") de tus rutas
    }

    try {
      if (editingProduct) {
        // Editar: PUT /api/product/:id
        await API.put(`/product/${editingProduct.id_product}`, data);
        alert("Producto editado con éxito");
      } else {
        // Crear: POST /api/product
        await API.post("/product", data);
        alert("Producto publicado con éxito");
      }
      setIsModalOpen(false);
      fetchProducts(); // Recargamos la lista
    } catch (err) {
      alert(
        err.response?.data?.body ||
          err.response?.data?.message ||
          "Error al procesar el producto",
      );
    }
  };

  // 🗑️ BAJA LÓGICA DE PRODUCTO
  const handleDeleteProduct = async (id_product) => {
    if (!window.confirm("¿Estás seguro de que querés dar de baja esta oferta?"))
      return;
    try {
      await API.delete(`/product/${id_product}`); // Baja (isActive=false)
      alert("Producto dado de baja");
      fetchProducts();
    } catch (err) {
      alert("No se pudo eliminar el producto");
    }
  };

  // ⏯️ PAUSAR / ACTIVAR PUBLICACIÓN
  const handlePauseProduct = async (product) => {
    const id_product = product.id_product;
    const isPaused = product.status === "paused";
    const action = isPaused ? "activate" : "pause";

    if (
      !window.confirm(
        `¿Estás seguro de que querés ${isPaused ? "activar" : "pausar"} esta oferta?`,
      )
    )
      return;

    try {
      await API.put(`/product/${id_product}/${action}`);
      alert("Oferta actualizada");
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.body || "No se pudo actualizar la oferta");
    }
  };

  // 🎯 Filtros en tiempo real
  const filteredUsers = usersList.filter((u) => {
    const q = searchUserQuery.toLowerCase().trim();
    return (
      `${u.name} ${u.surname}`.toLowerCase().includes(q) ||
      (u.user || "").toLowerCase().includes(q)
    );
  });

  const filteredProducts = productsList.filter((p) =>
    (p.name || "")
      .toLowerCase()
      .includes(searchProductQuery.toLowerCase().trim()),
  );

  const getRoleLabel = (roleId) => {
    if (roleId === ROLES.ADMIN) return "Administrador";
    if (roleId === ROLES.SELLER) return "Vendedor";
    return "Comprador";
  };

  if (loading) return <div className="loading-text">Cargando panel...</div>;

  return (
    <div className="dashboard-container">
      {/* 🧭 MENÚ LATERAL */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-user-info">
          <div className="user-avatar">👤</div>
          <h3>{formData.user}</h3>
          <span className={`badge-role role-${user?.id_role}`}>
            {getRoleLabel(user?.id_role)}
          </span>
        </div>

        <nav className="sidebar-menu">
          <button
            className={`menu-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            Editar Perfil
          </button>
          {(user?.id_role === ROLES.SELLER ||
            user?.id_role === ROLES.ADMIN) && (
            <button
              className={`menu-btn ${activeTab === "my-products" ? "active" : ""}`}
              onClick={() => setActiveTab("my-products")}
            >
              Mis Ofertas / Productos
            </button>
          )}
          {user?.id_role === ROLES.ADMIN && (
            <button
              className={`menu-btn ${activeTab === "admin-sellers" ? "active" : ""}`}
              onClick={() => setActiveTab("admin-sellers")}
            >
              Gestionar Vendedores
            </button>
          )}

          <button
            className={`menu-btn ${activeTab === "my-addresses" ? "active" : ""}`}
            onClick={() => setActiveTab("my-addresses")}
          >
            Mis Direcciones
          </button>
        </nav>
      </aside>

      {/* 🖥️ CONTENIDO DEL PANEL */}
      <main className="dashboard-content">
        {/* PESTAÑA A: EDITAR PERFIL */}
        {activeTab === "profile" && (
          <div className="profile-card-v2">
            <h2>Editar mi Información</h2>
            {message.text && (
              <div className={`alert-banner ${message.type}`}>
                {message.text}
              </div>
            )}
            <form onSubmit={handleSubmitProfile} className="profile-form">
              <div className="form-group">
                <label>Nombre de Usuario</label>
                <input
                  type="text"
                  name="user"
                  value={formData.user}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Apellido</label>
                  <input
                    type="text"
                    name="surname"
                    value={formData.surname}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Correo Electrónico</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <hr className="profile-divider" />
              <h3>Seguridad de la Cuenta</h3>
              <div className="form-group">
                <label>Contraseña Actual</label>
                <input
                  type="password"
                  name="currentPassword"
                  placeholder="Contraseña actual"
                  value={formData.currentPassword}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Nueva Contraseña (opcional)</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Nueva contraseña (opcional)"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              {/* Pregunta/Respuesta de seguridad */}
              <div className="form-group">
                <label>Pregunta de Seguridad</label>
                <select
                  name="securityQuestionId"
                  value={formData.securityQuestionId}
                  onChange={handleChange}
                >
                  {/* Igual que en Register.jsx */}
                  <option value={1}>
                    ¿Cuál fue el nombre de tu primera mascota?
                  </option>
                  <option value={2}>¿En qué ciudad nacieron tus padres?</option>
                  <option value={3}>
                    ¿Cuál es tu película favorita de la infancia?
                  </option>
                  <option value={4}>
                    ¿Cómo se llamaba tu primera escuela?
                  </option>
                </select>
              </div>
              <div className="form-group">
                <label>Respuesta Nueva</label>
                <input
                  type="text"
                  name="securityAnswer"
                  placeholder="Escribí la respuesta nueva"
                  value={formData.securityAnswer}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Respuesta de Seguridad Actual</label>
                <input
                  type="text"
                  name="currentSecurityAnswer"
                  placeholder="Confirmar respuesta anterior"
                  value={formData.currentSecurityAnswer}
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className="btn-save-profile">
                Guardar Cambios
              </button>
            </form>
          </div>
        )}

        {/* PESTAÑA B: MIS OFERTAS / PRODUCTOS */}
        {activeTab === "my-products" && (
          <div className="profile-card-v2 wide-card">
            <div className="products-header">
              <h2>Mis Productos Ofertados</h2>
              <button className="btn-add-product" onClick={() => openModal()}>
                + Publicar Producto
              </button>
            </div>

            <div className="search-bar-container">
              <input
                type="text"
                placeholder="🔍 Buscar producto por nombre..."
                className="dashboard-search-input"
                value={searchProductQuery}
                onChange={(e) => setSearchProductQuery(e.target.value)}
              />
            </div>

            {loadingProducts ? (
              <p>Cargando tus publicaciones...</p>
            ) : filteredProducts.length === 0 ? (
              <p className="no-results-txt">
                No tenés productos publicados que coincidan.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Foto</th>
                      <th>Nombre</th>
                      <th>Vendedor</th>
                      <th>Marca / Cat</th>

                      <th>Precio</th>

                      <th>Stock</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p.id_product}>
                        <td>
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="table-product-img"
                            />
                          ) : (
                            <div className="table-no-img">📦</div>
                          )}
                        </td>
                        <td>
                          <strong>{p.name}</strong>
                        </td>

                        <td>
                          <span className="txt-dim">
                            {p.user?.user || p.id_user}
                          </span>
                        </td>
                        <td>
                          <span className="txt-dim">
                            {p.brand} | {p.category}
                          </span>
                        </td>
                        <td>
                          <strong className="txt-success">${p.price}</strong>
                        </td>
                        <td>{p.stock} u.</td>
                        <td>
                          <div className="actions-cell-gap">
                            <button
                              className="btn-edit-prod"
                              onClick={() => openModal(p)}
                            >
                              Editar
                            </button>
                            <button
                              className="btn-delete-prod"
                              onClick={() => handleDeleteProduct(p.id_product)}
                            >
                              Baja
                            </button>
                            {user?.id_role !== ROLES.ADMIN && null}
                            {user?.id_role === ROLES.ADMIN && (
                              <button
                                className="btn-delete-prod"
                                onClick={() => handlePauseProduct(p)}
                                // importante: al activar, el producto vuelve a aparecer
                              >
                                {p.status === "paused" ? "Activar" : "Pausar"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA C: MIS DIRECCIONES (Todos los usuarios) */}
        {activeTab === "my-addresses" && (
          <div className="profile-card-v2 wide-card">
            <AddressBook />
          </div>
        )}

        {/* PESTAÑA D: GESTIÓN DE VENDEDORES (Solo Admin) */}
        {activeTab === "admin-sellers" && (
          <div className="profile-card-v2 wide-card">
            <h2>Panel de Administración: Usuarios</h2>
            <p className="subtitle-admin">
              Promové usuarios a Vendedores o quitalos del panel de ofertas.
            </p>
            <div className="search-bar-container">
              <input
                type="text"
                placeholder="🔍 Buscar por nombre, apellido o nick..."
                className="dashboard-search-input"
                value={searchUserQuery}
                onChange={(e) => setSearchUserQuery(e.target.value)}
              />
            </div>

            {loadingUsers ? (
              <p>Cargando listado de usuarios...</p>
            ) : filteredUsers.length === 0 ? (
              <p className="no-results-txt">No se encontraron usuarios.</p>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Usuario</th>
                      <th>Nombre Completo</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id_user}>
                        <td>{u.id_user}</td>
                        <td>
                          <strong>{u.user}</strong>
                        </td>
                        <td>
                          {u.name} {u.surname}
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span
                            className={`table-role-badge role-${u.id_role}`}
                          >
                            {getRoleLabel(u.id_role)}
                          </span>
                        </td>
                        <td>
                          {u.id_role !== ROLES.ADMIN ? (
                            <button
                              className={`btn-action-role ${u.id_role === ROLES.SELLER ? "btn-demote" : "btn-promote"}`}
                              onClick={() =>
                                handleRoleChange(u.id_user, u.id_role)
                              }
                            >
                              {u.id_role === ROLES.SELLER
                                ? "Quitar Seller"
                                : "Hacer Seller"}
                            </button>
                          ) : (
                            <span className="txt-protected">Protegido</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 🖼️ MODAL FLOTANTE: CREAR / EDITAR PRODUCTO */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>
              {editingProduct ? "Editar Producto" : "Publicar Nuevo Producto"}
            </h2>
            <form onSubmit={handleSaveProduct} className="modal-form">
              <div className="form-group">
                <label>Nombre del Producto</label>
                <input
                  type="text"
                  name="name"
                  value={productForm.name}
                  onChange={handleProductChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  name="description"
                  value={productForm.description}
                  onChange={handleProductChange}
                  rows="2"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Marca</label>
                  <input
                    type="text"
                    name="brand"
                    value={productForm.brand}
                    onChange={handleProductChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Categoría</label>
                  <input
                    type="text"
                    name="category"
                    value={productForm.category}
                    onChange={handleProductChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Precio ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="price"
                    value={productForm.price}
                    onChange={handleProductChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Stock Disponible</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    name="stock"
                    value={productForm.stock}
                    onChange={handleProductChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>
                  Imagen del Producto{" "}
                  {editingProduct && "(Opcional si no cambia)"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required={!editingProduct}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel-modal"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-submit-modal">
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
