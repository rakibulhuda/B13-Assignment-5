
## 1. What is the difference between var, let, and const?

**var** is the old way of declaring variables in JavaScript. It has function scope and can be redeclared and updated. It also has hoisting issues which can cause bugs.

**let** is the modern way to declare variables that can change. It has block scope, meaning it only exists within the curly braces where it's declared. You can update it but not redeclare it in the same scope.

**const** is used for variables that shouldn't be reassigned. Like let, it has block scope. However, for objects and arrays, you can still modify their contents, you just can't reassign the entire variable.

**Example:**
```javascript
const age = 25; 
age = 26; // Error

const person = {name: "John"}; 
person.name = "Jane"; // Works fine
```

---

## 2. What is the spread operator (...)?

The spread operator (...) is used to expand or spread elements from arrays or objects.

**For arrays** - copy arrays or combine them:
```javascript
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5]; // [1, 2, 3, 4, 5]
```

**For objects** - copy properties:
```javascript
const person = {name: "John", age: 25};
const newPerson = {...person, city: "NYC"};
```

It's also useful in function arguments to pass array elements as separate parameters.

---

## 3. What is the difference between map(), filter(), and forEach()?

### forEach()
Loops through an array and executes a function for each element. Does not return anything, just performs an action.
```javascript
arr.forEach(item => console.log(item));
```

### map()
Creates a new array by transforming each element. Returns a new array with modified values.
```javascript
const doubled = [1, 2, 3].map(num => num * 2); // [2, 4, 6]
```

### filter()
Creates a new array with only elements that pass a test condition. Returns a filtered array.
```javascript
const evens = [1, 2, 3, 4].filter(num => num % 2 === 0); // [2, 4]
```

**Summary:** forEach() executes code, map() transforms data, filter() selects data.

---

## 4. What is an arrow function?

Arrow functions are a shorter syntax for writing functions in JavaScript, introduced in ES6. They use the `=>` syntax.

**Regular function:**
```javascript
function add(a, b) {
    return a + b;
}
```

**Arrow function:**
```javascript
const add = (a, b) => a + b;
```

**Key features:**
- Concise syntax
- Lexical `this` binding (does not have its own `this` context)
- Parentheses optional for single parameters
- Implicit return for single expressions

---

## 5. What are template literals?

Template literals are a way to work with strings using backticks (`) instead of quotes. They allow you to embed variables and expressions directly into strings using `${}`.

**Basic usage:**
```javascript
const name = "John";
const age = 25;
const message = `My name is ${name} and I am ${age} years old`;
```

**Multi-line strings:**
```javascript
const text = `This is line one
This is line two`;
```

**Expression interpolation:**
```javascript
const result = `2 + 2 = ${2 + 2}`; // "2 + 2 = 4"
```

Template literals provide cleaner string concatenation compared to the traditional `+` operator approach.
