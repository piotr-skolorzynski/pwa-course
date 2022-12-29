const dbPromise = idb.open('posts-store', 1, (db) => {
    //to avoid creating objectStore each time this promise is fired it is wrapped in if statement
    if (!db.objectStoreNames.contains('posts')) {
        db.createObjectStore('posts', { keyPath: 'id' });
    };

});

const writeData = (storeName, data) => {
    return dbPromise.then((db) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        store.put(data);

        return transaction.complete;
    });
};