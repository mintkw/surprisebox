// Index of the text piece currently being displayed
let display_idx = -1;

// Current state of the app
let read_state = true;

// Database cache - read on startup
let texts = [];
window.dataStorage.read().then((result) => {
    // Parse into a dictionary
    texts = JSON.parse(result).texts;
})

function getSources() {
    // Get a sorted list of unique sources listed in the database
    let sources = texts.map(text => text.source);

    // Using filter with indexOf to find the repeated elements
    sources = sources.filter((item, index) => sources.indexOf(item) === index);

    sources.sort();
    return sources;
}

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
    // Update list of sources
    sources = getSources();

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

    texts = texts.slice(0, display_idx).concat(texts.slice(display_idx + 1))
    window.dataStorage.writeCacheToStorage(texts);

    clearTextDisplay();
})

// Autocomplete for source field based on all previously entered sources
let currentFocus = -1;  // idx of the autocomplete item currently pointed at
document.getElementById("new-source").addEventListener('input', async () => {
    closeAllLists();

    let new_source = document.getElementById("new-source");

    let val = new_source.value;
    if (!val) return false;
    currentFocus = -1;

    // Create div element to contain autocomplete list
    let autocomplete_list = document.createElement("div");
    autocomplete_list.setAttribute("id", new_source.id + "-autocomplete-list");
    autocomplete_list.className = "autocomplete-items";
    new_source.parentNode.appendChild(autocomplete_list);
    
    // Create autocomplete items
    let sources = getSources();
    for (const source of sources) {
        // Sheck if the item starts with the same letters as the text field value
        if (source.substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            // Create a DIV element for each matching element
            let autocomplete_item = document.createElement("div");
            autocomplete_item.className = "autocomplete-item";
            autocomplete_item.innerText = source;
            // Execute a function when someone clicks on the item value (DIV element)
            autocomplete_item.addEventListener("click", function(e) {
                // Insert the value for the autocomplete text field
                new_source.value = source;
                closeAllLists();
            });
            autocomplete_list.appendChild(autocomplete_item);
        }
    }
})

document.getElementById("new-source").addEventListener("keydown", function(e) {
    let new_source = document.getElementById("new-source");
    let autocomplete_items = document.getElementById(new_source.id + "-autocomplete-list");

    if (autocomplete_items) autocomplete_items = autocomplete_items.getElementsByClassName("autocomplete-item");
    if (e.keyCode == 40) {
        // If down arrow is pressed, increment currentFocus
        currentFocus++;
        // and set active item
        addActive(autocomplete_items);
    } else if (e.keyCode == 38) {
        // If up arrow key is pressed, decrement currentFocus
        currentFocus--;
        // and set active item
        addActive(autocomplete_items);
    } else if (e.keyCode == 13) {
        // If the ENTER key is pressed, prevent a newline being inserted
        e.preventDefault();
        if (currentFocus > -1) {
            // and simulate a click on the active item
            if (autocomplete_items) autocomplete_items[currentFocus].click();
        }
    }
});

document.getElementById("new-source").addEventListener('click', async () => {
    let new_source = document.getElementById("new-source");
    let autocomplete_items = document.getElementById(new_source.id + "-autocomplete-list");
    if (autocomplete_items) {
        autocomplete_items = autocomplete_items.getElementsByClassName("autocomplete-item");

        removeActive(autocomplete_items);
        currentFocus = -1;
    }
})

function addActive(items) {
    // Function to classify an item as "active"
    if (!items) return false;
    removeActive(items);
    if (currentFocus >= items.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (items.length - 1);
    items[currentFocus].classList.add("autocomplete-active");
}

function removeActive(items) {
    // Remove the "active" class from all autocomplete items
    for (const item of items) item.classList.remove("autocomplete-active");
}

function closeAllLists(excluded_elem) {
    // Close all autocomplete lists in the document, except the one passed as an argument
    let autocomplete_items = document.getElementsByClassName("autocomplete-items");
    for (const item of autocomplete_items) {
        if (item != excluded_elem) item.parentNode.removeChild(item);
    }
}

// Close autocomplete lists when any place is clicked
document.addEventListener("click", function (e) {
    closeAllLists(e.target);
})