module.exports = {
  analyzeJSON(json) {
    function getSchema(obj) {
      if (Array.isArray(obj)) {
        return {
          type: "array",
          items: getSchema(obj[0] || {})
        };
      } else if (typeof obj === "object" && obj !== null) {
        const schema = {};
        for (const key in obj) {
          schema[key] = getSchema(obj[key]);
        }
        return schema;
      } else {
        return { type: typeof obj };
      }
    }

    const schema = getSchema(json);

    // Determine complexity
    const isFlat = !Object.values(schema).some(
      (v) => v.type === "object" || v.type === "array"
    );

    return {
      schema,
      summary: {
        keys: Object.keys(schema),
        nested: !isFlat,
      },
      structure: isFlat ? "flat" : "nested",
    };
  },
};
