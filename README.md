Object-oriented programming framework for Javascript.

[![NPM Version][npm-image]][npm-url]
 
<<<< PLEASE UPGRADE TO THE LATEST VERSION AS OFTEN AS POSSIBLE >>>>

## Features

  -  Classes (not ES6's ones)
  -  Inheritance and Composition
  -  Interfaces (and Mix-ins and Traits)
  -  Class extenders
  -  Method and attribute scopes (public, protected and private)
  -  Base classes and interfaces
  -  Expandable objects (these objects can be extended like a class)
  -  Custom events management
  -  DOM events management
  -  NodeJs events management
  -  Exceptions
  -  Singletons
  -  Polymorphism
  -  Static classes
  -  Useful utility functions
  -  Namespaces and a registry
  -  Compatible with most recent browsers and NodeJs.
  -  Compatible with Windows, Linux and MacOS X (and Android).
  -  Supports browserify and webpack (beta).

## Quick Start

### Browsers (without a bundler)

Download and extract the .zip file from the [latest release][latest-url].

In your HTML file, load UUID and the Doodad package :

```html
	<script src="lib/uuid/uuid.min.js"></script>
	<script src="doodad-js.js"></script>
```

or their debug version :

```html
	<script src="lib/uuid/uuid.js"></script>
	<script src="doodad-js_debug.js"></script>
```

From Javascript, when the scripts are loaded, create the root namespace :

```js
    window.createRoot()
        .then(root => ...)
        .catch(err => {
            console.error(err);
        });
```

You can create a shortcut to the namespaces this way :
```js
    const doodad = root.Doodad,
        types = doodad.Types,
        tools = doodad.Tools,
        mixins = doodad.MixIns,
        interfaces = doodad.Interfaces,
        extenders = doodad.Extenders,
        namespaces = doodad.Namespaces,
        ... ;
```

### Node.js

Download and install Doodad from NPM :

```bash
$ npm install doodad-js --save
```

By default, Doodad is running in production mode, which disables every validations. You may want to activate the development mode by setting the "NODE_ENV" environment variable :

Windows :
```dos
    set NODE_ENV=development
```
Linux/Unix :
```bash
    export NODE_ENV=development
```

Now, from Javascript, create the root namespace :
```js
    require('doodad-js').createRoot()
        .then(root => ...)
        .catch(err => {
            console.error(err);
        });
```

You can create a shortcut to the namespaces this way :
```js
    const doodad = root.Doodad,
        types = doodad.Types,
        tools = doodad.Tools,
        mixins = doodad.MixIns,
        interfaces = doodad.Interfaces,
        extenders = doodad.Extenders,
        namespaces = doodad.Namespaces,
        ... ;
```

### Source code

Doodad must be built using [doodad-js-make][make-url] and its dependencies.

## Scopes

  - **doodad.PUBLIC**: Accessible from the outside.
  - **doodad.PROTECTED**: Accessible from the inside only.
  - **doodad.PRIVATE**: Accessible only from the inside of the prototype. Can't be overriden or replaced.
  - **doodad.PROTECTED_DEBUG**: Like "doodad.PROTECTED", but will be "doodad.PUBLIC" on debug mode.
  - **doodad.PRIVATE_DEBUG**:  Like "doodad.PRIVATE", but will be "doodad.PUBLIC" on debug mode.

## Class Modifiers

  - **doodad.BASE**: The class is not ready for object instantiation and must be extended.
  - **doodad.INTERFACE**: The class defines an Interface. https://en.wikipedia.org/wiki/Protocol_%28object-oriented_programming%29
  - **doodad.MIX_IN**: The class defines a Mix-in. https://en.wikipedia.org/wiki/Mixin
  - **doodad.TRAIT**: The class defines a Trait (currently implemented as "per convention", ie without validation). http://scg.unibe.ch/research/traits
  - **doodad.SEALED**: Objects instantiated from this class are sealed. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/seal
  - **doodad.STATIC**: The class does not allow instantiating.
  - **doodad.ISOLATED**: The class defines an isolated interface. This kind of interface makes the methods separated from the methods of its host class. To get access to them, you must call "getInterface".
  - **doodad.EXPANDABLE**: Instances of the class can be extended with ".extend". NOTE: You need to call ".create" after to apply the new construction.

## Attribute Modifiers :
  
  - **doodad.ATTRIBUTE**: Explicitly defines an attribute. Can be used to specify an extender, and/or extender options.
  - **doodad.OPTIONS**: Defines extender options.
  - **doodad.PRE_EXTEND**: Tells that an attribute must be extended before normal (non pre-extended) attributes.
  - **doodad.TYPE**: Attribute is accessible from its Type (ie class).
  - **doodad.INSTANCE**: Attribute is accessible from an instance of its Type (ie class).
  - **doodad.PERSISTENT**: Attribute is not deleted on destroy.
  - **doodad.READ_ONLY**: Attribute can't be modified.
  - **doodad.ASYNC**: Method will allways returns a Promise.
  - **doodad.METHOD**: Explicitly defines an attribute as a method.
  - **doodad.JS_METHOD**: Defines an attribute as a "pure" Javascript function.
  - **doodad.PROPERTY**: Defines a property (with getter and setter).
  - **doodad.EVENT**: Defines an event attribute.
  - **doodad.ERROR_EVENT**: Defines an error event attribute.
  - (client-side only) **doodad.JS_EVENT**: Defines a DOM event attribute.
  - (server-side only) **doodad.NODE_EVENT**: Defines a Node.Js event attribute.

## Method Modifiers

  - **doodad.MUST_OVERRIDE**: The method must be overriden within another class.
  - **doodad.REPLACE**: The method's functions stack gets deleted and replaced by the new function.
  - **doodad.OVERRIDE**: The new function is appended to the method's functions stack.
  - **doodad.CREATE_REPLACE**: Same as "doodad.REPLACE", but the method will get created if it doesn't exist.
  - **doodad.CREATE_OVERRIDE**: Same as "doodad.OVERRIDE", but the method will get created if it doesn't exist. 
  - **doodad.OBSOLETE**: The method is obsolete and will write a warning on the "console" when called for the first time.
  - **doodad.CALL_FIRST**: Roughly, the function is prepend to the method's functions stack.
  - **doodad.CAN_BE_DESTROYED**: The method can be called even when the object has been destroyed.
  - **doodad.NOT_IMPLEMENTED**: The method exists, but it is not implemented until it will get overriden or replaced.
  - **doodad.RETURNS**: Specifies a validator to the method's returned value.
  - **doodad.SUPER**: For methods defined with "doodad.JS_METHOD", used to override a method.
  - **doodad.BIND**: Binds a method to its object.
  - **doodad.NOT_REENTRANT**: The method must exits before being able to call it again.
  - **doodad.EXTERNAL**: The method can't be called from inside the object.
  - **doodad.AFTER**: When combined with "doodad.OVERRIDE", the function will get inserted in the stack after the function of the specified class.
  - **doodad.BEFORE**: When combined with "doodad.OVERRIDE", the function will get inserted in the stack before the function of the specified class. 
  - **doodad.RENAME_OVERRIDE**: Like "doodad.OVERRIDE", but also renames the method. To be used when implementing a Trait.
  - **doodad.RENAME_REPLACE**: Like "doodad.REPLACE", but also renames the method. To be used when implementing a Trait.

## Available extenders

  - **extenders.Attribute**: (inherits 'extenders.Extender') Extends an attribute with a new value.
  - **extenders.Null**: (inherits 'extenders.Attribute') Extends an attribute with 'null'.
  - **extenders.ClonedAttribute**: (inherits 'extenders.Attribute') When an object gets instantiated, the attribute's value is cloned.
  - **extenders.ExtendObject**: (inherits 'extenders.ClonedAttribute') When overriden, the attribute's object value will get extended instead of replaced.
  - **extenders.UniqueArray**: (inherits 'extenders.ClonedAttribute') When overriden, the attribute's array value will get appended instead of replaced. Duplicates are removed.
  - **extenders.Method**: (inherits 'extenders.ClonedAttribute') Extends a method.
  - **extenders.JsMethod**: (inherits 'extenders.Method') Extends a Javascript method.
  - **extenders.Property**: (inherits 'extenders.Method') Extends a property.
  - **extenders.Event**: (inherits 'extenders.Method') Extends an event attribute.
  - (client-side only) **extenders.JsEvent**: (inherits 'extenders.Event') Extends a DOM event attribute.
  - (server-side only) **extenders.NodeEvent**: (inherits 'extenders.Event') Extends a Node.Js event attribute.

## Pre-built Interfaces and Mix-Ins

  - **interfaces.Clonable**: (interface) Makes a class clonable.
  - **interfaces.Serializable**: (interface) Makes a class serializable and desializable.
  - **mixins.Creatable**: (mix-in) Makes a class creatable.
  - **mixins.Translatable**: (mix-in) Makes a localized class object.
  - **mixins.Configurable**: (mix-in) Makes a configurable class object.
  - **mixins.Events**: (mix-in) Makes a class with events.
  - (client-side only) **mixins.JsEvents**: (mix-in) Makes a class with managed Javascript events.
  - (server-side only) **mixins.NodeEvents**: (mix-in) Makes a class with managed NodeJs events.
  
## Pre-built Types

  - **types.Type**: The base of every types.
  - **types.CustomEvent**: (inherits 'types.Type') Custom event type for custom event targets.
  - **types.CustomEventTarget**: (inherits 'types.Type') Custom event targets.
  - **types.Namespace**: (inherits 'types.CustomEventTarget') Namespace object.

## Pre-built Errors

  - **types.TypeError**: (inherits 'global.TypeError') Raised on invalid value type.
  - **types.Error**: (inherits 'global.Error') Generic error with message formatting.
  - **types.AssertionError**: (inherits 'types.Error') Raised when an assertion fail.
  - **types.ParseError**: (inherits 'types.Error') Raised on parse error.
  - **types.NotSupported**: (inherits 'types.Error') Raised when something is not supported.
  - **types.NotAvailable**: (inherits 'types.Error') Raised when something is not available.
  - **types.HttpError**: (inherits 'types.Error') Raised on HTTP error.
  - **types.BufferOverflow**: (inherits 'types.Error') Raised on buffer overflow.
  - **types.TimeoutError**: (inherits 'types.Error') Raised on timeout.
  - **types.CanceledError**: (inherits 'types.Error') Raised when an operation has been canceled.
  - **types.AccessDenied**: (inherits 'types.Error') Raised on access denied or not allowed operations.
  
## Pre-built Classes

  - **doodad.Class**: (inherits 'types.Type') The base of every classes.
  - **doodad.Object**: (inherits 'doodad.Class', implements 'mixins.Creatable') The base of every object classes.

## Pre-built Exceptions
  
  - **doodad.Application**: (inherits 'doodad.Error') Application error. An error with a title to be displayed to the end user. Exemple: "This customer is not allowed to buy this product."
  
## Namespaces

  - **namespaces.Entries.Namespace**: (inherits 'types.Type') Namespace registry entry.
  - **namespaces.Entries.Package**: (inherits 'namespaces.Entries.Namespace') Package registry entry.
  - **namespaces.Entries.Module**: (inherits 'namespaces.Entries.Namespace') Module registry entry.
  - **namespaces.Entries.Application**: (inherits 'namespaces.Entries.Namespace') Application registry entry.
  - **namespaces.get**: Returns the namespace object of the specified namespace from the registry.
  - **namespaces.load**: Load modules and get them ready to be used. Usage: namespaces.load(modules, /*optional*/options, /*optional*/callback)
  - **[namespace].REGISTER**: Registers a class in the namespace object.
  - **[namespace].UNREGISTER**: Unregisters a class from the namespace object.

## More documentation

Incomming... In the meantime, you can browse the source files and look at the "DD_DOC" headers.
  
## Examples

Example 1 (inheritance):
```js
    const Turtle1 = types.INIT(doodad.Object.$extend({
        $TYPE_NAME: 'Turtle1',

        talk: doodad.PUBLIC(function() {
            return "Hi !";
        }),
    }));

    let turtle = new Turtle1();

    turtle.talk();

    const Turtle2 = types.INIT(Turtle1.$extend({
        $TYPE_NAME: 'Turtle2',

        talk: doodad.OVERRIDE(function() {
            return this._super() + " dOOOOdad";
        }),
    }));

    turtle = new Turtle2();

    console.log(turtle.talk());
```

Example 2 (interfaces):
```js
    const Turtles = types.INIT(doodad.INTERFACE(doodad.Class.$extend({
        $TYPE_NAME: 'Turtles',

        talk: doodad.PUBLIC(doodad.METHOD()),
    })));

    const Turtle1 = types.INIT(doodad.Object.$extend(
                Turtles, // Implements "Turtles"
    {
        $TYPE_NAME: 'Turtle1',

        talk: doodad.OVERRIDE(function() {
            return "Hi";
        }),
    }));

    const Turtle2 = types.INIT(doodad.Object.$extend(
                Turtles, // Implements "Turtles"
    {
        $TYPE_NAME: 'Turtle2',

        talk: doodad.OVERRIDE(function() {
            return "Bonjour";
        }),
    }));

    console.log(types._implements(Turtle1, Turtles) && types._implements(Turtle2, Turtles));
```

Example 3 (mix-ins) :
```js
    const Turtles = types.INIT(doodad.MIX_IN(doodad.Class.$extend({
        $TYPE_NAME: 'Turtles',

        talk: doodad.PUBLIC(function() {
            return "Hi";
        }),
    })));

    const Turtle1 = types.INIT(doodad.Object.$extend(
                Turtles, // Composes "Turtles"
    {
        $TYPE_NAME: 'Turtle1',
    }));
    
    console.log(types._implements(Turtle1, Turtles));
```

Example 4 (traits) :
```js
    const TAnimals = types.INIT(doodad.TRAIT(doodad.Class.$extend({
        $TYPE_NAME: 'TAnimals',

        talk: doodad.PUBLIC(function() {
            return this.getPhrase();
        }),
        
        getPhrase: doodad.PROTECTED(doodad.MUST_OVERRIDE()),
    })));

    const Turtle = types.INIT(doodad.Object.$extend(
                TAnimals, // Composes "TAnimals"
    {
        $TYPE_NAME: 'Turtles',

        phrase: doodad.PUBLIC(null),
        
        create: doodad.OVERRIDE(function(phrase) {
			this._super();
            this.phrase = phrase;
        }),
        
        talk: doodad.RENAME_OVERRIDE(function slowTalk() {
            return this._super().split('').join('...');
        }),

        getPhrase: doodad.OVERRIDE(function() {
            return this.phrase;
        }),
    }));

    const turtle = new Turtle("Hi !");

    console.log(turtle.talk());
    console.log(turtle.slowTalk());
```

Example 5 (expandable objects) :
```js
    const IAnimal = types.INIT(doodad.INTERFACE(doodad.Class.$extend({
        $TYPE_NAME: 'IAnimal',

        makeNoise: doodad.MUST_OVERRIDE(),
    })));

    const perrot = new doodad.Object();

    perrot.extend(
            IAnimal, // Implements "IAnimal"
        {
            phrase: null,
            create: doodad.OVERRIDE(function(phrase) {
                this._super();
                this.phrase = phrase;
            }),
            makeNoise: doodad.OVERRIDE(function() {
                return this.phrase;
            }),
       })
       .create("Hello world !");

    console.log(perrot.makeNoise());
```

## Future

Maybe I'll try to write a Babel plugin to get something like the following :

```js
    @interface
    class Turtles {
        @returns(types.isString)
        talk()
    }

    class SmallTurtle implements Turtles {
        @override
        talk() {
            return "hi";
        }
    }

    class GiantTurtle implements Turtles {
        @override
        talk() {
            return "HI";
        }
    }
```

But I have to wait on what will be feasible after current proposals like "decorators", "public fields" and "private fields".

## Other available packages

  - **doodad-js**: Object-oriented programming framework (release)
  - **doodad-js-cluster**: Cluster manager (alpha)
  - **doodad-js-dates**: Dates formatting (release)
  - **doodad-js-http**: Http server (alpha)
  - **doodad-js-http_jsonrpc**: JSON-RPC over http server (alpha)
  - **doodad-js-io**: I/O module (alpha)
  - **doodad-js-ipc**: IPC/RPC server (alpha)
  - **doodad-js-json**: JSON parser (alpha)
  - **doodad-js-loader**: Scripts loader (beta)
  - **doodad-js-locale**: Locales (release)
  - **doodad-js-make**: Make tools for doodad (alpha)
  - **doodad-js-mime**: Mime types (beta)
  - **doodad-js-minifiers**: Javascript minifier used by doodad (alpha)
  - **doodad-js-safeeval**: SafeEval (beta)
  - **doodad-js-server**: Servers base module (alpha)
  - **doodad-js-templates**: HTML page templates (alpha)
  - **doodad-js-terminal**: Terminal (alpha)
  - **doodad-js-test**: Test application
  - **doodad-js-unicode**: Unicode Tools (alpha)
  - **doodad-js-widgets**: Widgets base module (alpha)
  - **doodad-js-xml**: XML Parser (release)
  
## License

  [Apache-2.0][license-url]

[npm-image]: https://img.shields.io/npm/v/doodad-js.svg
[npm-url]: https://npmjs.org/package/doodad-js
[license-url]: http://opensource.org/licenses/Apache-2.0
[latest-url]: https://github.com/doodadjs/doodad-js/releases/latest
[make-url]: https://npmjs.org/package/doodad-js-make