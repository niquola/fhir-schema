# fhir-schema

[![Build Status](https://travis-ci.org/fhir-js/fhir-schema.svg)](https://travis-ci.org/fhir-js/fhir-schema)

[DEMO](http://niquola.github.io/fhir-schema/#/)

Convert FHIR structure definition into JSON schema.

## Requirements

Make sure you have NodeJS and wget installed.

```
brew install wget
```

## Installation

```sh
git clone https://github.com/niquola/fhir-schema
cd fhir-schema
npm install
npm run setup
npm test

# to build schemas into build folder
npm run build
```

## Layout

## TODO:

- refactoring
- support for simple ValueSet
- support for contained & Bundle validation
