import './globals.css';

const SITE_URL = 'https://www.elpaquetero.com.ar';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'El Paquetero — Indumentaria Mayorista Directo de Fábrica en Rosario',
    template: '%s | El Paquetero'
  },
  description:
    'Venta mayorista de indumentaria en Rosario, Santa Fe: buzos, camperas, calzas, camisas, remeras y gorras. Precios de fábrica, 40% OFF en compras +$50.000, envíos a todo el país y retiro en Camilo Aldao 2715.',
  keywords: [
    'indumentaria mayorista Rosario',
    'ropa mayorista Santa Fe',
    'mayorista de ropa Argentina',
    'buzos por mayor',
    'camperas por mayor',
    'venta directa de fábrica indumentaria',
    'El Paquetero'
  ],
  authors: [{ name: 'El Paquetero' }],
  alternates: {
    canonical: '/'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true
    }
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: SITE_URL,
    siteName: 'El Paquetero',
    title: 'El Paquetero — Indumentaria Mayorista Directo de Fábrica en Rosario',
    description:
      'Catálogo mayorista de indumentaria en Rosario. 40% OFF en compras +$50.000, envíos a todo el país y retiro en local.',
    images: [
      {
        url: '/elpaquetero_imagenes/Logo%202.jpeg',
        width: 1200,
        height: 896,
        alt: 'El Paquetero — Indumentaria Mayorista'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'El Paquetero — Indumentaria Mayorista Directo de Fábrica en Rosario',
    description:
      'Catálogo mayorista de indumentaria en Rosario. 40% OFF en compras +$50.000, envíos a todo el país y retiro en local.',
    images: ['/elpaquetero_imagenes/Logo%202.jpeg']
  }
};

// Datos estructurados (Schema.org) para SEO local / GEO: ayuda a que
// Google y los buscadores con IA entiendan que es un comercio físico
// real en Rosario, con horarios, rubro y contacto verificables.
const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ClothingStore',
  name: 'El Paquetero',
  image: `${SITE_URL}/elpaquetero_imagenes/Logo%202.jpeg`,
  url: SITE_URL,
  telephone: '+54-341-609-5021',
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Camilo Aldao 2715 esq. ex Godoy',
    addressLocality: 'Rosario',
    addressRegion: 'Santa Fe',
    addressCountry: 'AR'
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '08:00',
      closes: '16:30'
    }
  ],
  sameAs: ['https://www.instagram.com/el_paquetero_godoy/']
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
