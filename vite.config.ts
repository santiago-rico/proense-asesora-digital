import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    
    
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize build output
    target: "esnext",
    minify: "esbuild",
    cssMinify: true,
    
    // Reduce chunk size warnings threshold
    chunkSizeWarningLimit: 1000,
    
    rollupOptions: {
      output: {
        // Manual chunk splitting for optimal loading
        manualChunks: {
          // React core libraries
          "vendor-react": [
            "react",
            "react-dom",
            "react-router-dom"
          ],
          
          // Radix UI components (largest UI dependency)
          "vendor-ui": [
            "@radix-ui/react-accordion",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label",
            "@radix-ui/react-navigation-menu",
            "@radix-ui/react-popover",
            "@radix-ui/react-radio-group",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-slot",
            "@radix-ui/react-toast",
            "@radix-ui/react-tooltip",
            "lucide-react",
            "cmdk"
          ],
          
          // Form handling libraries
          "vendor-forms": [
            "react-hook-form",
            "@hookform/resolvers",
            "zod",
            "react-dropzone",
            "react-phone-number-input",
            "libphonenumber-js"
          ],
          
          // Sanity CMS libraries
          "vendor-sanity": [
            "@sanity/client",
            "@sanity/image-url",
            "@portabletext/react"
          ],
          
          // TanStack React Query
          "vendor-query": [
            "@tanstack/react-query"
          ],
          
          // Utility libraries
          "vendor-utils": [
            "clsx",
            "tailwind-merge",
            "class-variance-authority",
            "date-fns",
            "sonner",
            "next-themes",
            "embla-carousel-react",
            "react-day-picker"
          ]
        },
        
        // Chunk naming strategy
        chunkFileNames: (chunkInfo) => {
          // Use manual chunk names for vendor chunks
          if (chunkInfo.name?.startsWith('vendor-') || chunkInfo.name?.startsWith('chunk-')) {
            return `assets/${chunkInfo.name}-[hash].js`;
          }
          
          // Dynamic chunks based on entry points
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `assets/${facadeModuleId}-[hash].js`;
        },
        
        // Entry file naming
        entryFileNames: "assets/[name]-[hash].js",
        
        // Asset file naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|avif|webp/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    
    // Optimize dependencies
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "@tanstack/react-query",
        "react-hook-form",
        "zod"
      ]
    }
  }
}));
