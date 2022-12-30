const dbPromise = idb.open('posts-store', 1, (db) => {
    //to avoid creating objectStore each time this promise is fired it is wrapped in if statement
    if (!db.objectStoreNames.contains('posts')) {
        db.createObjectStore('posts', { keyPath: 'id' });
    };

    if (!db.objectStoreNames.contains('sync-posts')) {
        db.createObjectStore('sync-posts', { keyPath: 'id' });
    };

});

//put
const writeData = (storeName, data) => {
    dbPromise.then((db) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        store.put(data);

        return transaction.complete;
    });
};

//get all data 
const readAllData = (storeName) => {
    dbPromise.then((db) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);

        return store.getAll();
    });
};

//clear all data 
const clearAllData = (storeName) => {
    dbPromise.then((db) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        store.clear(); //deletes all data 

        return transaction.complete;
    });
};

//delete particular element from database
const deleteItemFromData = (storeName, id) => {
    dbPromise.then((db) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        store.delete(id);

        return transaction.complete;
    });
};