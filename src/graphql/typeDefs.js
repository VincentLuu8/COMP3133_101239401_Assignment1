const typeDefs = `#graphql
  type FieldError {
    field: String!
    message: String!
  }

  type User {
    _id: ID!
    username: String!
    email: String!
    created_at: String
    updated_at: String
  }

  type Employee {
    _id: ID!
    first_name: String!
    last_name: String!
    email: String!
    gender: String
    designation: String!
    salary: Float!
    date_of_joining: String!
    department: String!
    employee_photo: String
    created_at: String
    updated_at: String
  }

  type AuthResponse {
    success: Boolean!
    message: String!
    token: String
    user: User
    errors: [FieldError!]
  }

  type EmployeeResponse {
    success: Boolean!
    message: String!
    employee: Employee
    errors: [FieldError!]
  }

  type EmployeeListResponse {
    success: Boolean!
    message: String!
    employees: [Employee!]!
    errors: [FieldError!]
  }

  type DeleteResponse {
    success: Boolean!
    message: String!
    errors: [FieldError!]
  }

  input SignupInput {
    username: String!
    email: String!
    password: String!
  }

  input EmployeeInput {
    first_name: String!
    last_name: String!
    email: String!
    gender: String
    designation: String!
    salary: Float!
    date_of_joining: String!
    department: String!
    # Send a base64 Data URI (data:image/png;base64,...) OR a remote URL.
    employee_photo: String
  }

  input UpdateEmployeeInput {
    first_name: String
    last_name: String
    email: String
    gender: String
    designation: String
    salary: Float
    date_of_joining: String
    department: String
    employee_photo: String
  }

  type Query {
    login(usernameOrEmail: String!, password: String!): AuthResponse!
    getAllEmployees: EmployeeListResponse!
    searchEmployeeByEid(eid: ID!): EmployeeResponse!
    searchEmployeesByDesignationOrDepartment(designation: String, department: String): EmployeeListResponse!
  }

  type Mutation {
    signup(user: SignupInput!): AuthResponse!
    addEmployee(employee: EmployeeInput!): EmployeeResponse!
    updateEmployeeByEid(eid: ID!, employee: UpdateEmployeeInput!): EmployeeResponse!
    deleteEmployeeByEid(eid: ID!): DeleteResponse!
  }
`;

export default typeDefs;