/*
 * Javascript Document
 * Creat by Nelson on 2017/7/11
 *
 * Website:https://segmentfault.com/u/nelson2016
 *
 * QQ:616859570
 * Email:Nelson_Lee@outlook.com
 * */

let webpack = require('webpack');
let OpenBrowserPlugin = require('open-browser-webpack-plugin');
let path = require('path');

// 开发环境
let isDev = process.env.NODE_ENV.trim() === 'development';
// 生产环境
let isProd = process.env.NODE_ENV.trim() === 'production';

if(isDev){
    console.log('isDev');
}
if(isProd){
    console.log('isProd');
}

module.exports = {
    devtool: isProd ? false : 'inline-source-map',
    entry: {
        main: [
            path.resolve(__dirname, './src/js/main.js')
        ],
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].js',
        publicPath: isProd ? './dist/' : '/dist/',
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    {
                        loader: "css-loader",
                        options:{importLoaders:1}
                    }, {
                        loader: "postcss-loader",
                        options:{
                            plugins:() => [require('autoprefixer')({browsers:['last 5 versions']}),require('postcss-import')()]
                            // ,require('postcss-px2rem')({remUnit: 16})
                        }
                    }, {
                        loader: "less-loader" // compiles Less to CSS
                    }
                ]
            },
        ],
    },
    plugins: getPlugins()
};


// 获取配置
function getPlugins() {
    let plugins = [
    ];

    if (isDev) {
        plugins.push(
            new OpenBrowserPlugin({url: 'http://localhost:8081/'})
        );
    }else{
        // plugins.push(
        //     new webpack.optimize.UglifyJsPlugin({
        //         compress: {
        //             warnings: false
        //         },
        //         comments:false
        //
        //     })
        // );
    }

    return plugins;
}
