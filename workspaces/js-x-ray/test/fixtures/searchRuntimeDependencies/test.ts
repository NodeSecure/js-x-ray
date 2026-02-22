interface Foo {
  bar: string;
}

export function test() {
  const foo: Foo = { bar: "baz" };
  console.log(foo);
}
