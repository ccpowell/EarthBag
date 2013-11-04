var server = require('./server'),
    config = {},
    callback = function() {};

config.server = {
    port: 3000,
    base: '',
    views: {
        path: 'views',
        base: '',
        compileWith: 'ejs',
        extension: 'ejs'
    }
};

config.watch = {
    compiledDir: "public"
}

config.isOptimize = false;
config.liveReload = {enabled:false};
server.startServer(config, callback);


