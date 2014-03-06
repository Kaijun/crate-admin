({
    baseUrl: "app",
    out: "bundle.js",
    name: "almond",
    include: "main",
    insertRequire: ["main"],

    paths: {

        // Libraries
        almond: 'bower_components/almond/almond',
        backbone: 'bower_components/backbone/backbone',
        bootstrap: 'bower_components/bootstrap/dist/js/bootstrap',
        jquery: 'bower_components/jquery/dist/jquery',
        text: 'bower_components/requirejs-text/text',
        underscore: 'bower_components/underscore/underscore',
        spin: 'bower_components/ladda-bootstrap/dist/spin',
        ladda: 'bower_components/ladda-bootstrap/dist/ladda',
        flot: 'bower_components/flot/jquery.flot',

        // App
        main: 'js/main.build',
        app: 'js/app',
        base: 'js/base',
        Overview: 'js/overview',
        SQL: 'js/sql',
        Status: 'js/status',
        NavBar: 'js/navbar',
        Console: 'js/console',
        Tables: 'js/tables',
        Cluster: 'js/cluster',
        Tutorial: 'js/tutorial'
    },

    shim: {
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: "Backbone"
        },

        bootstrap: {
            deps: ['jquery']
        },

        underscore: {
            exports: '_'
        },

        flot: {
            deps: ['jquery']
        }
    },

    optimize: "none"
})