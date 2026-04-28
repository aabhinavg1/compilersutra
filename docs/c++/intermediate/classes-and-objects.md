---
title: Classes and Objects in C++ - Complete OOP Foundation Guide
description: Learn classes and objects in C++ from first principles. Understand user-defined types, member variables, member functions, encapsulation, access specifiers, object creation, and class design with practical examples.
keywords:
  - classes and objects in c++
  - class in c++
  - object in c++
  - user defined types in c++
  - encapsulation in c++
  - member functions in c++
tags:
  - C++
  - Classes
  - Objects
  - OOP
  - Encapsulation
---

import AdBanner from '@site/src/components/AdBanner';

# Classes and Objects in C++

If you have only written small programs so far, classes can look like extra syntax around variables and functions.

They are not.

Classes solve a real design problem:

> how do you keep related data and related behavior together in one clear unit?

Without classes, programs often become a mix of:

- loose variables
- loosely related functions
- unclear ownership
- weak control over valid state

Classes give you a way to define your own types around real concepts in your program.

<div
  style={{
    width: '100%',
    maxWidth: '900px',
    margin: '1rem auto',
  }}
>
  <iframe
    src="https://docs.google.com/forms/d/e/1FAIpQLSebP1JfLFDp0ckTxOhODKPNVeI1e21rUqMJ0fbBwJoaa-i4Yw/viewform?embedded=true"
    style={{
      width: '100%',
      minHeight: '620px',
      border: '0',
      borderRadius: '12px',
      background: '#fff',
    }}
    loading="lazy"
  >
    Loading…
  </iframe>
</div>

Once you move beyond very small programs, you need a way to model concepts that belong to your problem domain.

For example:

- a bank account
- a build configuration
- a compiler pass
- a file reader
- a game player
- a network connection

Built-in types like `int`, `double`, and `char` are not enough for that. C++ solves this with **classes**.

Classes let you define your own types. Objects are the actual instances of those types.

This is a major transition in C++ learning:

> moving from using built-in types to designing your own abstractions

## What You Should Leave With

By the end of this page, you should be comfortable with:

- what a class is
- what an object is
- how member variables and functions work
- why `private` data is often a better default
- how classes help you protect valid state

<div>
  <AdBanner />
</div>

## Table of Contents

