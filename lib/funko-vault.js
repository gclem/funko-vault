#!/usr/bin/env node
"use strict";

/**
 * Node.js : funko-pop
 * Get funko pop vaulted list (officialy marked as "not produced anymore")
 *
 **/

const cheerio = require('cheerio');
const rp = require('request-promise');
const Promise = require('bluebird');
const _ = require('lodash/core');

let FunkoVaultProvider = function() {
    const url = 'https://funko.com/collections/pop/the-vault?page=';

    var self = this;

    let handle = (err) => {
        console.error(err);
        switch (err.response.statusCode) {
            case 404 :
                throw new Error('PAGE_NOT_FOUND'); 
                break;
            case 500 : 
                throw new  Error('TECHNICAL_EXCEPTION_HTML_STRUCTURE_MAY_HAVE_CHANGED')
                break;
            default : 
                throw new Error('TECHNICAL_EXCEPTION_NOT_IDENTIFIED')
                break;
        }
    };

    var getUrl = (page = 1) => {
        return url + page;
    };

    var parsePageNumber = ($) => {
        var maxPage = $('.pagination li[class="unavailable"]').last().next();
        var currentPage = $('.pagination > li[class="current"] > a');
        var pager = {};
        
        pager.current = parseInt(currentPage.html());

        //// Max Count only on the first page
        if(pager.current == 1)
        {
            pager.count = maxPage && maxPage.length > 0 ? parseInt(maxPage.text()) : 0;;
            pager.count = pager.current > pager.count ? 0 : pager.count;
        }

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

    self.getFrom = (page) => {
        var j = rp.jar();
        var options = {
            uri: getUrl(page),
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
        .catch(handle);
    };

    self.list = (concurrency = 15) => {
        //// Need to get the page number first
        return self.getFrom(1)
                        .then((r) => {
                            if(!r)
                                return undefined;
                            return Promise.map(Array.from(Array(r.pager.count).keys()), function (page) {
                                console.log("Getting page %s / %s ...", page+1, r.pager.count);
                                return self.getFrom(page +1);
                            }, { concurrency: concurrency})
                            .then((parsed) => {
                                return parsed.map((item) => { return item.items})
                                    .reduce(function(a, b){ return a.concat(b); });
                            });
                        });
    };
}

module.exports = new FunkoVaultProvider()
