// Unit tests for Overdue Charges (charges.html / charges.js)
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

describe("OverdueChargesTest", () => {
    let page;

    // Test fixture ("today" is fixed at 2026-11-25)
    let fCalculus;   // available
    let fSapiens;    // borrowed by member, 5 days overdue
    let fCleanCode;  // borrowed by member, 1 day overdue
    let fDune;       // borrowed by member, not due yet
    let fHobbit;     // borrowed by student, 3 days overdue

    const $ = id => document.getElementById(id);

    function checkCharges(email) {
        $("member-email").value = email;
        $("check-charges-button").click();
    }

    function shownTitles() {
        return [...document.querySelectorAll("#charges-list h3")].map(h => h.textContent);
    }

    function cardFor(title) {
        return [...document.querySelectorAll("#charges-list .dashboard-card")]
            .find(card => card.querySelector("h3").textContent === title);
    }

    function openChargesPage(books) {
        localStorage.setItem("books", JSON.stringify(books));
        page = loadPage("charges.html", "charges.js", ["calculateOverdueCharge"], []);
    }

    beforeAll(() => {
        console.log("@setUpBeforeClass");
    });

    afterAll(() => {
        console.log("@tearDownAfterClass");
    });

    beforeEach(() => {
        console.log("@Before");

        // Freeze the clock so the charges never change
        jest.useFakeTimers();
        jest.setSystemTime(new Date("2026-11-25T00:00:00Z"));

        fCalculus = { id: 1, title: "Calculus", author: "James Stewart", category: "Math", available: true, borrowedBy: null, dueDate: null };
        fSapiens = { id: 2, title: "Sapiens", author: "Yuval Noah Harari", category: "History", available: false, borrowedBy: "member@library.ca", dueDate: "2026-11-20" };
        fCleanCode = { id: 3, title: "Clean Code", author: "Robert C. Martin", category: "Computer Science", available: false, borrowedBy: "member@library.ca", dueDate: "2026-11-24" };
        fDune = { id: 4, title: "Dune", author: "Frank Herbert", category: "Fiction", available: false, borrowedBy: "member@library.ca", dueDate: "2026-12-05" };
        fHobbit = { id: 5, title: "The Hobbit", author: "J.R.R. Tolkien", category: "Fiction", available: false, borrowedBy: "student@library.ca", dueDate: "2026-11-22" };

        openChargesPage([fCalculus, fSapiens, fCleanCode, fDune, fHobbit]);
    });

    afterEach(() => {
        console.log("@After");
        jest.useRealTimers();
        localStorage.clear();
        document.body.innerHTML = "";
    });

    test("calculateOverdueCharge", () => {
        console.log("@Test: calculateOverdueCharge");

        // $1 per day overdue
        expect(page.calculateOverdueCharge(fSapiens)).toBe(5);
        expect(page.calculateOverdueCharge(fCleanCode)).toBe(1);
        expect(page.calculateOverdueCharge(fHobbit)).toBe(3);
    });

    test("noChargeWhenDueToday", () => {
        console.log("@Test: noChargeWhenDueToday");

        expect(page.calculateOverdueCharge({ ...fDune, dueDate: "2026-11-25" })).toBe(0);
    });

    test("noChargeWhenNotDueYet", () => {
        console.log("@Test: noChargeWhenNotDueYet");

        expect(page.calculateOverdueCharge(fDune)).toBe(0);
    });

    test("noChargeWithNoDueDate", () => {
        console.log("@Test: noChargeWithNoDueDate");

        expect(page.calculateOverdueCharge(fCalculus)).toBe(0);
    });

    test("partOfADayIsChargedAsAFullDay", () => {
        console.log("@Test: partOfADayIsChargedAsAFullDay");

        jest.setSystemTime(new Date("2026-11-25T12:00:00Z"));

        expect(page.calculateOverdueCharge(fCleanCode)).toBe(2);
    });

    test("viewOverdueCharges", () => {
        console.log("@Test: viewOverdueCharges");

        checkCharges("member@library.ca");

        // Dune is borrowed by the same member but isn't overdue yet
        expect(shownTitles()).toEqual(["Sapiens", "Clean Code"]);
    });

    test("overdueChargeDetails", () => {
        console.log("@Test: overdueChargeDetails");

        checkCharges("member@library.ca");

        const card = cardFor("Sapiens");
        expect(card.textContent).toContain("Due Date: 2026-11-20");
        expect(card.textContent).toContain("Overdue Charge: $5");
        expect(cardFor("Clean Code").textContent).toContain("Overdue Charge: $1");
    });

    test("onlyMembersOwnChargesAreShown", () => {
        console.log("@Test: onlyMembersOwnChargesAreShown");

        checkCharges("student@library.ca");

        expect(shownTitles()).toEqual(["The Hobbit"]);
        expect(cardFor("The Hobbit").textContent).toContain("Overdue Charge: $3");
    });

    test("emailIsNotCaseSensitive", () => {
        console.log("@Test: emailIsNotCaseSensitive");

        checkCharges("  MEMBER@Library.ca  ");

        expect(shownTitles()).toEqual(["Sapiens", "Clean Code"]);
    });

    test("noOverdueChargesForMember", () => {
        console.log("@Test: noOverdueChargesForMember");

        openChargesPage([fCalculus, fDune]);
        checkCharges("member@library.ca");

        expect($("charges-list").textContent).toBe("No overdue charges found.");
    });

    test("unknownEmail", () => {
        console.log("@Test: unknownEmail");

        checkCharges("nobody@library.ca");

        expect($("charges-list").textContent).toBe("No overdue charges found.");
    });

    test("emptyEmail", () => {
        console.log("@Test: emptyEmail");

        checkCharges("");

        expect($("charges-list").textContent).toBe("No overdue charges found.");
    });

    test("checkingAgainReplacesPreviousResults", () => {
        console.log("@Test: checkingAgainReplacesPreviousResults");

        checkCharges("member@library.ca");
        checkCharges("student@library.ca");

        expect(shownTitles()).toEqual(["The Hobbit"]);
    });

    test("nothingShownBeforeChecking", () => {
        console.log("@Test: nothingShownBeforeChecking");

        expect($("charges-list").innerHTML).toBe("");
    });

    test("noBooksSaved", () => {
        console.log("@Test: noBooksSaved");

        localStorage.removeItem("books");
        page = loadPage("charges.html", "charges.js", ["calculateOverdueCharge"], []);
        checkCharges("member@library.ca");

        expect(page.getBooks()).toEqual([]);
        expect($("charges-list").textContent).toBe("No overdue charges found.");
    });

    // Expected exception: calculating the charge for a book that doesn't exist
    // (like @Test(expected = TypeError.class))
    test("chargeForMissingBook", () => {
        console.log("@Test: chargeForMissingBook");

        expect(() => page.calculateOverdueCharge(undefined)).toThrow(TypeError);
    });
});
