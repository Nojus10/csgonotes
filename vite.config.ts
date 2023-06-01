import { defineConfig, splitVendorChunkPlugin } from "vite"
import solidPlugin from "vite-plugin-solid"
import viteTsconfigPaths from "vite-tsconfig-paths"
import { serviceWorker } from "./src/lib/vite-service-worker"
import path from "path"
import { viteMangleClassNames } from "./src/lib/vite-mangle-classnames"
import { viteSingleFile } from "vite-plugin-singlefile"
import { createHtmlPlugin } from "vite-plugin-html"

export default defineConfig({
  plugins: [
    viteTsconfigPaths(),
    solidPlugin(),
    viteMangleClassNames(),
    // viteSingleFile({
    //   inlinePattern: ["assets/*.css", "assets/*.js"],
    //   useRecommendedBuildConfig: false,
    //   deleteInlinedFiles: true,
    // }),
    // serviceWorker({
    //   manifest: {
    //     short_name: "Notes",
    //     name: "CS:GO Notes",
    //     start_url: "/",
    //     scope: "/",
    //     theme_color: "#4caf50",
    //     background_color: "#4caf50",
    //     display: "fullscreen",
    //     orientation: "portrait",
    //     description: "A CS:GO Themed Notes Web App with AES256 Encryption.",
    //     icons: [
    //       {
    //         src: "/static/icons/icon.svg",
    //         type: "image/svg+xml",
    //         sizes: "any",
    //         purpose: "any",
    //       },
    //       {
    //         src: "/static/icons/icon.png",
    //         type: "image/png",
    //         sizes: "128x128",
    //         purpose: "any",
    //       },
    //     ],
    //     screenshots: [],
    //   },
    // }),
    // createHtmlPlugin({
    //   minify: false,
    // }),
  ],
  assetsInclude: ["**.woff2"],
  build: {
    target: "esnext",
    assetsInlineLimit: 15150,
    cssCodeSplit: false,
  },
  resolve: {
    alias: {
      "@Assets": path.join(__dirname, "./src/Assets"),
    },
  },
})
