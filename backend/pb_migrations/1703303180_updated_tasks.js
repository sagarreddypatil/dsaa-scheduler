/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("bbixn3qtwz4o7u9")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "pbzp3jjs",
    "name": "status",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "DONE",
        "READY",
        "SLEEP",
        "CURRENT"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("bbixn3qtwz4o7u9")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "pbzp3jjs",
    "name": "status",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "DONE.READY",
        "SLEEP",
        "CURRENT"
      ]
    }
  }))

  return dao.saveCollection(collection)
})
