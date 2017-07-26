# javascript-classes-protected-private
Thanks to Benvie , for creating javaScript classes with private, protected, and super.
JavaScript Classes with private, protected, and super

July 25, 2012

An example of the versatility of Maps/WeakMaps. Private instance storage of provided using WeakMaps and wrapping each class in a scope. Even better, this private state can be shared even among inheriting classes. Wrapping each class in a scope also allows the creation of a correctly functioning super keyword-like function that doesn't run into the infinite loop issue.

var call = Function.prototype.call;

var classes = createStorage(),
    namespaces = createStorage(function(){ return new Namespace }),
    instances = createStorage(createStorage);

function Namespace(){}

function createStorage(creator){
  var storage = new WeakMap;
  creator = typeof creator === 'function' ? creator : Object.create.bind(null, null, {});
  return function store(o, v){
    if (v) {
      storage.set(o, v);
    } else {
      v = storage.get(o);
      if (!v) {
        storage.set(o, v = creator(o));
      }
    }
    return v;
  };
}

function Type(){
  var self = function(){}
  self.__proto__ = Type.prototype;
  return self;
}

Type.prototype = Object.create(Function, {
  constructor: { value: Type,
                 writable: true,
                 configurable: true },
  subclass: { value: function subclass(scope){ return new Class(this, scope) },
              configurable: true,
              writable: true }
});

function Class(Super, scope){
  if (!scope) {
    scope = Super;
    Super = new Type;
  }

  if (typeof Super !== 'function') {
    throw new TypeError('Superconstructor must be a function');
  } else if (typeof scope !== 'function') {
    throw new TypeError('A scope function was not provided');
  }

  this.super = Super;
  this.scope = scope;

  return this.instantiate();
}

Class.unwrap = function unwrap(Ctor){
  return classes(Ctor);
};

Class.prototype.instantiate = function instantiate(){
  function super_(){
    var name = super_.caller === Ctor ? 'constructor' : super_.caller.name;
    var method = Super.prototype[name];

    if (typeof method !== 'function') {
      throw new Error('Attempted to call non-existent supermethod');
    }

    return call.apply(method, arguments);
  }

  var Super = this.super,
      namespace = namespaces(Super),
      protected = instances(namespace),
      private = createStorage();

  var Ctor = this.scope.call(namespace, protected, private, super_);
  Ctor.__proto__ = Super;
  Ctor.prototype.__proto__ = Super.prototype;
  namespaces(Ctor, namespace);
  classes(Ctor, this);
  return Ctor;
}
Example Usage

Inside the scope:

this is the namespace, a protected static storage area

_ is protected instance storage, accessible to inherited instances

__ is private instance storage, accessible to instances of that specifi class

super_ calls the supermethod

var Primary = new Class(function(_, _, super){ var namespace = this; namespace.instances = 0;

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

var Derived = Primary.subclass(function(_, _, super){

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

var Bob = new Derived('Bob', 'is dumb', 20); Bob.logSecret(); console.log(Bob); console.log(Bob.exposeSecret());
