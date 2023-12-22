/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("bbixn3qtwz4o7u9")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "cqsobju6",
    "name": "color",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": "^#(?:[0-9a-fA-F]{3}){1,2}$"
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("bbixn3qtwz4o7u9")

  // remove
  collection.schema.removeField("cqsobju6")

  return dao.saveCollection(collection)
})
