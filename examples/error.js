"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnyItem = exports.Item = void 0;
const converter_1 = require("./aws/converter");
const internal_1 = require("./aws/ddb/internal");
const utils_1 = require("./utils");
const Error_1 = require("./Error");
const Internal_1 = require("./Internal");
const { internalProperties } = Internal_1.default.General;
const dynamooseUndefined = Internal_1.default.Public.undefined;
const dynamooseAny = Internal_1.default.Public.any;
const Populate_1 = require("./Populate");
const InternalPropertiesClass_1 = require("./InternalPropertiesClass");
const Error_2 = require("./Error");
// Item represents an item in a Model that is either pending (not saved) or saved
class Item extends InternalPropertiesClass_1.InternalPropertiesClass {
    /**
     * Create a new item.
     * @param model Internal property. Not used publicly.
     * @param object The object for the item.
     * @param settings The settings for the item.
     */
    constructor(model, object, settings) {
        super();
        const itemObject = Item.isDynamoObject(object) ? Item.fromDynamo(object) : object;
        Object.keys(itemObject).forEach((key) => this[key] = itemObject[key]);
        this.setInternalProperties(internalProperties, {
            "originalObject": utils_1.default.deep_copy(itemObject),
            "originalSettings": Object.assign({}, settings),
            model,
            "storedInDynamo": settings.type === "fromDynamo"
        });
    }
    static objectToDynamo(object, settings = { "type": "object" }) {
        if (object === undefined) {
            return undefined;
        }
        const options = settings.type === "value" ? undefined : { "removeUndefinedValues": true };
        return (settings.type === "value" ? (0, converter_1.default)().convertToAttr : (0, converter_1.default)().marshall)(object, options);
    }
    static fromDynamo(object) {
        const result = (0, converter_1.default)().unmarshall(object);
        utils_1.default.object.entries(result).forEach(([key, value]) => {
            if (value instanceof Uint8Array) {
                utils_1.default.object.set(result, key, Buffer.from(value));
            }
        });
        return result;
    }
    // This function will return null if it's unknown if it is a Dynamo object (ex. empty object). It will return true if it is a Dynamo object and false if it's not.
    static isDynamoObject(object, recursive) {
        function isValid(value) {
            if (typeof value === "undefined" || value === null) {
                return false;
            }
            const keys = Object.keys(value);
            const key = keys[0];
            const nestedResult = typeof value[key] === "object" && !(value[key] instanceof Buffer) && !(value[key] instanceof Uint8Array) ? Array.isArray(value[key]) ? value[key].every((value) => Item.isDynamoObject(value, true)) : Item.isDynamoObject(value[key]) : true;
            const { Schema } = require("./Schema");
            const attributeType = Schema.attributeTypes.findDynamoDBType(key);
            return typeof value === "object" && keys.length === 1 && attributeType && (nestedResult || Object.keys(value[key]).length === 0 || attributeType.isSet);
        }
        const keys = Object.keys(object);
        const values = Object.values(object);
        if (keys.length === 0) {
            return null;
        }
        else {
            return recursive ? isValid(object) : values.every((value) => isValid(value));
        }
    }
    // This function handles actions that should take place before every response (get, scan, query, batchGet, etc.)
    async prepareForResponse() {
        if (this.getInternalProperties(internalProperties).model.getInternalProperties(internalProperties).table().getInternalProperties(internalProperties).options.populate) {
            return this.populate({ "properties": this.getInternalProperties(internalProperties).model.getInternalProperties(internalProperties).table().getInternalProperties(internalProperties).options.populate });
        }
        return this;
    }
    /**
     * This function returns the original item that was received from DynamoDB. This function will return a JSON object that represents the original item. In the event no item has been retrieved from DynamoDB `null` will be returned.
     *
     * ```js
     * const user = await User.get(1);
     * console.log(user); // {"id": 1, "name": "Bob"}
     * user.name = "Tim";
     *
     * console.log(user); // {"id": 1, "name": "Tim"}
     * console.log(user.original()); // {"id": 1, "name": "Bob"}
     * ```
     * @returns Object | null
     */
    original() {
        return this.getInternalProperties(internalProperties).originalSettings.type === "fromDynamo" ? this.getInternalProperties(internalProperties).originalObject : null;
    }
    /**
     * This function returns a JSON object representation of the item. This is most commonly used when comparing a item to an object you receive elsewhere without worrying about prototypes.
     *
     * ```js
     * const user = new User({"id": 1, "name": "Tim"});
     *
     * console.log(user); // Item {"id": 1, "name": "Tim"}
     * console.log(user.toJSON()); // {"id": 1, "name": "Tim"}
     * ```
     *
     * Due to the fact that a item instance is based on an object it is rare that you will have to use this function since you can access all the properties of the item directly. For example, both of the results will yield the same output.
     *
     * ```js
     * const user = new User({"id": 1, "name": "Tim"});
     *
     * console.log(user.id); // 1
     * console.log(user.toJSON().id); // 1
     * ```
     * @returns Object
     */
    toJSON() {
        return utils_1.default.dynamoose.itemToJSON.bind(this)();
    }
    /**
     * This method will return a promise containing an object of the item that includes default values for any undefined values in the item.
     *
     * ```js
     * const schema = new Schema({
     * 	"id": String,
     * 	"data": {
     * 		"type": String,
     * 		"default": "Hello World"
     * 	}
     * });
     * const User = dynamoose.model("User", schema);
     * const user = new User({"id": 1});
     * console.log(await user.withDefaults()); // {"id": 1, "data": "Hello World"}
     * ```
     * @returns Promise<Object>
     */
    async withDefaults() {
        return Item.objectFromSchema(utils_1.default.deep_copy(this.toJSON()), this.getInternalProperties(internalProperties).model, {
            "typeCheck": false,
            "defaults": true,
            "type": "toDynamo"
        });
    }
    // Serializer
    serialize(nameOrOptions) {
        return this.getInternalProperties(internalProperties).model.serializer.getInternalProperties(internalProperties).serialize(this, nameOrOptions);
    }
    delete(callback) {
        const hashKey = this.getInternalProperties(internalProperties).model.getInternalProperties(internalProperties).getHashKey();
        const rangeKey = this.getInternalProperties(internalProperties).model.getInternalProperties(internalProperties).getRangeKey();
        const key = { [hashKey]: this[hashKey] };
        if (rangeKey) {
            key[rangeKey] = this[rangeKey];
        }
        return this.getInternalProperties(internalProperties).model.delete(key, callback);
    }
    save(settings, callback) {
        if (typeof settings !== "object" && typeof settings !== "undefined") {
            callback = settings;
            settings = {};
        }
        if (typeof settings === "undefined") {
            settings = {};
        }
        const table = this.getInternalProperties(internalProperties).model.getInternalProperties(internalProperties).table();
        let savedItem;
        const localSettings = settings;
        const paramsPromise = this.toDynamo({ "defaults": true, "validate": true, "required": true, "enum": true, "forceDefault": true, "combine": true, "saveUnknown": true, "customTypesDynamo": true, "updateTimestamps": true, "modifiers": ["set"], "mapAttributes": true }).then(async (item) => {
            savedItem = item;
            let putItemObj = {
                "Item": item,
                "TableName": table.getInternalProperties(internalProperties).name
            };
            if (localSettings.condition) {
                putItemObj = Object.assign(Object.assign({}, putItemObj), await localSettings.condition.getInternalProperties(internalProperties).requestObject(this.getInternalProperties(internalProperties).model));
            }
            if (localSettings.overwrite === false) {
                const conditionExpression = "attribute_not_exists(#__hash_key)";
                putItemObj.ConditionExpression = putItemObj.ConditionExpression ? `(${putItemObj.ConditionExpression}) AND (${conditionExpression})` : conditionExpression;
                putItemObj.ExpressionAttributeNames = Object.assign(Object.assign({}, putItemObj.ExpressionAttributeNames || {}), { "#__hash_key": this.getInternalProperties(internalProperties).model.getInternalProperties(internalProperties).getHashKey() });
            }
            return putItemObj;
        });
        if (settings.return === "request") {
            if (callback) {
                const localCallback = callback;
                paramsPromise.then((result) => localCallback(null, result));
                return;
            }
            else {
                return paramsPromise;
            }
        }
        const promise = Promise.all([paramsPromise, table.getInternalProperties(internalProperties).pendingTaskPromise()]).then((promises) => {
            const [putItemObj] = promises;
            return (0, internal_1.default)(table.getInternalProperties(internalProperties).instance, "putItem", putItemObj);
        });
        if (callback) {
            const localCallback = callback;
            promise.then(() => {
                this.getInternalProperties(internalProperties).storedInDynamo = true;
                const returnItem = new (this.getInternalProperties(internalProperties).model).Item(savedItem);
                returnItem.getInternalProperties(internalProperties).storedInDynamo = true;
                localCallback(null, returnItem);
            }).catch((error) => callback(error));
        }
        else {
            return (async () => {
                await promise;
                this.getInternalProperties(internalProperties).storedInDynamo = true;
                const returnItem = new (this.getInternalProperties(internalProperties).model).Item(savedItem);
                returnItem.getInternalProperties(internalProperties).storedInDynamo = true;
                return returnItem;
            })();
        }
    }
    populate(...args) {
        return Populate_1.PopulateItem.bind(this)(...args);
    }
}
exports.Item = Item;
class AnyItem extends Item {
}
exports.AnyItem = AnyItem;
// This function will mutate the object passed in to run any actions to conform to the schema that cannot be achieved through non mutating methods in Item.objectFromSchema (setting timestamps, etc.)
Item.prepareForObjectFromSchema = async function (object, model, settings) {
    if (settings.updateTimestamps) {
        const schema = model.getInternalProperties(internalProperties).schemaForObject(object);
        if (schema.getInternalProperties(internalProperties).settings.timestamps && settings.type === "toDynamo") {
            const date = new Date();
            const timeResult = (prop) => {
                const typeDetails = schema.getAttributeTypeDetails(prop.name);
                if (Array.isArray(typeDetails)) {
                    throw new Error_2.default.InvalidType(`Not allowed to use an array of types for the timestamps attribute "${prop.name}".`);
                }
                switch (typeDetails.typeSettings.storage) {
                    case "iso": return date.toISOString();
                    case "seconds": return Math.floor(date.getTime() / 1000);
                    default: return date.getTime();
                }
            };
            const timestampProperties = schema.getInternalProperties(internalProperties).getTimestampAttributes();
            const createdAtProperties = timestampProperties.filter((val) => val.type === "createdAt");
            const updatedAtProperties = timestampProperties.filter((val) => val.type === "updatedAt");
            if (object.getInternalProperties && object.getInternalProperties(internalProperties) && !object.getInternalProperties(internalProperties).storedInDynamo && (typeof settings.updateTimestamps === "boolean" || settings.updateTimestamps.createdAt)) {
                createdAtProperties.forEach((prop) => {
                    utils_1.default.object.set(object, prop.name, timeResult(prop));
                });
            }
            if (typeof settings.updateTimestamps === "boolean" || settings.updateTimestamps.updatedAt) {
                updatedAtProperties.forEach((prop) => {
                    utils_1.default.object.set(object, prop.name, timeResult(prop));
                });
            }
        }
    }
    return object;
};
// This function will return a list of attributes combining both the schema attributes with the item attributes. This also takes into account all attributes that could exist (ex. properties in sets that don't exist in item), adding the indexes for each item in the item set.
// https://stackoverflow.com/a/59928314/894067
Item.attributesWithSchema = async function (item, model) {
    const schema = model.getInternalProperties(internalProperties).schemaForObject(item);
    const attributes = schema.attributes();
    // build a tree out of schema attributes
    const root = {};
    attributes.forEach((attribute) => {
        let node = root;
        attribute.split(".").forEach((part) => {
            node[part] = node[part] || {};
            node = node[part];
        });
    });
    // explore the tree
    function traverse(node, treeNode, outPath, callback) {
        callback(outPath);
        if (Object.keys(treeNode).length === 0) { // a leaf
            return;
        }
        Object.keys(treeNode).forEach((attr) => {
            if (attr === "0") {
                // We check for empty objects here (added `typeof node === "object" && Object.keys(node).length == 0`, see PR https://github.com/dynamoose/dynamoose/pull/1034) to handle the use case of 2d arrays, or arrays within arrays. `node` in that case will be an empty object.
                if (!node || node.length == 0 || typeof node === "object" && Object.keys(node).length == 0) {
                    node = [{}]; // fake the path for arrays
                }
                node.forEach((a, index) => {
                    outPath.push(index);
                    traverse(node[index], treeNode[attr], outPath, callback);
                    outPath.pop();
                });
            }
            else {
                if (!node) {
                    node = {}; // fake the path for properties
                }
                outPath.push(attr);
                traverse(node[attr], treeNode[attr], outPath, callback);
                outPath.pop();
            }
        });
    }
    const out = [];
    traverse(item, root, [], (val) => out.push(val.join(".")));
    const result = out.slice(1);
    return result;
};
// This function will return an object that conforms to the schema (removing any properties that don't exist, using default values, etc.) & throws an error if there is a type mismatch.
Item.objectFromSchema = async function (object, model, settings = { "type": "toDynamo" }) {
    if (settings.checkExpiredItem && model.getInternalProperties(internalProperties).table().getInternalProperties(internalProperties).options.expires && (model.getInternalProperties(internalProperties).table().getInternalProperties(internalProperties).options.expires.items || {}).returnExpired === false && object[model.getInternalProperties(internalProperties).table().getInternalProperties(internalProperties).options.expires.attribute] && object[model.getInternalProperties(internalProperties).table().getInternalProperties(internalProperties).options.expires.attribute] * 1000 < Date.now()) {
        return undefined;
    }
    let returnObject = utils_1.default.deep_copy(object);
    const schema = settings.schema || model.getInternalProperties(internalProperties).schemaForObject(returnObject);
    const schemaAttributes = schema.attributes(returnObject);
    function mapAttributes(type) {
        if (settings.mapAttributes && settings.type === type) {
            const schemaInternalProperties = schema.getInternalProperties(internalProperties);
            const mappedAttributesObject = type === "toDynamo" ? schemaInternalProperties.getMapSettingObject() : schema.attributes().reduce((obj, attribute) => {
                const mapValues = schemaInternalProperties.getMapSettingValuesForKey(attribute);
                if (mapValues && mapValues.length > 0) {
                    const defaultMapAttribute = schema.getInternalProperties(internalProperties).getDefaultMapAttribute(attribute);
                    if (defaultMapAttribute) {
                        if (defaultMapAttribute !== attribute) {
                            obj[attribute] = defaultMapAttribute;
                        }
                    }
                    else {
                        obj[attribute] = mapValues[0];
                    }
                }
                return obj;
            }, {});
            Object.entries(mappedAttributesObject).forEach(([oldKey, newKey]) => {
                if (returnObject[oldKey] !== undefined && returnObject[newKey] !== undefined) {
                    throw new Error_2.default.InvalidParameter(`Cannot map attribute ${oldKey} to ${newKey} because both are defined`);
                }
                if (returnObject[oldKey] !== undefined) {
                    returnObject[newKey] = returnObject[oldKey];
                    delete returnObject[oldKey];
                }
            });
        }
    }
    // Map Attributes toDynamo
    mapAttributes("toDynamo");
    // Type check
    const typeIndexOptionMap = schema.getTypePaths(returnObject, settings);
    if (settings.typeCheck === undefined || settings.typeCheck === true) {
        const validParents = []; // This array is used to allow for set contents to not be type checked
        const keysToDelete = [];
        const checkTypeFunction = (item) => {
            const [key, value] = item;
            if (validParents.find((parent) => key.startsWith(parent.key) && (parent.infinite || key.split(".").length === parent.key.split(".").length + 1))) {
                return;
            }
            const genericKey = key.replace(/\.\d+/gu, ".0"); // This is a key replacing all list numbers with 0 to standardize things like checking if it exists in the schema
            const existsInSchema = schemaAttributes.includes(genericKey);
            if (existsInSchema) {
                const { isValidType, matchedTypeDetails, typeDetailsArray } = utils_1.default.dynamoose.getValueTypeCheckResult(schema, value, genericKey, settings, { "standardKey": true, typeIndexOptionMap });
                if (!isValidType) {
                    throw new Error_1.default.TypeMismatch(`Expected ${key} to be of type ${typeDetailsArray.map((detail) => detail.dynamicName ? detail.dynamicName() : detail.name.toLowerCase()).join(", ")}, instead found type ${utils_1.default.type_name(value, typeDetailsArray)}.`);
                }
                else if (matchedTypeDetails.isSet || matchedTypeDetails.name.toLowerCase() === "model" || (matchedTypeDetails.name === "Object" || matchedTypeDetails.name === "Array") && schema.getAttributeSettingValue("schema", genericKey) === dynamooseAny) {
                    validParents.push({ key, "infinite": true });
                }
                else if ( /*typeDetails.dynamodbType === "M" || */matchedTypeDetails.dynamodbType === "L") {
                    // The code below is an optimization for large array types to speed up the process of not having to check the type for every element but only the ones that are different
                    value.forEach((subValue, index, array) => {
                        if (index === 0 || typeof subValue !== typeof array[0]) {
                            checkTypeFunction([`${key}.${index}`, subValue]);
                        }
                        else if (keysToDelete.includes(`${key}.0`) && typeof subValue === typeof array[0]) {
                            keysToDelete.push(`${key}.${index}`);
                        }
                    });
                    validParents.push({ key });
                }
            }
            else {
                // Check saveUnknown
                if (!settings.saveUnknown || !utils_1.default.dynamoose.wildcard_allowed_check(schema.getSettingValue("saveUnknown"), key)) {
                    keysToDelete.push(key);
                }
            }
        };
        utils_1.default.object.entries(returnObject).filter((item) => item[1] !== undefined && item[1] !== dynamooseUndefined).map(checkTypeFunction);
        keysToDelete.reverse().forEach((key) => utils_1.default.object.delete(returnObject, key));
    }
    if (settings.defaults || settings.forceDefault) {
        await Promise.all((await Item.attributesWithSchema(returnObject, model)).map(async (key) => {
            const value = utils_1.default.object.get(returnObject, key);
            if (value === dynamooseUndefined) {
                utils_1.default.object.set(returnObject, key, undefined);
            }
            else {
                const defaultValue = await schema.defaultCheck(key, value, settings);
                const isDefaultValueUndefined = Array.isArray(defaultValue) ? defaultValue.some((defaultValue) => typeof defaultValue === "undefined" || defaultValue === null) : typeof defaultValue === "undefined" || defaultValue === null;
                const parentKey = utils_1.default.parentKey(key);
                const parentValue = parentKey.length === 0 ? returnObject : utils_1.default.object.get(returnObject, parentKey);
                if (!isDefaultValueUndefined) {
                    const { isValidType, typeDetailsArray } = utils_1.default.dynamoose.getValueTypeCheckResult(schema, defaultValue, key, settings, { typeIndexOptionMap });
                    if (!isValidType) {
                        throw new Error_1.default.TypeMismatch(`Expected ${key} to be of type ${typeDetailsArray.map((detail) => detail.dynamicName ? detail.dynamicName() : detail.name.toLowerCase()).join(", ")}, instead found type ${typeof defaultValue}.`);
                    }
                    else if (typeof parentValue !== "undefined" && parentValue !== null) {
                        utils_1.default.object.set(returnObject, key, defaultValue);
                    }
                }
            }
        }));
    }
    // Custom Types
    if (settings.customTypesDynamo) {
        (await Item.attributesWithSchema(returnObject, model)).map((key) => {
            const value = utils_1.default.object.get(returnObject, key);
            const isValueUndefined = typeof value === "undefined" || value === null;
            if (!isValueUndefined) {
                const typeDetails = utils_1.default.dynamoose.getValueTypeCheckResult(schema, value, key, settings, { typeIndexOptionMap }).matchedTypeDetails;
                const { customType } = typeDetails;
                const { "type": typeInfo } = typeDetails.isOfType(value);
                const isCorrectTypeAlready = typeInfo === (settings.type === "toDynamo" ? "underlying" : "main");
                if (customType && customType.functions[settings.type] && !isCorrectTypeAlready) {
                    const customValue = customType.functions[settings.type](value);
                    utils_1.default.object.set(returnObject, key, customValue);
                }
            }
        });
    }
    // DynamoDB Type Handler (ex. converting sets to correct value for toDynamo & fromDynamo)
    utils_1.default.object.entries(returnObject).filter((item) => typeof item[1] === "object").forEach((item) => {
        const [key, value] = item;
        let typeDetails;
        try {
            typeDetails = utils_1.default.dynamoose.getValueTypeCheckResult(schema, value, key, settings, { typeIndexOptionMap }).matchedTypeDetails;
        }
        catch (e) {
            const { Schema } = require("./Schema");
            typeDetails = Schema.attributeTypes.findTypeForValue(value, settings.type, settings);
        }
        if (typeDetails && typeDetails[settings.type]) {
            utils_1.default.object.set(returnObject, key, typeDetails[settings.type](value));
        }
    });
    if (settings.combine) {
        schemaAttributes.map((key) => {
            try {
                const typeDetails = schema.getAttributeTypeDetails(key);
                return {
                    key,
                    "type": typeDetails
                };
            }
            catch (e) { } // eslint-disable-line no-empty
        }).filter((item) => {
            return Array.isArray(item.type) ? item.type.some((type) => type.name === "Combine") : item.type.name === "Combine";
        }).map((obj) => {
            if (obj && Array.isArray(obj.type)) {
                throw new Error_1.default.InvalidParameter("Combine type is not allowed to be used with multiple types.");
            }
            return obj;
        }).forEach((item) => {
            const { key, type } = item;
            const value = type.typeSettings.attributes.map((attribute) => utils_1.default.object.get(returnObject, attribute)).filter((value) => typeof value !== "undefined" && value !== null).join(type.typeSettings.separator);
            utils_1.default.object.set(returnObject, key, value);
        });
    }
    if (settings.modifiers) {
        await Promise.all(settings.modifiers.map(async (modifier) => {
            await Promise.all((await Item.attributesWithSchema(returnObject, model)).map(async (key) => {
                const value = utils_1.default.object.get(returnObject, key);
                const modifierFunction = await schema.getAttributeSettingValue(modifier, key, { "returnFunction": true, typeIndexOptionMap });
                const modifierFunctionExists = Array.isArray(modifierFunction) ? modifierFunction.some((val) => Boolean(val)) : Boolean(modifierFunction);
                const isValueUndefined = typeof value === "undefined" || value === null;
                if (modifierFunctionExists && !isValueUndefined) {
                    const oldValue = object.original ? utils_1.default.object.get(object.original(), key) : undefined;
                    utils_1.default.object.set(returnObject, key, await modifierFunction(value, oldValue));
                }
            }));
            const schemaModifier = schema.getInternalProperties(internalProperties).settings[modifier];
            if (schemaModifier) {
                returnObject = await schemaModifier(returnObject);
            }
        }));
    }
    if (settings.validate) {
        await Promise.all((await Item.attributesWithSchema(returnObject, model)).map(async (key) => {
            const value = utils_1.default.object.get(returnObject, key);
            const isValueUndefined = typeof value === "undefined" || value === null;
            if (!isValueUndefined) {
                const validator = await schema.getAttributeSettingValue("validate", key, { "returnFunction": true, typeIndexOptionMap });
                if (validator) {
                    let result;
                    if (validator instanceof RegExp) {
                        if (typeof value === "string") {
                            result = validator.test(value);
                        }
                        else {
                            throw new Error_1.default.ValidationError(`Trying to pass in ${typeof value} to a RegExp validator for key: ${key}.`);
                        }
                    }
                    else {
                        result = typeof validator === "function" ? await validator(value) : validator === value;
                    }
                    if (!result) {
                        throw new Error_1.default.ValidationError(`${key} with a value of ${value} had a validation error when trying to save the item`);
                    }
                }
            }
        }));
        const schemaValidator = schema.getInternalProperties(internalProperties).settings.validate;
        if (schemaValidator) {
            const result = await schemaValidator(returnObject);
            if (!result) {
                throw new Error_1.default.ValidationError(`${JSON.stringify(returnObject)} had a schema validation error when trying to save the item.`);
            }
        }
    }
    if (settings.required) {
        let attributesToCheck = await Item.attributesWithSchema(returnObject, model);
        if (settings.required === "nested") {
            attributesToCheck = attributesToCheck.filter((attribute) => utils_1.default.object.keys(returnObject).find((key) => attribute === key || attribute.startsWith(key + ".")));
        }
        await Promise.all(attributesToCheck.map(async (key) => {
            const check = async () => {
                const value = utils_1.default.object.get(returnObject, key);
                await schema.requiredCheck(key, value);
            };
            const keyParts = key.split(".");
            const parentKey = keyParts.slice(0, -1).join(".");
            if (parentKey) {
                const parentValue = utils_1.default.object.get(returnObject, parentKey);
                const isParentValueUndefined = typeof parentValue === "undefined" || parentValue === null;
                if (!isParentValueUndefined) {
                    await check();
                }
            }
            else {
                await check();
            }
        }));
    }
    if (settings.enum) {
        await Promise.all((await Item.attributesWithSchema(returnObject, model)).map(async (key) => {
            const value = utils_1.default.object.get(returnObject, key);
            const isValueUndefined = typeof value === "undefined" || value === null;
            if (!isValueUndefined) {
                const enumArray = await schema.getAttributeSettingValue("enum", key, { "returnFunction": false, typeIndexOptionMap });
                if (enumArray && !enumArray.includes(value)) {
                    throw new Error_1.default.ValidationError(`${key} must equal ${JSON.stringify(enumArray)}, but is set to ${value}`);
                }
            }
        }));
    }
    // Map Attributes fromDynamo
    mapAttributes("fromDynamo");
    return Object.assign({}, returnObject);
};
Item.prototype.toDynamo = async function (settings = {}) {
    const newSettings = Object.assign(Object.assign({}, settings), { "type": "toDynamo" });
    await Item.prepareForObjectFromSchema(this, this.getInternalProperties(internalProperties).model, newSettings);
    const object = await Item.objectFromSchema(this, this.getInternalProperties(internalProperties).model, newSettings);
    return Item.objectToDynamo(object);
};
// This function will modify the item to conform to the Schema
Item.prototype.conformToSchema = async function (settings = { "type": "fromDynamo" }) {
    let item = this;
    if (settings.type === "fromDynamo") {
        item = await this.prepareForResponse();
    }
    const model = item.getInternalProperties(internalProperties).model;
    await Item.prepareForObjectFromSchema(item, model, settings);
    const expectedObject = await Item.objectFromSchema(item, model, settings);
    if (!expectedObject) {
        return expectedObject;
    }
    const expectedKeys = Object.keys(expectedObject);
    if (settings.mapAttributes) {
        const schema = model.getInternalProperties(internalProperties).schemaForObject(expectedObject);
        const schemaInternalProperties = schema.getInternalProperties(internalProperties);
        const mapSettingObject = schemaInternalProperties.getMapSettingObject();
        for (const key in mapSettingObject) {
            const expectedObjectValue = utils_1.default.object.get(expectedObject, key);
            if (expectedObjectValue) {
                utils_1.default.object.set(this, key, expectedObjectValue);
            }
        }
    }
    for (const key in item) {
        if (!expectedKeys.includes(key)) {
            delete this[key];
        }
        else if (this[key] !== expectedObject[key]) {
            this[key] = expectedObject[key];
        }
    }
    return this;
};
