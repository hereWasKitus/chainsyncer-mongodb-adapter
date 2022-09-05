![Project Presentation](https://github.com/hereWasKitus/mongodb-adapter/blob/main/public/logo.jpg "MongoDB adapter")

# MongoDB Adapter

MongoDB adapter for [chain-syncer](https://www.npmjs.com/package/chain-syncer).

---

## Install

```bash
$ npm i @chainsyncer/mongodb-adapter
```

---

## Example usage (Mongoose)

```js
const Mongoose = require('mongoose');
const { MongoDBAdapter } = require('@chainsyncer/mongodb-adapter');
const { ChainSyncer } = require('chain-syncer');

await Mongoose.connect('srv_string');
const mongo_adapter = new MongoDBAdapter(Mongoose.connection.db);

const syncer = new ChainSyncer(mongo_adapter, ...);
```

---

## Example usage (MongoDB NodeJS Driver)

```js
const { MongoClient } = require('mongodb');
const { MongoDBAdapter } = require('@chainsyncer/mongodb-adapter');
const { ChainSyncer } = require('chain-syncer');

const connection = await MongoClient.connect( 'srv_string' );
const db = await connection.db( 'test' );

const mongo_adapter = new MongoDBAdapter(db);

const syncer = new ChainSyncer(mongo_adapter, ...);
```

---

## License
MongoDB adapter is released under the MIT license. © 2022 Polikarpov Nikita
