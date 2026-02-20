const fs = require('fs');
try {
    const data = JSON.parse(fs.readFileSync('output.json/teste gil.json', 'utf8'));
    let text = "";
    data.Pages.forEach(page => {
        page.Texts.forEach(t => {
            text += decodeURIComponent(t.R[0].T) + " ";
        });
        text += "\n\n";
    });
    fs.writeFileSync('pdf_text.txt', text);
    console.log("Extracted to pdf_text.txt");
} catch (e) { console.error(e); }
