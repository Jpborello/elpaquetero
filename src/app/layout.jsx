import './globals.css';
import Script from 'next/script';

const SITE_URL = 'https://www.elpaquetero.com.ar';

// Sin esto, algunos navegadores de celular renderizan la pagina con un
// ancho "de escritorio" y despues la recortan — causaba que en mobile se
// viera una sola columna de productos con la siguiente cortada, sin poder
// desplazarse para el costado.
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5
};

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
        url: '/elpaquetero_imagenes/logo.webp',
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
    images: ['/elpaquetero_imagenes/logo.webp']
  }
};

// Datos estructurados (Schema.org) para SEO local / GEO: ayuda a que
// Google y los buscadores con IA entiendan que es un comercio físico
// real en Rosario, con horarios, rubro y contacto verificables.
const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ClothingStore',
  name: 'El Paquetero',
  image: `${SITE_URL}/elpaquetero_imagenes/logo.webp`,
  url: SITE_URL,
  telephone: '+54-9-341-3286628',
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
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Aplica el tema guardado ANTES de pintar la pagina, para que no se
            vea un flash de tema claro y despues salte a oscuro. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('elpaquetero_theme');
                  if (saved === 'light' || saved === 'dark') {
                    document.documentElement.setAttribute('data-theme', saved);
                  }
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />

        {/* Meta Pixel Code */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1619985726217301');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1619985726217301&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}

        {children}
      </body>
    </html>
  );
}
