#!/usr/bin/env node
"use strict";

var fp = require('../index.js');

fp.list()
    .then((data) => console.dir(data, {depth : 3, colors : true}) );