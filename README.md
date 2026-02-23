# COMP3133 Assignment 1 — GraphQL Employee Management API
**Student ID:** 101239401  
**Repo:** COMP3133_101239401_Assignment1

This is an employee management system backend application using NodeJS, Express, GraphQL and MongoDB. Users can signup/login and features employee CRUD + search.

## Setup
### 1) Install
```bash
npm install

## 2) Create `.env`

Create a file named `.env` in the project root:

```env
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/comp3133_101239401_Assigment1
JWT_SECRET=random_string

CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx

## Run MongoDB (Docker)

```bash
docker compose up -d
docker ps

## Run Server

```bash
npm run dev

GraphQL: `http://localhost:4000/graphql`

## Testing (Postman)

### Request
- **Method:** POST
- **URL:** `http://localhost:4000/graphql`

### Headers
- `Content-Type: application/json`
- After login (for employee operations): `Authorization: Bearer <token>`

### Test order
Signup → Login → Add Employee → Get All → Search by EID → Update → Search by Dept/Designation → Delete

## Sample Login
- **Username:** `vincent`
- **Email:** `101239401@test.com`
- **Password:** `test123`