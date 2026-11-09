import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// Third-party packages grouped into long-lived vendor chunks. The order is the
// priority order of the groups (see codeSplitting below): keep vendor-react first.
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
    "sonner",
    "next-themes",
    "embla-carousel-react",
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
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    // Optimize build output
    target: "esnext",
    // Vite 8's own minifier. esbuild is only an optional peer of Vite now.
    minify: "oxc",
    cssMinify: true,
    
    // Reduce chunk size warnings threshold
    chunkSizeWarningLimit: 1000,
    
    rolldownOptions: {
      output: {
        // Vendor chunks. Every file of a package, including subpaths like
        // react/jsx-runtime or react/compiler-runtime, goes to its package's
        // group; otherwise React can be split across chunks that import each
        // other, and the app crashes on load (#197).
        // Rolldown also pulls a captured module's dependencies into its group,
        // so groups claim modules in VENDOR_GROUPS order (highest priority
        // first). vendor-react must come first, or vendor-forms takes React
        // along with react-hook-form, as Vite 8's manualChunks shim did.
        codeSplitting: {
          groups: Object.keys(VENDOR_GROUPS).map((name, i, names) => ({
            name,
            test: (id: string) => {
              const pkg = packageName(id);
              return pkg !== undefined && VENDOR_CHUNKS[pkg] === name;
            },
            priority: names.length - i,
          })),
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
