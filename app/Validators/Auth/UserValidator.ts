import { schema } from "@ioc:Adonis/Core/Validator";

export const UserCreateSchema = schema.create({
  name: schema.string(),
  company: schema.string.optional(),
  designation: schema.string.optional(),
  ph_number: schema.string.optional(),
  email: schema.string(),
  hq_address: schema.string.optional(),
  password: schema.string(),
  avatar_url: schema.string.optional(),
  is_active: schema.boolean.optional(),
});
