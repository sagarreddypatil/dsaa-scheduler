/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("a0jyo4fk7pqvi59")

  // remove
  collection.schema.removeField("dxgr9ush")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "jil6zwyx",
    "name": "status",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "READY",
        "CURRENT",
        "DONE",
        "SLEEP"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("a0jyo4fk7pqvi59")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "dxgr9ush",
    "name": "status",
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
  collection.schema.removeField("jil6zwyx")

  return dao.saveCollection(collection)
})
