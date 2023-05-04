const config = {
  runtime: "edge",
  images: {
    loader: "custom",
    loaderFile: "./cloudflare_loader.js",
  },
};

module.exports = config;
