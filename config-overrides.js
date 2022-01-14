const { override, loaders } = require('customize-cra');

module.exports = function override (config, env) {
    console.log('override')
    let loaders = config.resolve
    loaders.fallback = {
        "buffer": false,
    }
    
    return config
}