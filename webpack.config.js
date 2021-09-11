const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    mode: 'development',
    entry: './src/js/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[contenthash].js',
        clean: true
        //filename: 'bundle.js'
    },
    // für top level await, babel-loader s.u.
    experiments: {
        topLevelAwait: true
    },
    module: {
        rules: [
            {
                test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'fonts/'
                    }
                }]
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                  // Creates `style` nodes from JS strings
                  "style-loader",
                  // Translates CSS into CommonJS
                  "css-loader",
                  // Compiles Sass to CSS
                  "sass-loader"]
            },
            // npm install babel-loader --save-dev
            // um top level await zu ermöglichen
            // siehe auch weiter oben experiments
            {
                test: /\.(js|mjs|jsx|ts|tsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        plugins: ['@babel/plugin-syntax-top-level-await'],
                    }
                }
            }
        ]
    },


    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        }),
        // Kopiert beim build die Verzeichnisse nach dist/
        // npm install copy-webpack-plugin --save-dev
        // Einbinden des Plug-Ins s.o.
        new CopyPlugin({
            patterns: [
                { from: "./data", to: "data/" },
                { from: "./images", to: "images/" },
            ],
        }),
    ],
    // Im development-Modus werden die map-Dateien
    // für das Debugging in die bundle.js kopiert.
    devtool: "eval-cheap-source-map"
};
