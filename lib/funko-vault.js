#!/usr/bin/env node
"use strict";

/**
 * Node.js : funko-pop
 * Get funko pop vaulted list (officialy marked as "not produced anymore")
 *
 **/

const cheerio = require('cheerio');
const rp = require('request-promise');
const _ = require('lodash/core');

let FunkoVaultProvider = function() {
    const url = 'https://funko.com/collections/pop/the-vault?page=';

    var self = this;

    var getUrl = (page = 1) => {
        return url + page;
    }

    var parseItem = () => {

    };

    var parsePageNumber = ($) => {
        var pager = $('.pagination > .unavailable');
        console.log(pager);
    };

    var parseItemsList = ($) => {
        var items = [];
       
       _.each($('.product-grid > .product-item'), (item) => {
            var item = $(item);
            
            var thumbnailItem = item.find('.image-wrapper > a > img');
            var pageUrl = item.find('.image-wrapper > a').attr('href');
            var thumbnailUrl = thumbnailItem.attr('src');
            var label = thumbnailItem.attr('alt');

            items.push({
                url : pageUrl,
                img : thumbnailUrl,
                title : label
            });
        });

        return items;
    };

    self.test = () => {

    }

    self.getAll = () => {
        var firstPageUrl = getUrl();
        console.log(firstPageUrl);

        var j = rp.jar();
        var options = {
            uri: firstPageUrl,
            withCredentials: true,
            jar : true,
            headers: {
                'User-Agent': 'curl/7.51.0'
            },
            transform: function (body) {
                return cheerio.load(body);
            }
        };

        return rp(firstPageUrl).then(($) => {

            var result = {};

            //// Getting profile
            result.items.concat(parseItemsList($));

            return result;
        })
        //.catch(handle);
    };
};

module.exports = new FunkoVaultProvider();
