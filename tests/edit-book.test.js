// Unit tests for Edit Book (edit-book.html / edit-book.js)
//
// JUnit  ->  Jest
//   @BeforeClass  ->  beforeAll
//   @AfterClass   ->  afterAll
//   @Before       ->  beforeEach
//   @After   ->  afterEach
//   @Test   ->  test
//   assertTrue / assertEquals->expect(...).toBe / toEqual
//   @Test(expected = X.class)->expect(() => ...).toThrow(X)

const { loadPage } = require("./load-page");

describe("EditBookTest", () => {
    let page;

    // Test fixture
    let fCalculus;
    let fSapiens;

    const $ = id => document.getElementById(id);

    function savedBooks() {
        return JSON.parse(localStorage.getItem("books"));
    }

    function fillForm(title, author, category) {
        $("title").value = title;
        $("author").value = author;
        $("category").value = category;
    }

    beforeAll(() => {
        console.log("@setUpBeforeClass");
    });

    afterAll(() => {
        console.log("@tearDownAfterClass");
    });

    beforeEach(() => {
        console.log("@Before");

        fCalculus = { id: 1, title: "Calculus", author: "James Stewart", category: "Math", available: true, borrowedBy: null, dueDate: null };
        fSapiens = { id: 2, title: "Sapiens", author: "Yuval Noah Harari", category: "History", available: true, borrowedBy: null, dueDate: null };

        localStorage.setItem("books", JSON.stringify([fCalculus, fSapiens]));
        page = loadPage("edit-book.html", "edit-book.js",
            ["loadBookList", "showBook", "saveBook"], ["testEditBook"]);
    });

    afterEach(() => {
        console.log("@After");
        localStorage.clear();
        document.body.innerHTML = "";
    });

    test("loadBookList", () => {
        console.log("@Test: loadBookList");

        const options = $("book-select").options;
        expect(options.length).toBe(2);
        expect(options[0].textContent).toBe("Calculus");
        expect(options[1].textContent).toBe("Sapiens");

        // The first book is shown in the form when the page opens
        expect($("title").value).toBe("Calculus");
        expect($("author").value).toBe("James Stewart");
        expect($("category").value).toBe("Math");
    });

    test("selectBookShowsItsDetails", () => {
        console.log("@Test: selectBookShowsItsDetails");

        $("book-select").value = "2";
        $("book-select").dispatchEvent(new Event("change"));

        expect($("title").value).toBe("Sapiens");
        expect($("author").value).toBe("Yuval Noah Harari");
        expect($("category").value).toBe("History");
    });

    test("editBook", () => {
        console.log("@Test: editBook");

        fillForm("Calculus 9th Edition", "J. Stewart", "Mathematics");
        $("save-book-button").click();

        const book = page.getBooks().find(b => b.id === 1);
        expect(book.title).toBe("Calculus 9th Edition");
        expect(book.author).toBe("J. Stewart");
        expect(book.category).toBe("Mathematics");
        expect($("message").textContent).toBe('"Calculus 9th Edition" was updated successfully');
    });

    test("editBookIsSavedToLocalStorage", () => {
        console.log("@Test: editBookIsSavedToLocalStorage");

        fillForm("Calculus 9th Edition", "J. Stewart", "Mathematics");
        page.saveBook();

        const saved = savedBooks().find(b => b.id === 1);
        expect(saved.title).toBe("Calculus 9th Edition");
        expect(saved.author).toBe("J. Stewart");
        expect(saved.category).toBe("Mathematics");
    });

    test("editBookOnlyChangesSelectedBook", () => {
        console.log("@Test: editBookOnlyChangesSelectedBook");

        $("book-select").value = "2";
        page.showBook();
        fillForm("Sapiens (Illustrated)", "Yuval Noah Harari", "History");
        page.saveBook();

        expect(savedBooks()).toEqual([
            fCalculus,
            { ...fSapiens, title: "Sapiens (Illustrated)" }
        ]);
        // The edited book stays selected after saving
        expect($("book-select").value).toBe("2");
    });

    test("editBookKeepsOtherFields", () => {
        console.log("@Test: editBookKeepsOtherFields");

        fillForm("New Title", "New Author", "Science");
        page.saveBook();

        const book = page.getBooks().find(b => b.id === 1);
        expect(book.id).toBe(1);
        expect(book.available).toBe(true);
        expect(book.borrowedBy).toBe(null);
        expect(book.dueDate).toBe(null);
    });

    test("editBookWithEmptyTitle", () => {
        console.log("@Test: editBookWithEmptyTitle");

        fillForm("", "James Stewart", "Math");
        page.saveBook();

        expect($("message").textContent).toBe("Please fill in all fields");
        expect(savedBooks()[0]).toEqual(fCalculus);
    });

    test("editBookWithEmptyAuthor", () => {
        console.log("@Test: editBookWithEmptyAuthor");

        fillForm("Calculus", "", "Math");
        page.saveBook();

        expect($("message").textContent).toBe("Please fill in all fields");
        expect(savedBooks()[0]).toEqual(fCalculus);
    });

    test("editBookWithEmptyCategory", () => {
        console.log("@Test: editBookWithEmptyCategory");

        fillForm("Calculus", "James Stewart", "");
        page.saveBook();

        expect($("message").textContent).toBe("Please fill in all fields");
        expect(savedBooks()[0]).toEqual(fCalculus);
    });

    test("noBooksToEdit", () => {
        console.log("@Test: noBooksToEdit");

        localStorage.setItem("books", JSON.stringify([]));
        page = loadPage("edit-book.html", "edit-book.js",
            ["loadBookList", "showBook", "saveBook"], ["testEditBook"]);

        expect($("message").textContent).toBe("There are no books to edit.");
        expect($("save-book-button").disabled).toBe(true);
        expect($("book-select").options.length).toBe(0);
    });

    // Expected exception: showing a book that isn't in the list
    // (like @Test(expected = TypeError.class))
    test("showBookThatDoesNotExist", () => {
        console.log("@Test: showBookThatDoesNotExist");

        $("book-select").innerHTML = '<option value="99">Missing Book</option>';

        expect(() => page.showBook()).toThrow(TypeError);
    });

    // Expected exception: saving changes to a book that isn't in the list
    test("saveBookThatDoesNotExist", () => {
        console.log("@Test: saveBookThatDoesNotExist");

        $("book-select").innerHTML = '<option value="99">Missing Book</option>';
        fillForm("Title", "Author", "Category");

        expect(() => page.saveBook()).toThrow(TypeError);
    });
});
