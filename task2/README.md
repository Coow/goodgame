# Task 2

### Scrape the Steam Store page, from a page with these requirements:
- Is a game
- Supports Norwegian
- Cost max 90 NOK
- Is tagged as "Family Friendly"
- Has "Positive" ratings
- Doesn't contain the letter "A" in the title

### Saves these properties to a JSON array
- App ID
- Game Title
- Image URL
- Review Summary
- Original Price
- Discount
- Disconted Price
- Release date

### Running
`node index.js`
Saves output to `games.json`