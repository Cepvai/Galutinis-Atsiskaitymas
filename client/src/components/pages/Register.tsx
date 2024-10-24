import { useFormik } from "formik";
import * as Yup from 'yup';
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";

import UsersContext from "../../contexts/UserContext";
import { UsersContextTypes } from "../../../../types";

const Register = () => {

  const { addNewUser } = useContext(UsersContext) as UsersContextTypes;
  const [registerMessage, setRegisterMessage] = useState('');
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues:{
      email: '',
      username: '',
      password: '',
      passwordRepeat: ''
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
        .required('Field must be filled')
    }),
    onSubmit: async (values) => {
      // console.log(values);
      const registerResponse = await addNewUser({
        username: values.username,
        email: values.email,
        password: values.password,
        password_visible: values.password,
        role: 'user'
      });
      // Type Guard - tikrina ar raktinis žodis "error" yra "registerResponse" objekto viduje
      if("error" in registerResponse){ // error yra (email arba user jau panaudotas)
        // console.log(registerResponse);
        setRegisterMessage(registerResponse.error);
      } else { // error nėra, viskas sėkmingai
        // console.log(registerResponse);
        setRegisterMessage(registerResponse.success);
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    }
  });

  return (
    <section>
      <h2>Registruotis</h2>
      <form onSubmit={formik.handleSubmit}>
        <div>
          <label htmlFor="email">El. Paštas:</label>
          <input
            type="email"
            name="email" id="email"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
          />
          {
            formik.touched.email && formik.errors.email 
            && <p>{formik.errors.email}</p>
          }
        </div>
        <div>
          <label htmlFor="username">Vartotojo vardas:</label>
          <input
            type="text"
            name="username" id="username"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.username}
          />
          {
            formik.touched.username && formik.errors.username 
            && <p>{formik.errors.username}</p>
          }
        </div>
        <div>
          <label htmlFor="password">Slaptažodis:</label>
          <input
            type="password"
            name="password" id="password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
          />
          {
            formik.touched.password && formik.errors.password 
            && <p>{formik.errors.password}</p>
          }
        </div>
        <div>
          <label htmlFor="passwordRepeat">Slaptažodžio pakartojimas:</label>
          <input
            type="password"
            name="passwordRepeat" id="passwordRepeat"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.passwordRepeat}
          />
          {
            formik.touched.passwordRepeat && formik.errors.passwordRepeat 
            && <p>{formik.errors.passwordRepeat}</p>
          }
        </div>
        <input type="submit" value="Registruotis" />
      </form>
      { registerMessage && <p>{registerMessage}</p> }
      <p>Jau turite paskyrą? Eikite <Link to="/prisijungti">prisijungti</Link>.</p>
    </section>
  );
}
 
export default Register;