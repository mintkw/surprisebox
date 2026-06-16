const fs = require('node:fs');

// Index of the text piece currently being displayed
let display_idx = -1;

// Current state of the app
let read_state = true;

// Cached database
let texts = null;

function clearTextDisplay() {
    document.getElementById('display-div').innerHTML = "";
    console.log("screen cleared");
    display_idx = -1;
    read_state = true;
}

document.getElementById('draw-button').addEventListener('click', async () => {
    console.log("draw button clicked");
    if (!read_state) {
        // Change appearance of buttons
        document.getElementById('save-write-button').style.backgroundImage = "url('assets/retro-write-button.png')";

        // Make delete button available
        const delete_button = document.getElementById('delete-button');
        delete_button.disabled = false;

        // Clear input fields and hide writing screen
        document.getElementById('new-text').value = "";
        document.getElementById('new-source').value = "";
        document.getElementById('input-div').style.visibility = "hidden";
    }

    read_state = true;
    clearTextDisplay();

    // Only read text database again if display_idx is 0, meaning an update has occurred.
    if (display_idx == -1) {
        try {
            const data = fs.readFileSync('data.txt', 'utf8');
            // Parse into a list of lists
            texts = data.split('\n').slice(1);
            texts = texts.map(line => line.split('//'));
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
    display_div = document.getElementById("display-div");
    display_div.style.visibility = "visible";

    // Create string to be displayed
    let text_content = random_text[0].split("<br>");
    console.log(texts);
    console.log(text_content);
    for (const par of text_content) {
        let par_element = document.createElement('p');
        par_element.innerText = par;
        display_div.appendChild(par_element);
        console.log(par);
    }

    let source_element = document.createElement('p');
    source_element.innerText = `— ${random_text[1]}`;
    source_element.className = "attribution";
    display_div.appendChild(source_element);

    document.getElementById('main-window').appendChild(display_div);
})

document.getElementById('save-write-button').addEventListener('click', async () => {
    console.log("Save/Write button clicked");

    if (read_state) {
        // Disable delete button
        const delete_button = document.getElementById('delete-button');
        delete_button.disabled = true;

        // Hide reading screen
        document.getElementById('display-div').style.visibility = "hidden";

        // Show writing screen
        document.getElementById("input-div").style.visibility = "visible";

        read_state = false;
        document.getElementById('save-write-button').style.backgroundImage = "url('assets/retro-save-button.png')";
    } else {
        let textbox = document.getElementById('new-text');
        let sourcebox = document.getElementById('new-source');
        let new_text = textbox.value;
        // Process newline characters
        new_text = new_text.replace(/\n/g, "<br>");
        let new_source = sourcebox.value;

        // Clear input boxes
        textbox.value = "";
        sourcebox.value = "";

        // Append new entry to the file
        let content = `\n${new_text}//${new_source}`;
        console.log(content);
        try {
            fs.appendFileSync('./data.txt', content);
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
        const data = fs.readFileSync('data.txt', 'utf8');
        let texts = data.split('\n');
        texts = texts.map(line => line.split('//'));

        // since the header is included, this_idx is considered with a +1 increment
        let updated_text = texts.slice(0, display_idx + 1).concat(texts.slice(display_idx + 2)).map(line => line.join('//'));  // make a list of '//'-delimited strings
        updated_text = updated_text.join("\n");  // convert the list to a string

        try {
            fs.writeFileSync('data.txt', updated_text);
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