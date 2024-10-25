import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from 'yup';
import { useContext, useState } from "react";

import UsersContext from "../../contexts/UserContext";
import { UsersContextTypes } from '../../../../types';

const Login = () => {

  const { logUserIn } = useContext(UsersContext) as UsersContextTypes;
  const [loginMessage, setLoginMessage] = useState('');  // Saugosime žinutes (klaidos/sėkmės)
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      username: '',
      password: ''
    },
    validationSchema: Yup.object({
      username: Yup.string() // Pakeista į `username` validaciją
        .min(5, 'Vartotojo vardas turi būti ne trumpesnis nei 5 simboliai')
        .max(20, 'Vartotojo vardas turi būti ne ilgesnis nei 20 simbolių')
        .required('Šis laukas yra privalomas.'),
      password: Yup.string()
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,25}$/,
          'Slaptažodis privalo turėti bent: vieną mažąją raidę, vieną didžiąją raidę, vieną skaičių, vieną specialų simbolį (@$!%*?&) ir ilgis privalo būti tarp 8 ir 25 simbolių.'
        ).required('Šis laukas yra privalomas.')  // Slaptažodžio validacija
    }),
    onSubmit: async (values) => {
        try {
          const loginResponse = await logUserIn(values); // Dabar `values` yra perduodamas
          if ("error" in loginResponse) {
            setLoginMessage(loginResponse.error);
          } else {
            setLoginMessage(loginResponse.success);
            setTimeout(() => {
              navigate("/");  // Galima nukreipti į home arba kitą puslapį
            }, 3000);
          }
        } catch(err) {
          console.error(err);
        }
      }
  });

  return (
    <section>
      <h2>Prisijungti</h2>
      <form onSubmit={formik.handleSubmit}>
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
        <input type="submit" value="Prisijungti" />
      </form>
      { loginMessage && <p>{loginMessage}</p> }  {/* Rodoma klaidos ar sėkmės žinutė */}
      <p>Dar neturite paskyros? Eikite <Link to="/registruotis">prisiregistruoti</Link>.</p>
    </section>
  );
}
 
export default Login;
