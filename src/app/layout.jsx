import './globals.css';

export const metadata = {
  title: 'El Paquetero — Indumentaria Mayorista Directo de Fábrica',
  description: 'Venta mayorista de ropa, buzos, camperas, calzas, camisas y gorras. Catálogo completo, precios especiales y envíos a todo el país.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
