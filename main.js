Ext.application({

    name: 'LocalStorageTest',

    launch: function() {

        // ONLINE MODEL

        Ext.define('LocalStorageTest.model.Online', {
            extend: 'Ext.data.Model',
            config: {
                fields: [
                    'title',
                    'summary'
                ]
            }
        });

        // OFFLINE MODEL

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

        // STORE FOR ONLINE MODEL

        Ext.define('LocalStorageTest.store.Online', {
            extend:'Ext.data.Store',
            storeId: 'OnlineStore', // RM
            config:{
                model:'LocalStorageTest.model.Online',
                proxy: {
                    type: 'jsonp',
                    timeout: 3000, // How long to wait before going into "Offline" mode, in milliseconds.
                    url: 'http://next24.tv/getdata',
                    extraParams: {
                        bouquet: 'toptv'
                    },
                    reader: {
                        type: 'json',
                        rootProperty: 'MovieSchedule'
                    }
                },
                autoLoad: false // Will load later
            }
        });


        var onlineStore = Ext.getStore('OnlineStore'),
            localStore  = Ext.create('Ext.data.Store', { // Create the Offline Store on the fly
                model: 'LocalStorageTest.model.Offline'
            }),
            me = this;

        localStore.load();

        /*
         * When app is online, store all the records to HTML5 local storage.
         * This will be used as a fallback if app is offline more
         */

        onlineStore.on('refresh', function (store, records) {

            // Get rid of old records, so store can be repopulated with latest details
            localStore.getProxy().clear();

            store.each(function(record) {

                var rec = {
                    name : record.data.name + ' (from localStorage)' // in a real app you would not update a real field like this!
                };

                localStore.add(rec);
                localStore.sync(); // The magic! This command persists the records in the store to the browsers localStorage
            });

        });
    }

});