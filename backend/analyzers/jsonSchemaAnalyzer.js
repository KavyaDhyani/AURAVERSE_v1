// backend/analyzers/jsonSchemaAnalyzer.js
// Simple JSON Schema Analyzer for deciding SQL vs NoSQL
// Exports: analyzeJsonBuffer(buffer) -> Promise<analysis>

const MAX_SAMPLE = 100; // limit records to analyze

function inferType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) {
    // check element types
    if (value.length === 0) return "array";
    const types = new Set(value.map(inferType));
    if (types.size === 1) return `array<${[...types][0]}>`;
    return "array<mixed>";
  }
  switch (typeof value) {
    case "string": return "text";
    case "number":
      // integer check
      return Number.isInteger(value) ? "integer" : "float";
    case "boolean": return "boolean";
    case "object": return "object";
    default: return "text";
  }
}

/**
 * Flattens one level of object keys into dot notation, stops at objects as json
 * Returns a map: { "a": "text", "address.city": "text", ... }
 */
function extractFieldsFromObject(obj, prefix = "", maxDepth = 2, depth = 0) {
  const fields = {};
  if (depth >= maxDepth) {
    // treat as json blob
    fields[prefix.replace(/\.$/, "")] = "json";
    return fields;
  }

  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const path = prefix ? `${prefix}.${key}` : key;

    if (val === null) {
      fields[path] = fields[path] || "null";
    } else if (Array.isArray(val)) {
      // arrays: check element types
      if (val.length === 0) {
        fields[path] = fields[path] || "array";
      } else {
        const elemType = inferType(val[0]);
        if (elemType === "object") {
          // array of objects => json
          fields[path] = "json";
        } else {
          fields[path] = fields[path] || `array<${elemType}>`;
        }
      }
    } else if (typeof val === "object") {
      // nested object -> if depth+1 reached limit, mark json, else flatten one level
      if (depth + 1 >= maxDepth) {
        fields[path] = fields[path] || "json";
      } else {
        const nested = extractFieldsFromObject(val, `${path}`, maxDepth, depth + 1);
        Object.assign(fields, nested);
      }
    } else {
      fields[path] = fields[path] || inferType(val);
    }
  }
  return fields;
}

/**
 * Analyze JSON data (object or array)
 * @param {Buffer|string|Object} input - JSON buffer, string or parsed object
 */
async function analyzeJsonBuffer(input) {
  let data;
  try {
    if (Buffer.isBuffer(input)) {
      data = JSON.parse(input.toString());
    } else if (typeof input === "string") {
      data = JSON.parse(input);
    } else {
      data = input;
    }
  } catch (err) {
    throw new Error("Invalid JSON");
  }

  // Normalize to an array of records where possible
  let records = [];
  if (Array.isArray(data)) {
    records = data.slice(0, MAX_SAMPLE);
  } else if (typeof data === "object" && data !== null) {
    // Could be object with nested data or keyed by IDs
    // If keys map to objects and it's large, treat as records
    const values = Object.values(data);
    const areValuesObjects = values.length > 0 && values.every(v => typeof v === "object" && v !== null);
    if (areValuesObjects) {
      records = values.slice(0, MAX_SAMPLE);
    } else {
      // single top-level object -> treat as one record (Mongo)
      records = [data];
    }
  } else {
    throw new Error("Unsupported JSON top-level structure");
  }

  // Basic metrics
  const sampleSize = records.length;
  let maxDepth = 0;
  const keyCounts = {}; // count keys occurrences
  const mergedFields = {}; // union of inferred fields

  function measureDepth(obj, depth = 0) {
    if (depth > maxDepth) maxDepth = depth;
    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
      for (const k of Object.keys(obj)) {
        measureDepth(obj[k], depth + 1);
      }
    }
  }

  // Extract fields from each record
  for (const rec of records) {
    if (typeof rec === "object" && rec !== null) {
      measureDepth(rec, 0);
      // top-level keys
      for (const k of Object.keys(rec)) {
        keyCounts[k] = (keyCounts[k] || 0) + 1;
      }
      // merge field types using a small maxDepth of 2 (top-level + one nested)
      const fields = extractFieldsFromObject(rec, "", 2, 0);
      for (const [f, t] of Object.entries(fields)) {
        // prefer the more specific type if exists
        if (!mergedFields[f]) mergedFields[f] = new Set();
        mergedFields[f].add(t);
      }
    }
  }

  // Convert mergedFields to single-type hints
  const fields = {};
  for (const [k, s] of Object.entries(mergedFields)) {
    const arr = Array.from(s);
    // if multiple types, choose json or text as fallback
    if (arr.length === 1) fields[k] = arr[0];
    else if (arr.includes("json")) fields[k] = "json";
    else if (arr.includes("text")) fields[k] = "text";
    else fields[k] = arr.join("|");
  }

  // Key consistency: percent of records that contain each top-level key
  const keyConsistency = {};
  for (const k of Object.keys(keyCounts)) {
    keyConsistency[k] = +(keyCounts[k] / sampleSize).toFixed(3);
  }

  // Heuristic decision
  // Criteria for SQL:
  // - top-level is array (or values were array-like)
  // - sampleSize > 1
  // - keyConsistency for majority keys >= 0.8
  // - maxDepth <= 1 (no deep nesting)
  const majorityKeys = Object.values(keyConsistency).filter(v => v >= 0.8).length;
  const topLevelIsArray = Array.isArray(data);
  const deepNesting = maxDepth > 1; // >1 indicates nested objects
  const consistentEnough = majorityKeys >= Math.max(1, Object.keys(keyConsistency).length * 0.6);

  const decision = {};
  if (topLevelIsArray && sampleSize > 1 && !deepNesting && consistentEnough) {
    decision.database = "postgresql";
    decision.reason = "Flat array of objects with consistent keys and shallow nesting";
    // Build simple CREATE TABLE SQL
    // choose table name placeholder 'imported_table'
    const columns = [];
    for (const [f, t] of Object.entries(fields)) {
      // replace dots with underscores for SQL column names
      const col = f.replace(/\./g, "_");
      let sqlType = "text";
      if (t === "integer") sqlType = "integer";
      else if (t === "float") sqlType = "double precision";
      else if (t === "boolean") sqlType = "boolean";
      else if (t.startsWith("array<")) sqlType = "jsonb";
      else if (t === "json") sqlType = "jsonb";
      columns.push(`"${col}" ${sqlType}`);
    }
    const createSQL = `CREATE TABLE imported_table (\n  id serial primary key,\n  ${columns.join(",\n  ")}\n);`;
    decision.fields = fields;
    decision.createTableSQL = createSQL;
  } else {
    decision.database = "mongodb";
    decision.reason = deepNesting ? "Nested or variable structure detected" : "Inconsistent keys / single object or mixed types";
    decision.fields = fields;
    // include sample docs
    decision.collectionSample = records.slice(0, 3);
  }

  decision.sampleSize = sampleSize;
  decision.keyConsistency = keyConsistency;
  decision.nestingDepth = maxDepth;
  decision.summary = `${decision.database.toUpperCase()} recommended — ${decision.reason}`;

  return decision;
}

module.exports = {
  analyzeJsonBuffer
};
