import { z } from "zod";


export const usernameVailidation = z
  .string()
  .min(2, "username must be atleast 2 characters long")
  .max(20, "username must be no longer than 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "username must be not contain special character")


  export const signUpSchema = z.object({
    username: usernameVailidation,
    email: z.string().email({message: "invalid email address"}),
    password: z.string().min(6, "password must be atleast 6 charactors")
    
  })