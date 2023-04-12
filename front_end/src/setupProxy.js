const { FunctionsTwoTone } = require("@mui/icons-material");
const { response } = require("express");
const {
  createProxyMiddleware,
  responseInterceptor,
} = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/digest-auth",
    createProxyMiddleware({
      target: "https://httpbin.org",
      changeOrigin: true,
      onProxyRes: (proxyRes, req, res) => {
        if (proxyRes.statusCode === 401) {
          // console.log("statusCode is 401");
          proxyRes.statusCode = 400;
        }
      },

      // selfHandleResponse: true,

      /**
       * Intercept response and replace 'Hello' with 'Goodbye'
       **/
      // change the header of the response to prevent pop up to show
      // onProxyRes: responseInterceptor(function (
      //   responseBuffer,
      //   proxyRes,
      //   req,
      //   res
      // ) {
      //   // console.log(proxyRes);
      // }),

      // selfHandleResponse: true,
      // onProxyRes: async (proxyRes, req, res) => {
      //   delete proxyRes.headers["www-authenticate"];
      // },
      // on: {
      //   proxyRes: responseInterceptor(
      //     async (responseBuffer, proxyRes, req, res) => {
      //       res.removeHeader("www-authenticate"); // Remove the header which makes the browser show authentication pop up
      //       res.setHeader("HPM-Header", "Intercepted by HPM"); // Set a new header and value
      //       console.log(res);
      //       return responseBuffer;
      //     }
      //   ),
      // },
    })
  );
  app.use(
    "/ISAPI",
    createProxyMiddleware({
      target: "http://10.98.160.101",
      changeOrigin: true,
    })
  );
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
