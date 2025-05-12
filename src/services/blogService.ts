
import { BlogPost } from "@/components/shared/BlogPostCard";

// Mock blog data for the initial build
const mockPosts: BlogPost[] = [
  {
    id: 1,
    slug: "beneficios-seguro-vida",
    title: "Los 5 Beneficios Clave de un Seguro de Vida en Colombia",
    excerpt: "Descubre cómo un seguro de vida puede proteger a tu familia financieramente y brindarte tranquilidad en el futuro.",
    featuredImage: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
    category: "Seguro de Vida",
    date: "10 Mayo, 2023",
    author: "María Gómez"
  },
  {
    id: 2,
    slug: "elegir-seguro-salud",
    title: "Cómo Elegir el Mejor Seguro de Salud para tu Familia",
    excerpt: "Factores importantes a considerar para seleccionar la póliza de salud que mejor se adapte a las necesidades de tu familia.",
    featuredImage: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528",
    category: "Seguro de Salud",
    date: "5 Mayo, 2023",
    author: "Carlos Ramírez"
  },
  {
    id: 3,
    slug: "coberturas-seguro-auto",
    title: "Coberturas Esenciales en un Seguro de Auto Colombiano",
    excerpt: "Conoce las coberturas que no pueden faltar en tu póliza para estar completamente protegido en las vías colombianas.",
    featuredImage: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2",
    category: "Seguro de Auto",
    date: "28 Abril, 2023",
    author: "Juan Pérez"
  },
  {
    id: 4,
    slug: "seguros-pymes-colombia",
    title: "Seguros para PYMES: Protegiendo tu Negocio en Colombia",
    excerpt: "Guía completa sobre las opciones de seguros disponibles para pequeñas y medianas empresas en el mercado colombiano.",
    featuredImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
    category: "Seguros para PYMES",
    date: "20 Abril, 2023",
    author: "Ana Martínez"
  },
  {
    id: 5,
    slug: "seguro-hogar-proteger-vivienda",
    title: "Por Qué Necesitas un Seguro de Hogar para Proteger tu Vivienda",
    excerpt: "Descubre las razones por las que un seguro de hogar es una inversión inteligente para proteger uno de tus activos más valiosos.",
    featuredImage: "https://images.unsplash.com/photo-1621293954908-907159247fc8",
    category: "Seguro de Hogar",
    date: "15 Abril, 2023",
    author: "Sofía Torres"
  },
  {
    id: 6,
    slug: "seguro-mascotas-cuidado",
    title: "El Seguro para Mascotas: Una Tendencia Creciente en Colombia",
    excerpt: "Explora cómo los seguros para mascotas están ganando popularidad y los beneficios que ofrecen para el cuidado de tus animales.",
    featuredImage: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1",
    category: "Seguro para Mascotas",
    date: "10 Abril, 2023",
    author: "Diego López"
  }
];

// Mock blog post content
const mockPostContent = {
  "beneficios-seguro-vida": {
    title: "Los 5 Beneficios Clave de un Seguro de Vida en Colombia",
    content: `
      <p>En un mundo lleno de incertidumbres, proteger el futuro financiero de nuestra familia se ha convertido en una prioridad. Los seguros de vida en Colombia ofrecen una solución integral para garantizar la tranquilidad de nuestros seres queridos en caso de que ya no estemos presentes.</p>
      
      <h2>1. Protección financiera para tu familia</h2>
      <p>El beneficio principal de un seguro de vida es proporcionar seguridad económica a tus dependientes. Los fondos del seguro pueden ayudar a cubrir gastos diarios, pagar la hipoteca, mantener el estilo de vida familiar o financiar la educación de tus hijos.</p>
      
      <h2>2. Planificación patrimonial</h2>
      <p>Un seguro de vida puede ser una herramienta efectiva dentro de tu estrategia de planificación patrimonial, permitiendo transferir riqueza a las generaciones futuras de manera eficiente y con posibles beneficios fiscales.</p>
      
      <h2>3. Liquidez inmediata</h2>
      <p>A diferencia de otros activos que pueden tardar en liquidarse, los beneficios del seguro de vida generalmente se pagan rápidamente a los beneficiarios, proporcionando fondos cuando más se necesitan.</p>
      
      <h2>4. Diversificación de inversiones</h2>
      <p>Algunos seguros de vida en Colombia, como los seguros universales o unit-linked, combinan la protección con componentes de ahorro e inversión, ofreciéndote la posibilidad de diversificar tu portafolio financiero.</p>
      
      <h2>5. Tranquilidad emocional</h2>
      <p>Quizás el beneficio menos tangible pero igualmente valioso: la paz mental de saber que tus seres queridos estarán protegidos financieramente pase lo que pase.</p>
      
      <h3>¿Cómo elegir el seguro de vida adecuado?</h3>
      <p>La selección del seguro ideal dependerá de factores como tu edad, responsabilidades financieras, número de dependientes y objetivos a largo plazo. En Proense Seguros podemos ayudarte a evaluar tus necesidades específicas y recomendarte la póliza que mejor se adapte a tu situación personal.</p>
      
      <p>Recuerda que la mejor inversión que puedes hacer es aquella que protege lo que más valoras. Contáctanos hoy mismo para una asesoría personalizada sobre seguros de vida en Colombia.</p>
    `,
    author: "María Gómez",
    date: "10 Mayo, 2023",
    category: "Seguro de Vida",
    featuredImage: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
    tags: ["seguro de vida", "protección familiar", "planificación financiera", "seguros en colombia"]
  }
};

export const getBlogPosts = async (): Promise<BlogPost[]> => {
  // In a real implementation, this would fetch data from WordPress API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockPosts);
    }, 500);
  });
};

export const getBlogPostBySlug = async (slug: string): Promise<any> => {
  // In a real implementation, this would fetch a specific post from WordPress API
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const post = mockPosts.find(post => post.slug === slug);
      const content = mockPostContent[slug as keyof typeof mockPostContent];
      
      if (post && content) {
        resolve({
          ...post,
          content: content.content,
          tags: content.tags
        });
      } else {
        reject(new Error("Blog post not found"));
      }
    }, 500);
  });
};

export const getRecentBlogPosts = async (limit: number = 3): Promise<BlogPost[]> => {
  // In a real implementation, this would fetch recent posts from WordPress API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockPosts.slice(0, limit));
    }, 500);
  });
};

export const getBlogPostsByCategory = async (category: string): Promise<BlogPost[]> => {
  // In a real implementation, this would fetch posts by category from WordPress API
  return new Promise((resolve) => {
    setTimeout(() => {
      const posts = mockPosts.filter(post => post.category.toLowerCase() === category.toLowerCase());
      resolve(posts);
    }, 500);
  });
};
