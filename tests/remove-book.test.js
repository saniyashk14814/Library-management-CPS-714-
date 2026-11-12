// Unit tests for Remove Book (deleteBook in catalogue.js)
//
// JUnit  ->  Jest
//   @BeforeClass  ->  beforeAll
//   @AfterClass   ->  afterAll
//   @Before       ->  beforeEach
//   @After        ->  afterEach
//   @Test         ->  test
//   assertTrue / assertEquals           ->  expect(...).toBe / toEqual
//   @Test(expected = X.class)           ->  expect(() => ...).toThrow(X)

const { loadPage } = require("./load-page");

describe("RemoveBookTest", () => {
    let page;

    // Test fixture
    let fCalculus;   // available
    let fSapiens;    // checked out
    let fCleanCode;  // available

    function savedBooks() {
        return JSON.parse(localStorage.getItem("books"));
    }

    function bookIds() {
        return page.getBooks().map(b => b.id);
    }

    function openCatalogue(role) {
        window.history.pushState({}, "", role ? `/catalogue.html?role=${role}` : "/catalogue.html");
        page = loadPage("catalogue.html", "catalogue.js",
            ["deleteBook", "renderBooks"],
            ["testRemoveBook", "testCheckedOutBookCannotBeRemoved"]);
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
        fSapiens = { id: 2, title: "Sapiens", author: "Yuval Noah Harari", category: "History", available: false, borrowedBy: "member@library.ca", dueDate: "2026-11-30" };
        fCleanCode = { id: 3, title: "Clean Code", author: "Robert C. Martin", category: "Computer Science", available: true, borrowedBy: null, dueDate: null };

        localStorage.setItem("books", JSON.stringify([fCalculus, fSapiens, fCleanCode]));

        // The browser's confirm/alert pop-ups are replaced with fakes:
        // confirm answers "OK" unless a test says otherwise.
        jest.spyOn(window, "confirm").mockReturnValue(true);
        jest.spyOn(window, "alert").mockImplementation(() => {});

        openCatalogue("admin");
    });

    afterEach(() => {
        console.log("@After");
        jest.restoreAllMocks();
        localStorage.clear();
        document.body.innerHTML = "";
    });

    test("removeBook", () => {
        console.log("@Test: removeBook");

        page.deleteBook(1);

        expect(bookIds()).toEqual([2, 3]);
        expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete "Calculus"?');
    });

    test("removeBookIsSavedToLocalStorage", () => {
        console.log("@Test: removeBookIsSavedToLocalStorage");

        page.deleteBook(1);

        expect(savedBooks()).toEqual([fSapiens, fCleanCode]);
    });

    test("removedBookIsNoLongerShown", () => {
        console.log("@Test: removedBookIsNoLongerShown");

        page.deleteBook(3);

        const titles = [...document.querySelectorAll("#book-list h3")].map(h => h.textContent);
        expect(titles).toEqual(["Calculus", "Sapiens"]);
    });

    test("removeBookWithDeleteButton", () => {
        console.log("@Test: removeBookWithDeleteButton");

        const firstCard = document.querySelector("#book-list .book-card");
        firstCard.querySelector(".delete-book-button").click();

        expect(bookIds()).toEqual([2, 3]);
        expect(savedBooks().length).toBe(2);
    });

    test("removeBookCancelled", () => {
        console.log("@Test: removeBookCancelled");

        window.confirm.mockReturnValue(false);
        page.deleteBook(1);

        expect(bookIds()).toEqual([1, 2, 3]);
        expect(savedBooks().length).toBe(3);
    });

    test("checkedOutBookCannotBeRemoved", () => {
        console.log("@Test: checkedOutBookCannotBeRemoved");

        page.deleteBook(2);

        expect(bookIds()).toEqual([1, 2, 3]);
        expect(window.alert).toHaveBeenCalledWith("This book cannot be deleted while it is checkedout.");
        expect(window.confirm).not.toHaveBeenCalled();
    });

    test("removeBookThatDoesNotExist", () => {
        console.log("@Test: removeBookThatDoesNotExist");

        page.deleteBook(99);

        expect(bookIds()).toEqual([1, 2, 3]);
        expect(window.confirm).not.toHaveBeenCalled();
        expect(window.alert).not.toHaveBeenCalled();
    });

    test("removeSameBookTwice", () => {
        console.log("@Test: removeSameBookTwice");

        page.deleteBook(1);
        page.deleteBook(1);

        expect(bookIds()).toEqual([2, 3]);
        expect(window.confirm).toHaveBeenCalledTimes(1);
    });

    test("removeAllAvailableBooks", () => {
        console.log("@Test: removeAllAvailableBooks");

        page.deleteBook(1);
        page.deleteBook(3);

        expect(bookIds()).toEqual([2]);
        expect(savedBooks()).toEqual([fSapiens]);
    });

    test("membersDoNotSeeDeleteButton", () => {
        console.log("@Test: membersDoNotSeeDeleteButton");

        openCatalogue("member");

        expect(document.querySelectorAll(".delete-book-button").length).toBe(0);
    });

    // Expected exception: removing a book when the book list is missing
    // (like @Test(expected = TypeError.class))
    test("removeBookWhenListIsMissing", () => {
        console.log("@Test: removeBookWhenListIsMissing");

        page.setBooks(null);

        expect(() => page.deleteBook(1)).toThrow(TypeError);
    });
});
