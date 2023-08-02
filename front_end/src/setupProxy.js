const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  // app.use(
  //   "/digest-auth",
  //   createProxyMiddleware({
  //     target: "https://httpbin.org",
  //     changeOrigin: true,
  //     //prevent browser pop up
  //     onProxyRes: (proxyRes, req, res) => {
  //       if (proxyRes.statusCode === 401) {
  //         proxyRes.statusCode = 400;
  //       }
  //     },
  //   })
  // );

  app.use("/socket.io/", createProxyMiddleware({
    target: "http://localhost:3000",
    ws: false,
    changeOrigin: true
  }))

  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:3000",
      changeOrigin: true,
    })
  );
  app.use(
    "/uploads",
    createProxyMiddleware({
      target: "http://localhost:3000",
      changeOrigin: true,
    })
  );
};
