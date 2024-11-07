import { useFormik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import styled from "styled-components";

import UsersContext from "../../contexts/UserContext";
import { UsersContextTypes } from "../../../../server/types";

const RegisterContainer = styled.section`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #1c1c1e;
  color: #eaeaea;
`;

const RegisterForm = styled.form`
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background-color: #2e2e2e;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
`;

const Title = styled.h2`
  text-align: center;
  color: #e3e3e3;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
`;

const FieldContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  color: #bbb;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  background-color: #444;
  border: 1px solid #555;
  border-radius: 8px;
  color: #fff;
  transition: border-color 0.3s;

  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;

const ErrorText = styled.p`
  color: #ff4d4d;
  font-size: 0.85rem;
  margin-top: 0.25rem;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 1rem;

  &:hover {
    background-color: #0056b3;
  }
`;

const UpdateMessage = styled.p`
  text-align: center;
  color: #80ff80;
  margin-top: 1.5rem;
`;

const LoginPrompt = styled.p`
  text-align: center;
  color: #bbb;
  margin-top: 1rem;

  a {
    color: #007bff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

// Component
const Register = () => {
  const { addNewUser } = useContext(UsersContext) as UsersContextTypes;
  const [registerMessage, setRegisterMessage] = useState('');
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: '',
      username: '',
      password: '',
      passwordRepeat: '',
      profileImage: ''
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Privalo būti realus email adresas.')
        .required('Šis laukas yra privalomas.'),
      username: Yup.string()
        .min(5, 'Vartotojo vardas privalo būti bent 5 simbolių ilgio')
        .max(20, 'Vartotojo vardas privalo būti ne ilgenis nei 20 simbolių')
        .required('Šis laukas yra privalomas.'),
      password: Yup.string()
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,25}$/,
          'Slaptažodis privalo turėti bent: vieną mažąją raidę, vieną didžiąją raidę, vieną skaičių, vieną specialų simbolį (@$!%*?&) ir ilgis privalo būti tarp 8 ir 25 simbolių.'
        ).required('Šis laukas yra privalomas.'),
      passwordRepeat: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Field must be filled'),
      profileImage: Yup.string()
        .url('Privalo būti teisingas URL.')
        .nullable()
    }),
    onSubmit: async (values) => {
      const registerResponse = await addNewUser({
        username: values.username,
        email: values.email,
        password: values.password,
        password_visible: values.password,
        profileImage: values.profileImage || '',
      });
      if("error" in registerResponse){
        setRegisterMessage(registerResponse.error);
      } else {
        setRegisterMessage(registerResponse.success);
        setTimeout(() => {
          navigate("/all-users");
        }, 3000);
      }
    }
  });

  return (
    <RegisterContainer>
      <RegisterForm onSubmit={formik.handleSubmit}>
        <Title>Registruotis</Title>
        <FieldContainer>
          <Label htmlFor="email">El. Paštas:</Label>
          <Input
            type="email"
            name="email" id="email"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
          />
          {formik.touched.email && formik.errors.email && <ErrorText>{formik.errors.email}</ErrorText>}
        </FieldContainer>
        <FieldContainer>
          <Label htmlFor="username">Vartotojo vardas:</Label>
          <Input
            type="text"
            name="username" id="username"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.username}
          />
          {formik.touched.username && formik.errors.username && <ErrorText>{formik.errors.username}</ErrorText>}
        </FieldContainer>
        <FieldContainer>
          <Label htmlFor="password">Slaptažodis:</Label>
          <Input
            type="password"
            name="password" id="password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
          />
          {formik.touched.password && formik.errors.password && <ErrorText>{formik.errors.password}</ErrorText>}
        </FieldContainer>
        <FieldContainer>
          <Label htmlFor="passwordRepeat">Slaptažodžio pakartojimas:</Label>
          <Input
            type="password"
            name="passwordRepeat" id="passwordRepeat"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.passwordRepeat}
          />
          {formik.touched.passwordRepeat && formik.errors.passwordRepeat && <ErrorText>{formik.errors.passwordRepeat}</ErrorText>}
        </FieldContainer>
        <FieldContainer>
          <Label htmlFor="profileImage">Profilio nuotraukos URL:</Label>
          <Input
            type="url"
            name="profileImage" id="profileImage"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.profileImage}
          />
          {formik.touched.profileImage && formik.errors.profileImage && <ErrorText>{formik.errors.profileImage}</ErrorText>}
        </FieldContainer>
        <SubmitButton type="submit">Registruotis</SubmitButton>
        {registerMessage && <UpdateMessage>{registerMessage}</UpdateMessage>}
        <LoginPrompt>
          Jau turite paskyrą? Eikite <Link to="/login">prisijungti</Link>.
        </LoginPrompt>
      </RegisterForm>
    </RegisterContainer>
  );
}

export default Register;
