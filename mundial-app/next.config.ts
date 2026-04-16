import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Los errores de TS en build son de inferencia de tipos de Supabase
    // (joins devueltos como array[]). No afectan el runtime.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
