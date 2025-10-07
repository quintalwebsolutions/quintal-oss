const schema = z
  .object({
    email: Z.string().email(),
    password: Z.string().min(5),
    confirmPassword: Z.string(),

    // ...schema;
  })
  .refine(() => {
    if (password !== confirmpassword) {
      return 'passwords must match'; // loc: confirmpassword
    }
  });

const formState = useForm(schema, {
  isLoading: true, // default false
  fields: {
    email: {},
    password: {},
    confirmPassword: {},
  },
});

type FormState = {};
