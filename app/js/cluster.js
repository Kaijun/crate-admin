define(['jquery',
        'underscore',
        'backbone',
        'base',
        'SQL',
        'morris',
        'text!views/cluster.html',
        'text!views/nodelistitem.html',
        'text!views/nodeinfo.html',
        'bootstrap',
    ], function ($, _, Backbone, base, SQL, Morris, ClusterTemplate, NodeListItemTemplate, NodeInfoTemplate) {

    var Cluster = {};

    Cluster._refreshTimeout = 5000;

    Cluster.Node = Backbone.Model.extend({

        health: function () {
            return _.max([this.get('fs').used_percent, this.get('mem').used_percent]);
        },

        healthStatus: function () {
            var health = this.health();
            if (health>98) {
                return 'critical';
            } else if (health>90) {
                return 'warning';
            }
            return 'good';
        },

        httpLink: function () {
            return 'http://' + this.get('hostname') + ':' + this.get('port').http;
        }

    });

    Cluster.Cluster = Backbone.Collection.extend({

        model: Cluster.Node,

        comparator: function (item) {
            var health = item.healthStatus();

            switch (health) {
                case 'critical':
                    health = '0';
                    break;
                case 'warning':
                    health = '1';
                    break;
                case 'good':
                    health = '2';
                    break;
            }
            return health + item.get('name');
        },

        fetch: function (options) {
            var self = this,
                sqInfo, sqShardInfo, dInfo, dShardInfo, d;

            d = $.Deferred();
            sqNodes = new SQL.Query('select id, name, hostname, port, load, mem, fs from sys.nodes');
            dNodes = sqNodes.execute();

            dNodes.done(function (res) {
                var nodes = _.map(res.rows, function (row) {
                    return _.object(['id', 'name', 'hostname', 'port', 'load', 'mem', 'fs'], row);
                });
                if (options && options.reset) {
                    self.reset(nodes);
                } else {
                    self.set(nodes);
                }
            });

            return d.promise();
        }

    });

    Cluster.ClusterView = base.CrateView.extend({

        template: _.template(ClusterTemplate),

        selectedItem: null,

        initialize: function () {
            var self = this;
            this.listenTo(this.collection, 'reset', this.render);
            this.listenTo(this.collection, 'add', this.addNode);
            this.listenTo(this.collection, 'remove', this.removeNode);
            this.refreshTimeout = setTimeout(function () { self.refresh(); }, Cluster._refreshTimeout);
        },

        refresh: function () {
            var self = this;
            this.collection.fetch();
            this.refreshTimeout = setTimeout(function () { self.refresh(); }, Cluster._refreshTimeout);
        },

        deactivateAll: function () {
            this.$('li').removeClass('active');
        },

        showDetails: function (name) {
            var n = this.collection.get(name),
            v = new Cluster.NodeInfoView({model: n});
            this.$('#node-info').html(v.render().$el);
            this.selectedItem = name;
        },

        addNode: function (node) {
            var v = new Cluster.NodeListItemView({model: node});
            this.$('ul').append(v.render().$el);
            this.addView(node.id, v);

        },

        removeNode: function (node) {
            if (_.has(this.subviews, node.id)) {
                this.subviews[node.id].dispose();
            }
        },

        render: function () {
            var self = this;
            this.$el.html(this.template());
            _.each(this.collection.models, function (node) {
                self.addNode(node);
            });
            if (!this.selectedItem && this.collection.length) {
                this.showDetails(this.collection.first().id);
                this.$('#sidebar-wrapper ul').children().first().addClass('active');
            }
            return this;
        },

        dispose: function () {
            clearTimeout(this.refreshTimeout);
            base.CrateView.prototype.dispose.call(this);
        }

    });

    Cluster.NodeListItemView = base.CrateView.extend({

        tagName: 'li',

        template: _.template(NodeListItemTemplate),

        events: {
            'click ': 'selectNode'
        },

        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
        },

        selectNode: function (ev) {
            ev.preventDefault();
            ev.stopPropagation();
            this.parentView.deactivateAll();
            this.$el.addClass('active');
            this.parentView.showDetails(this.model.id);
        },

        render: function () {
            var data = this.model.toJSON();
            data.httpLink = this.model.httpLink();
            data.health = this.model.healthStatus();
            this.$el.html(this.template(data));
            return this;
        }
    });

    Cluster.NodeInfoView = base.CrateView.extend({

        template: _.template(NodeInfoTemplate),

        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
        },

        render: function () {
            var data = this.model.toJSON();
            data.memUsed = base.humanReadableSize(data.mem.used);
            data.fsUsed = base.humanReadableSize(data.fs.used);
            data.httpLink = this.model.httpLink();
            this.$el.html(this.template(data));

            Morris.Donut({
                element: this.$('#disk-usage-graph'),
                data: [
                    {label: 'free', value: this.model.get('fs').free},
                    {label: 'used', value: this.model.get('fs').used}],
                formatter: function (y, data) { return base.humanReadableSize(y); }
            });

            Morris.Donut({
                element: this.$('#mem-usage-graph'),
                data: [
                    {label: 'free', value: this.model.get('mem').free},
                    {label: 'used', value: this.model.get('mem').used}],
                formatter: function (y, data) { return base.humanReadableSize(y); }
            });

            return this;
        }

    });

    return Cluster;
});
