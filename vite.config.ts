import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// Third-party packages grouped into long-lived vendor chunks.
const VENDOR_GROUPS: Record<string, string[]> = {
  "vendor-react": [
    "react",
    "react-dom",
    "scheduler",
    "react-router-dom",
    "react-router",
  ],
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
    "cmdk",
  ],
  "vendor-forms": [
    "react-hook-form",
    "@hookform/resolvers",
    "zod",
    "react-dropzone",
    "react-phone-number-input",
    "libphonenumber-js",
  ],
  "vendor-sanity": [
    "@sanity/client",
    "@sanity/image-url",
    "@portabletext/react",
  ],
  "vendor-query": [
    "@tanstack/react-query",
  ],
  "vendor-utils": [
    "clsx",
    "tailwind-merge",
    "class-variance-authority",
    "date-fns",
    "sonner",
    "next-themes",
    "embla-carousel-react",
    "react-day-picker",
  ],
};

const VENDOR_CHUNKS: Record<string, string> = Object.fromEntries(
  Object.entries(VENDOR_GROUPS).flatMap(([chunk, pkgs]) => pkgs.map((pkg) => [pkg, chunk])),
);

// "/x/node_modules/@scope/pkg/dist/a.js" -> "@scope/pkg"
function packageName(id: string): string | undefined {
  const match = id.match(/.*node_modules\/((?:@[^/]+\/)?[^/]+)/);
  return match?.[1];
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    tailwindcss(),
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
        // Manual chunk splitting for optimal loading. A function (not the
        // object form) so that every file of a package, including subpaths
        // like react/jsx-runtime or react/compiler-runtime, lands in its
        // group; otherwise React can be split across chunks that import each
        // other, and the app crashes on load.
        manualChunks: (id) => {
          const pkg = packageName(id);
          return pkg ? VENDOR_CHUNKS[pkg] : undefined;
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
