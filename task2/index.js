const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const fs = require('fs');
const { exit } = require('process');

games = []

//https://github.com/chenxiaochun/blog/issues/38
async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

(async () => {
    //Create the browser and navigate to the site, and send the innerHTML to cheerio for "processing"
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('https://store.steampowered.com/search/?sort_by=Reviews_DESC&maxprice=90&tags=5350&category1=998&supportedlang=norwegian');

    await autoScroll(page);

    return await page.evaluate(() => document.body.innerHTML);
})()
.then(response => {
    const $ = cheerio.load(response);

    //Every game that is a result, loop through them, and push them to the games array
    $('.search_result_row').each((index, game) => {

        //Gets the title of the game
        game_title = $(game).find('.search_name .title').text();
        console.log(game_title);

        //If the game title contains 'a', return, which is equivalent to continue
        if(game_title.includes('a')){
            return;
        }

        review_summary = $(game).find('.search_review_summary').attr('class').replace('search_review_summary ','')

        if(review_summary != 'positive'){
            return;
        }

        //Gets the image for the game
        image = $(game).find('.search_capsule').find('img').attr('src')
        
        //Gets the price for the game
        originalPrice = ""
        discountPrice = ""
        discount = ""

        //Regex for removing return, newline and tab, aswell as spaces before and after the price tag
        regex = /[ \r\n\t]+[ ]/g

        //If the length is 0, it means its not discounted
        if($(game).find('.search_price').children().length == 0){
            originalPrice = $(game).find('.search_price').text();
            originalPrice = originalPrice.replace(regex,'');
        } else {
            //If the length is anything else, do some logic for getting discount, price and discounted price
            originalPrice = $(game).find('.search_price span').text();
            originalPrice = originalPrice.replace(regex,'');

            discount = $(game).find('.search_discount').text();
            discount = discount.replace(regex,'');

            //Need to do some funky things here, for getting the text of the div, and not other children objects
            discountPrice = $(game).find('.search_price').first().contents().filter(function() {
                return this.type === 'text'
            }).text();
            discountPrice = discountPrice.replace(regex,'');
        }

        releaseDate = $(game).find('.search_released').text();

        appID = $(game).attr('data-ds-appid');

        games.push({
            appID,
            game_title,
            review_summary,
            originalPrice,
            discountPrice,
            discount,
            releaseDate,
            appID
        })
    });
}).then(() => {
    fs.writeFileSync("games.json", JSON.stringify(games));
    console.log("Written to JSON")
    process.exit()
})