1. [What is a class in C++?](#what-is-a-class-in-c)
2. [What is an object?](#what-is-an-object)
3. [Basic class syntax](#basic-class-syntax)
4. [Member variables and member functions](#member-variables-and-member-functions)
5. [Access specifiers](#access-specifiers)
6. [Encapsulation](#encapsulation)
7. [Creating and using objects](#creating-and-using-objects)
8. [this pointer basics](#this-pointer-basics)
9. [Class vs struct](#class-vs-struct)
10. [Good class design](#good-class-design)
11. [Common mistakes](#common-mistakes)
12. [FAQ](#faq)

## What is a Class in C++?

A class is a user-defined type that groups related:

- data
- behavior
- access rules

In simple terms, a class is a blueprint for creating objects.

Example:

```cpp
class Student {
public:
    std::string name;
    int age;
};
```

This class defines what a `Student` object contains:

- a `name`
- an `age`

But the class itself is only the definition. It is not yet a real student object in memory.

## What is an Object?

An object is an actual instance of a class.

```cpp
Student s1;
s1.name = "Abhinav";
s1.age = 24;
```

Now `s1` is a real object created from the `Student` blueprint.

You can create many objects from one class:

```cpp
Student s1;
Student s2;
Student s3;
```

Each object has its own state.

That point matters:

- `s1.name` and `s2.name` can be different
- `s1.age` and `s3.age` can be different

The class definition is shared.
The object data is not.

## Basic Class Syntax

Here is a slightly more useful example:

```cpp
#include <iostream>
#include <string>

class Student {
public:
    std::string name;
    int age;

    void print() {
        std::cout << "Name: " << name << ", Age: " << age << '\n';
    }
};
```

This class contains:

- data members: `name`, `age`
- a member function: `print()`

## Member Variables and Member Functions

### Member variables

These are the data stored inside the class.

```cpp
std::string name;
int age;
```

### Member functions

These are functions associated with the class.

```cpp
void print() {
    std::cout << name << '\n';
}
```

They usually operate on the object’s own data.

That is why calling `print()` on one object prints that object's data, not every object's data.

This is the core idea of object-oriented design:

- data and behavior belong together

## Access Specifiers

C++ classes support access control.

The main access specifiers are:

- `public`
- `private`
- `protected`

### public

Members are accessible from outside the class.

### private

Members are only accessible inside the class itself.

### protected

Members are accessible inside the class and derived classes.

Example:

```cpp
class BankAccount {
private:
    double balance;

public:
    void deposit(double amount) {
        balance += amount;
    }

    double get_balance() {
        return balance;
    }
};
```

This is better than making `balance` public, because outside code cannot modify it arbitrarily.

## Encapsulation

Encapsulation means hiding internal details and exposing only the operations that make sense.

This is one of the most important reasons classes exist.

Encapsulation is not only about hiding things.
It is about protecting correctness.

Bad design:

```cpp
class Account {
public:
    double balance;
};
```

Now anyone can do:

```cpp
account.balance = -999999;
```

That might violate your program’s rules.

Better design:

```cpp
class Account {
private:
    double balance = 0.0;

public:
    void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
        }
    }

    double get_balance() const {
        return balance;
    }
};
```

Now the class controls its own valid state.

This is the practical value of classes.

## Creating and Using Objects

Example:

```cpp
class Book {
public:
    std::string title;
    int pages;
};

int main() {
    Book cpp_book;
    cpp_book.title = "Modern C++";
    cpp_book.pages = 450;
}
```

Accessing members uses the dot operator:

```cpp
cpp_book.title
cpp_book.pages
```

## A More Practical Class Example

```cpp
#include <iostream>
#include <string>

class BuildConfig {
private:
    std::string compiler_;
    int opt_level_;

public:
    void set_compiler(const std::string& compiler) {
        compiler_ = compiler;
    }

    void set_optimization_level(int level) {
        if (level >= 0 && level <= 3) {
            opt_level_ = level;
        }
    }

    void print() const {
        std::cout << "Compiler: " << compiler_ << ", O" << opt_level_ << '\n';
    }
};

int main() {
    BuildConfig cfg;
    cfg.set_compiler("clang++");
    cfg.set_optimization_level(3);
    cfg.print();
}
```

This is much closer to how classes are used in real software:

- data hidden behind a clean interface
- rules enforced through methods
- state represented in one place

## this Pointer Basics

Inside a non-static member function, C++ provides access to the current object through `this`.

Example:

```cpp
class Counter {
private:
    int value_ = 0;

public:
    void increment() {
        this->value_++;
    }
};
```

You often do not need to write `this->` explicitly in simple code, but it is useful to know that member functions work on a specific object instance.

## Class vs struct

In C++, `class` and `struct` are almost the same.

The main default difference is:

- `class` members are private by default
- `struct` members are public by default

Example:

```cpp
struct Point {
    int x;
    int y;
};
```

This is often fine for simple data-only types.

Use `class` when you want stronger encapsulation by default.

## Good Class Design

A good class usually:

- represents one meaningful concept
- keeps related data and behavior together
- hides internal details
- exposes a small and clear interface
- preserves valid state

A bad class often:

- exposes everything publicly
- mixes unrelated responsibilities
- becomes a dumping ground for random functions
- has vague names like `Manager`, `Helper`, or `Processor` with no clear meaning

## Common Mistakes

### 1. Making everything public

This removes most of the value of classes.

### 2. Treating classes as just fancy variable containers

Classes are not only about storing fields. They also define behavior and invariants.

### 3. Creating giant “god classes”

If one class tries to do too many unrelated things, the design becomes hard to maintain.

### 4. Ignoring const correctness

Read-only member functions should often be marked `const`.

Example:

```cpp
double get_balance() const;
```

## Best Practices

- keep classes focused
- make internal state private unless there is a strong reason not to
- expose behavior through meaningful methods
- name classes after real concepts
- maintain invariants inside the class, not outside it

## Summary

Classes and objects are the foundation of abstraction in C++.

They let you move from:

- raw variables
- loose functions
- scattered logic

to:

- meaningful types
- controlled state
- reusable interfaces

If functions organize behavior, classes organize systems.

## FAQ

### What is the difference between a class and an object?

A class is a blueprint. An object is an actual instance created from that blueprint.

### Should all data members be private?

Not always, but private by default is a strong and safe design habit.

### Are classes only for OOP?

No. In C++, classes are also a general abstraction tool for resource wrappers, utilities, generic types, containers, and systems code.
