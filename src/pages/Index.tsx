import milanesaImg from "@/assets/milanesa.png";
import empanadasImg from "@/assets/empanadas.png";
import pastaImg from "@/assets/pasta.png";
import ensaladaImg from "@/assets/ensalada.png";
import heroLeftImg from "@/assets/food-hero-left.png";
import heroRightImg from "@/assets/food-hero-right.png";
import { ShoppingCart, Utensils, Search, ChevronRight } from "lucide-react";

const menuItems = [
  {
    id: 1,
    name: "Milanesa con Papas",
    price: "$12.500",
    image: milanesaImg,
    tag: "milanesa",
  },
  {
    id: 2,
    name: "Empanadas Criollas",
    price: "$8.900",
    image: empanadasImg,
    tag: "empanadas",
  },
  {
    id: 3,
    name: "Pasta a la Bolognesa",
    price: "$10.800",
    image: pastaImg,
    tag: "pasta",
  },
  {
    id: 4,
    name: "Ensalada César",
    price: "$9.200",
    image: ensaladaImg,
    tag: "ensalada",
  },
];

const navLinks = ["Inicio", "Menú", "Reservas", "Nosotros", "Contacto"];

const Index = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(var(--background))" }}>
      {/* NAVBAR */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-8 py-4"
        style={{
          backgroundColor: "hsl(0 0% 100%)",
          borderBottom: "1px solid hsl(var(--border))",
          boxShadow: "0 1px 8px hsl(var(--card-shadow) / 0.08)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "hsl(var(--brown-dark))" }}
          >
            <Utensils className="w-6 h-6" style={{ color: "hsl(var(--primary-foreground))" }} />
          </div>
          <div className="leading-tight">
            <div
              className="font-script text-2xl leading-none"
              style={{ color: "hsl(var(--orange-accent))" }}
            >
              El Buen Sabor
            </div>
            <div
              className="text-xs tracking-widest uppercase font-semibold"
              style={{ color: "hsl(var(--brown-dark))" }}
            >
              — Restaurante —
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a key={link} href="#" className="nav-link">
              {link}
            </a>
          ))}
        </nav>

        {/* Order Now button */}
        <button
          className="flex items-center gap-2 px-5 py-2 rounded-full border-2 font-semibold text-sm transition-all duration-200 hover:text-white"
          style={{
            borderColor: "hsl(var(--brown-dark))",
            color: "hsl(var(--foreground))",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "hsl(var(--brown-dark))";
            (e.currentTarget as HTMLElement).style.color = "white";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
            (e.currentTarget as HTMLElement).style.color = "hsl(var(--foreground))";
          }}
        >
          <Search className="w-4 h-4" />
          Order Now
        </button>
      </header>

      {/* HERO SECTION */}
      <section
        className="relative overflow-hidden flex flex-col items-center justify-center text-center py-20 min-h-[420px]"
        style={{
          background: `linear-gradient(135deg, hsl(var(--hero-bg)) 0%, hsl(var(--hero-bg-end)) 100%)`,
        }}
      >
        {/* Decorative blob left */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full overflow-hidden"
          style={{
            transform: "translate(-20%, -50%)",
            boxShadow: "0 8px 32px hsl(var(--card-shadow) / 0.2)",
          }}
        >
          <img
            src={heroLeftImg}
            alt="Milanesa con papas"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Decorative blob right */}
        <div
          className="absolute right-0 top-1/2 w-64 h-64 rounded-full overflow-hidden"
          style={{
            transform: "translate(20%, -50%)",
            boxShadow: "0 8px 32px hsl(var(--card-shadow) / 0.2)",
          }}
        >
          <img
            src={heroRightImg}
            alt="Empanadas criollas"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Hero Text */}
        <div className="relative z-10 flex flex-col items-center gap-4">
          <h1
            className="font-script text-7xl md:text-8xl leading-none"
            style={{ color: "hsl(var(--brown-dark))" }}
          >
            El{" "}
            <span style={{ color: "hsl(var(--orange-accent))" }}>Buen</span>{" "}
            Sabor
          </h1>
          <p
            className="text-xl md:text-2xl font-medium"
            style={{ color: "hsl(var(--brown-dark))" }}
          >
            La mejor comida casera
          </p>
          <a href="#menu" className="btn-primary-restaurant mt-2">
            <Utensils className="w-5 h-5" />
            Ver Menú
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* MENU SECTION */}
      <section id="menu" className="px-8 py-12 max-w-6xl mx-auto">
        <h2 className="section-title">
          <span
            className="p-2 rounded-lg"
            style={{ backgroundColor: "hsl(var(--secondary))" }}
          >
            <Utensils className="w-5 h-5" style={{ color: "hsl(var(--brown-dark))" }} />
          </span>
          Menú del Restaurante
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item) => (
            <div key={item.id} className="menu-card">
              {/* Food image */}
              <div className="w-full h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>

              {/* Card content */}
              <div className="p-4 flex flex-col gap-2">
                <h3
                  className="font-bold text-base text-center"
                  style={{
                    color: "hsl(var(--foreground))",
                    fontFamily: "'Playfair Display', serif",
                  }}
                >
                  {item.name}
                </h3>
                <p className="price-text text-xl text-center">{item.price}</p>

                <button
                  className="btn-primary-restaurant w-full justify-center mt-1"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Order Now
                </button>

                <p
                  className="text-xs text-center mt-1"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  {item.tag}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="text-center py-8 mt-8"
        style={{
          backgroundColor: "hsl(var(--brown-dark))",
          color: "hsl(var(--primary-foreground))",
        }}
      >
        <p className="font-script text-2xl mb-1" style={{ color: "hsl(var(--orange-accent))" }}>
          El Buen Sabor
        </p>
        <p className="text-sm opacity-70">© 2024 Restaurante El Buen Sabor. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default Index;
