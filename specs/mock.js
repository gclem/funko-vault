#!/usr/bin/env node
"use strict";

var fp = require('../index.js');

fp.getAll()
    .then((data) => console.dir(data, {depth : 3, colors : true}) );