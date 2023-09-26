
function validateData(schema, data){ 
    const result = schema.safeParse(data);
    if(!result.success) return result.error.issues.map(issue => issue.message);
    return [];
}

export default validateData;