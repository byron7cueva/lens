const autoBind = require("auto-bind");

class Foo {
  myField = 1;

  constructor() {
    autoBind(this);
  }

  inFoo() {
    return this.myField.toString();
  }
}

class SubFoo {
  mySubFooField = 2;

  inSubFoo() {
    return this.mySubFooField.toString();
  }
}

const x = new SubFoo()
const method = x.inSubFoo
console.log(method());
