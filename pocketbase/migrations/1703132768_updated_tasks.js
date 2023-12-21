/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("bbixn3qtwz4o7u9")

  // remove
  collection.schema.removeField("xxyxwn12")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "0cwcae4n",
    "name": "priority",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "noDecimal": false
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("bbixn3qtwz4o7u9")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "xxyxwn12",
    "name": "priority",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  // remove
  collection.schema.removeField("0cwcae4n")

  return dao.saveCollection(collection)
})
