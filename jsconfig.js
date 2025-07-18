{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/hooks/*": ["./hooks/*"]
    },
    "jsx": "preserve"  // <-- This MUST be inside compilerOptions
  },
  "include": ["next-env.d.ts", "**/*.js", "**/*.jsx"],
  "exclude": ["node_modules"]
}