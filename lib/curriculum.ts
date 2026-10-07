export type LessonSection = {
  id: string;
  title: string;
  objective: string;
  explanation: string;
  example: string;
  takeaway: string;
};

export type DayOption = { id: string; text: string };

export type DayQuestion = {
  id: string;
  prompt: string;
  options: DayOption[];
  correctOptionId: string;
  explanation: string;
};

export type LearningDay = {
  day: number;
  title: string;
  topic: string;
  lessons: LessonSection[];
  questions: DayQuestion[];
};

export const PASS_THRESHOLD = 85;

export const learningCurriculum: LearningDay[] = [
  {
    day: 1,
    title: "Web request basics",
    topic: "How a browser request reaches a server and becomes a page",
    lessons: [
      {
        id: "day-1-web-request",
        title: "How a web request becomes a page",
        objective: "Explain the request, server processing, and response sequence.",
        explanation:
          "When you open a URL, the browser sends a request to a web server. The server runs PHP and Drupal, may read content from a database, and sends an HTTP response—commonly HTML—back. The browser displays that response; it does not run or receive the PHP source code.",
        example: "Browser request -> server runs PHP/Drupal -> HTML response -> browser displays page",
        takeaway: "The browser asks first; the server processes the request and returns a response.",
      },
    ],
    questions: [
      {
        id: "d1-q1",
        prompt: "Which action happens first when you open a page?",
        options: [
          { id: "a", text: "The browser requests the URL from a server." },
          { id: "b", text: "The server sends a page without a request." },
          { id: "c", text: "The browser runs the server's PHP files." },
        ],
        correctOptionId: "a",
        explanation: "The browser sends the request; the server responds afterward.",
      },
      {
        id: "d1-q2",
        prompt: "Where does PHP normally run for a Drupal page?",
        options: [
          { id: "a", text: "In the visitor's browser." },
          { id: "b", text: "On the web server." },
          { id: "c", text: "Inside the URL." },
        ],
        correctOptionId: "b",
        explanation: "The server runs PHP and returns the generated response.",
      },
      {
        id: "d1-q3",
        prompt: "What does a web server commonly send back for a generated page?",
        options: [
          { id: "a", text: "The PHP source file." },
          { id: "b", text: "An HTTP response containing HTML." },
          { id: "c", text: "A browser request." },
        ],
        correctOptionId: "b",
        explanation: "The browser receives the result, commonly HTML, not the server-side PHP source.",
      },
      {
        id: "d1-q4",
        prompt: "What might Drupal read while it builds a page?",
        options: [
          { id: "a", text: "The visitor's browser memory only." },
          { id: "b", text: "The address bar pixels." },
          { id: "c", text: "Content or configuration from a database." },
        ],
        correctOptionId: "c",
        explanation: "Drupal often reads stored content and configuration from its database.",
      },
      {
        id: "d1-q5",
        prompt: "Which sequence is in the correct order?",
        options: [
          { id: "a", text: "Browser requests -> server processes -> browser receives response." },
          { id: "b", text: "Server processes -> browser requests -> response is created." },
          { id: "c", text: "Browser runs PHP -> server displays the page." },
        ],
        correctOptionId: "a",
        explanation: "A request arrives first; server processing creates a response.",
      },
      {
        id: "d1-q6",
        prompt: "Does a browser normally need to understand PHP to display a Drupal page?",
        options: [
          { id: "a", text: "Yes, it executes the PHP source." },
          { id: "b", text: "No, it displays the response produced by the server." },
          { id: "c", text: "Yes, PHP is part of every URL." },
        ],
        correctOptionId: "b",
        explanation: "The server processes PHP before returning the page response.",
      },
      {
        id: "d1-q7",
        prompt: "What is an HTTP request?",
        options: [
          { id: "a", text: "A request from a client asking a server for a resource or action." },
          { id: "b", text: "A PHP variable." },
          { id: "c", text: "A database table." },
        ],
        correctOptionId: "a",
        explanation: "HTTP is the protocol browsers and servers use to exchange requests and responses.",
      },
      {
        id: "d1-q8",
        prompt: "Which component is responsible for displaying returned HTML?",
        options: [
          { id: "a", text: "The SQL database." },
          { id: "b", text: "The browser." },
          { id: "c", text: "The PHP interpreter alone." },
        ],
        correctOptionId: "b",
        explanation: "The browser reads the HTML response and renders the visible page.",
      },
      {
        id: "d1-q9",
        prompt: "When does server-side Drupal code run?",
        options: [
          { id: "a", text: "As the server handles a request." },
          { id: "b", text: "Only after the browser has already displayed the final page." },
          { id: "c", text: "When a user edits the URL text but never submits it." },
        ],
        correctOptionId: "a",
        explanation: "The server runs Drupal while processing the incoming request.",
      },
      {
        id: "d1-q10",
        prompt: "Which statement best describes a database in a Drupal request?",
        options: [
          { id: "a", text: "It is the browser's screen." },
          { id: "b", text: "It may provide stored data that Drupal uses to build a response." },
          { id: "c", text: "It sends PHP directly to each visitor." },
        ],
        correctOptionId: "b",
        explanation: "Drupal can query its database for content and settings during page generation.",
      },
    ],
  },
  {
    day: 2,
    title: "PHP building blocks",
    topic: "Variables, values, conditions, and arrays",
    lessons: [
      {
        id: "day-2-variables",
        title: "Store a value in a variable",
        objective: "Read and assign a basic PHP variable.",
        explanation:
          "A variable is a named place for a value while a program runs. PHP variable names begin with a dollar sign. The equals sign assigns the value on the right to the variable on the left.",
        example: "$siteName = 'Learning garden';",
        takeaway: "PHP variables start with `$`, and `=` assigns a value.",
      },
      {
        id: "day-2-types",
        title: "Work with common value types",
        objective: "Distinguish text, numbers, and true/false values.",
        explanation:
          "Text is written inside quotes, numbers can be written without quotes, and a boolean is either `TRUE` or `FALSE`. Choosing the correct type helps later comparisons and calculations behave as expected.",
        example: "$title = 'Welcome';  $count = 3;  $isOpen = TRUE;",
        takeaway: "Quotes mark text; numbers and booleans have their own types.",
      },
      {
        id: "day-2-conditions-arrays",
        title: "Choose a path and group values",
        objective: "Understand a simple condition and a zero-based array.",
        explanation:
          "An `if` statement runs code only when its condition is true. An indexed PHP array groups values; its first numeric index is 0. A loop can visit each value without repeating the same statement by hand.",
        example: "$colors = array('red', 'blue');  $first = $colors[0];",
        takeaway: "Conditions make decisions; indexed arrays begin at index 0.",
      },
    ],
    questions: [
      {
        id: "d2-q1",
        prompt: "Which is a valid PHP variable assignment?",
        options: [
          { id: "a", text: "$name = 'Mina';" },
          { id: "b", text: "name := 'Mina';" },
          { id: "c", text: "var $name == 'Mina';" },
        ],
        correctOptionId: "a",
        explanation: "PHP variable names begin with `$`; `=` assigns the quoted string.",
      },
      {
        id: "d2-q2",
        prompt: "What value is stored in `$count` here: `$count = 4;`?",
        options: [
          { id: "a", text: "The text string '4'." },
          { id: "b", text: "The number 4." },
          { id: "c", text: "The boolean FALSE." },
        ],
        correctOptionId: "b",
        explanation: "Without quotes, `4` is a numeric value.",
      },
      {
        id: "d2-q3",
        prompt: "Which value represents the boolean true in PHP?",
        options: [
          { id: "a", text: "'TRUE' as quoted text." },
          { id: "b", text: "1.0 only." },
          { id: "c", text: "TRUE without quotes." },
        ],
        correctOptionId: "c",
        explanation: "`TRUE` without quotes is a boolean value.",
      },
      {
        id: "d2-q4",
        prompt: "What does `=` do in `$city = 'Rabat';`?",
        options: [
          { id: "a", text: "Assigns the value on the right to the variable on the left." },
          { id: "b", text: "Compares two values for equality." },
          { id: "c", text: "Prints the variable." },
        ],
        correctOptionId: "a",
        explanation: "A single equals sign is assignment in PHP.",
      },
      {
        id: "d2-q5",
        prompt: "When does the body of an `if ($ready)` block run?",
        options: [
          { id: "a", text: "Only when `$ready` is true." },
          { id: "b", text: "Only when `$ready` is a string." },
          { id: "c", text: "Every time, regardless of the condition." },
        ],
        correctOptionId: "a",
        explanation: "An `if` block runs when its condition evaluates to true.",
      },
      {
        id: "d2-q6",
        prompt: "Given `$colors = array('red', 'blue');`, what is `$colors[0]`?",
        options: [
          { id: "a", text: "'blue'" },
          { id: "b", text: "'red'" },
          { id: "c", text: "The array length." },
        ],
        correctOptionId: "b",
        explanation: "The first item in a numerically indexed PHP array is at index 0.",
      },
      {
        id: "d2-q7",
        prompt: "Which operator concatenates (joins) strings in PHP?",
        options: [
          { id: "a", text: "." },
          { id: "b", text: "+" },
          { id: "c", text: "::" },
        ],
        correctOptionId: "a",
        explanation: "PHP uses the dot operator to concatenate strings.",
      },
      {
        id: "d2-q8",
        prompt: "Why use a loop with an array?",
        options: [
          { id: "a", text: "To visit each item without duplicating the same code for every item." },
          { id: "b", text: "To turn PHP into HTML." },
          { id: "c", text: "To rename the array." },
        ],
        correctOptionId: "a",
        explanation: "A loop repeats an operation for items in a collection.",
      },
      {
        id: "d2-q9",
        prompt: "Which value is text rather than a number?",
        options: [
          { id: "a", text: "12" },
          { id: "b", text: "'12'" },
          { id: "c", text: "FALSE" },
        ],
        correctOptionId: "b",
        explanation: "Quotes make `12` a string of text.",
      },
      {
        id: "d2-q10",
        prompt: "What is the main purpose of a variable?",
        options: [
          { id: "a", text: "To give a value a name so code can use it." },
          { id: "b", text: "To create a browser request." },
          { id: "c", text: "To automatically save data to SQL." },
        ],
        correctOptionId: "a",
        explanation: "A variable gives a value a name that the program can refer to.",
      },
    ],
  },
  {
    day: 3,
    title: "HTML forms and safe output",
    topic: "Collect input, validate it, and escape output",
    lessons: [
      {
        id: "day-3-form-html",
        title: "A form collects input",
        objective: "Recognize the basic parts and purpose of an HTML form.",
        explanation:
          "An HTML form groups controls such as text fields and a submit button. Each control needs a meaningful `name` so its value can be identified when the browser submits the form.",
        example: "<form method=\"post\"><input name=\"display_name\"><button>Save</button></form>",
        takeaway: "The form gathers values; the server still has to inspect them.",
      },
      {
        id: "day-3-validation",
        title: "Validate before trusting input",
        objective: "Separate receiving user input from accepting it.",
        explanation:
          "A browser can send unexpected or altered values, so server-side code must validate them. Validation checks whether input matches the application's rules, such as a required value or a reasonable length.",
        example: "Reject a blank display name before saving it.",
        takeaway: "Never assume a submitted value is valid just because a form displayed it.",
      },
      {
        id: "day-3-escaping",
        title: "Escape text when displaying it",
        objective: "Explain why output escaping helps prevent cross-site scripting.",
        explanation:
          "Input validation and output escaping solve different problems. If user-provided text is later shown in HTML, escape it for that output context so characters such as `<` are displayed as text instead of being interpreted as markup or script.",
        example: "Drupal 7: check_plain($display_name)",
        takeaway: "Validate for your rules, then escape untrusted text when rendering it.",
      },
    ],
    questions: [
      {
        id: "d3-q1",
        prompt: "What does an HTML form primarily do?",
        options: [
          { id: "a", text: "Collects values for submission." },
          { id: "b", text: "Validates all values securely on the server automatically." },
          { id: "c", text: "Runs PHP in the browser." },
        ],
        correctOptionId: "a",
        explanation: "A form collects and submits data; server code must still validate it.",
      },
      {
        id: "d3-q2",
        prompt: "Why should a form control have a `name`?",
        options: [
          { id: "a", text: "It gives the submitted value a field key." },
          { id: "b", text: "It encrypts its value." },
          { id: "c", text: "It makes the value trusted." },
        ],
        correctOptionId: "a",
        explanation: "The control name identifies the value in form submission.",
      },
      {
        id: "d3-q3",
        prompt: "Where should important validation happen?",
        options: [
          { id: "a", text: "Only in browser JavaScript." },
          { id: "b", text: "On the server that receives the submitted value." },
          { id: "c", text: "Only in the CSS." },
        ],
        correctOptionId: "b",
        explanation: "Server-side validation is required because clients can be modified or bypassed.",
      },
      {
        id: "d3-q4",
        prompt: "Does validating a value make it safe to print as HTML?",
        options: [
          { id: "a", text: "Yes, validation always prevents XSS." },
          { id: "b", text: "No; escape untrusted text for its output context." },
          { id: "c", text: "Yes, if the form used POST." },
        ],
        correctOptionId: "b",
        explanation: "Validation checks application rules; output escaping prevents text being interpreted as markup.",
      },
      {
        id: "d3-q5",
        prompt: "In Drupal 7, which function escapes plain text for HTML output?",
        options: [
          { id: "a", text: "check_plain()" },
          { id: "b", text: "variable_set()" },
          { id: "c", text: "db_delete()" },
        ],
        correctOptionId: "a",
        explanation: "`check_plain()` escapes text for safe HTML output in Drupal 7.",
      },
      {
        id: "d3-q6",
        prompt: "What is cross-site scripting (XSS) in this context?",
        options: [
          { id: "a", text: "Untrusted content is interpreted as executable browser markup or script." },
          { id: "b", text: "A database connection closes." },
          { id: "c", text: "A form contains two fields." },
        ],
        correctOptionId: "a",
        explanation: "XSS occurs when attacker-controlled content is interpreted as code in a user's browser.",
      },
      {
        id: "d3-q7",
        prompt: "A user submits a display name containing `<script>`. What is the safe display approach?",
        options: [
          { id: "a", text: "Insert the value directly into HTML." },
          { id: "b", text: "Escape it as text for HTML output." },
          { id: "c", text: "Remove the database table." },
        ],
        correctOptionId: "b",
        explanation: "Escaping ensures the browser displays untrusted content as text.",
      },
      {
        id: "d3-q8",
        prompt: "What does the form's `method` attribute help specify?",
        options: [
          { id: "a", text: "How the browser submits form data, such as GET or POST." },
          { id: "b", text: "The PHP variable type." },
          { id: "c", text: "The database's table name." },
        ],
        correctOptionId: "a",
        explanation: "The method attribute selects an HTTP method for the form submission.",
      },
      {
        id: "d3-q9",
        prompt: "Which statement about client-side validation is correct?",
        options: [
          { id: "a", text: "It improves feedback but cannot replace server-side validation." },
          { id: "b", text: "It prevents a user from changing a request." },
          { id: "c", text: "It makes every submitted value trustworthy." },
        ],
        correctOptionId: "a",
        explanation: "Client checks help usability, but users can bypass them.",
      },
      {
        id: "d3-q10",
        prompt: "Which order is safest when handling a submitted name?",
        options: [
          { id: "a", text: "Accept any value and concatenate it into HTML." },
          { id: "b", text: "Validate it on the server, then escape it when displaying it." },
          { id: "c", text: "Escape the submit button and trust the value." },
        ],
        correctOptionId: "b",
        explanation: "Validate according to your rules and escape untrusted output in its context.",
      },
    ],
  },
  {
    day: 4,
    title: "SQL and safe data access",
    topic: "Tables, queries, filtering, and parameterized values",
    lessons: [
      {
        id: "day-4-tables",
        title: "Think in tables and rows",
        objective: "Understand tables, rows, and columns as a data model.",
        explanation:
          "A relational database organizes information in tables. A column describes a kind of value, while a row stores one record. A primary key identifies a row so another part of the application can refer to that specific record.",
        example: "users table: uid | name | mail",
        takeaway: "Tables group similar records; columns describe fields and rows hold records.",
      },
      {
        id: "day-4-select",
        title: "Read only the rows you need",
        objective: "Use SELECT and WHERE to read filtered records.",
        explanation:
          "`SELECT` chooses which columns to read, `FROM` names the table, and `WHERE` limits which rows match. Filtering by a key avoids loading every record when you only need one.",
        example: "SELECT name FROM users WHERE uid = 7;",
        takeaway: "Use a clear SELECT and a WHERE condition to narrow results.",
      },
      {
        id: "day-4-parameters",
        title: "Keep values separate from SQL syntax",
        objective: "Explain why parameterized queries prevent SQL injection.",
        explanation:
          "Never concatenate a user-supplied value into SQL text. A parameterized query sends the SQL structure separately from the value, so the database treats the value as data rather than executable query syntax. Drupal 7 provides placeholders through `db_query()`.",
        example: "db_query('SELECT name FROM {users} WHERE uid = :uid', array(':uid' => $uid));",
        takeaway: "Bind input values to placeholders instead of building SQL by concatenation.",
      },
    ],
    questions: [
      {
        id: "d4-q1",
        prompt: "In a relational database table, what does a row usually represent?",
        options: [
          { id: "a", text: "One record." },
          { id: "b", text: "The database server." },
          { id: "c", text: "A query condition." },
        ],
        correctOptionId: "a",
        explanation: "Each row stores one record in the table.",
      },
      {
        id: "d4-q2",
        prompt: "Which SQL statement reads data?",
        options: [
          { id: "a", text: "SELECT" },
          { id: "b", text: "DISPLAY" },
          { id: "c", text: "OPEN ROWS" },
        ],
        correctOptionId: "a",
        explanation: "`SELECT` is used to retrieve data from tables.",
      },
      {
        id: "d4-q3",
        prompt: "What does a WHERE clause do?",
        options: [
          { id: "a", text: "Filters rows using a condition." },
          { id: "b", text: "Renames every column." },
          { id: "c", text: "Creates a PHP function." },
        ],
        correctOptionId: "a",
        explanation: "`WHERE` restricts which rows a query returns or affects.",
      },
      {
        id: "d4-q4",
        prompt: "What is a primary key commonly used for?",
        options: [
          { id: "a", text: "Uniquely identifying a row." },
          { id: "b", text: "Escaping HTML." },
          { id: "c", text: "Choosing CSS colors." },
        ],
        correctOptionId: "a",
        explanation: "A primary key distinguishes one record from the others.",
      },
      {
        id: "d4-q5",
        prompt: "How should a user-provided value enter a SQL query?",
        options: [
          { id: "a", text: "By direct string concatenation." },
          { id: "b", text: "Through a bound parameter or placeholder." },
          { id: "c", text: "By placing it in a comment." },
        ],
        correctOptionId: "b",
        explanation: "Binding values keeps data separate from SQL syntax.",
      },
      {
        id: "d4-q6",
        prompt: "What risk does SQL string concatenation create with untrusted input?",
        options: [
          { id: "a", text: "SQL injection." },
          { id: "b", text: "An HTML heading." },
          { id: "c", text: "A CSS selector." },
        ],
        correctOptionId: "a",
        explanation: "An attacker could change the intended query by supplying SQL syntax.",
      },
      {
        id: "d4-q7",
        prompt: "In Drupal 7, what does `db_query()` help an application do?",
        options: [
          { id: "a", text: "Run a database query with parameter placeholders." },
          { id: "b", text: "Render CSS." },
          { id: "c", text: "Create a browser URL." },
        ],
        correctOptionId: "a",
        explanation: "Drupal 7's database API supports parameterized queries through `db_query()`.",
      },
      {
        id: "d4-q8",
        prompt: "What is a column in a table?",
        options: [
          { id: "a", text: "A named kind of value stored for records." },
          { id: "b", text: "A complete database server." },
          { id: "c", text: "A PHP loop." },
        ],
        correctOptionId: "a",
        explanation: "Columns define the fields each row can store.",
      },
      {
        id: "d4-q9",
        prompt: "Why filter a query with a WHERE condition?",
        options: [
          { id: "a", text: "To retrieve only rows matching the needed condition." },
          { id: "b", text: "To execute PHP inside SQL." },
          { id: "c", text: "To disable the database." },
        ],
        correctOptionId: "a",
        explanation: "Filtering narrows results to the records the application needs.",
      },
      {
        id: "d4-q10",
        prompt: "Which is the safer query pattern?",
        options: [
          { id: "a", text: "Build SQL by joining in the user's text." },
          { id: "b", text: "Keep query structure fixed and bind the user's value separately." },
          { id: "c", text: "Remove quotes and concatenate the input." },
        ],
        correctOptionId: "b",
        explanation: "Parameterized values are handled as data, not query instructions.",
      },
    ],
  },
];

export function getLearningDay(day: number) {
  return learningCurriculum.find((item) => item.day === day);
}

export function getPublicQuestions(day: LearningDay) {
  return day.questions.map(({ correctOptionId: _answer, explanation: _explanation, ...question }) => question);
}
