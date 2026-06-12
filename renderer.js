const fs = require('fs');

let data = fs.readFileSync('./data.json');
let texts = JSON.parse(data);
var num_texts = texts.texts.length;

document.getElementById('draw-button').addEventListener('click', async () => {
    var random_idx = Math.floor(Math.random() * (num_texts + 1));
    var random_text = texts.texts[random_idx]
    document.getElementById('display-text').innerText = `\n${random_text.content} - ${random_text.author}`
})