stowit
======
Stowit is a Node.js web service that will store and retrive JSON docs.

At this time it is really just a simple Node wrapper around MongoDB storage.

The goals are: Simple reliable and can be modified to do smarter tricks easily.

CORS makes it availible from other domains.

Usage:

    GET http://domain:port/?finder={"some_prop":{"$eq":"some_value"}}&size=10

    POST http://domain:port/  ...with data... envelope={"intent":"insert", "content":{"some_prop":"some_value"}}

It is not exatly RESTful
