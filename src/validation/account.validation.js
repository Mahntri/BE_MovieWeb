import { object, string } from "yup";

const accountValidationSchema = {
  register: object({
    username: string()
      .required("Username is required")
      .min(3, "Username must be at least 3 characters")
      .trim(),
    
    email: string()
      .email("Invalid email format")
      .required("Email is required"),

    password: string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
    fullName: string()
      .required("Full name is required")
      .min(2, "Full name must be at least 2 characters"),
  }),

  login: object({
    username: string().required("Username is required"),
    password: string().required("Password is required"),
  }),
};

export default accountValidationSchema;