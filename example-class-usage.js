// Inside the scope:
// * this is the namespace, a protected static storage area
// * _ is protected instance storage, accessible to inherited instances
// * __ is private instance storage, accessible to instances of that specifi class
// * super_ calls the supermethod

var Primary = new Class(function(_, __, super_){
  var namespace = this;
  namespace.instances = 0;

  function Primary(name, secret){
    this.name = name;
    _(this).secret = secret;
    namespace.instances++;
  }

  Primary.prototype.logSecret = function logSecret(label){
    label = label || 'secret';
    console.log(label + ': ' + _(this).secret);
  }

  return Primary;
});


var Derived = Primary.subclass(function(_, __, super_){

  function Derived(name, secret, size){
    super_(this, name, secret);
    this.size = size;
  }

  Derived.prototype.logSecret = function logSecret(){
    super_(this, 'derived secret');
  }

  Derived.prototype.exposeSecret = function exposeSecret(){
    return _(this).secret;
  }

  return Derived;
});

var Bob = new Derived('Bob', 'is dumb', 20);
Bob.logSecret();
console.log(Bob);
console.log(Bob.exposeSecret());
