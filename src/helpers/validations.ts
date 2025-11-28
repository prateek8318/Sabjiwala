import * as Yup from 'yup';

const SignInValidationSchema = Yup.object().shape({
  loginid: Yup.string().required('Please enter login ID'),
  password: Yup.string().required('Please enter password'),
});


export {
  SignInValidationSchema,
};
