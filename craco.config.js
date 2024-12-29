const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // html-webpack-plugin yapılandırması
      webpackConfig.plugins = webpackConfig.plugins.map(plugin => {
        if (plugin instanceof HtmlWebpackPlugin) {
          return new HtmlWebpackPlugin({
            ...plugin.options,
            template: './public/index.html'
          });
        }
        return plugin;
      });

      return webpackConfig;
    }
  },
  style: {
    postcss: {
      plugins: [require('tailwindcss'), require('autoprefixer')]
    }
  }
}; 