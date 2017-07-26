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
