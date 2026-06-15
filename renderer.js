const fs = require('node:fs');

// Index of the text piece currently being displayed
let display_idx = -1;

// Current state of the app
let read_state = true;

// Cached database
let texts = null;

function clearTextDisplay() {
    document.getElementById('main-window').innerText = "";
    display_idx = -1;
    read_state = true;
}

document.getElementById('draw-button').addEventListener('click', async () => {
    console.log("draw button clicked");
    if (!read_state) {
        // Change appearance of buttons
        document.getElementById('save-write-button').innerText = "Write";

        // Make delete button available
        const delete_button = document.getElementById('delete-button');
        delete_button.style.visibility = 'visible';
        delete_button.disabled = false;
    }

    read_state = true;
    clearTextDisplay();

    // Only read text database again if display_idx is 0, meaning an update has occurred.
    if (display_idx == -1) {
        try {
            const data = fs.readFileSync('data.csv', 'utf8');
            // Parse into a list of lists
            texts = data.split('\n').slice(1);
            texts = texts.map(line => line.split(','));
        } catch (read_err) {
            console.error(read_err);
        }
    }

    let num_texts = texts.length;

    console.log("num texts:", num_texts);

    if (num_texts == 0) {
        display_idx = -1;
        return;
    }

    display_idx = Math.floor(Math.random() * (num_texts));
    let random_text = texts[display_idx];
    let display_text = document.createElement('div');
    display_text.id = "display-text";
    let text_content = document.createTextNode(`\n${random_text[0]} - ${random_text[1]}`);
    display_text.appendChild(text_content);

    document.getElementById('main-window').appendChild(display_text);
})

document.getElementById('save-write-button').addEventListener('click', async () => {
    console.log("Save/Write button clicked");

    if (read_state) {
        // Disable and hide delete button
        const delete_button = document.getElementById('delete-button');
        delete_button.style.visibility = 'hidden';
        delete_button.disabled = true;
        clearTextDisplay();

        // Add input fields
        const main_window = document.getElementById('main-window');
        const fragment = document.createDocumentFragment();
        const text_label = document.createElement("label");
        text_label.htmlFor = "new-text";
        text_label.textContent = "Text: ";
        fragment.appendChild(text_label);

        const text_input = document.createElement("input");
        text_input.type = "text";
        text_input.id = "new-text";
        fragment.appendChild(text_input);

        const author_label = document.createElement("label");
        author_label.htmlFor = "new-author";
        author_label.textContent = "Author: ";
        fragment.appendChild(author_label);

        const author_input = document.createElement("input");
        author_input.type = "text";
        author_input.id = "new-author";
        fragment.appendChild(author_input);

        main_window.appendChild(fragment);

        read_state = false;
        document.getElementById('save-write-button').innerText = "Save";
    } else {
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
    }
})

document.getElementById('delete-button').addEventListener('click', async () => {
    console.log("Delete button clicked");

    // Do nothing if nothing is being displayed
    if (display_idx == -1) {
        return;
    }

    try {
        const data = fs.readFileSync('data.csv', 'utf8');
        let texts = data.split('\n');
        texts = texts.map(line => line.split(','));
        let updated_text = texts.slice(0, display_idx + 1).concat(texts.slice(display_idx + 2)).join("\n");  // since the header is included, this_idx is incremented
        try {
            fs.writeFileSync('data.csv', updated_text);
        } catch (write_err) {
            console.error(write_err);
        }
    } catch (read_err) {
        console.error(read_err);
    }

    clearTextDisplay();
})


// FOR TESTING PURPOSES -------------------------------------------
document.body.addEventListener('click', async () => {
    console.log(display_idx);
})