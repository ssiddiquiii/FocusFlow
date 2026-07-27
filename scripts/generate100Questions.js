import fs from 'fs';
const path = './src/data/jsTopicPractice.json';

const categories = [
  {
    "id": "cat-1-variables-datatypes",
    "topic": "1. Variables, Datatypes & Type Coercion (Videos 4-8)",
    "icon": "📦",
    "description": "Covering let/const/var, ECMA standards, implicit type coercion, and equality comparison rules.",
    "questions": [
      {
        "id": "q1_1",
        "title": "Temporal Dead Zone (TDZ) Identification",
        "difficulty": "easy",
        "question": "What happens when you access a `let` variable before its declaration line vs a `var` variable?",
        "solution": "`let` throws `ReferenceError: Cannot access 'a' before initialization` due to the Temporal Dead Zone (TDZ).\n`var` returns `undefined` because its declaration is hoisted without initialization.",
        "link": "https://javascript.info/variables"
      },
      {
        "id": "q1_2",
        "title": "Const Mutation vs Re-assignment",
        "difficulty": "easy",
        "question": "Can you change property `name` in `const user = { name: 'A' }`? Why does `user = {}` throw TypeError?",
        "solution": "`const` prevents re-assigning the variable reference identifier. Mutating internal object properties (`user.name = 'B'`) does NOT change the memory reference address.",
        "link": "https://www.w3resource.com/javascript-exercises/javascript-basic-exercise-13.php"
      },
      {
        "id": "q1_3",
        "title": "Implicit String Coercion: + vs -",
        "difficulty": "medium",
        "question": "Evaluate: A) `\"1\" + 2 + 2`  B) `1 + 2 + \"2\"`  C) `\"5\" - 2`  D) `\"5\" * \"2\"`",
        "solution": "A) `\"122\"` (Left-to-right: \"1\"+2 = \"12\", \"12\"+2 = \"122\")\nB) `\"32\"` (1+2 = 3, 3+\"2\" = \"32\")\nC) `3` (- coerces string to number)\nD) `10` (* coerces string to number)",
        "link": "https://javascript.info/type-conversions"
      },
      {
        "id": "q1_4",
        "title": "Unary Plus (+) Type Conversion",
        "difficulty": "medium",
        "question": "What do `+\"\"`, `+true`, `+false`, and `+null` evaluate to?",
        "solution": "`+\"\" === 0`\n`+true === 1`\n`+false === 0`\n`+null === 0`",
        "link": "https://www.w3resource.com/javascript-exercises/javascript-basic-exercise-11.php"
      },
      {
        "id": "q1_5",
        "title": "NaN Comparison Property",
        "difficulty": "medium",
        "question": "Why does `NaN === NaN` return false? How do you reliably check for NaN?",
        "solution": "`NaN` is the only value in JavaScript not equal to itself. Use `Number.isNaN(val)` or `Object.is(val, NaN)`.",
        "link": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN"
      },
      {
        "id": "q1_6",
        "title": "Loose (==) vs Strict (===) Equality Matrix",
        "difficulty": "medium",
        "question": "Evaluate: A) `null == undefined`  B) `null === undefined`  C) `\"0\" == 0`  D) `\"0\" === 0`",
        "solution": "A) `true` (null only loosely equals undefined)\nB) `false` (different types)\nC) `true` (coerced string to number)\nD) `false` (type mismatch)",
        "link": "https://www.w3resource.com/javascript-exercises/javascript-basic-exercise-36.php"
      },
      {
        "id": "q1_7",
        "title": "The `typeof null` Bug Explanation",
        "difficulty": "hard",
        "question": "Why does `typeof null` return `\"object\"`? Is null an object?",
        "solution": "No! Null is a primitive type. In early JS, values were stored with 32-bit type tags where 000 meant object. Null was represented as NULL pointer (0x00), so typeof misidentified it as object.",
        "link": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof"
      },
      {
        "id": "q1_8",
        "title": "Illegal Shadowing of Variables",
        "difficulty": "hard",
        "question": "Will `let a = 10; { var a = 20; }` throw an error? What about `var b = 10; { let b = 20; }`?",
        "solution": "First throws `SyntaxError: Identifier 'a' has already been declared` (var cannot shadow let in nested scope). Second is VALID (let can shadow var).",
        "link": "https://javascript.info/variables"
      },
      {
        "id": "q1_9",
        "title": "Symbol Uniqueness Trap",
        "difficulty": "hard",
        "question": "Does `Symbol('id') === Symbol('id')` evaluate to true or false?",
        "solution": "`false`. Every `Symbol()` call guarantees a unique primitive value, even if created with identical description string.",
        "link": "https://javascript.info/symbol"
      },
      {
        "id": "q1_10",
        "title": "Global Window Attachment Rules",
        "difficulty": "hard",
        "question": "Which variable declaration (`var`, `let`, `const`) at top-level attaches properties to the browser `window` object?",
        "solution": "Only `var` attaches to `window` (e.g. `var x=5` -> `window.x===5`). `let` and `const` create declarations in global declarative environment record without attaching to `window`.",
        "link": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var"
      }
    ]
  },
  {
    "id": "cat-2-memory-strings-math",
    "topic": "2. Memory Architecture, Strings, Math & Dates (Videos 9-13)",
    "icon": "🧠",
    "description": "Stack vs Heap memory, String immutability/slice, Math.random formula, and Date timestamps.",
    "questions": [
      {
        "id": "q2_1",
        "title": "Stack vs Heap Copy Behavior",
        "difficulty": "easy",
        "question": "Predict output: `let a = 5; let b = a; b = 10; console.log(a);` vs `let x = {v:5}; let y = x; y.v = 10; console.log(x.v);`",
        "solution": "`a` remains `5` (Stack copy by value). `x.v` becomes `10` (Heap copy by reference address).",
        "link": "https://javascript.info/object-copy"
      },
      {
        "id": "q2_2",
        "title": "String Immutability Verification",
        "difficulty": "easy",
        "question": "If `let str = \"chai\"`, what is the value of `str` after executing `str[0] = \"C\"`?",
        "solution": "`str` is still `\"chai\"`. Strings are immutable primitives; index assignments silently fail (or throw TypeError in strict mode).",
        "link": "https://www.w3resource.com/javascript-exercises/string/javascript-string-exercise-1.php"
      },
      {
        "id": "q2_3",
        "title": "Slice vs Substring Negative Indices",
        "difficulty": "medium",
        "question": "Evaluate: `\"JavaScript\".slice(-4)` vs `\"JavaScript\".substring(-4)`.",
        "solution": "`\"JavaScript\".slice(-4)` returns `\"ript\"` (negative index count from end).\n`\"JavaScript\".substring(-4)` converts negative index to `0`, returning `\"JavaScript\"`.",
        "link": "https://www.w3resource.com/javascript-exercises/string/javascript-string-exercise-4.php"
      },
      {
        "id": "q2_4",
        "title": "Random Integer Range Formula",
        "difficulty": "medium",
        "question": "Write the exact formula using `Math.random()` to generate a random integer between `min` (inclusive) and `max` (inclusive).",
        "solution": "```js\nMath.floor(Math.random() * (max - min + 1)) + min;\n```",
        "link": "https://www.w3resource.com/javascript-exercises/javascript-math-exercise-4.php"
      },
      {
        "id": "q2_5",
        "title": "toFixed() Return Type Trap",
        "difficulty": "easy",
        "question": "What is `typeof (123.456).toFixed(2)`?",
        "solution": "`\"string\"`! `.toFixed()` formats a number and returns a String (e.g. `\"123.46\"`).",
        "link": "https://www.w3resource.com/javascript-exercises/javascript-math-exercise-5.php"
      },
      {
        "id": "q2_6",
        "title": "Date.now() Timestamp Unit",
        "difficulty": "medium",
        "question": "What unit does `Date.now()` return? How do you get current time in seconds?",
        "solution": "`Date.now()` returns milliseconds elapsed since Jan 1, 1970 UTC. To get seconds: `Math.floor(Date.now() / 1000)`.",
        "link": "https://javascript.info/date"
      },
      {
        "id": "q2_7",
        "title": "0.1 + 0.2 Floating Point Precision",
        "difficulty": "hard",
        "question": "Why does `0.1 + 0.2 === 0.3` evaluate to false? How do you compare them?",
        "solution": "JS uses IEEE 754 64-bit binary float representation. `0.1 + 0.2` equals `0.30000000000000004`. Compare using: `Math.abs((0.1 + 0.2) - 0.3) < Number.EPSILON`.",
        "link": "https://javascript.info/number"
      },
      {
        "id": "q2_8",
        "title": "Shallow Copy Spread vs Deep Clone",
        "difficulty": "hard",
        "question": "Why is `{...user}` insufficient if `user` object contains nested objects like `{ address: { city: 'Delhi' } }`?",
        "solution": "Spread operator `{...user}` creates a SHALLOW copy. Top properties are cloned, but nested `address` object still shares reference pointer. Use `structuredClone(user)` for deep copy.",
        "link": "https://javascript.info/object-copy"
      },
      {
        "id": "q2_9",
        "title": "First Non-Repeating Character in String",
        "difficulty": "hard",
        "question": "Write a function `firstNonRepeat(\"abacddbec\")` returning `'e'`.",
        "solution": "```js\nfunction firstNonRepeat(str) {\n  for (let char of str) {\n    if (str.indexOf(char) === str.lastIndexOf(char)) return char;\n  }\n  return null;\n}\n```",
        "link": "https://www.w3resource.com/javascript-exercises/javascript-function-exercise-23.php"
      },
      {
        "id": "q2_10",
        "title": "V8 Garbage Collector Mark-and-Sweep",
        "difficulty": "hard",
        "question": "How does V8 determine whether Heap memory allocated to an object can be freed by Garbage Collection?",
        "solution": "V8 uses the Mark-and-Sweep algorithm. It starts from roots (global window, call stack variables) and marks reachable objects. Any unmarked/unreachable object is swept and freed.",
        "link": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management"
      }
    ]
  },
  {
    "id": "cat-3-arrays-objects-json",
    "topic": "3. Arrays, Objects, Destructuring & JSON (Videos 14-18)",
    "icon": "📊",
    "description": "Splice vs slice, array spread, Object.freeze, destructuring defaults, and JSON API.",
    "questions": [
      {
        "id": "q3_1",
        "title": "Array Splice vs Slice Mutability",
        "difficulty": "easy",
        "question": "Which method mutates the original array: `arr.slice(1,3)` or `arr.splice(1,3)`?",
        "solution": "`splice(1, 3)` MUTATES the original array by removing elements.\n`slice(1, 3)` returns a new shallow copy WITHOUT modifying original array.",
        "link": "https://www.w3resource.com/javascript-exercises/javascript-array-exercise-24.php"
      },
      {
        "id": "q3_2",
        "title": "Array Deduplication 1-Liner",
        "difficulty": "easy",
        "question": "Write 1 line of code to remove duplicates from `[1, 2, 2, 3, 4, 4]`.",
        "solution": "```js\nconst unique = [...new Set(arr)];\n```",
        "link": "https://www.w3resource.com/javascript-exercises/javascript-array-exercise-14.php"
      },
      {
        "id": "q3_3",
        "title": "Dot Notation vs Bracket Notation",
        "difficulty": "easy",
        "question": "When MUST you use bracket notation (`obj[key]`) over dot notation (`obj.key`)?",
        "solution": "1. When key contains spaces, hyphens, or special characters (`obj[\"full name\"]`).\n2. When key is stored inside a dynamic variable (`const k = \"age\"; obj[k]`).\n3. When key is a Symbol.",
        "link": "https://javascript.info/object"
      },
      {
        "id": "q3_4",
        "title": "Object.freeze() Scope Limit",
        "difficulty": "medium",
        "question": "Does `Object.freeze(user)` prevent modifying nested object property `user.address.city`?",
        "solution": "No! `Object.freeze()` is SHALLOW. It freezes top-level properties only. Nested objects remain mutable unless recursively frozen via `deepFreeze()`.",
        "link": "https://www.w3resource.com/javascript-exercises/javascript-object-exercise-17.php"
      },
      {
        "id": "q3_5",
        "title": "Object Destructuring Alias & Default Value",
        "difficulty": "medium",
        "question": "Destructure `title` as `courseTitle` and `role` with default `'Student'` from `const obj = { title: 'JS' }`.",
        "solution": "```js\nconst { title: courseTitle, role = 'Student' } = obj;\n```",
        "link": "https://javascript.info/destructuring-assignment"
      },
      {
        "id": "q3_6",
        "title": "JSON.stringify Replacer Parameter",
        "difficulty": "medium",
        "question": "How do you exclude property `password` when stringifying `const user = { name: 'A', password: '123' }`?",
        "solution": "Use replacer array: `JSON.stringify(user, ['name'])` or replacer function `(key, val) => key === 'password' ? undefined : val`.",
        "link": "https://javascript.info/json"
      },
      {
        "id": "q3_7",
        "title": "Flat Multidimensional Array",
        "difficulty": "hard",
        "question": "Flatten deeply nested array `[1, [2, [3, [4]]]]` into `[1, 2, 3, 4]`.",
        "solution": "```js\nconst flatArr = arr.flat(Infinity);\n```",
        "link": "https://www.w3resource.com/javascript-exercises/javascript-array-exercise-21.php"
      },
      {
        "id": "q3_8",
        "title": "Array Sort Number Comparator Gotcha",
        "difficulty": "medium",
        "question": "Why does `[10, 5, 20, 2].sort()` produce `[10, 20, 2, 5]`? How do you fix it?",
        "solution": "Default `.sort()` converts items to strings and compares UTF-16 code units. For numbers, pass comparator: `arr.sort((a, b) => a - b)`.",
        "link": "https://www.w3resource.com/javascript-exercises/javascript-array-exercise-7.php"
      },
      {
        "id": "q3_9",
        "title": "Invert Object Keys and Values",
        "difficulty": "hard",
        "question": "Write a function `invert({a: '1', b: '2'})` returning `{'1': 'a', '2': 'b'}`.",
        "solution": "```js\nconst invert = obj => Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]));\n```",
        "link": "https://www.w3resource.com/javascript-exercises/javascript-object-exercise-16.php"
      },
      {
        "id": "q3_10",
        "title": "Two Sum Indices in O(n) Time",
        "difficulty": "hard",
        "question": "Given `nums = [2, 7, 11, 15]` and `target = 9`, return indices `[0, 1]` using Map in 1 pass.",
        "solution": "```js\nfunction twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) return [map.get(diff), i];\n    map.set(nums[i], i);\n  }\n}\n```",
        "link": "https://leetcode.com/problems/two-sum/"
      }
    ]
  },
  {
    "id": "cat-4-functions-scopes-this",
    "topic": "4. Functions, Scopes, Hoisting & `this` Keyword (Videos 19-23)",
    "icon": "⚙️",
    "description": "Function declarations vs expressions, rest params, block scope, hoisting rules, and arrow function `this`.",
    "questions": [
      {
        "id": "q4_1",
        "title": "Function Declaration vs Expression Hoisting",
        "difficulty": "easy",
        "question": "Why can `sayHi()` be called before its definition line while `sayHello()` throws ReferenceError/TypeError?",
        "solution": "Function Declarations (`function sayHi(){}`) hoist both name and body.\nFunction Expressions (`const sayHello = function(){}`) assigned to let/const sit in TDZ before declaration line.",
        "link": "https://javascript.info/function-expressions"
      },
      {
        "id": "q4_2",
        "title": "Rest Parameter vs Arguments Object",
        "difficulty": "easy",
        "question": "Why is `function(...args)` better than using the legacy `arguments` keyword?",
        "solution": "1. `...args` is a true Array supporting map/filter/reduce, while `arguments` is an Array-like object.\n2. `...args` works inside Arrow functions.",
        "link": "https://javascript.info/rest-parameters-spread"
      },
      {
        "id": "q4_3",
        "title": "Arrow Function `this` Lexical Binding",
        "difficulty": "medium",
        "question": "Predict output: `const user = { name: 'A', say: () => console.log(this.name) }; user.say();`",
        "solution": "Prints `undefined` (or global window name). Arrow functions do NOT have their own `this`; they inherit `this` lexically from outer window scope.",
        "link": "https://javascript.info/arrow-functions"
      },
      {
        "id": "q4_4",
        "title": "Default Parameters Evaluation Timing",
        "difficulty": "medium",
        "question": "When are default parameter expressions evaluated in `function foo(x = getDefault())`?",
        "solution": "Default parameter expressions are evaluated AT CALL TIME only when argument is `undefined` (not when argument is `null` or omitted).",
        "link": "https://javascript.info/function-basics"
      },
      {
        "id": "q4_5",
        "title": "Global vs Function vs Block Scope",
        "difficulty": "easy",
        "question": "Where is a variable declared with `let` accessible if declared inside an `if (true) { let x = 10; }` block?",
        "solution": "ONLY inside the `{}` block statement. Accessing `x` outside block throws `ReferenceError: x is not defined`.",
        "link": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/basic-javascript/global-vs--local-scope-in-functions"
      },
      {
        "id": "q4_6",
        "title": "Function Length Property",
        "difficulty": "medium",
        "question": "What is `fn.length` for `function test(a, b = 1, c) {}`?",
        "solution": "`1`! `fn.length` counts the number of expected parameters BEFORE the first default parameter.",
        "link": "https://javascript.info/function-object"
      },
      {
        "id": "q4_7",
        "title": "Method Borrowing with `this`",
        "difficulty": "hard",
        "question": "How do you invoke `user2` with `user1`'s method `printName` using `.call()`?",
        "solution": "```js\nuser1.printName.call(user2, arg1, arg2);\n```",
        "link": "https://javascript.info/object-methods"
      },
      {
        "id": "q4_8",
        "title": "Infinite Currying Sum Function",
        "difficulty": "hard",
        "question": "Write a curried function `sum(1)(2)(3)...()` returning total when invoked empty.",
        "solution": "```js\nfunction sum(a) {\n  return function(b) {\n    if (b !== undefined) return sum(a + b);\n    return a;\n  };\n}\n```",
        "link": "https://javascript.info/currying-partials"
      },
      {
        "id": "q4_9",
        "title": "Function Debounce Implementation",
        "difficulty": "hard",
        "question": "Implement a `debounce(fn, delay)` function to rate-limit search box input callbacks.",
        "solution": "```js\nfunction debounce(fn, delay) {\n  let timer;\n  return function(...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn.apply(this, args), delay);\n  };\n}\n```",
        "link": "https://javascript.info/settimeout-setinterval"
      },
      {
        "id": "q4_10",
        "title": "Chaining Methods returning `this`",
        "difficulty": "hard",
        "question": "How do you make calculator methods `calc.add(5).sub(2).getResult()` chainable?",
        "solution": "Return `this` at the end of each chainable method: `add(n) { this.val += n; return this; }`.",
        "link": "https://www.w3resource.com/javascript-exercises/javascript-object-exercise-8.php"
      }
    ]
  },
  {
    "id": "cat-5-execution-callstack-control",
    "topic": "5. Execution Context, Call Stack & Control Flow (Videos 24-28)",
    "icon": "📜",
    "description": "IIFE, Call Stack, Global Execution Context, Memory Creation Phase, for loops & break/continue.",
    "questions": [
      {
        "id": "q5_1",
        "title": "2 Phases of JavaScript Execution Context",
        "difficulty": "easy",
        "question": "What are the 2 phases V8 goes through when executing a JavaScript script?",
        "solution": "1. **Memory Creation Phase (Parsing):** Allocates memory for variables (`undefined`) and functions.\n2. **Code Execution Phase:** Executes code line-by-line, assigning real values.",
        "link": "https://javascript.info/recursion"
      },
      {
        "id": "q5_2",
        "title": "IIFE Syntax & Primary Use Case",
        "difficulty": "easy",
        "question": "Write an IIFE (Immediately Invoked Function Expression) and explain why it was used.",
        "solution": "```js\n(function() {\n  const secret = \"private\";\n})();\n```\nIIFE creates a private scope to avoid polluting global window namespace.",
        "link": "https://developer.mozilla.org/en-US/docs/Glossary/IIFE"
      },
      {
        "id": "q5_3",
        "title": "Call Stack Overflow (Maximum Call Stack Size Exceeded)",
        "difficulty": "medium",
        "question": "What causes a Stack Overflow error in JavaScript?",
        "solution": "Unbounded recursion without a base exit condition pushes function frames onto the Call Stack until max memory limit is exceeded.",
        "link": "https://www.w3resource.com/javascript-exercises/javascript-recursion-exercise-1.php"
      },
      {
        "id": "q5_4",
        "title": "Break vs Continue in Loops",
        "difficulty": "easy",
        "question": "What is the difference between `break` and `continue` inside a `for` loop?",
        "solution": "`break` terminates the entire loop immediately.\n`continue` skips current iteration and moves to next loop step.",
        "link": "https://javascript.info/while-for"
      },
      {
        "id": "q5_5",
        "title": "Truthy vs Falsy Values Matrix",
        "difficulty": "medium",
        "question": "List all 8 Falsy values in JavaScript.",
        "solution": "`false`, `0`, `-0`, `0n` (BigInt zero), `\"\"` (empty string), `null`, `undefined`, `NaN`.\nEverything else (including `[]` and `{}`) is Truthy!",
        "link": "https://developer.mozilla.org/en-US/docs/Glossary/Falsy"
      },
      {
        "id": "q5_6",
        "title": "Nullish Coalescing (??) vs Logical OR (||)",
        "difficulty": "medium",
        "question": "What does `0 || 'default'` evaluate to vs `0 ?? 'default'`?",
        "solution": "`0 || 'default'` returns `'default'` (because 0 is falsy).\n`0 ?? 'default'` returns `0` (`??` checks ONLY `null` or `undefined`).",
        "link": "https://javascript.info/nullish-coalescing-operator"
      },
      {
        "id": "q5_7",
        "title": "Switch Statement Strict Equality Trap",
        "difficulty": "medium",
        "question": "If `const val = \"5\"`, will `case 5:` trigger in `switch(val)`? Why?",
        "solution": "No! `switch` statements use Strict Equality (`===`). String `\"5\" === Number 5` is `false`.",
        "link": "https://javascript.info/switch"
      },
      {
        "id": "q5_8",
        "title": "FizzBuzz Loop Challenge (Classic)",
        "difficulty": "medium",
        "question": "Write loop 1..20: Print 'Fizz' for multiples of 3, 'Buzz' for 5, 'FizzBuzz' for both.",
        "solution": "```js\nfor (let i = 1; i <= 20; i++) {\n  let out = '';\n  if (i % 3 === 0) out += 'Fizz';\n  if (i % 5 === 0) out += 'Buzz';\n  console.log(out || i);\n}\n```",
        "link": "https://leetcode.com/problems/fizz-buzz/"
      },
      {
        "id": "q5_9",
        "title": "Labeled Loops with Break",
        "difficulty": "hard",
        "question": "How do you break out of a outer nested loop from inside an inner loop in JavaScript?",
        "solution": "Use a Labeled Statement:\n```js\nouterLoop: for (let i=0; i<3; i++) {\n  for (let j=0; j<3; j++) {\n    if (i === 1 && j === 1) break outerLoop;\n  }\n}\n```",
        "link": "https://javascript.info/while-for"
      },
      {
        "id": "q5_10",
        "title": "Tail Call Optimization (TCO)",
        "difficulty": "hard",
        "question": "What is Tail Call Optimization? Why does writing recursive functions in tail position prevent stack overflows in supporting engines?",
        "solution": "When a function returns the direct result of another function call without remaining work, engine reuses current stack frame instead of creating a new one.",
        "link": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions"
      }
    ]
  },
  {
    "id": "cat-6-hofs-filter-map-reduce-dom",
    "topic": "6. Higher-Order Array Iterators (filter/map/reduce) & DOM Selectors (Videos 29-33)",
    "icon": "🔍",
    "description": "for...of vs for...in, map, filter, reduce accumulators, DOM tree nodes, and querySelector.",
    "questions": [
      {
        "id": "q6_1",
        "title": "`for...of` vs `for...in` Loop Difference",
        "difficulty": "easy",
        "question": "What does `for...of` iterate over vs `for...in` on an Array `['a', 'b', 'c']`?",
        "solution": "`for...in` iterates over ARRAY INDICES/KEYS (`\"0\", \"1\", \"2\"`).\n`for...of` iterates over ARRAY VALUES (`\"a\", \"b\", \"c\"`).",
        "link": "https://javascript.info/array-methods"
      },
      {
        "id": "q6_2",
        "title": "Map vs Filter Return Types",
        "difficulty": "easy",
        "question": "What is returned when running `[1, 2, 3].map(n => n > 1)` vs `[1, 2, 3].filter(n => n > 1)`?",
        "solution": "`.map()` returns `[false, true, true]` (transformed boolean for each element).\n`.filter()` returns `[2, 3]` (elements passing condition).",
        "link": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/functional-programming/use-the-map-method-to-extract-data-from-an-array"
      },
      {
        "id": "q6_3",
        "title": "Reduce Accumulator Initial Value",
        "difficulty": "medium",
        "question": "Why MUST you specify initial accumulator `0` or `{}` in `arr.reduce(cb, initialValue)`?",
        "solution": "If omitted, `reduce` uses first array element as initial accumulator and starts at index 1. If array is empty, calling `reduce` without initial value throws TypeError!",
        "link": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce"
      },
      {
        "id": "q6_4",
        "title": "NodeList vs HTMLCollection",
        "difficulty": "easy",
        "question": "What is the key difference between `querySelectorAll` (NodeList) and `getElementsByClassName` (HTMLCollection)?",
        "solution": "`querySelectorAll` returns a static NodeList (supports `.forEach()`). `getElementsByClassName` returns a LIVE HTMLCollection that auto-updates when DOM changes.",
        "link": "https://javascript.info/searching-elements-dom"
      },
      {
        "id": "q6_5",
        "title": "Convert HTMLCollection / NodeList to Array",
        "difficulty": "easy",
        "question": "Write 2 ways to convert `document.getElementsByTagName('p')` into a real Array.",
        "solution": "1. `Array.from(collection)`\n2. `[...collection]`",
        "link": "https://www.w3resource.com/javascript-exercises/dom/javascript-dom-exercise-1.php"
      },
      {
        "id": "q6_6",
        "title": "Chaining Map and Filter",
        "difficulty": "medium",
        "question": "Given `[10, 15, 20, 25]`, double all numbers > 15 using chained `filter` and `map`.",
        "solution": "```js\nconst res = nums.filter(n => n > 15).map(n => n * 2); // [40, 50]\n```",
        "link": "https://javascript.info/array-methods"
      },
      {
        "id": "q6_7",
        "title": "Group Array of Objects by Category with Reduce",
        "difficulty": "hard",
        "question": "Given `items = [{cat:'A', v:1}, {cat:'A', v:2}, {cat:'B', v:3}]`, group by `cat`.",
        "solution": "```js\nconst grouped = items.reduce((acc, item) => {\n  (acc[item.cat] = acc[item.cat] || []).push(item);\n  return acc;\n}, {});\n```",
        "link": "https://www.w3resource.com/javascript-exercises/javascript-array-exercise-27.php"
      },
      {
        "id": "q6_8",
        "title": "createElement vs innerHTML Security",
        "difficulty": "medium",
        "question": "Why is `document.createElement()` + `textContent` safer than assigning untrusted user string to `element.innerHTML`?",
        "solution": "`innerHTML` parses string as HTML, exposing app to Cross-Site Scripting (XSS) attacks if user string contains `<script>` or `<img onerror=...>` tags.",
        "link": "https://javascript.info/modifying-document"
      },
      {
        "id": "q6_9",
        "title": "Implement Custom `myReduce` Prototype",
        "difficulty": "hard",
        "question": "Write a custom `Array.prototype.myReduce` implementation without using built-in `.reduce()`.",
        "solution": "```js\nArray.prototype.myReduce = function(cb, initVal) {\n  let acc = initVal !== undefined ? initVal : this[0];\n  let start = initVal !== undefined ? 0 : 1;\n  for (let i = start; i < this.length; i++) {\n    acc = cb(acc, this[i], i, this);\n  }\n  return acc;\n};\n```",
        "link": "https://javascript.info/array-methods"
      },
      {
        "id": "q6_10",
        "title": "Flatten & Sum Nested Data with Reduce",
        "difficulty": "hard",
        "question": "Given `data = [{score:[10, 20]}, {score:[30, 40]}]`, calculate total sum of all scores.",
        "solution": "```js\nconst total = data.reduce((acc, item) => \n  acc + item.score.reduce((s, v) => s + v, 0), 0);\n```",
        "link": "https://www.w3resource.com/javascript-exercises/javascript-array-exercise-12.php"
      }
    ]
  },
  {
    "id": "cat-7-dom-events-async-basics",
    "topic": "7. DOM Manipulation, Events & Async Fundamentals (Videos 34-38)",
    "icon": "⚡",
    "description": "classList methods, Event Delegation, event.target vs currentTarget, and setTimeout queue.",
    "questions": [
      {
        "id": "q7_1",
        "title": "Event Bubbling vs Capturing Phase",
        "difficulty": "easy",
        "question": "What direction does Event Bubbling propagate? How do you listen in Capturing phase?",
        "solution": "Bubbling propagates UPWARDS from target element to window. To listen in capturing phase, pass `{ capture: true }` as 3rd arg in `addEventListener()`.",
        "link": "https://javascript.info/bubbling-and-capturing"
      },
      {
        "id": "q7_2",
        "title": "Event Delegation Pattern (Interview Favorite)",
        "difficulty": "medium",
        "question": "Why add 1 event listener to parent `<ul id='list'>` instead of adding 100 listeners to `<li>` elements?",
        "solution": "Event Delegation uses bubbling. 1 listener on `<ul>` handles clicks for all current AND dynamically added `<li>` elements, saving memory and DOM setup overhead.",
        "link": "https://javascript.info/event-delegation"
      },
      {
        "id": "q7_3",
        "title": "`target` vs `currentTarget` Difference",
        "difficulty": "medium",
        "question": "In an event listener on `<div id='parent'><button id='btn'>Click</button></div>`, what is `e.target` vs `e.currentTarget` when clicking button?",
        "solution": "`e.target` is the exact element clicked (`<button id='btn'>`).\n`e.currentTarget` is the element holding the listener (`<div id='parent'>`).",
        "link": "https://javascript.info/introduction-browser-events"
      },
      {
        "id": "q7_4",
        "title": "preventDefault() vs stopPropagation()",
        "difficulty": "easy",
        "question": "What is the difference between `e.preventDefault()` and `e.stopPropagation()`?",
        "solution": "`e.preventDefault()` cancels browser default action (e.g. link navigation / form submit).\n`e.stopPropagation()` stops event from bubbling further up the DOM tree.",
        "link": "https://www.w3resource.com/javascript-exercises/dom/javascript-dom-exercise-1.php"
      },
      {
        "id": "q7_5",
        "title": "classList Methods (add/remove/toggle)",
        "difficulty": "easy",
        "question": "Write 1 line of code to toggle class `'active'` on element `el`.",
        "solution": "```js\nel.classList.toggle('active');\n```",
        "link": "https://developer.mozilla.org/en-US/docs/Web/API/Element/classList"
      },
      {
        "id": "q7_6",
        "title": "zero-delay setTimeout Execution Order",
        "difficulty": "medium",
        "question": "Predict output order: `console.log(1); setTimeout(() => console.log(2), 0); console.log(3);`",
        "solution": "Prints `1, 3, 2`.\n`setTimeout` callback is pushed to the Macrotask Queue and runs ONLY AFTER the current synchronous call stack finishes.",
        "link": "https://javascript.info/settimeout-setinterval"
      },
      {
        "id": "q7_7",
        "title": "DocumentFragment Performance Optimization",
        "difficulty": "hard",
        "question": "How do you append 1,000 `<li>` items to `<ul>` without triggering 1,000 DOM reflows?",
        "solution": "```js\nconst fragment = document.createDocumentFragment();\nfor (let i = 0; i < 1000; i++) {\n  const li = document.createElement('li');\n  fragment.appendChild(li);\n}\ndocument.querySelector('ul').appendChild(fragment);\n```",
        "link": "https://javascript.info/modifying-document"
      },
      {
        "id": "q7_8",
        "title": "Form Submit without Page Reload",
        "difficulty": "medium",
        "question": "Write form submit handler extracting inputs as plain JS object.",
        "solution": "```js\nform.addEventListener('submit', (e) => {\n  e.preventDefault();\n  const data = Object.fromEntries(new FormData(e.target));\n  console.log(data);\n});\n```",
        "link": "https://www.w3resource.com/javascript-exercises/dom/javascript-dom-exercise-2.php"
      },
      {
        "id": "q7_9",
        "title": "Throttle Function Implementation",
        "difficulty": "hard",
        "question": "Write a `throttle(fn, limit)` function to rate-limit window scroll event callbacks.",
        "solution": "```js\nfunction throttle(fn, limit) {\n  let inThrottle;\n  return function(...args) {\n    if (!inThrottle) {\n      fn.apply(this, args);\n      inThrottle = true;\n      setTimeout(() => inThrottle = false, limit);\n    }\n  };\n}\n```",
        "link": "https://javascript.info/settimeout-setinterval"
      },
      {
        "id": "q7_10",
        "title": "Intersection Observer Infinite Scroll",
        "difficulty": "hard",
        "question": "How do you detect when a sentinel element at page bottom enters viewport?",
        "solution": "```js\nconst observer = new IntersectionObserver((entries) => {\n  if (entries[0].isIntersecting) loadMoreData();\n});\nobserver.observe(document.getElementById('sentinel'));\n```",
        "link": "https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API"
      }
    ]
  },
  {
    "id": "cat-8-promises-fetch-prototypes",
    "topic": "8. Promises, Fetch API & Prototypal Inheritance (Videos 39-43)",
    "icon": "🌐",
    "description": "V8 Microtask Queue, Promise states, fetch API error handling, async/await, and prototype chain.",
    "questions": [
      {
        "id": "q8_1",
        "title": "Microtask Queue vs Macrotask Queue (Interview Classic)",
        "difficulty": "medium",
        "question": "Predict output order: \n`console.log(1); setTimeout(()=>console.log(2),0); Promise.resolve().then(()=>console.log(3)); console.log(4);`",
        "solution": "Prints `1, 4, 3, 2`.\nSynchronous code (1, 4) executes first. Microtask Promise queue (3) runs before Macrotask setTimeout queue (2).",
        "link": "https://javascript.info/event-loop"
      },
      {
        "id": "q8_2",
        "title": "Promise Immutability State Transition",
        "difficulty": "easy",
        "question": "What happens if a Promise invokes `resolve('A')` followed immediately by `reject('B')`?",
        "solution": "The Promise resolves to `'A'`. Once a Promise state transitions from Pending to Fulfilled or Rejected, it becomes immutable and subsequent calls are ignored.",
        "link": "https://javascript.info/promise-basics"
      },
      {
        "id": "q8_3",
        "title": "Fetch API HTTP Error Handling Trap",
        "difficulty": "medium",
        "question": "Why does `fetch(url)` NOT reject its Promise on HTTP 404 or 500 status codes?",
        "solution": "`fetch()` only rejects on network failures. For 404/500, `fetch()` resolves normally with `response.ok === false`. You must check `if (!response.ok) throw new Error(response.statusText)`.",
        "link": "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch"
      },
      {
        "id": "q8_4",
        "title": "Promise.all vs Promise.allSettled",
        "difficulty": "medium",
        "question": "If 1 of 5 promises rejects, what is the output of `Promise.all()` vs `Promise.allSettled()`?",
        "solution": "`Promise.all()` rejects immediately with the error of first rejected promise.\n`Promise.allSettled()` waits for all promises and returns status array (`fulfilled`/`rejected`) of each.",
        "link": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled"
      },
      {
        "id": "q8_5",
        "title": "Prototype Chain Lookup Mechanism",
        "difficulty": "medium",
        "question": "What happens when you access `obj.toString()` if `toString` is not defined on `obj` directly?",
        "solution": "JS engine searches `obj`'s prototype `Object.getPrototypeOf(obj)`. If not found, it traverses up the chain until `Object.prototype`, and finally `null`.",
        "link": "https://javascript.info/prototype-inheritance"
      },
      {
        "id": "q8_6",
        "title": "Sleep / Delay Async Helper",
        "difficulty": "easy",
        "question": "Write a `sleep(ms)` helper function so you can execute `await sleep(2000)`.",
        "solution": "```js\nconst sleep = ms => new Promise(resolve => setTimeout(resolve, ms));\n```",
        "link": "https://leetcode.com/problems/sleep/"
      },
      {
        "id": "q8_7",
        "title": "Retry Failed API Request with Async/Await",
        "difficulty": "hard",
        "question": "Write `fetchWithRetry(url, retries)` that retries failed requests up to `retries` times.",
        "solution": "```js\nasync function fetchWithRetry(url, retries = 3) {\n  try {\n    return await fetch(url);\n  } catch (err) {\n    if (retries <= 1) throw err;\n    return fetchWithRetry(url, retries - 1);\n  }\n}\n```",
        "link": "https://www.w3resource.com/javascript-exercises/asynchronous/javascript-asynchronous-exercise-6.php"
      },
      {
        "id": "q8_8",
        "title": "Prototypal Method Inheritance (`Object.create`)",
        "difficulty": "hard",
        "question": "Create `child` object inheriting from `parent` object using `Object.create`.",
        "solution": "```js\nconst parent = { greet() { return 'Hi'; } };\nconst child = Object.create(parent);\n```",
        "link": "https://javascript.info/prototype-methods"
      },
      {
        "id": "q8_9",
        "title": "Custom Promise Implementation (Mini)",
        "difficulty": "hard",
        "question": "Write a simplified `MyPromise` class with `.then()` and `resolve()` support.",
        "solution": "Implement state `PENDING/FULFILLED`, `value`, and callbacks array invoked upon resolution.",
        "link": "https://javascript.info/promise-basics"
      },
      {
        "id": "q8_10",
        "title": "Sequential vs Parallel Async Execution",
        "difficulty": "hard",
        "question": "Write parallel fetch for `urls = [a, b, c]` vs sequential fetch using async/await.",
        "solution": "Parallel: `await Promise.all(urls.map(url => fetch(url)))`\nSequential: Use a `for...of` loop with `await fetch(url)` inside.",
        "link": "https://javascript.info/async-await"
      }
    ]
  },
  {
    "id": "cat-9-classes-callbind-descriptors",
    "topic": "9. OOP Classes, Call/Bind & Object Descriptors (Videos 44-48)",
    "icon": "🏗️",
    "description": "call() vs bind(), ES6 class constructors, static methods, property descriptors, getters/setters.",
    "questions": [
      {
        "id": "q9_1",
        "title": "Call vs Apply vs Bind Differences",
        "difficulty": "easy",
        "question": "What is the difference between `fn.call()`, `fn.apply()`, and `fn.bind()`?",
        "solution": "`call(thisArg, arg1, arg2)`: Invokes immediately with comma args.\n`apply(thisArg, [arg1, arg2])`: Invokes immediately with array args.\n`bind(thisArg, arg1)`: Returns a NEW bound function without executing immediately.",
        "link": "https://javascript.info/bind"
      },
      {
        "id": "q9_2",
        "title": "ES6 Class Constructor & Super Call",
        "difficulty": "easy",
        "question": "Why MUST you call `super()` in a derived subclass constructor before accessing `this`?",
        "solution": "In ES6 subclass inheritance, the parent constructor creates `this` object. Calling `super()` invokes parent constructor and initializes `this`.",
        "link": "https://javascript.info/class-inheritance"
      },
      {
        "id": "q9_3",
        "title": "Static Class Methods & Properties",
        "difficulty": "medium",
        "question": "Can static class methods be called on class instances (e.g. `new User().staticMethod()`)?",
        "solution": "No! Static methods belong to the class constructor itself (`User.staticMethod()`), NOT to instantiated instances.",
        "link": "https://javascript.info/static-properties-methods"
      },
      {
        "id": "q9_4",
        "title": "Property Descriptors (writable, enumerable, configurable)",
        "difficulty": "medium",
        "question": "What happens when property has `writable: false` and `configurable: false`?",
        "solution": "Value CANNOT be changed, and property CANNOT be deleted or redefined using `Object.defineProperty()`.",
        "link": "https://javascript.info/property-descriptors"
      },
      {
        "id": "q9_5",
        "title": "Getter/Setter Stack Overflow Trap",
        "difficulty": "medium",
        "question": "Why does `get email() { return this.email; }` cause a Maximum Call Stack Exceeded error?",
        "solution": "Accessing `this.email` inside `email` getter triggers the getter recursively in an infinite loop! Use backing property `this._email` instead.",
        "link": "https://javascript.info/property-accessors"
      },
      {
        "id": "q9_6",
        "title": "Hide Property from `Object.keys()`",
        "difficulty": "medium",
        "question": "How do you make an object property non-enumerable so it doesn't show up in `for...in` or `Object.keys()`?",
        "solution": "```js\nObject.defineProperty(obj, 'secret', {\n  value: '123',\n  enumerable: false\n});\n```",
        "link": "https://javascript.info/property-descriptors"
      },
      {
        "id": "q9_7",
        "title": "Implement Custom `myBind` Prototype",
        "difficulty": "hard",
        "question": "Write a custom `Function.prototype.myBind` without using built-in `.bind()`.",
        "solution": "```js\nFunction.prototype.myBind = function(context, ...outerArgs) {\n  const fn = this;\n  return function(...innerArgs) {\n    return fn.apply(context, [...outerArgs, ...innerArgs]);\n  };\n};\n```",
        "link": "https://javascript.info/bind"
      },
      {
        "id": "q9_8",
        "title": "Private Class Fields (#field)",
        "difficulty": "hard",
        "question": "How do ES2022 Private Class Fields (`#privateVar`) enforce true encapsulation compared to `_privateVar` convention?",
        "solution": "Hard private fields prefixed with `#` cannot be accessed or inspected outside class body. Accessing `#field` outside class throws SyntaxError at parse time.",
        "link": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields"
      },
      {
        "id": "q9_9",
        "title": "Object.getOwnPropertyDescriptor inspection",
        "difficulty": "hard",
        "question": "Inspect why `Math.PI` cannot be overwritten (`Math.PI = 4` fails).",
        "solution": "`Object.getOwnPropertyDescriptor(Math, 'PI')` reveals `{ writable: false, configurable: false }`.",
        "link": "https://javascript.info/property-descriptors"
      },
      {
        "id": "q9_10",
        "title": "Singleton Pattern in JavaScript Classes",
        "difficulty": "hard",
        "question": "Implement a Singleton class in JS that returns the same instance on every `new Database()` call.",
        "solution": "```js\nclass Database {\n  constructor() {\n    if (Database.instance) return Database.instance;\n    Database.instance = this;\n  }\n}\n```",
        "link": "https://javascript.info/class"
      }
    ]
  },
  {
    "id": "cat-10-closures-v8-internals",
    "topic": "10. Advanced Lexical Closures & V8 Internals (PACKED vs HOLEY) (Videos 49 & 51)",
    "icon": "🔬",
    "description": "Lexical Scope, Closures, V8 Array Optimizations (PACKED vs HOLEY), SMI vs DOUBLE elements.",
    "questions": [
      {
        "id": "q10_1",
        "title": "Lexical Scope Definition",
        "difficulty": "easy",
        "question": "What determines variable availability in lexical scope?",
        "solution": "The PHYSICAL LOCATION of code where variable was written in source text (determined at compile/parse time).",
        "link": "https://javascript.info/closure"
      },
      {
        "id": "q10_2",
        "title": "Closure Definition & Memory Retaining",
        "difficulty": "easy",
        "question": "Why does `count` stay alive after `createCounter()` finishes executing?",
        "solution": "Inner function holds reference to outer function's Lexical Environment record. As long as inner function exists, V8 Garbage Collector retains `count` variable in memory.",
        "link": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures"
      },
      {
        "id": "q10_3",
        "title": "Private Variable Counter via Closure",
        "difficulty": "medium",
        "question": "Write a `createCounter()` function with private `count` and methods `increment()` and `getValue()`.",
        "solution": "```js\nfunction createCounter() {\n  let count = 0;\n  return {\n    increment: () => ++count,\n    getValue: () => count\n  };\n}\n```",
        "link": "https://leetcode.com/problems/counter-ii/"
      },
      {
        "id": "q10_4",
        "title": "Closure Loop Index Bug Fix",
        "difficulty": "medium",
        "question": "Fix bug: `for(var i=0; i<3; i++) { setTimeout(()=>console.log(i), 100); }` using closure (WITHOUT changing `var` to `let`).",
        "solution": "```js\nfor(var i=0; i<3; i++) {\n  (function(index) {\n    setTimeout(()=>console.log(index), 100);\n  })(i);\n}\n```",
        "link": "https://javascript.info/closure"
      },
      {
        "id": "q10_5",
        "title": "V8 Element Kinds: PACKED vs HOLEY",
        "difficulty": "medium",
        "question": "What is the difference between a PACKED array and a HOLEY array in V8 engine?",
        "solution": "PACKED: Array has no missing indices (dense contiguous memory, fast access).\nHOLEY: Array contains holes/deleted indices (e.g. `arr[100] = 5`), forcing V8 to perform prototype chain lookups for missing indices.",
        "link": "https://v8.dev/blog/elements-kinds"
      },
      {
        "id": "q10_6",
        "title": "V8 Array Element Transitions (Irreversible)",
        "difficulty": "hard",
        "question": "Can a V8 array transition back from HOLEY to PACKED or from DOUBLE to SMI?",
        "solution": "No! Transitions in V8 Element Kinds are ONE-WAY only (from specific/PACKED to generic/HOLEY). Once degraded, array remains generic.",
        "link": "https://v8.dev/blog/elements-kinds"
      },
      {
        "id": "q10_7",
        "title": "PACKED_SMI vs PACKED_DOUBLE vs PACKED_ELEMENTS",
        "difficulty": "hard",
        "question": "Rank the 3 PACKED element types in V8 from fastest to slowest performance.",
        "solution": "1. `PACKED_SMI` (Small Integers only — fastest)\n2. `PACKED_DOUBLE` (Floating point numbers)\n3. `PACKED_ELEMENTS` (Mixed object/string/number elements — slowest)",
        "link": "https://v8.dev/blog/elements-kinds"
      },
      {
        "id": "q10_8",
        "title": "Function Memoization using Closure",
        "difficulty": "hard",
        "question": "Write a `memoize(fn)` wrapper that caches computed values using closure.",
        "solution": "```js\nfunction memoize(fn) {\n  const cache = {};\n  return function(...args) {\n    const key = JSON.stringify(args);\n    if (key in cache) return cache[key];\n    const res = fn.apply(this, args);\n    cache[key] = res;\n    return res;\n  };\n}\n```",
        "link": "https://javascript.info/closure"
      },
      {
        "id": "q10_9",
        "title": "Delete Operator Performance Impact on V8 Arrays",
        "difficulty": "hard",
        "question": "Why does `delete arr[1]` degrade V8 array performance?",
        "solution": "`delete arr[1]` creates a hole (empty slot) at index 1, permanently downgrading array from PACKED to HOLEY elements kind.",
        "link": "https://v8.dev/blog/elements-kinds"
      },
      {
        "id": "q10_10",
        "title": "Currying with Variable Arguments",
        "difficulty": "hard",
        "question": "Write a generic `curry(fn)` function that transforms any function `fn(a, b, c)` into curried version.",
        "solution": "```js\nfunction curry(fn) {\n  return function curried(...args) {\n    if (args.length >= fn.length) return fn.apply(this, args);\n    return (...nextArgs) => curried.apply(this, [...args, ...nextArgs]);\n  };\n}\n```",
        "link": "https://javascript.info/currying-partials"
      }
    ]
  }
];

fs.writeFileSync(path, JSON.stringify(categories, null, 2));
console.log('Successfully generated 100 high-yield questions grouped into 10 numbered categories mapped to 51 videos!');
