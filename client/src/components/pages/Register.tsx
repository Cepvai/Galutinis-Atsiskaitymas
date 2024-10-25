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
        try {
          // Paruošiame vartotojo duomenis su numatytaisiais laukais
          const newUser = {
            username: values.username,
            email: values.email,
            password: values.password,
            profileImage: values.profileImage || '',
            password_visible: values.password,
          };
  
          const registerResponse = await addNewUser(newUser);
          if ("error" in registerResponse) {
            setRegisterMessage(registerResponse.error);
          } else {
            setRegisterMessage(registerResponse.success);
            setTimeout(() => {
              navigate('/login');  // Po registracijos nukreipiame į prisijungimo puslapį
            }, 3000);
          }
        } catch (err) {
          console.error(err);
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
        <div>
          <label htmlFor="profileImage">Profilio nuotraukos URL:</label>
          <input
            type="url"
            name="profileImage" id="profileImage"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.profileImage}
          />
          {formik.touched.profileImage && formik.errors.profileImage && <p>{formik.errors.profileImage}</p>}
        </div>
        <input type="submit" value="Registruotis" />
      </form>
      { registerMessage && <p>{registerMessage}</p> }
      <p>Jau turite paskyrą? Eikite <Link to="/prisijungti">prisijungti</Link>.</p>
    </section>
  );
}
 
export default Register;