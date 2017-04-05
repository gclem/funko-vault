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
    };

    var parsePageNumber = ($) => {
        var maxPage = $('.pagination > li[class="unavailable"] ~ li > a');
        var currentPage = $('.pagination > li[class="current"] ~ li > a');
        var pager = {};

        if (maxPage && maxPage.length > 0)
        {
            pager.count = maxPage.html();
        }

        pager.current = currentPage.html();

        return pager;
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

    self.getAll = () => {
        var firstPageUrl = getUrl();

        var j = rp.jar();
        var options = {
            uri: firstPageUrl,
            withCredentials: true,
            jar : true,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.1',
                'Accept' : '*/*'
            },
            transform: function (body) {
                return cheerio.load(body);
            }
        };

        return rp(options).then(($) => {
            return {
                items : parseItemsList($),
                pager : parsePageNumber($)
            }; 
        })
        //.catch(handle);
    };
};

module.exports = new FunkoVaultProvider()
