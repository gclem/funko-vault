# funko-vault
Get the Funko pop Vault list from the official website [Funko](https://funko.com)
The vault is the registry of items not produced anymore. By the way this makes its cost unit price to increase.

## Functionalities
* Get the full list of vaulted pop

## Next Functionnalities
* Indexing through Elasticsearch
* Retrieve all items from .json shopify API

## Install

#### Requirements
* Node v6.0+

```bash
npm install funko-vault
```

## How to
Extremely simple use case. See `specs/mocktest.js`
All methods use Promise. 

```
var fp = require('funko-vault');

fp.list()
    .then((data) => console.dir(data, {depth : 3, colors : true}) );
```

## License
MIT