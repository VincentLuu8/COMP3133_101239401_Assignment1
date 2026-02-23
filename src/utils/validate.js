import { checkSchema, validationResult } from "express-validator";

export async function runValidation(schema, body) {
  const req = { body };

  const chains = checkSchema(schema);
  await Promise.all(chains.map((c) => c.run(req)));

  const result = validationResult(req);
  if (result.isEmpty()) return [];

  return result.array({ onlyFirstError: true }).map((e) => ({
    field: e.path,
    message: e.msg
  }));
}

export const signupSchema = {
  username: {
    in: ["body"],
    isString: { errorMessage: "username must be a string" },
    notEmpty: { errorMessage: "username is required" },
    isLength: { options: { min: 3, max: 30 }, errorMessage: "username must be 3-30 chars" }
  },
  email: {
    in: ["body"],
    isEmail: { errorMessage: "email must be valid" },
    normalizeEmail: true
  },
  password: {
    in: ["body"],
    isString: { errorMessage: "password must be a string" },
    isLength: { options: { min: 6 }, errorMessage: "password must be at least 6 chars" }
  }
};

export const employeeCreateSchema = {
  first_name: { in: ["body"], notEmpty: { errorMessage: "first_name is required" } },
  last_name: { in: ["body"], notEmpty: { errorMessage: "last_name is required" } },
  email: { in: ["body"], isEmail: { errorMessage: "email must be valid" }, normalizeEmail: true },
  gender: {
    in: ["body"],
    optional: true,
    custom: {
      options: (v) => ["Male", "Female", "Other"].includes(v),
      errorMessage: "gender must be Male, Female, or Other"
    }
  },
  designation: { in: ["body"], notEmpty: { errorMessage: "designation is required" } },
  salary: {
    in: ["body"],
    isFloat: { options: { min: 1000 }, errorMessage: "salary must be >= 1000" }
  },
  date_of_joining: {
    in: ["body"],
    isISO8601: { errorMessage: "date_of_joining must be ISO8601 (YYYY-MM-DD)" }
  },
  department: { in: ["body"], notEmpty: { errorMessage: "department is required" } }
};

export const employeeUpdateSchema = {
  first_name: { in: ["body"], optional: true, isString: { errorMessage: "first_name must be a string" } },
  last_name: { in: ["body"], optional: true, isString: { errorMessage: "last_name must be a string" } },
  email: { in: ["body"], optional: true, isEmail: { errorMessage: "email must be valid" }, normalizeEmail: true },
  gender: {
    in: ["body"],
    optional: true,
    custom: {
      options: (v) => ["Male", "Female", "Other"].includes(v),
      errorMessage: "gender must be Male, Female, or Other"
    }
  },
  designation: { in: ["body"], optional: true, isString: { errorMessage: "designation must be a string" } },
  salary: { in: ["body"], optional: true, isFloat: { options: { min: 1000 }, errorMessage: "salary must be >= 1000" } },
  date_of_joining: { in: ["body"], optional: true, isISO8601: { errorMessage: "date_of_joining must be ISO8601" } },
  department: { in: ["body"], optional: true, isString: { errorMessage: "department must be a string" } }
};