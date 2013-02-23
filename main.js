Ext.application({

    name: 'LocalStorageTest',

    launch: function() {

        // Online model

        Ext.define('LocalStorageTest.model.Online', {
            extend: 'Ext.data.Model',
            config: {
                fields: [
                    'title',
                    'summary'
                ]
            }
        });

        // Offline model

        Ext.define('LocalStorageTest.model.Offline', {
            extend: 'Ext.data.Model',
            config: {
                fields: [
                    'title',
                    'summary'
                ],
                identifier:'uuid', // needed to avoid console warnings!
                proxy: {
                    type: 'localstorage',
                    id  : 'movies'
                }
            }
        });

        // Store for Online model

        Ext.create('Ext.data.Store', {
            storeId: 'OnlineStore',
            model: 'LocalStorageTest.model.Online',
            autoLoad: false,
            proxy: {
                type: 'jsonp',
                timeout: 10000,
                url: 'http://next24.tv/getdata',
                extraParams: {
                    bouquet: 'toptv'
                },
                reader: {
                    type: 'json',
                    rootProperty: 'MovieSchedule'
                }
            },
            listeners: {
                load: function() {
                    // ...
                }
            }
        });

        var list = Ext.create('Ext.DataView',{
            padding: 5,
            fullscreen: true,
            id: 'MovieList',
            store: 'OnlineStore',
            itemTpl: '<b>{title}</b><p>{summary}</p>',
            emptyText: 'Empty!',

            listeners: {
                itemtap: function(dataview, index, target, record, e, options) {
                    console.log('itemTap: ' + record.get('summary'));
                }
            }
        });

        var onlineStore = Ext.getStore('OnlineStore'),
            localStore  = Ext.create('Ext.data.Store', { // Create the Offline Store on the fly
                model: 'LocalStorageTest.model.Offline'
            });

        localStore.load();
        console.log('localStore dynamically loaded');

        /*
         When the app is online, store all the records to HTML5 local storage.
         This will be used as a fallback should the app go offline.
        */

        onlineStore.on('refresh', function (store, records) {

            console.log('Ok, it\'s loaded now');
            console.log('onlineStore has ' + onlineStore.getCount() + ' records');
            console.log('localStore has '  + localStore.getCount()  + ' before sync');

            // Get rid of old records, so store can be repopulated with latest details
            localStore.getProxy().clear();

            store.each(function(record) {
                localStore.add(record);
            });

            localStore.sync(); // The magic! This command persists the records in the store to the browsers localStorage
            console.log('localStore is now sync\'d with ' + localStore.getCount() + ' records');

        });

        /*
         If the app is offline, a proxy exception will be thrown.
         If that happens then use the local storage store instead.
        */

        onlineStore.getProxy().on('exception', function () {
            list.setStore(localStore);
            localStore.load(); // This causes the "loading" mask to disappear
            Ext.Msg.alert('Notice', 'You are in offline mode', Ext.emptyFn); // Alert the user that they are in offline mode
        });

        onlineStore.load(); // finally try load the Online Store;
        console.log('onlineStore load attempt');
    }
});