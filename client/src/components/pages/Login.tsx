import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from 'yup';
import { useContext, useState } from "react";
import styled from "styled-components";

import UsersContext from "../../contexts/UserContext";
import { UsersContextTypes } from '../../../../server/types';

const LoginContainer = styled.section`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #2d2d2d;
`;

const LoginForm = styled.form`
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background-color: #333;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  text-align: center;
  color: #fff;
`;

const Title = styled.h2`
  margin-bottom: 1.5rem;
  color: #e3e3e3;
  font-size: 1.5rem;
`;

const InputContainer = styled.div`
  position: relative;
  margin-bottom: 1rem;
  text-align: left;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: #bbb;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-top: 0.5rem;
  border: 1px solid #555;
  border-radius: 4px;
  background-color: #3a3a3a; /* Pilka spalva */
  color: #e3e3e3; /* Teksto spalva */

  &:focus {
    border-color: #007bff;
    outline: none;
    background-color: #444; /* Šiek tiek šviesesnė spalva fokusui */
  }
`;

const ErrorText = styled.p`
  color: #ff4d4d;
  font-size: 0.8rem;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  margin-top: 1rem;
  background-color: #007bff;
  color: #fff;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }
`;

const Message = styled.p`
  margin-top: 1rem;
  color: #bbb;
`;

const RegisterLink = styled(Link)`
  color: #007bff;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const Login = () => {
  const { logUserIn } = useContext(UsersContext) as UsersContextTypes;
  const [loginMessage, setLoginMessage] = useState('');
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      username: '',
      password: ''
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .min(5, 'Vartotojo vardas turi būti ne trumpesnis nei 5 simboliai')
        .max(20, 'Vartotojo vardas turi būti ne ilgesnis nei 20 simbolių')
        .required('Šis laukas yra privalomas.'),
      password: Yup.string()
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,25}$/,
          'Slaptažodis privalo turėti bent: vieną mažąją raidę, vieną didžiąją raidę, vieną skaičių, vieną specialų simbolį (@$!%*?&) ir ilgis privalo būti tarp 8 ir 25 simbolių.'
        ).required('Šis laukas yra privalomas.')
    }),
    onSubmit: async (values) => {
        try {
          const loginResponse = await logUserIn(values);
          if ("error" in loginResponse) {
            setLoginMessage(loginResponse.error);
          } else {
            setLoginMessage(loginResponse.success);
            setTimeout(() => {
              navigate("/all-users");
            }, 3000);
          }
        } catch(err) {
          console.error(err);
        }
      }
  });

  return (
    <LoginContainer>
      <LoginForm onSubmit={formik.handleSubmit}>
        <Title>CHATAS</Title>
        <InputContainer>
          <Label htmlFor="username">Vartotojas</Label>
          <Input
            type="text"
            name="username" id="username"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.username}
          />
          {formik.touched.username && formik.errors.username && <ErrorText>{formik.errors.username}</ErrorText>}
        </InputContainer>
        <InputContainer>
          <Label htmlFor="password">Slaptažodis</Label>
          <Input
            type="password"
            name="password" id="password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
          />
          {formik.touched.password && formik.errors.password && <ErrorText>{formik.errors.password}</ErrorText>}
        </InputContainer>
        <SubmitButton type="submit">Prisijungti</SubmitButton>
        { loginMessage && <Message>{loginMessage}</Message> }
        <Message>Dar neturite paskyros? <RegisterLink to="/register">Registruotis</RegisterLink>.</Message>
      </LoginForm>
    </LoginContainer>
  );
}

export default Login;
