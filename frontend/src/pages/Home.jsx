import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import "../styles/home.css"; // Archivo para los estilos del catálogo

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Traer los productos del backend al cargar la pantalla
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Ajustá este endpoint según cómo se llame en tu backend (ej: /product o /products)
        const res = await API.get("/product");

        // Sincronizado con la respuesta habitual de tus controladores (res.data.body)
        setProducts(res.data.body || []);
      } catch (err) {
        setError("No se pudieron cargar los productos. Intentelo más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 🛒 Función para agregar al carrito con control de invitado
  const handleAddToCart = async (id_product) => {
    // 🔐 Si NO está logueado, lo frena de manos y lo manda a iniciar sesión
    if (!user) {
      alert("Debes iniciar sesión para agregar productos al carrito.");
      navigate("/login");
      return;
    }

    // Si está logueado, procede a pegarle a la ruta del carrito que creamos antes
    try {
      await API.post("/cart", { id_product, quantity: 1 });
      alert("¡Producto agregado al carrito con éxito!");
    } catch (err) {
      alert(err.response?.data?.body || "Error al agregar al carrito");
    }
  };

  if (loading) return <div className="loading-text">Cargando catálogo...</div>;
  if (error) return <div className="error-banner">{error}</div>;

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Nuestra Librería</h1>
        <p>Explorá nuestro catálogo de libros y artículos.</p>
      </header>

      <div className="products-grid">
        {products.length === 0 ? (
          <p>No hay productos disponibles en este momento.</p>
        ) : (
          products.map((prod) => (
            <div key={prod.id_product} className="product-card">
              {prod.imageUrl && (
                <div className="product-image-container">
                  <img
                    src={prod.imageUrl}
                    alt={prod.name}
                    className="product-image"
                  />
                </div>
              )}
              <div className="product-info">
                <span className="product-brand">{prod.brand}</span>
                <h3>{prod.name}</h3>
                <p className="product-description">{prod.description}</p>
                <p className="product-category">{prod.category}</p>
                <p className="product-price">${prod.price}</p>
                <p className="product-stock">Disponibles: {prod.stock}</p>

                <button
                  className="btn-add-cart"
                  onClick={() => handleAddToCart(prod.id_product)}
                  disabled={prod.stock <= 0}
                >
                  {prod.stock > 0 ? "Agregar al carrito" : "Sin Stock"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
