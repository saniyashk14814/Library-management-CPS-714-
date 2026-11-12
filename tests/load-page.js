const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

// Loads a page the way the browser would: puts the page's HTML into the
// document, then runs its script. Each call runs the script in a fresh scope,
// so every test starts from a clean state (like a JUnit @Before fixture).
//
// The browser-only self-test calls at the bottom of the script (e.g.
// "testEditBook();") are skipped so they don't interfere with these tests.
//
// Returns the script's functions plus getBooks()/setBooks() to read and
// replace its `books` array.
function loadPage(htmlFile, scriptFile, functionNames, selfTestCalls) {
    const html = fs.readFileSync(path.join(ROOT, htmlFile), "utf8");
    document.body.innerHTML = html.match(/<body>([\s\S]*)<\/body>/)[1];

    let source = fs.readFileSync(path.join(ROOT, scriptFile), "utf8");
    selfTestCalls.forEach(call => {
        source = source.replace(new RegExp(`^${call}\\(\\);\\s*$`, "m"), "");
    });

    const exportsCode = `
        return {
            getBooks: () => books,
            setBooks: newBooks => { books = newBooks; },
            ${functionNames.join(", ")}
        };`;

    return new Function(source + exportsCode)();
}

module.exports = { loadPage };
