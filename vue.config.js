const Dotenv = require('dotenv-webpack');

module.exports = {
  lintOnSave: false,
  configureWebpack: {
    plugins: [new Dotenv()]
  },
  chainWebpack: (config) => {
    config.plugin('fork-ts-checker').tap((args) => {
      args[0].typescript.memoryLimit = 8192;
      return args;
    });
    config.plugin('html').tap((args) => {
      args[0].chunksSortMode = (a, b) => {
        if (a.entry !== b.entry) {
          // make sure entry is loaded last so user CSS can override
          // vendor CSS
          return b.entry ? -1 : 1;
        } else {
          return 0;
        }
      };
      return args;
    });
    config.optimization.splitChunks({
      ...config.optimization.get('splitChunks'),
      cacheGroups: {
        libs: {
          name: 'chunk-a',
          test: /[\\/]node_modules[\\/]/,
          priority: 1,
          chunks: 'initial',
          maxSize: 6000000,
          minSize: 3000000,
          maxInitialRequests: 5
        },
        oinone: {
          name: 'chunk-b',
          test: /[\\/]node_modules[\\/]@oinone[\\/]/,
          priority: 2,
          chunks: 'initial',
          maxSize: 6000000,
          minSize: 3000000,
          maxInitialRequests: 5
        },
        common: {
          name: 'chunk-c',
          minChunks: 2,
          priority: 3,
          chunks: 'initial',
          reuseExistingChunk: true
        }
      }
    });
  },
  devServer: {
    port: 8080,
    hot: true,
    compress: true,
    client: {
      overlay: false,
      progress: true
    },
    proxy: {
      '/pamirs': {
        changeOrigin: true,
        // 请求后端地址
        target: 'http://127.0.0.1:8091'
        // Oinone 提供的演示环境地址
        // target: 'https://demo.oinone.top'
      }
    }
  }
};
