function greet(name) {
  const message = {
    text: "Hello, " + name,
    timestamp: Date.now()
  // missing closing brace for object

  return message;
  }

  const result = greet("Bob");
  console.log(result.text);

