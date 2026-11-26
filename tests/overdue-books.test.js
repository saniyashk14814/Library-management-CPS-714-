// Unit tests for Overdue Books (overdue.html / overdue.js)
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

describe("OverdueBooksTest", () => {
    let page;

    // Test fixture ("today" is fixed at 2026-11-25)
    let fCalculus;   // available
    let fSapiens;    // checked out, 5 days overdue
    let fCleanCode;  // checked out, 1 day overdue
    let fDune;       // checked out, not due yet

    const $ = id => document.getElementById(id);

    function shownTitles() {
        return [...document.querySelectorAll("#overdue-book-list h3")].map(h => h.textContent);
    }

    function cardFor(title) {
        return [...document.querySelectorAll("#overdue-book-list .book-card")]
            .find(card => card.querySelector("h3").textContent === title);
    }

    function openOverduePage(books) {
        localStorage.setItem("books", JSON.stringify(books));
        page = loadPage("overdue.html", "overdue.js",
            ["getDaysOverdue", "renderOverdueBooks"], []);
    }

    beforeAll(() => {
        console.log("@setUpBeforeClass");
    });

    afterAll(() => {
        console.log("@tearDownAfterClass");
    });

    beforeEach(() => {
        console.log("@Before");

        // Freeze the clock so the number of days overdue never changes
        jest.useFakeTimers();
        jest.setSystemTime(new Date("2026-11-25T00:00:00Z"));

        fCalculus = { id: 1, title: "Calculus", author: "James Stewart", category: "Math", available: true, borrowedBy: null, dueDate: null };
        fSapiens = { id: 2, title: "Sapiens", author: "Yuval Noah Harari", category: "History", available: false, borrowedBy: "member@library.ca", dueDate: "2026-11-20" };
        fCleanCode = { id: 3, title: "Clean Code", author: "Robert C. Martin", category: "Computer Science", available: false, borrowedBy: "student@library.ca", dueDate: "2026-11-24" };
        fDune = { id: 4, title: "Dune", author: "Frank Herbert", category: "Fiction", available: false, borrowedBy: "member@library.ca", dueDate: "2026-12-05" };

        openOverduePage([fCalculus, fSapiens, fCleanCode, fDune]);
    });

    afterEach(() => {
        console.log("@After");
        jest.useRealTimers();
        localStorage.clear();
        document.body.innerHTML = "";
    });

    test("getDaysOverdue", () => {
        console.log("@Test: getDaysOverdue");

        expect(page.getDaysOverdue(fSapiens)).toBe(5);
        expect(page.getDaysOverdue(fCleanCode)).toBe(1);
    });

    test("bookDueTodayIsNotOverdue", () => {
        console.log("@Test: bookDueTodayIsNotOverdue");

        expect(page.getDaysOverdue({ ...fDune, dueDate: "2026-11-25" })).toBe(0);
    });

    test("bookNotDueYetIsNotOverdue", () => {
        console.log("@Test: bookNotDueYetIsNotOverdue");

        expect(page.getDaysOverdue(fDune)).toBe(0);
    });

    test("bookWithNoDueDateIsNotOverdue", () => {
        console.log("@Test: bookWithNoDueDateIsNotOverdue");

        expect(page.getDaysOverdue(fCalculus)).toBe(0);
    });

    test("partOfADayCountsAsAFullDay", () => {
        console.log("@Test: partOfADayCountsAsAFullDay");

        jest.setSystemTime(new Date("2026-11-25T12:00:00Z"));

        expect(page.getDaysOverdue(fCleanCode)).toBe(2);
    });

    test("onlyOverdueBooksAreShown", () => {
        console.log("@Test: onlyOverdueBooksAreShown");

        expect(shownTitles()).toEqual(["Sapiens", "Clean Code"]);
    });

    test("mostOverdueBookIsShownFirst", () => {
        console.log("@Test: mostOverdueBookIsShownFirst");

        const fOld = { ...fDune, id: 5, title: "Old Book", dueDate: "2026-11-01" };
        openOverduePage([fCleanCode, fSapiens, fOld]);

        expect(shownTitles()).toEqual(["Old Book", "Sapiens", "Clean Code"]);
    });

    test("overdueBookDetails", () => {
        console.log("@Test: overdueBookDetails");

        const card = cardFor("Sapiens");
        expect(card.querySelector(".book-category").textContent).toBe("History");
        expect(card.textContent).toContain("by Yuval Noah Harari");
        expect(card.textContent).toContain("Borrowed By: member@library.ca");
        expect(card.textContent).toContain("Due Date: 2026-11-20");
    });

    test("overdueCharge", () => {
        console.log("@Test: overdueCharge");

        // $1 per day overdue
        expect(cardFor("Sapiens").textContent).toContain("Overdue Charge: $5");
        expect(cardFor("Clean Code").textContent).toContain("Overdue Charge: $1");
    });

    test("daysOverdueLabel", () => {
        console.log("@Test: daysOverdueLabel");

        expect(cardFor("Sapiens").querySelector(".book-status").textContent).toBe("5 days overdue");
        expect(cardFor("Clean Code").querySelector(".book-status").textContent).toBe("1 day overdue");
    });

    test("returnedBookIsNotShown", () => {
        console.log("@Test: returnedBookIsNotShown");

        // Marked available again, even though the old due date is still saved
        openOverduePage([{ ...fSapiens, available: true }, fCleanCode]);

        expect(shownTitles()).toEqual(["Clean Code"]);
    });

    test("noOverdueBooks", () => {
        console.log("@Test: noOverdueBooks");

        openOverduePage([fCalculus, fDune]);

        expect($("overdue-book-list").textContent).toBe("There are no overdue books.");
        expect(document.querySelectorAll("#overdue-book-list .book-card").length).toBe(0);
    });

    test("noBooksSaved", () => {
        console.log("@Test: noBooksSaved");

        localStorage.removeItem("books");
        page = loadPage("overdue.html", "overdue.js",
            ["getDaysOverdue", "renderOverdueBooks"], []);

        expect(page.getBooks()).toEqual([]);
        expect($("overdue-book-list").textContent).toBe("There are no overdue books.");
    });

    test("renderAgainAfterBookBecomesOverdue", () => {
        console.log("@Test: renderAgainAfterBookBecomesOverdue");

        // Move the clock past Dune's due date
        jest.setSystemTime(new Date("2026-12-07T00:00:00Z"));
        page.renderOverdueBooks();

        expect(shownTitles()).toEqual(["Sapiens", "Clean Code", "Dune"]);
        expect(cardFor("Dune").textContent).toContain("Overdue Charge: $2");
    });

    // Expected exception: checking a book that doesn't exist
    // (like @Test(expected = TypeError.class))
    test("getDaysOverdueForMissingBook", () => {
        console.log("@Test: getDaysOverdueForMissingBook");

        expect(() => page.getDaysOverdue(null)).toThrow(TypeError);
    });

    // Expected exception: showing overdue books when the book list is missing
    test("renderWhenListIsMissing", () => {
        console.log("@Test: renderWhenListIsMissing");

        page.setBooks(null);

        expect(() => page.renderOverdueBooks()).toThrow(TypeError);
    });
});
