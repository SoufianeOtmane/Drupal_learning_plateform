import type { PlacementSkill } from "@/lib/learner-types";

export type PlacementOption = {
  id: string;
  text: string;
};

export type PlacementQuestion = {
  id: string;
  skill: PlacementSkill;
  prompt: string;
  options: PlacementOption[];
  correctOptionId: string;
};

export const placementQuestions: PlacementQuestion[] = [
  {
    id: "php-variable",
    skill: "php",
    prompt: "Which PHP variable contains the text value `Drupal`?",
    options: [
      { id: "a", text: "name = 'Drupal';" },
      { id: "b", text: "$name = 'Drupal';" },
      { id: "c", text: "var name = 'Drupal';" },
    ],
    correctOptionId: "b",
  },
  {
    id: "php-array",
    skill: "php",
    prompt: "Given `$colors = array('red', 'blue');`, how do you read the first item?",
    options: [
      { id: "a", text: "$colors[0]" },
      { id: "b", text: "$colors[1]" },
      { id: "c", text: "$colors.first()" },
    ],
    correctOptionId: "a",
  },
  {
    id: "php-concatenate",
    skill: "php",
    prompt: "Which operator joins two strings in PHP?",
    options: [
      { id: "a", text: "+" },
      { id: "b", text: "&" },
      { id: "c", text: "." },
    ],
    correctOptionId: "c",
  },
  {
    id: "php-require",
    skill: "php",
    prompt: "What is the key difference between PHP `include` and `require` when the file is missing?",
    options: [
      { id: "a", text: "Both always stop the script." },
      { id: "b", text: "`require` causes a fatal error; `include` raises a warning and continues." },
      { id: "c", text: "`include` is only for CSS files." },
    ],
    correctOptionId: "b",
  },
  {
    id: "web-client-server",
    skill: "web",
    prompt: "In a normal web request, what happens first?",
    options: [
      { id: "a", text: "The server sends a page before the browser asks for it." },
      { id: "b", text: "The browser requests a URL from a server." },
      { id: "c", text: "The browser runs the server's PHP files directly." },
    ],
    correctOptionId: "b",
  },
  {
    id: "web-response",
    skill: "web",
    prompt: "What does a web server usually send back for a page that PHP has generated?",
    options: [
      { id: "a", text: "The server's PHP source code." },
      { id: "b", text: "A database password." },
      { id: "c", text: "An HTTP response, commonly containing HTML." },
    ],
    correctOptionId: "c",
  },
  {
    id: "web-404",
    skill: "web",
    prompt: "What does HTTP status code 404 usually mean?",
    options: [
      { id: "a", text: "The requested resource was not found." },
      { id: "b", text: "The request succeeded." },
      { id: "c", text: "The server has permanently moved." },
    ],
    correctOptionId: "a",
  },
  {
    id: "web-post",
    skill: "web",
    prompt: "Which HTTP method is commonly used to submit form data that changes server-side state?",
    options: [
      { id: "a", text: "GET" },
      { id: "b", text: "POST" },
      { id: "c", text: "TRACE" },
    ],
    correctOptionId: "b",
  },
  {
    id: "sql-select",
    skill: "sql",
    prompt: "Which SQL statement reads rows from a table?",
    options: [
      { id: "a", text: "SELECT" },
      { id: "b", text: "CHANGE" },
      { id: "c", text: "FETCH FILE" },
    ],
    correctOptionId: "a",
  },
  {
    id: "sql-where",
    skill: "sql",
    prompt: "Which SQL clause filters rows by a condition?",
    options: [
      { id: "a", text: "ORDER" },
      { id: "b", text: "WHERE" },
      { id: "c", text: "TABLE" },
    ],
    correctOptionId: "b",
  },
  {
    id: "sql-injection",
    skill: "sql",
    prompt: "How should application code safely pass a user-provided value into a SQL query?",
    options: [
      { id: "a", text: "Concatenate the value directly into the SQL string." },
      { id: "b", text: "Remove spaces and concatenate the value." },
      { id: "c", text: "Use a parameterized query with a bound placeholder." },
    ],
    correctOptionId: "c",
  },
  {
    id: "git-pwd",
    skill: "git_cli",
    prompt: "Which command prints the current directory in a Unix-like terminal?",
    options: [
      { id: "a", text: "pwd" },
      { id: "b", text: "where" },
      { id: "c", text: "git current" },
    ],
    correctOptionId: "a",
  },
  {
    id: "git-status",
    skill: "git_cli",
    prompt: "Which command shows changed, staged, and untracked files in a Git repository?",
    options: [
      { id: "a", text: "git save" },
      { id: "b", text: "git status" },
      { id: "c", text: "git files" },
    ],
    correctOptionId: "b",
  },
  {
    id: "git-commit",
    skill: "git_cli",
    prompt: "What is the usual command to record staged changes in Git history?",
    options: [
      { id: "a", text: "git push" },
      { id: "b", text: "git checkout" },
      { id: "c", text: "git commit" },
    ],
    correctOptionId: "c",
  },
  {
    id: "cli-cd",
    skill: "git_cli",
    prompt: "What does the `cd` command do in a terminal?",
    options: [
      { id: "a", text: "Changes the current directory." },
      { id: "b", text: "Deletes a directory." },
      { id: "c", text: "Creates a Git commit." },
    ],
    correctOptionId: "a",
  },
  {
    id: "drupal-module-info",
    skill: "drupal",
    prompt: "In Drupal 7, which file provides a module's name and metadata?",
    options: [
      { id: "a", text: "module.yml" },
      { id: "b", text: "The module's .info file." },
      { id: "c", text: "composer.json only." },
    ],
    correctOptionId: "b",
  },
  {
    id: "drupal-hooks",
    skill: "drupal",
    prompt: "Where does a custom Drupal 7 module usually implement hooks?",
    options: [
      { id: "a", text: "In its .module file." },
      { id: "b", text: "In routes.yml." },
      { id: "c", text: "In a Twig template only." },
    ],
    correctOptionId: "a",
  },
  {
    id: "drupal-content-type",
    skill: "drupal",
    prompt: "What is a Drupal content type?",
    options: [
      { id: "a", text: "A PHP variable holding the database password." },
      { id: "b", text: "A template file extension." },
      { id: "c", text: "A definition of a kind of node and its fields." },
    ],
    correctOptionId: "c",
  },
  {
    id: "drupal-taxonomy",
    skill: "drupal",
    prompt: "In Drupal 7, what is a taxonomy vocabulary commonly used for?",
    options: [
      { id: "a", text: "Grouping related taxonomy terms, such as categories." },
      { id: "b", text: "Storing PHP source code." },
      { id: "c", text: "Replacing user permissions." },
    ],
    correctOptionId: "a",
  },
  {
    id: "drupal-menu",
    skill: "drupal",
    prompt: "Which Drupal 7 hook declares menu paths and page callbacks?",
    options: [
      { id: "a", text: "hook_route()" },
      { id: "b", text: "hook_menu()" },
      { id: "c", text: "hook_path_alter()" },
    ],
    correctOptionId: "b",
  },
];

export function getPublicPlacementQuestions() {
  return placementQuestions.map(({ id, skill, prompt, options }) => ({
    id,
    skill,
    prompt,
    options,
  }));
}

export const placementSkillLabels: Record<PlacementSkill, string> = {
  php: "PHP",
  web: "Web basics",
  sql: "SQL",
  git_cli: "Git & command line",
  drupal: "Drupal 7",
};
