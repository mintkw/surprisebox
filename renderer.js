// Index of the text piece currently being displayed
let display_idx = -1;

// Current state of the app
let read_state = true;

// Database cache - read on startup
let texts = null;
window.dataStorage.read().then((result) => {
    texts = result;
})

function clearTextDisplay() {
    document.getElementById('display-div').innerHTML = "";
    display_idx = -1;
    read_state = true;
}

document.getElementById('draw-button').addEventListener('click', async () => {
    if (!read_state) {
        // Change appearance of save/write buttons
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

    let num_texts = texts.length;

    // Make reading display available
    let display_div = document.getElementById("display-div");
    display_div.style.visibility = "visible";

    if (num_texts == 0) {
        display_idx = -1;
        console.log("Database empty; no texts to show");
        display_div.innerText = "(No texts stored)";

    } else {
        // Generate the index of the text to be shown
        display_idx = Math.floor(Math.random() * (num_texts));
        let random_text = texts[display_idx];

        // Create string to be displayed
        let text_content = random_text.text.split("\n");
        for (const par of text_content) {
            let par_element = document.createElement('p');
            par_element.innerText = par;
            display_div.appendChild(par_element);
        }

        let source_element = document.createElement('p');
        source_element.innerText = `— ${random_text.source}`;
        source_element.className = "attribution";
        display_div.appendChild(source_element);
    }
})

document.getElementById('save-write-button').addEventListener('click', async () => {
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
        // Get input
        let textbox = document.getElementById('new-text');
        let sourcebox = document.getElementById('new-source');
        let new_text = textbox.value;
        let new_source = sourcebox.value;

        // Clear input boxes
        textbox.value = "";
        sourcebox.value = "";

        // Append new entry to the file
        let new_entry = {"text": new_text, "source": new_source};
        texts.push(new_entry);
        window.dataStorage.writeCacheToStorage(texts);
    }
})

document.getElementById('delete-button').addEventListener('click', async () => {
    // Do nothing if nothing is being displayed
    if (display_idx == -1) {
        return;
    }

    try {
        texts = texts.slice(0, display_idx).concat(texts.slice(display_idx + 1))
        window.dataStorage.writeCacheToStorage(texts);
    } catch (read_err) {
        console.error(read_err);
    }

    clearTextDisplay();
})