import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Employee from "../models/Employee.js";
import { signToken } from "../middleware/auth.js";
import { uploadEmployeePhoto } from "../config/cloudinary.js";
import { formatEmployee, formatUser } from "../utils/format.js";
import { runValidation, signupSchema, employeeCreateSchema, employeeUpdateSchema } from "../utils/validate.js";

function isMongoDuplicateKey(err) {
  return err && err.code === 11000;
}

function pickLoginQuery(usernameOrEmail) {
  const looksLikeEmail = usernameOrEmail.includes("@");
  return looksLikeEmail
    ? { email: usernameOrEmail.toLowerCase().trim() }
    : { username: usernameOrEmail.trim() };
}

function requireAuth(ctx) {
  if (!ctx.user) {
    return {
      ok: false,
      errors: [{ field: "auth", message: "Error. Authentication required, try again." }]
    };
  }
  return { ok: true };
}

const resolvers = {
  Query: {
    async login(_, args) {
      const { usernameOrEmail, password } = args;

      if (!usernameOrEmail || !password) {
        return {
          success: false,
          message: "username/email and password are required",
          token: null,
          user: null,
          errors: [{ field: "login", message: "Authentication details are missing." }]
        };
      }

      const user = await User.findOne(pickLoginQuery(usernameOrEmail));
      if (!user) {
        return {
          success: false,
          message: "Authentication failed, invalid credentials",
          token: null,
          user: null,
          errors: [{ field: "login", message: "User not found" }]
        };
      }

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) {
        return {
          success: false,
          message: "Authentication failed, invalid credentials",
          token: null,
          user: null,
          errors: [{ field: "login", message: "Wrong password" }]
        };
      }

      const token = signToken(user);
      return {
        success: true,
        message: "Login successful",
        token,
        user: formatUser(user),
        errors: []
      };
    },

    async getAllEmployees(_, __, ctx) {
      const auth = requireAuth(ctx);
      if (!auth.ok) {
        return { success: false, message: "Unauthorized", employees: [], errors: auth.errors };
      }

      const employees = await Employee.find().sort({ created_at: -1 });
      return {
        success: true,
        message: "Employees retrieved successfully",
        employees: employees.map(formatEmployee),
        errors: []
      };
    },

    async searchEmployeeByEid(_, { eid }, ctx) {
      const auth = requireAuth(ctx);
      if (!auth.ok) {
        return { success: false, message: "Unauthorized", employee: null, errors: auth.errors };
      }

      const employee = await Employee.findById(eid);
      if (!employee) {
        return {
          success: false,
          message: "Employee not found",
          employee: null,
          errors: [{ field: "eid", message: "No employee found with the given id" }]
        };
      }

      return { success: true, message: "Employee retrieved successfully", employee: formatEmployee(employee), errors: [] };
    },

    async searchEmployeesByDesignationOrDepartment(_, { designation, department }, ctx) {
      const auth = requireAuth(ctx);
      if (!auth.ok) {
        return { success: false, message: "Unauthorized", employees: [], errors: auth.errors };
      }

      if (!designation && !department) {
        return {
          success: false,
          message: "Provide designation or department",
          employees: [],
          errors: [{ field: "filter", message: "Please provide either designation or department." }]
        };
      }

      const or = [];
      if (designation) or.push({ designation: designation.trim() });
      if (department) or.push({ department: department.trim() });

      const employees = await Employee.find({ $or: or }).sort({ created_at: -1 });

      return {
        success: true,
        message: "Search done successfully",
        employees: employees.map(formatEmployee),
        errors: []
      };
    }
  },

  Mutation: {
    async signup(_, { user }) {
      const errors = await runValidation(signupSchema, user);
      if (errors.length) {
        return { success: false, message: "Validation failed", token: null, user: null, errors };
      }

      try {
        const existing = await User.findOne({
          $or: [{ username: user.username.trim() }, { email: user.email.toLowerCase().trim() }]
        });

        if (existing) {
          return {
            success: false,
            message: "User already exists",
            token: null,
            user: null,
            errors: [{ field: "user", message: "Username or email already exists" }]
          };
        }

        const hashed = await bcrypt.hash(user.password, 10);

        const created = await User.create({
          username: user.username.trim(),
          email: user.email.toLowerCase().trim(),
          password: hashed
        });

        const token = signToken(created);

        return {
          success: true,
          message: "Signup successful",
          token,
          user: formatUser(created),
          errors: []
        };
      } catch (err) {
        if (isMongoDuplicateKey(err)) {
          return {
            success: false,
            message: "Duplicate key error",
            token: null,
            user: null,
            errors: [{ field: "user", message: "Username or email already exists" }]
          };
        }

        return {
          success: false,
          message: "Signup failed",
          token: null,
          user: null,
          errors: [{ field: "server", message: err.message }]
        };
      }
    },

    async addEmployee(_, { employee }, ctx) {
      const auth = requireAuth(ctx);
      if (!auth.ok) return { success: false, message: "Unauthorized", employee: null, errors: auth.errors };

      const errors = await runValidation(employeeCreateSchema, employee);
      if (errors.length) return { success: false, message: "Validation failed", employee: null, errors };

      try {
        let photoUrl = null;
        if (employee.employee_photo) {
          photoUrl = await uploadEmployeePhoto(employee.employee_photo);
        }

        const created = await Employee.create({
          first_name: employee.first_name.trim(),
          last_name: employee.last_name.trim(),
          email: employee.email.toLowerCase().trim(),
          gender: employee.gender || "Other",
          designation: employee.designation.trim(),
          salary: employee.salary,
          date_of_joining: new Date(employee.date_of_joining),
          department: employee.department.trim(),
          employee_photo: photoUrl
        });

        return { success: true, message: "Employee created successfully", employee: formatEmployee(created), errors: [] };
      } catch (err) {
        if (isMongoDuplicateKey(err)) {
          return {
            success: false,
            message: "Employee email already exists",
            employee: null,
            errors: [{ field: "email", message: "Email is already in use." }]
          };
        }

        return { success: false, message: "Failed to create employee", employee: null, errors: [{ field: "server", message: err.message }] };
      }
    },

    async updateEmployeeByEid(_, { eid, employee }, ctx) {
      const auth = requireAuth(ctx);
      if (!auth.ok) return { success: false, message: "Unauthorized", employee: null, errors: auth.errors };

      const errors = await runValidation(employeeUpdateSchema, employee);
      if (errors.length) return { success: false, message: "Validation failed", employee: null, errors };

      try {
        const existing = await Employee.findById(eid);
        if (!existing) {
          return {
            success: false,
            message: "Employee not found",
            employee: null,
            errors: [{ field: "eid", message: "No employee found with the given id" }]
          };
        }

        const patch = { ...employee };

        if (patch.employee_photo) {
          patch.employee_photo = await uploadEmployeePhoto(patch.employee_photo);
        } else {
          delete patch.employee_photo;
        }

        if (patch.email) patch.email = patch.email.toLowerCase().trim();
        if (patch.first_name) patch.first_name = patch.first_name.trim();
        if (patch.last_name) patch.last_name = patch.last_name.trim();
        if (patch.designation) patch.designation = patch.designation.trim();
        if (patch.department) patch.department = patch.department.trim();
        if (patch.date_of_joining) patch.date_of_joining = new Date(patch.date_of_joining);

        const updated = await Employee.findByIdAndUpdate(eid, patch, { new: true, runValidators: true });

        return { success: true, message: "Employee updated successfully", employee: formatEmployee(updated), errors: [] };
      } catch (err) {
        if (isMongoDuplicateKey(err)) {
          return {
            success: false,
            message: "Duplicate email",
            employee: null,
            errors: [{ field: "email", message: "This email is already used by another employee" }]
          };
        }

        return { success: false, message: "Failed to update employee", employee: null, errors: [{ field: "server", message: err.message }] };
      }
    },

    async deleteEmployeeByEid(_, { eid }, ctx) {
      const auth = requireAuth(ctx);
      if (!auth.ok) return { success: false, message: "Unauthorized", errors: auth.errors };

      const deleted = await Employee.findByIdAndDelete(eid);
      if (!deleted) {
        return {
          success: false,
          message: "Employee not found",
          errors: [{ field: "eid", message: "No employee found with the given id" }]
        };
      }

      return { success: true, message: "Employee deleted successfully", errors: [] };
    }
  }
};

export default resolvers;