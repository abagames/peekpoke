import typescript from "@rollup/plugin-typescript";

export default {
  input: "src_memorymap/main.ts",
  output: {
    file: "docs/memorymap/bundle.js",
    format: "es",
  },
  plugins: [typescript({ tsconfig: "tsconfig.json" })],
};
