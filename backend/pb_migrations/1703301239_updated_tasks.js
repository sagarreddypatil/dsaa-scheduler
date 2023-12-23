/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("bbixn3qtwz4o7u9")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "8ami5toh",
    "name": "timestamp",
    "type": "date",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": "",
      "max": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("bbixn3qtwz4o7u9")

  // remove
  collection.schema.removeField("8ami5toh")

  return dao.saveCollection(collection)
})
