const fs = require('node:fs');

// Index of the text piece currently being displayed
let display_idx = -1;

document.getElementById('draw-button').addEventListener('click', async () => {
    // Read text database
    fs.readFile('data.csv', 'utf8', function(err, data) {
        if (err) {
            console.error(err);
        }
        // Parse into a list of lists
        let texts = data.split('\n').slice(1);
        texts = texts.map(line => line.split(','));

        let num_texts = texts.length;

        display_idx = Math.floor(Math.random() * (num_texts));
        let random_text = texts[display_idx];
        document.getElementById('display-text').innerText = `\n${random_text[0]} - ${random_text[1]}`;
    });
})

document.getElementById('save-button').addEventListener('click', async () => {
    let textbox = document.getElementById('new-text');
    let authorbox = document.getElementById('new-author');
    let new_text = textbox.value;
    let new_author = authorbox.value;

    // Clear input boxes
    textbox.value = "";
    authorbox.value = "";

    // Append new entry to the file
    let content = `\n${new_text},${new_author}`;
    try {
        fs.appendFileSync('./data.csv', content);
    } catch (err) {
        console.error(err);
    }
})

document.getElementById('delete-button').addEventListener('click', async () => {
    // Do nothing if nothing is being displayed
    if (display_idx == -1) {
        return;
    }

    fs.readFile('data.csv', 'utf8', function(err, data) {
        if (err) {
            console.error(err);
        }
        let texts = data.split('\n');
        texts = texts.map(line => line.split(','));
        let updated_text = texts.slice(0, display_idx + 1).concat(texts.slice(display_idx + 2)).join("\n");  // since the header is included, this_idx is incremented
        fs.writeFileSync('data.csv', updated_text);
        console.log(updated_text);
    })
})


// FOR TESTING PURPOSES -------------------------------------------
document.body.addEventListener('click', async () => {
    console.log(display_idx);
})