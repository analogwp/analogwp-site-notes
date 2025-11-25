const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

module.exports = {
    ...defaultConfig,
    entry: {
        frontend: path.resolve(process.cwd(), 'src', 'frontend.js'),
        admin: path.resolve(process.cwd(), 'src', 'admin.js')
    },
    output: {
        ...defaultConfig.output,
        path: path.resolve(process.cwd(), 'assets/js/app')
    }
};