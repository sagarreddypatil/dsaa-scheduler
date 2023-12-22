/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("a0jyo4fk7pqvi59")

  collection.listRule = "@request.auth.id != \"\" && task.user = @request.auth.id"
  collection.viewRule = "@request.auth.id != \"\" && task.user = @request.auth.id"
  collection.createRule = "@request.auth.id != \"\" && task.user = @request.auth.id"
  collection.updateRule = "@request.auth.id != \"\" && task.user = @request.auth.id"
  collection.deleteRule = "@request.auth.id != \"\" && task.user = @request.auth.id"

  // remove
  collection.schema.removeField("acrrj3yk")

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("a0jyo4fk7pqvi59")

  collection.listRule = "@request.auth.id != \"\" && user = @request.auth.id"
  collection.viewRule = "@request.auth.id != \"\" && user = @request.auth.id"
  collection.createRule = "@request.auth.id != \"\" && user = @request.auth.id"
  collection.updateRule = "@request.auth.id != \"\" && user = @request.auth.id"
  collection.deleteRule = "@request.auth.id != \"\" && user = @request.auth.id"

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "acrrj3yk",
    "name": "user",
    "type": "relation",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "_pb_users_auth_",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
})
